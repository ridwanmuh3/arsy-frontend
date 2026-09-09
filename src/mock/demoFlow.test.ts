import { beforeEach, describe, expect, test } from "bun:test";
import {
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { createMockAdapter, setMockLatency } from "./mockAdapter";
import { createMemoryStorage, createStore, type DemoStore } from "./store";

setMockLatency(0);

const BASE_URL = "http://localhost:9000/api/v1";

let store: DemoStore;
let authed: (
  token: string,
  method: string,
  url: string,
  data?: unknown,
) => Promise<AxiosResponse>;

beforeEach(() => {
  store = createStore(createMemoryStorage(), `flow-${crypto.randomUUID()}`);
  const adapter = createMockAdapter({ store, latencyMs: 0 });
  authed = (token, method, url, data) =>
    adapter({
      method,
      url,
      baseURL: BASE_URL,
      headers: new AxiosHeaders({ Authorization: `Bearer ${token}` }),
      data,
    } as InternalAxiosRequestConfig);
});

const login = async (username: string): Promise<string> => {
  const adapter = createMockAdapter({ store, latencyMs: 0 });
  const response = await adapter({
    method: "post",
    url: "/auth/login",
    baseURL: BASE_URL,
    headers: new AxiosHeaders(),
    data: { username, password: "demo123" },
  } as InternalAxiosRequestConfig);
  return (response.data.data as { access_token: string }).access_token;
};

/**
 * Skenario demo end-to-end: LOKET membuat bon + request, ADMIN menyetujui
 * hingga COMPLETED, SUPER_ADMIN mengelola user — persis alur klik demo.
 */
describe("alur demo lintas role", () => {
  test("LOKET → ADMIN → riwayat → SUPER_ADMIN", async () => {
    // 1. LOKET membuat bon peminjaman + request pencarian berkas.
    const loketToken = await login("loket");
    const loanNote = (
      await authed(loketToken, "post", "/loan-notes", {
        nomor_berkas: "777001",
        jenis_hak: "Hak Milik",
        tahun: "2024",
        desa: "Sukamaju",
        kecamatan: "Cilodong",
        keperluan: "Pengecekan berkas untuk keperluan balik nama sertipikat",
        nama_peminjam: "Pemohon Skenario",
      })
    ).data.data as { id: string };
    expect(loanNote.id).toBeDefined();

    const request = (
      await authed(loketToken, "post", "/search-documents", {
        nomor_berkas: "777001",
        nama_pemilik: "Pemohon Skenario",
        desa: "Sukamaju",
        kecamatan: "Cilodong",
      })
    ).data.data as {
      id: string;
      status: string;
      created_by_user_id: string;
      nama_pemilik: string;
    };
    expect(request.status).toBe("PENDING");

    // 2. Bon cocok dengan request via nama (syarat tombol View di UI).
    const notes = (
      await authed(loketToken, "get", "/loan-notes")
    ).data.data as { nama_peminjam: string }[];
    expect(
      notes.some((note) => note.nama_peminjam === request.nama_pemilik),
    ).toBe(true);

    // 3. ADMIN melihat request baru lalu menyetujui hingga COMPLETED.
    const adminToken = await login("admin");
    const visible = (
      await authed(adminToken, "get", "/search-documents")
    ).data.data as { id: string }[];
    expect(visible.some((item) => item.id === request.id)).toBe(true);

    await authed(adminToken, "put", `/search-documents/${request.id}`, {
      ...request,
      status: "APPROVED",
    });
    const done = (
      await authed(adminToken, "put", `/search-documents/${request.id}`, {
        ...request,
        status: "COMPLETED",
      })
    ).data.data as { status: string };
    expect(done.status).toBe("COMPLETED");

    // 4. Riwayat mencatat request yang selesai.
    const history = (
      await authed(adminToken, "get", "/search-documents")
    ).data.data as { id: string; status: string }[];
    expect(
      history.find((item) => item.id === request.id)?.status,
    ).toBe("COMPLETED");

    // 5. SUPER_ADMIN menambah user LOKET baru yang langsung bisa login.
    const superToken = await login("superadmin");
    const newUser = (
      await authed(superToken, "post", "/users", {
        username: "loketbaru",
        password: "demo123",
        role: "LOCKET",
        fullname: "Loket Baru",
      })
    ).data.data as { username: string };
    expect(newUser.username).toBe("loketbaru");
    const newToken = await login("loketbaru");
    expect(typeof newToken).toBe("string");
  });

  test("isolasi data antar petugas loket (filter History)", async () => {
    const loketToken = await login("loket");
    const loket2Token = await login("loketdua");

    await authed(loketToken, "post", "/search-documents", {
      nomor_berkas: "888001",
      nama_pemilik: "Milik Loket Satu",
      desa: "A",
      kecamatan: "B",
    });

    const all = (
      await authed(loket2Token, "get", "/search-documents")
    ).data.data as { created_by_user_id: string; nama_pemilik: string }[];

    // Simulasi filter History.tsx: LOKET hanya melihat request sendiri.
    const loket2Id = store
      .read()
      .users.find((user) => user.username === "loketdua")!.id;
    const mine = all.filter((item) => item.created_by_user_id === loket2Id);
    expect(mine.some((item) => item.nama_pemilik === "Milik Loket Satu")).toBe(
      false,
    );
  });
});
