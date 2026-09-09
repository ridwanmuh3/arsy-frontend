import { describe, expect, test } from "bun:test";
import { jwtDecode } from "jwt-decode";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  createMockToken,
  createMockTokenPair,
  decodeMockToken,
  REFRESH_TOKEN_TTL_SECONDS,
} from "./tokens";
import type { JwtPayload } from "../types";

const demoUser = {
  id: "11111111-1111-1111-1111-111111111111",
  username: "loket",
  fullname: "Petugas Loket",
  role: "LOCKET",
};

describe("createMockToken", () => {
  test("berformat JWT tiga segmen", () => {
    const token = createMockToken(demoUser, "access");
    expect(token.split(".")).toHaveLength(3);
  });

  test("payload memuat identitas user dan exp di masa depan", () => {
    const before = Math.floor(Date.now() / 1000);
    const token = createMockToken(demoUser, "access");
    const payload = decodeMockToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe(demoUser.id);
    expect(payload?.username).toBe("loket");
    expect(payload?.fullname).toBe("Petugas Loket");
    expect(payload?.role).toBe("LOCKET");
    expect(payload?.kind).toBe("access");
    expect(payload!.exp).toBeGreaterThanOrEqual(before + ACCESS_TOKEN_TTL_SECONDS - 1);
  });

  test("refresh token berumur lebih panjang dan kind=refresh", () => {
    const before = Math.floor(Date.now() / 1000);
    const token = createMockToken(demoUser, "refresh");
    const payload = decodeMockToken(token);
    expect(payload?.kind).toBe("refresh");
    expect(payload!.exp).toBeGreaterThanOrEqual(
      before + REFRESH_TOKEN_TTL_SECONDS - 1,
    );
  });

  test("kompatibel dengan jwt-decode seperti dipakai getUserFromToken", () => {
    const token = createMockToken(demoUser, "access");
    const decoded = jwtDecode<JwtPayload>(token);
    expect(decoded.username).toBe("loket");
    expect(decoded.role).toBe("LOCKET");
    expect(decoded.exp * 1000).toBeGreaterThan(Date.now());
  });

  test("mendukung ttl kustom", () => {
    const token = createMockToken(demoUser, "access", 60);
    const payload = decodeMockToken(token);
    expect(payload!.exp).toBeLessThanOrEqual(
      Math.floor(Date.now() / 1000) + 60,
    );
  });
});

describe("createMockTokenPair", () => {
  test("mengembalikan access_token dan refresh_token berbeda", () => {
    const pair = createMockTokenPair(demoUser);
    expect(pair.type).toBe("Bearer");
    expect(pair.access_token).not.toBe(pair.refresh_token);
    expect(decodeMockToken(pair.access_token)?.kind).toBe("access");
    expect(decodeMockToken(pair.refresh_token)?.kind).toBe("refresh");
  });
});

describe("decodeMockToken", () => {
  test("null untuk token malformed", () => {
    expect(decodeMockToken("bukan-token")).toBeNull();
    expect(decodeMockToken("a.b")).toBeNull();
    expect(decodeMockToken("")).toBeNull();
    expect(decodeMockToken("a.b.c")).toBeNull();
  });

  test("null untuk token kedaluwarsa", () => {
    const expired = createMockToken(demoUser, "access", -10);
    expect(decodeMockToken(expired)).toBeNull();
  });

  test("null bila payload tidak lengkap", () => {
    const header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
    const payload = btoa(JSON.stringify({ foo: "bar" }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    expect(decodeMockToken(`${header}.${payload}.demo-signature`)).toBeNull();
  });
});
