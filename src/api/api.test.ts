import { beforeEach, describe, expect, test } from "bun:test";
import { createMockToken, decodeMockToken } from "../mock/tokens";
import { getUserFromToken } from "../lib/auth";
import { loginUser } from "./auth";
import { findAllDocuments } from "./documents";
import { findAllUsers } from "./users";

/**
 * Test integrasi lapis API: modul `src/api/*` + interceptor
 * (auto-refresh, pemetaan error) + `getUserFromToken`, berjalan di atas
 * mock adapter yang terpasang otomatis saat VITE_USE_MOCK !== "false".
 */

// localStorage minimal untuk interceptor & lib/auth (bun tidak punya DOM).
const memory = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => (memory.has(key) ? memory.get(key)! : null),
    setItem: (key: string, value: string) => {
      memory.set(key, String(value));
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  },
  configurable: true,
});

beforeEach(() => {
  memory.clear();
});

const storeTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
};

describe("loginUser", () => {
  test("sukses mengembalikan pasangan token", async () => {
    const result = await loginUser({ username: "loket", password: "demo123" });
    expect(typeof result.access_token).toBe("string");
    expect(typeof result.refresh_token).toBe("string");
  });

  test("kredensial salah melempar pesan backend, bukan teknis", async () => {
    const error = await loginUser({
      username: "loket",
      password: "salah",
    }).catch((e: unknown) => e as Error);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("username atau password salah");
  });
});

describe("panggilan terproteksi + getUserFromToken", () => {
  test("token tersimpan dipakai otomatis & user terbaca", async () => {
    const pair = await loginUser({ username: "admin", password: "demo123" });
    storeTokens(pair.access_token, pair.refresh_token);

    const users = (await findAllUsers()) as unknown[];
    expect(users.length).toBeGreaterThan(0);

    const documents = (await findAllDocuments()) as unknown[];
    expect(documents.length).toBeGreaterThan(0);

    const user = getUserFromToken();
    expect(user?.username).toBe("admin");
    expect(user?.role).toBe("ADMIN");
  });

  test("tanpa token sesi dibersihkan & error jelas", async () => {
    // Tanpa token tersimpan, interceptor mencoba refresh lalu gagal bersih.
    const error = await findAllUsers().catch((e: unknown) => e as Error);
    expect((error as Error).message).toBe("refresh token is missing");
    expect(localStorage.getItem("access_token")).toBeNull();
  });
});

describe("auto-refresh interceptor", () => {
  test("access kedaluwarsa + refresh valid → pulih otomatis & token dirotasi", async () => {
    const pair = await loginUser({ username: "loket", password: "demo123" });
    const payload = decodeMockToken(pair.refresh_token);
    expect(payload).not.toBeNull();
    const expiredAccess = createMockToken(
      {
        id: payload!.sub,
        username: payload!.username,
        fullname: payload!.fullname,
        role: payload!.role,
      },
      "access",
      -10,
    );
    storeTokens(expiredAccess, pair.refresh_token);

    const users = (await findAllUsers()) as unknown[];
    expect(users.length).toBeGreaterThan(0);

    const rotated = localStorage.getItem("access_token");
    expect(rotated).not.toBeNull();
    expect(rotated).not.toBe(expiredAccess);
  });

  test("access kedaluwarsa + refresh hilang → error bersih, sesi dibersihkan", async () => {
    const pair = await loginUser({ username: "loket", password: "demo123" });
    const payload = decodeMockToken(pair.refresh_token);
    const expiredAccess = createMockToken(
      {
        id: payload!.sub,
        username: payload!.username,
        fullname: payload!.fullname,
        role: payload!.role,
      },
      "access",
      -10,
    );
    storeTokens(expiredAccess, "");
    localStorage.removeItem("refresh_token");

    const error = await findAllUsers().catch((e: unknown) => e as Error);
    expect((error as Error).message).toBe("refresh token is missing");
    expect(localStorage.getItem("access_token")).toBeNull();
  });
});

describe("getUserFromToken", () => {
  test("null untuk token sampah & membersihkan sesi", () => {
    storeTokens("sampah", "sampah");
    expect(getUserFromToken()).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
  });

  test("null untuk token kedaluwarsa & membersihkan sesi", async () => {
    const pair = await loginUser({ username: "loket", password: "demo123" });
    const payload = decodeMockToken(pair.access_token);
    const expired = createMockToken(
      {
        id: payload!.sub,
        username: payload!.username,
        fullname: payload!.fullname,
        role: payload!.role,
      },
      "access",
      -10,
    );
    storeTokens(expired, pair.refresh_token);
    expect(getUserFromToken()).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
  });
});
