import { describe, expect, test } from "bun:test";
import {
  createMemoryStorage,
  createStore,
  DEMO_DB_STORAGE_KEY,
  type KeyValueStorage,
} from "./store";
import { buildSeedDb } from "./seed";

const freshStore = () =>
  createStore(createMemoryStorage(), `test-${crypto.randomUUID()}`);

describe("buildSeedDb", () => {
  test("memuat 3 role + data pendukung yang konsisten", () => {
    const db = buildSeedDb();
    const roles = new Set(db.users.map((user) => user.role));
    expect(roles).toEqual(new Set(["SUPER_ADMIN", "ADMIN", "LOCKET"]));
    expect(db.users.length).toBeGreaterThanOrEqual(3);
    expect(db.documents.length).toBeGreaterThan(0);
    expect(db.searchDocuments.length).toBeGreaterThan(0);
    expect(db.loanNotes.length).toBeGreaterThan(0);
  });

  test("setiap bon peminjaman cocok dengan request (nama_peminjam = nama_pemilik)", () => {
    const db = buildSeedDb();
    const owners = new Set(db.searchDocuments.map((item) => item.nama_pemilik));
    for (const note of db.loanNotes) {
      expect(owners.has(note.nama_peminjam)).toBe(true);
    }
  });

  test("request menunjuk ke user loket yang ada (filter History valid)", () => {
    const db = buildSeedDb();
    const userIds = new Set(db.users.map((user) => user.id));
    for (const request of db.searchDocuments) {
      expect(userIds.has(request.created_by_user_id)).toBe(true);
    }
  });

  test("status seed hanya berisi nilai enum yang valid", () => {
    const db = buildSeedDb();
    for (const request of db.searchDocuments) {
      expect(["PENDING", "APPROVED", "COMPLETED"]).toContain(
        request.status ?? "UNKNOWN",
      );
    }
  });
});

describe("createStore", () => {
  test("inisialisasi seed saat storage kosong dan persist", () => {
    const storage = createMemoryStorage();
    const store = createStore(storage, `test-${crypto.randomUUID()}`);
    const first = store.read();
    expect(first.users.length).toBeGreaterThan(0);
    const raw = storage.getItem(DEMO_DB_STORAGE_KEY);
    expect(raw).toBeNull(); // key kustom, bukan key default
    const second = store.read();
    expect(second).toEqual(first);
  });

  test("update tersimpan dan terbaca kembali", () => {
    const store = freshStore();
    const before = store.read().users.length;
    store.update((db) => ({
      ...db,
      users: [
        ...db.users,
        {
          id: crypto.randomUUID(),
          username: "penggunabaru",
          password: "demo123",
          role: "LOCKET",
          fullname: "Pengguna Baru",
        },
      ],
    }));
    expect(store.read().users).toHaveLength(before + 1);
  });

  test("reset mengembalikan seed segar", () => {
    const store = freshStore();
    store.update((db) => ({ ...db, users: [] }));
    expect(store.read().users).toHaveLength(0);
    const seed = store.reset();
    expect(seed.users.length).toBeGreaterThan(0);
    expect(store.read().users.length).toBe(seed.users.length);
  });

  test("JSON korup diganti seed baru, tidak throw", () => {
    const storage = createMemoryStorage();
    const key = `test-${crypto.randomUUID()}`;
    storage.setItem(key, "{json-rusak");
    const store = createStore(storage, key);
    const db = store.read();
    expect(db.users.length).toBeGreaterThan(0);
  });

  test("format lama / shape salah diganti seed baru", () => {
    const storage = createMemoryStorage();
    const key = `test-${crypto.randomUUID()}`;
    storage.setItem(key, JSON.stringify({ users: [], versi: 1 }));
    const store = createStore(storage, key);
    expect(store.read().loanNotes.length).toBeGreaterThan(0);
  });

  test("storage read-only tetap mengembalikan data sesi", () => {
    const broken: KeyValueStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("penuh");
      },
      removeItem: () => undefined,
    };
    const store = createStore(broken, `test-${crypto.randomUUID()}`);
    expect(store.read().users.length).toBeGreaterThan(0);
    expect(() =>
      store.update((db) => ({ ...db, documents: [] })),
    ).not.toThrow();
  });
});
