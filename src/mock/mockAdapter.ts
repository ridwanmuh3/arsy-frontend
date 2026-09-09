import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { demoStore, type DemoStore } from "./store";
import {
  createMockToken,
  createMockTokenPair,
  decodeMockToken,
  type MockTokenPayload,
} from "./tokens";
import type { UserSchema } from "../schemas/user";
import type { SearchDocumentSchema } from "../schemas/search-document";

export type MockAdapterOptions = {
  store?: DemoStore;
  latencyMs?: number;
};

let defaultLatencyMs = 200;

/** Ubah latensi buatan (ms). Dipakai test agar berjalan instan. */
export const setMockLatency = (ms: number): void => {
  defaultLatencyMs = ms;
};

export const getMockLatency = (): number => defaultLatencyMs;

/** Mock aktif kecuali dimatikan eksplisit via `VITE_USE_MOCK=false`. */
export const isMockEnabled = (): boolean => {
  try {
    return import.meta.env.VITE_USE_MOCK !== "false";
  } catch {
    return true;
  }
};

class MockHttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "MockHttpError";
    this.status = status;
  }
}

type RouteResult =
  | { status: number; body: unknown; raw?: false }
  | { status: number; body: unknown; raw: true };

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const ok = (body: unknown, status = 200): RouteResult => ({ status, body });

const created = (body: unknown): RouteResult => ({ status: 201, body });

const rawOk = (body: unknown): RouteResult => ({ status: 200, body, raw: true });

const nowIso = (): string => new Date().toISOString();

const toInt = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.floor(parsed);
  }
  return undefined;
};

const paginate = <T>(
  items: T[],
  params: Record<string, unknown> | undefined,
): T[] => {
  const offsetRaw = toInt(params?.["offset"]);
  const offset = offsetRaw === undefined || offsetRaw < 0 ? 0 : offsetRaw;
  const limit = toInt(params?.["limit"]);
  if (limit === undefined || limit < 0) return items.slice(offset);
  return items.slice(offset, offset + limit);
};

const readBody = (config: InternalAxiosRequestConfig): Record<string, unknown> => {
  const data = config.data as unknown;
  if (data === null || data === undefined) return {};
  if (typeof data === "string") {
    try {
      const parsed: unknown = JSON.parse(data);
      return typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  if (typeof data === "object") return data as Record<string, unknown>;
  return {};
};

const readParams = (
  config: InternalAxiosRequestConfig,
): Record<string, unknown> | undefined => {
  const params = config.params as unknown;
  if (typeof params === "object" && params !== null) {
    return params as Record<string, unknown>;
  }
  return undefined;
};

const readBearerToken = (config: InternalAxiosRequestConfig): string | null => {
  const headers = config.headers as unknown;
  let value: unknown = null;
  if (headers instanceof AxiosHeaders) {
    value = headers.get("Authorization");
  } else if (typeof headers === "object" && headers !== null) {
    const record = headers as Record<string, unknown>;
    value = record["Authorization"] ?? record["authorization"] ?? null;
  }
  if (typeof value !== "string") return null;
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ? match[1].trim() : null;
};

const requireAuth = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
): MockTokenPayload => {
  const token = readBearerToken(config);
  const payload = token ? decodeMockToken(token) : null;
  if (!payload || payload.kind !== "access") {
    throw new MockHttpError(401, "token tidak valid atau sudah kedaluwarsa");
  }
  const userExists = store
    .read()
    .users.some((candidate) => candidate.id === payload.sub);
  if (!userExists) {
    throw new MockHttpError(401, "pengguna tidak ditemukan");
  }
  return payload;
};

const sanitizeUser = (user: UserSchema): Omit<UserSchema, "password"> => ({
  id: user.id,
  username: user.username,
  role: user.role,
  fullname: user.fullname,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

const pickString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const NEXT_STATUS: Record<string, string> = {
  PENDING: "APPROVED",
  APPROVED: "COMPLETED",
};

const safeDecodeId = (id: string): string => {
  try {
    return decodeURIComponent(id);
  } catch {
    throw new MockHttpError(400, "format id tidak valid");
  }
};

const resolvePath = (config: InternalAxiosRequestConfig): string => {
  const url = config.url ?? "";
  const baseURL = config.baseURL ?? "";
  const full =
    /^https?:\/\//i.test(url) || baseURL === "" ? url : `${baseURL}${url}`;
  try {
    const pathname = new URL(full, "http://demo.local").pathname;
    const stripped = pathname.replace(/^\/api\/v1/, "") || "/";
    return stripped.length > 1 ? stripped.replace(/\/+$/, "") : stripped;
  } catch {
    return url || "/";
  }
};

const handleAuthLogin = (store: DemoStore, body: Record<string, unknown>): RouteResult => {
  const username = pickString(body["username"]);
  const password = pickString(body["password"]);
  const user = username
    ? store.read().users.find((candidate) => candidate.username === username)
    : undefined;
  if (!user || user.password !== password) {
    throw new MockHttpError(401, "username atau password salah");
  }
  return ok(createMockTokenPair(user));
};

const handleAuthRefresh = (
  store: DemoStore,
  body: Record<string, unknown>,
): RouteResult => {
  const refreshToken = pickString(body["refresh_token"]);
  const payload = refreshToken ? decodeMockToken(refreshToken) : null;
  if (!payload || payload.kind !== "refresh") {
    throw new MockHttpError(401, "refresh token tidak valid");
  }
  const user = store.read().users.find((candidate) => candidate.id === payload.sub);
  if (!user) {
    throw new MockHttpError(401, "pengguna tidak ditemukan");
  }
  // Rotasi: access token baru + refresh token baru, seperti backend asli.
  return ok({
    type: "Bearer",
    access_token: createMockToken(user, "access"),
    refresh_token: createMockToken(user, "refresh"),
  });
};

const handleGetUsers = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
): RouteResult => {
  requireAuth(store, config);
  return ok(paginate(store.read().users.map(sanitizeUser), readParams(config)));
};

const handleGetUserById = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
  id: string,
): RouteResult => {
  requireAuth(store, config);
  const user = store.read().users.find((candidate) => candidate.id === id);
  if (!user) throw new MockHttpError(404, "pengguna tidak ditemukan");
  return ok(sanitizeUser(user));
};

const handleCreateUser = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
): RouteResult => {
  requireAuth(store, config);
  const body = readBody(config);
  const username = pickString(body["username"]);
  const password = pickString(body["password"]);
  const role = pickString(body["role"]);
  const fullname = pickString(body["fullname"]);
  if (!username || !password || !role || !fullname) {
    throw new MockHttpError(400, "username, password, role, dan fullname wajib diisi");
  }
  if (!["LOCKET", "ADMIN", "SUPER_ADMIN"].includes(role)) {
    throw new MockHttpError(400, "role tidak valid");
  }
  const exists = store
    .read()
    .users.some((candidate) => candidate.username === username);
  if (exists) {
    throw new MockHttpError(409, "username sudah digunakan");
  }
  const timestamp = nowIso();
  const user: UserSchema = {
    id: crypto.randomUUID(),
    username,
    password,
    role: role as UserSchema["role"],
    fullname,
    created_at: timestamp,
    updated_at: timestamp,
  };
  store.update((db) => ({ ...db, users: [...db.users, user] }));
  return created(sanitizeUser(user));
};

const handleUpdateUser = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
  id: string,
): RouteResult => {
  requireAuth(store, config);
  const body = readBody(config);
  const db = store.read();
  const index = db.users.findIndex((candidate) => candidate.id === id);
  if (index === -1) throw new MockHttpError(404, "pengguna tidak ditemukan");
  const current = db.users[index]!;
  const username = pickString(body["username"]) ?? current.username;
  const duplicate = db.users.some(
    (candidate) => candidate.id !== id && candidate.username === username,
  );
  if (duplicate) throw new MockHttpError(409, "username sudah digunakan");
  const role = pickString(body["role"]);
  if (role && !["LOCKET", "ADMIN", "SUPER_ADMIN"].includes(role)) {
    throw new MockHttpError(400, "role tidak valid");
  }
  const password = pickString(body["password"]);
  const updated: UserSchema = {
    ...current,
    username,
    fullname: pickString(body["fullname"]) ?? current.fullname,
    role: (role ?? current.role) as UserSchema["role"],
    password: password ?? current.password,
    updated_at: nowIso(),
  };
  store.update((currentDb) => ({
    ...currentDb,
    users: currentDb.users.map((candidate) =>
      candidate.id === id ? updated : candidate,
    ),
  }));
  return ok(sanitizeUser(updated));
};

const handleDeleteUser = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
  id: string,
): RouteResult => {
  requireAuth(store, config);
  const db = store.read();
  if (!db.users.some((candidate) => candidate.id === id)) {
    throw new MockHttpError(404, "pengguna tidak ditemukan");
  }
  store.update((currentDb) => ({
    ...currentDb,
    users: currentDb.users.filter((candidate) => candidate.id !== id),
  }));
  return rawOk({ message: "pengguna berhasil dihapus" });
};

const handleGetDocuments = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
): RouteResult => {
  requireAuth(store, config);
  return ok(paginate(store.read().documents, readParams(config)));
};

const handleCreateDocument = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
): RouteResult => {
  requireAuth(store, config);
  const body = readBody(config);
  const nomorBerkas = pickString(body["nomor_berkas"]);
  if (!nomorBerkas) {
    throw new MockHttpError(400, "nomor berkas wajib diisi");
  }
  const duplicate = store
    .read()
    .documents.some((doc) => doc.nomor_berkas === nomorBerkas);
  if (duplicate) {
    throw new MockHttpError(409, "nomor berkas sudah terdaftar");
  }
  const document = {
    nomor_berkas: nomorBerkas,
    nama_pemilik: pickString(body["nama_pemilik"]) ?? "",
    desa: pickString(body["desa"]) ?? "",
    kecamatan: pickString(body["kecamatan"]) ?? "",
    kode_lokasi: pickString(body["kode_lokasi"]) ?? "",
    created_at: nowIso(),
  };
  store.update((db) => ({ ...db, documents: [...db.documents, document] }));
  return created(document);
};

const handleGetSearchDocuments = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
): RouteResult => {
  requireAuth(store, config);
  return ok(paginate(store.read().searchDocuments, readParams(config)));
};

const handleCreateSearchDocument = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
): RouteResult => {
  const auth = requireAuth(store, config);
  const body = readBody(config);
  const timestamp = nowIso();
  const request = {
    id: crypto.randomUUID(),
    nomor_berkas: pickString(body["nomor_berkas"]) ?? "",
    nama_pemilik: pickString(body["nama_pemilik"]) ?? "",
    desa: pickString(body["desa"]) ?? "",
    kecamatan: pickString(body["kecamatan"]) ?? "",
    status: "PENDING",
    created_at: timestamp,
    changed_at: timestamp,
    created_by_user_id: auth.sub,
    created_by_locket_officer_name: auth.fullname,
  };
  store.update((db) => ({
    ...db,
    searchDocuments: [...db.searchDocuments, request],
  }));
  return created(request);
};

const handleUpdateSearchDocument = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
  id: string,
): RouteResult => {
  const auth = requireAuth(store, config);
  const body = readBody(config);
  const db = store.read();
  const current = db.searchDocuments.find((item) => item.id === id);
  if (!current) {
    throw new MockHttpError(404, "permintaan pencarian berkas tidak ditemukan");
  }
  const nextStatus = pickString(body["status"]);
  if (
    nextStatus &&
    nextStatus !== current.status &&
    NEXT_STATUS[current.status ?? ""] !== nextStatus
  ) {
    throw new MockHttpError(
      400,
      `transisi status dari ${current.status ?? "kosong"} ke ${nextStatus} tidak valid`,
    );
  }
  const updated: SearchDocumentSchema = {
    ...current,
    nomor_berkas: pickString(body["nomor_berkas"]) ?? current.nomor_berkas,
    nama_pemilik: pickString(body["nama_pemilik"]) ?? current.nama_pemilik,
    desa: pickString(body["desa"]) ?? current.desa,
    kecamatan: pickString(body["kecamatan"]) ?? current.kecamatan,
    status: (nextStatus ?? current.status) as SearchDocumentSchema["status"],
    changed_at: nowIso(),
    changed_by_archivist_name: auth.fullname,
  };
  store.update((currentDb) => ({
    ...currentDb,
    searchDocuments: currentDb.searchDocuments.map((item) =>
      item.id === id ? updated : item,
    ),
  }));
  return ok(updated);
};

const handleGetLoanNotes = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
): RouteResult => {
  requireAuth(store, config);
  return ok(paginate(store.read().loanNotes, readParams(config)));
};

const handleCreateLoanNote = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
): RouteResult => {
  const auth = requireAuth(store, config);
  const body = readBody(config);
  const loanNote = {
    id: crypto.randomUUID(),
    nomor_berkas: pickString(body["nomor_berkas"]) ?? "",
    jenis_hak: pickString(body["jenis_hak"]) ?? "",
    tahun: pickString(body["tahun"]) ?? "",
    desa: pickString(body["desa"]) ?? "",
    kecamatan: pickString(body["kecamatan"]) ?? "",
    keperluan: pickString(body["keperluan"]) ?? "",
    nama_peminjam: pickString(body["nama_peminjam"]) ?? "",
    nama_petugas_arsip:
      pickString(body["nama_petugas_arsip"]) ?? auth.fullname,
    created_at: nowIso(),
    created_by_user_id: auth.sub,
  };
  store.update((db) => ({ ...db, loanNotes: [...db.loanNotes, loanNote] }));
  return created(loanNote);
};

const handleUpdateLoanNote = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
): RouteResult => {
  requireAuth(store, config);
  const body = readBody(config);
  const id = pickString(body["id"]);
  const db = store.read();
  const current = id
    ? db.loanNotes.find((item) => item.id === id)
    : undefined;
  if (!current) {
    throw new MockHttpError(404, "bon peminjaman tidak ditemukan");
  }
  const updated = {
    ...current,
    nomor_berkas: pickString(body["nomor_berkas"]) ?? current.nomor_berkas,
    jenis_hak: pickString(body["jenis_hak"]) ?? current.jenis_hak,
    tahun: pickString(body["tahun"]) ?? current.tahun,
    desa: pickString(body["desa"]) ?? current.desa,
    kecamatan: pickString(body["kecamatan"]) ?? current.kecamatan,
    keperluan: pickString(body["keperluan"]) ?? current.keperluan,
    nama_peminjam: pickString(body["nama_peminjam"]) ?? current.nama_peminjam,
    nama_petugas_arsip:
      pickString(body["nama_petugas_arsip"]) ?? current.nama_petugas_arsip,
  };
  store.update((currentDb) => ({
    ...currentDb,
    loanNotes: currentDb.loanNotes.map((item) =>
      item.id === id ? updated : item,
    ),
  }));
  return ok(updated);
};

const dispatch = (
  store: DemoStore,
  config: InternalAxiosRequestConfig,
): RouteResult => {
  const method = (config.method ?? "get").toLowerCase();
  const path = resolvePath(config);
  const body = readBody(config);

  if (method === "post" && path === "/auth/login") {
    return handleAuthLogin(store, body);
  }
  if (method === "post" && path === "/auth/refresh") {
    return handleAuthRefresh(store, body);
  }
  if (method === "get" && path === "/users") {
    return handleGetUsers(store, config);
  }
  const userIdMatch = path.match(/^\/users\/([^/]+)$/);
  if (userIdMatch?.[1]) {
    const id = safeDecodeId(userIdMatch[1]);
    if (method === "get") return handleGetUserById(store, config, id);
    if (method === "put") return handleUpdateUser(store, config, id);
    if (method === "delete") return handleDeleteUser(store, config, id);
  }
  if (method === "post" && path === "/users") {
    return handleCreateUser(store, config);
  }
  if (method === "get" && path === "/documents") {
    return handleGetDocuments(store, config);
  }
  if (method === "post" && path === "/documents") {
    return handleCreateDocument(store, config);
  }
  if (method === "get" && path === "/search-documents") {
    return handleGetSearchDocuments(store, config);
  }
  if (method === "post" && path === "/search-documents") {
    return handleCreateSearchDocument(store, config);
  }
  const requestIdMatch = path.match(/^\/search-documents\/([^/]+)$/);
  if (method === "put" && requestIdMatch?.[1]) {
    return handleUpdateSearchDocument(
      store,
      config,
      safeDecodeId(requestIdMatch[1]),
    );
  }
  if (method === "get" && path === "/loan-notes") {
    return handleGetLoanNotes(store, config);
  }
  if (method === "post" && path === "/loan-notes") {
    return handleCreateLoanNote(store, config);
  }
  if (method === "put" && path === "/loan-notes") {
    return handleUpdateLoanNote(store, config);
  }
  throw new MockHttpError(404, "endpoint tidak ditemukan");
};

const errorCodeForStatus = (status: number): string =>
  status >= 500 ? "ERR_BAD_RESPONSE" : "ERR_BAD_REQUEST";

const statusTextFor = (status: number): string => {
  if (status === 201) return "Created";
  if (status >= 200 && status < 300) return "OK";
  if (status === 400) return "Bad Request";
  if (status === 401) return "Unauthorized";
  if (status === 404) return "Not Found";
  if (status === 409) return "Conflict";
  return "Error";
};

/**
 * Membuat axios adapter yang menjawab seluruh endpoint demo dari store lokal.
 * Bentuk respons (envelope `{ data }` + error `{ message }`) disamakan
 * dengan backend Go sehingga `src/api/*.ts` tidak perlu diubah.
 */
export const createMockAdapter = (options: MockAdapterOptions = {}) => {
  const store = options.store ?? demoStore;
  const latency = options.latencyMs ?? defaultLatencyMs;

  return async (
    config: InternalAxiosRequestConfig,
  ): Promise<AxiosResponse> => {
    if (latency > 0) {
      await sleep(latency);
    }
    try {
      const result = dispatch(store, config);
      return {
        data: result.raw === true ? result.body : { data: result.body },
        status: result.status,
        statusText: statusTextFor(result.status),
        headers: {},
        config,
      };
    } catch (error) {
      if (error instanceof MockHttpError) {
        const response = {
          data: { message: error.message },
          status: error.status,
          statusText: statusTextFor(error.status),
          headers: {},
          config,
        } as AxiosResponse;
        throw new AxiosError(
          error.message,
          errorCodeForStatus(error.status),
          config,
          undefined,
          response,
        );
      }
      throw error;
    }
  };
};

/** Adapter singleton untuk aplikasi. */
export const mockAdapter = createMockAdapter();
