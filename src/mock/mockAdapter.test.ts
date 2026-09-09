import { beforeEach, describe, expect, test } from "bun:test";
import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { createMockAdapter, setMockLatency } from "./mockAdapter";
import { createMemoryStorage, createStore, type DemoStore } from "./store";
import { createMockToken } from "./tokens";

setMockLatency(0);

const BASE_URL = "http://localhost:9000/api/v1";

let store: DemoStore;
let call: (
  method: string,
  url: string,
  init?: {
    data?: unknown;
    params?: Record<string, unknown>;
    token?: string | null;
    rawStringBody?: boolean;
  },
) => Promise<AxiosResponse>;

const unwrap = (response: AxiosResponse): unknown => response.data.data;

const errorOf = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(AxiosError);
    return error as AxiosError<{ message?: string }>;
  }
  throw new Error("seharusnya gagal, tapi berhasil");
};

beforeEach(() => {
  store = createStore(createMemoryStorage(), `test-${crypto.randomUUID()}`);
  const adapter = createMockAdapter({ store, latencyMs: 0 });
  call = (method, url, init) => {
    const headers = new AxiosHeaders();
    if (init?.token !== null && init?.token !== undefined) {
      headers.set("Authorization", `Bearer ${init.token}`);
    }
    const data =
      init?.rawStringBody && init.data !== undefined
        ? JSON.stringify(init.data)
        : init?.data;
    return adapter({
      method,
      url,
      baseURL: BASE_URL,
      headers,
      data,
      params: init?.params,
    } as InternalAxiosRequestConfig);
  };
});

const loginAs = async (username: string): Promise<string> => {
  const response = await call("post", "/auth/login", {
    token: null,
    data: { username, password: "demo123" },
  });
  const body = unwrap(response) as { access_token: string };
  return body.access_token;
};

describe("auth", () => {
  test("login sukses mengembalikan pasangan token", async () => {
    const response = await call("post", "/auth/login", {
      token: null,
      data: { username: "loket", password: "demo123" },
    });
    expect(response.status).toBe(200);
    const body = unwrap(response) as {
      access_token: string;
      refresh_token: string;
    };
    expect(typeof body.access_token).toBe("string");
    expect(typeof body.refresh_token).toBe("string");
  });

  test("login menerima body JSON string (seperti transform bawaan axios)", async () => {
    const response = await call("post", "/auth/login", {
      token: null,
      data: { username: "admin", password: "demo123" },
      rawStringBody: true,
    });
    expect(response.status).toBe(200);
  });

  test("password salah → 401 dengan pesan jelas", async () => {
    const error = await errorOf(
      call("post", "/auth/login", {
        token: null,
        data: { username: "loket", password: "salah" },
      }),
    );
    expect(error.response?.status).toBe(401);
    expect(error.response?.data.message).toBe("username atau password salah");
  });

  test("username tidak dikenal / kosong → 401", async () => {
    for (const username of ["tidak-ada", ""]) {
      const error = await errorOf(
        call("post", "/auth/login", {
          token: null,
          data: { username, password: "demo123" },
        }),
      );
      expect(error.response?.status).toBe(401);
    }
  });

  test("refresh token valid memutar pasangan token baru", async () => {
    const first = (await call("post", "/auth/login", {
      token: null,
      data: { username: "admin", password: "demo123" },
    }).then(unwrap)) as { refresh_token: string };
    const response = await call("post", "/auth/refresh", {
      token: null,
      data: { refresh_token: first.refresh_token },
    });
    const body = unwrap(response) as { access_token: string };
    expect(typeof body.access_token).toBe("string");
  });

  test("refresh dengan access token / sampah / kedaluwarsa → 401", async () => {
    const access = await loginAs("admin");
    const expired = createMockToken(
      { id: "x", username: "admin", fullname: "Admin Arsip", role: "ADMIN" },
      "refresh",
      -10,
    );
    for (const refreshToken of [access, "sampah", expired, ""]) {
      const error = await errorOf(
        call("post", "/auth/refresh", {
          token: null,
          data: { refresh_token: refreshToken },
        }),
      );
      expect(error.response?.status).toBe(401);
    }
  });
});

describe("otorisasi", () => {
  test("tanpa token / token sampah / token kedaluwarsa → 401", async () => {
    const expired = createMockToken(
      { id: "x", username: "loket", fullname: "Petugas Loket", role: "LOCKET" },
      "access",
      -10,
    );
    const noAuth = await errorOf(call("get", "/users", { token: null }));
    expect(noAuth.response?.status).toBe(401);
    const garbage = await errorOf(call("get", "/users", { token: "sampah" }));
    expect(garbage.response?.status).toBe(401);
    const stale = await errorOf(call("get", "/users", { token: expired }));
    expect(stale.response?.status).toBe(401);
  });

  test("refresh token tidak bisa dipakai sebagai access token", async () => {
    const login = (await call("post", "/auth/login", {
      token: null,
      data: { username: "loket", password: "demo123" },
    }).then(unwrap)) as { refresh_token: string };
    const error = await errorOf(
      call("get", "/users", { token: login.refresh_token }),
    );
    expect(error.response?.status).toBe(401);
  });
});

describe("users", () => {
  test("CRUD penuh: tambah → baca → ubah → hapus", async () => {
    const admin = await loginAs("superadmin");
    const before = ((await call("get", "/users", {
      token: admin,
    }).then(unwrap)) as unknown[]).length;

    const createdUser = (await call("post", "/users", {
      token: admin,
      data: {
        username: "pegawaibaru",
        password: "demo123",
        role: "LOCKET",
        fullname: "Pegawai Baru",
      },
    }).then(unwrap)) as { id: string; username: string };
    expect(createdUser.username).toBe("pegawaibaru");

    const fetched = (await call("get", `/users/${createdUser.id}`, {
      token: admin,
    }).then(unwrap)) as { fullname: string };
    expect(fetched.fullname).toBe("Pegawai Baru");

    const updated = (await call("put", `/users/${createdUser.id}`, {
      token: admin,
      data: { fullname: "Pegawai Baru Edited" },
    }).then(unwrap)) as { fullname: string };
    expect(updated.fullname).toBe("Pegawai Baru Edited");

    const deleted = await call("delete", `/users/${createdUser.id}`, {
      token: admin,
    });
    expect(deleted.data.message).toBe("pengguna berhasil dihapus");

    const after = ((await call("get", "/users", {
      token: admin,
    }).then(unwrap)) as unknown[]).length;
    expect(after).toBe(before);
  });

  test("respons list tidak membocorkan password", async () => {
    const admin = await loginAs("superadmin");
    const users = (await call("get", "/users", {
      token: admin,
    }).then(unwrap)) as Record<string, unknown>[];
    expect(users.length).toBeGreaterThan(0);
    for (const user of users) {
      expect("password" in user).toBe(false);
    }
  });

  test("edge: id tidak ada → 404 untuk get/put/delete", async () => {
    const admin = await loginAs("superadmin");
    const unknownId = crypto.randomUUID();
    for (const [method, url] of [
      ["get", `/users/${unknownId}`],
      ["put", `/users/${unknownId}`],
      ["delete", `/users/${unknownId}`],
    ] as const) {
      const error = await errorOf(
        call(method, url, { token: admin, data: { fullname: "x" } }),
      );
      expect(error.response?.status).toBe(404);
    }
  });

  test("edge: username duplikat saat tambah dan ubah → 409", async () => {
    const admin = await loginAs("superadmin");
    const duplicate = await errorOf(
      call("post", "/users", {
        token: admin,
        data: {
          username: "loket",
          password: "demo123",
          role: "LOCKET",
          fullname: "Kembar",
        },
      }),
    );
    expect(duplicate.response?.status).toBe(409);

    const other = (await call("post", "/users", {
      token: admin,
      data: {
        username: "uniksekali",
        password: "demo123",
        role: "LOCKET",
        fullname: "Unik",
      },
    }).then(unwrap)) as { id: string };
    const clash = await errorOf(
      call("put", `/users/${other.id}`, {
        token: admin,
        data: { username: "loket" },
      }),
    );
    expect(clash.response?.status).toBe(409);
  });

  test("edge: field wajib kosong / role invalid → 400", async () => {
    const admin = await loginAs("superadmin");
    const missing = await errorOf(
      call("post", "/users", {
        token: admin,
        data: { username: "tanpalengkap" },
      }),
    );
    expect(missing.response?.status).toBe(400);
    const badRole = await errorOf(
      call("post", "/users", {
        token: admin,
        data: {
          username: "rolenya",
          password: "demo123",
          role: "PRESIDEN",
          fullname: "X",
        },
      }),
    );
    expect(badRole.response?.status).toBe(400);
  });

  test("password kosong saat ubah mempertahankan password lama (bisa login)", async () => {
    const admin = await loginAs("superadmin");
    const createdUser = (await call("post", "/users", {
      token: admin,
      data: {
        username: "tetappass",
        password: "demo123",
        role: "LOCKET",
        fullname: "Tetap",
      },
    }).then(unwrap)) as { id: string };
    await call("put", `/users/${createdUser.id}`, {
      token: admin,
      data: { fullname: "Tetap Ganti", password: "" },
    });
    const login = await call("post", "/auth/login", {
      token: null,
      data: { username: "tetappass", password: "demo123" },
    });
    expect(login.status).toBe(200);
  });

  test("user yang dihapus tidak bisa login lagi", async () => {
    const admin = await loginAs("superadmin");
    const createdUser = (await call("post", "/users", {
      token: admin,
      data: {
        username: "sementara",
        password: "demo123",
        role: "LOCKET",
        fullname: "Sementara",
      },
    }).then(unwrap)) as { id: string };
    await call("delete", `/users/${createdUser.id}`, { token: admin });
    const error = await errorOf(
      call("post", "/auth/login", {
        token: null,
        data: { username: "sementara", password: "demo123" },
      }),
    );
    expect(error.response?.status).toBe(401);
  });

  test("paginasi offset/limit dihormati, limit=-1 semua", async () => {
    const admin = await loginAs("superadmin");
    const all = (await call("get", "/users", {
      token: admin,
      params: { offset: 0, limit: -1 },
    }).then(unwrap)) as unknown[];
    const page = (await call("get", "/users", {
      token: admin,
      params: { offset: 1, limit: 2 },
    }).then(unwrap)) as unknown[];
    expect(page).toHaveLength(Math.min(2, Math.max(all.length - 1, 0)));
  });
});

describe("documents", () => {
  test("tambah berkas lalu terbaca di list", async () => {
    const admin = await loginAs("admin");
    const before = ((await call("get", "/documents", {
      token: admin,
    }).then(unwrap)) as unknown[]).length;
    const createdDoc = (await call("post", "/documents", {
      token: admin,
      data: {
        nomor_berkas: "999001",
        nama_pemilik: "Uji Coba",
        desa: "Demo",
        kecamatan: "Demo",
        kode_lokasi: "1234567",
      },
    }).then(unwrap)) as { nomor_berkas: string };
    expect(createdDoc.nomor_berkas).toBe("999001");
    const after = ((await call("get", "/documents", {
      token: admin,
    }).then(unwrap)) as unknown[]).length;
    expect(after).toBe(before + 1);
  });

  test("edge: nomor berkas duplikat → 409, kosong → 400", async () => {
    const admin = await loginAs("admin");
    const existing = (
      (await call("get", "/documents", { token: admin }).then(
        unwrap,
      )) as { nomor_berkas: string }[]
    )[0]!;
    const duplicate = await errorOf(
      call("post", "/documents", {
        token: admin,
        data: { nomor_berkas: existing.nomor_berkas },
      }),
    );
    expect(duplicate.response?.status).toBe(409);
    const empty = await errorOf(
      call("post", "/documents", { token: admin, data: {} }),
    );
    expect(empty.response?.status).toBe(400);
  });
});

describe("search-documents", () => {
  test("transisi status PENDING → APPROVED → COMPLETED", async () => {
    const admin = await loginAs("admin");
    const pending = (
      (await call("get", "/search-documents", { token: admin }).then(
        unwrap,
      )) as { id: string; status: string }[]
    ).find((item) => item.status === "PENDING");
    expect(pending).toBeDefined();
    const approved = (await call("put", `/search-documents/${pending!.id}`, {
      token: admin,
      data: { status: "APPROVED" },
    }).then(unwrap)) as { status: string };
    expect(approved.status).toBe("APPROVED");
    const completed = (await call(
      "put",
      `/search-documents/${pending!.id}`,
      { token: admin, data: { status: "COMPLETED" } },
    ).then(unwrap)) as { status: string };
    expect(completed.status).toBe("COMPLETED");
  });

  test("edge: lompat/mundur status → 400, id asing → 404", async () => {
    const admin = await loginAs("admin");
    const pending = (
      (await call("get", "/search-documents", { token: admin }).then(
        unwrap,
      )) as { id: string; status: string }[]
    ).find((item) => item.status === "PENDING");
    expect(pending).toBeDefined();
    const skip = await errorOf(
      call("put", `/search-documents/${pending!.id}`, {
        token: admin,
        data: { status: "COMPLETED" },
      }),
    );
    expect(skip.response?.status).toBe(400);
    const unknown = await errorOf(
      call("put", `/search-documents/${crypto.randomUUID()}`, {
        token: admin,
        data: { status: "APPROVED" },
      }),
    );
    expect(unknown.response?.status).toBe(404);
  });
});

describe("loan-notes", () => {
  test("buat lalu ubah bon peminjaman", async () => {
    const loket = await loginAs("loket");
    const createdNote = (await call("post", "/loan-notes", {
      token: loket,
      data: {
        nomor_berkas: "555001",
        jenis_hak: "Hak Milik",
        tahun: "2024",
        desa: "Demo",
        kecamatan: "Demo",
        keperluan: "Balik nama",
        nama_peminjam: "Pemohon Demo",
      },
    }).then(unwrap)) as { id: string; created_by_user_id: string };
    expect(createdNote.id).toBeDefined();
    const updated = (await call("put", "/loan-notes", {
      token: loket,
      data: { id: createdNote.id, keperluan: "Balik nama revisi" },
    }).then(unwrap)) as { keperluan: string };
    expect(updated.keperluan).toBe("Balik nama revisi");
  });

  test("edge: update tanpa id / id asing → 404", async () => {
    const loket = await loginAs("loket");
    const missing = await errorOf(
      call("put", "/loan-notes", { token: loket, data: {} }),
    );
    expect(missing.response?.status).toBe(404);
    const unknown = await errorOf(
      call("put", "/loan-notes", {
        token: loket,
        data: { id: crypto.randomUUID() },
      }),
    );
    expect(unknown.response?.status).toBe(404);
  });
});

describe("routing tak dikenal", () => {
  test("endpoint asing → 404", async () => {
    const admin = await loginAs("admin");
    const error = await errorOf(
      call("get", "/tidak-ada", { token: admin }),
    );
    expect(error.response?.status).toBe(404);
  });

  test("trailing slash dinormalisasi", async () => {
    const admin = await loginAs("admin");
    const plain = (await call("get", "/users", { token: admin }).then(
      unwrap,
    )) as unknown[];
    const slashed = (await call("get", "/users/", { token: admin }).then(
      unwrap,
    )) as unknown[];
    expect(slashed).toEqual(plain);
  });

  test("id dengan encoding rusak → 400, bukan crash", async () => {
    const admin = await loginAs("admin");
    const error = await errorOf(
      call("get", "/users/%", { token: admin }),
    );
    expect(error.response?.status).toBe(400);
    expect(error.response?.data.message).toBe("format id tidak valid");
  });

  test("offset/limit string numerik tetap dihormati", async () => {
    const admin = await loginAs("admin");
    const page = (await call("get", "/users", {
      token: admin,
      params: { offset: "1", limit: "2" },
    }).then(unwrap)) as unknown[];
    expect(page.length).toBeLessThanOrEqual(2);
    const all = (await call("get", "/users", {
      token: admin,
      params: { offset: 0, limit: "-1" },
    }).then(unwrap)) as unknown[];
    expect(all.length).toBeGreaterThan(0);
  });

  test("offset di luar jangkauan mengembalikan array kosong", async () => {
    const admin = await loginAs("admin");
    const page = (await call("get", "/users", {
      token: admin,
      params: { offset: 9999, limit: 10 },
    }).then(unwrap)) as unknown[];
    expect(page).toEqual([]);
  });

  test("create mengembalikan status 201 Created", async () => {
    const admin = await loginAs("admin");
    const response = await call("post", "/documents", {
      token: admin,
      data: {
        nomor_berkas: "888001",
        nama_pemilik: "Status Check",
        desa: "A",
        kecamatan: "B",
        kode_lokasi: "1234567",
      },
    });
    expect(response.status).toBe(201);
    expect(response.statusText).toBe("Created");
  });
});

describe("token user yang sudah dihapus", () => {
  test("token lama ditolak 401 setelah user dihapus", async () => {
    const admin = await loginAs("superadmin");
    const createdUser = (await call("post", "/users", {
      token: admin,
      data: {
        username: "sementaralalu",
        password: "demo123",
        role: "LOCKET",
        fullname: "Sementara",
      },
    }).then(unwrap)) as { id: string };
    const staleToken = await loginAs("sementaralalu");
    await call("delete", `/users/${createdUser.id}`, { token: admin });
    const error = await errorOf(
      call("get", "/documents", { token: staleToken }),
    );
    expect(error.response?.status).toBe(401);
  });
});
