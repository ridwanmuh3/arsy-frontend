import type { JwtPayload, TokenResponse } from "../types";
import type { UserSchema } from "../schemas/user";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 3_600;

const base64UrlEncode = (input: string): string => {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const base64UrlDecode = (input: string): string => {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = padded.length % 4;
  const base64 = remainder === 0 ? padded : padded + "=".repeat(4 - remainder);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const toLatin1Safe = (input: string): string =>
  Array.from(input)
    .map((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code > 255 ? `\\u${code.toString(16).padStart(4, "0")}` : char;
    })
    .join("");

export type MockTokenPayload = JwtPayload & { kind: "access" | "refresh" };

/**
 * Menerbitkan token demo berformat JWT (header.payload.signature).
 * Signature TIDAK ditandatangani secara kriptografis — `jwt-decode`
 * di sisi klien hanya mem-parsing payload, persis seperti yang
 * dibutuhkan `getUserFromToken` dan `ProtectedRoute`.
 */
export const createMockToken = (
  user: Pick<UserSchema, "id" | "username" | "fullname" | "role">,
  kind: "access" | "refresh",
  ttlSeconds: number = kind === "access"
    ? ACCESS_TOKEN_TTL_SECONDS
    : REFRESH_TOKEN_TTL_SECONDS,
): string => {
  const header = base64UrlEncode(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  );
  const payload: MockTokenPayload = {
    sub: user.id ?? "",
    username: user.username,
    fullname: user.fullname,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    kind,
  };
  const encodedPayload = base64UrlEncode(toLatin1Safe(JSON.stringify(payload)));
  return `${header}.${encodedPayload}.demo-signature`;
};

export const createMockTokenPair = (
  user: Pick<UserSchema, "id" | "username" | "fullname" | "role">,
): TokenResponse => ({
  type: "Bearer",
  access_token: createMockToken(user, "access"),
  refresh_token: createMockToken(user, "refresh"),
});

/** Decode payload TANPA verifikasi signature. Null bila malformed/kedaluwarsa. */
export const decodeMockToken = (token: string): MockTokenPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1])) as MockTokenPayload;
    if (
      typeof payload.sub !== "string" ||
      typeof payload.username !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};
