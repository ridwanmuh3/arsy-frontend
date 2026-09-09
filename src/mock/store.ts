import { buildSeedDb, type DemoDb } from "./seed";

export const DEMO_DB_STORAGE_KEY = "arsy-demo-db-v1";

/** Abstraksi storage minimal agar store bisa diuji tanpa browser. */
export type KeyValueStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export const createMemoryStorage = (): KeyValueStorage => {
  const data = new Map<string, string>();
  return {
    getItem: (key) => (data.has(key) ? data.get(key)! : null),
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
};

const sharedMemoryStorage = createMemoryStorage();

const isStorageUsable = (storage: KeyValueStorage, key: string): boolean => {
  try {
    const probe = `__arsy_probe_${key}`;
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
};

/** Storage browser bila tersedia & bisa ditulis, selain itu memori. */
export const defaultStorage = (): KeyValueStorage => {
  try {
    const browserStorage =
      typeof localStorage !== "undefined" ? localStorage : null;
    if (browserStorage && isStorageUsable(browserStorage, "probe")) {
      return browserStorage;
    }
  } catch {
    // abaikan, jatuh ke memori di bawah
  }
  return sharedMemoryStorage;
};

const isValidDb = (value: unknown): value is DemoDb => {
  if (typeof value !== "object" || value === null) return false;
  const db = value as Record<string, unknown>;
  return (
    Array.isArray(db.users) &&
    Array.isArray(db.documents) &&
    Array.isArray(db.searchDocuments) &&
    Array.isArray(db.loanNotes)
  );
};

export type DemoStore = {
  read: () => DemoDb;
  write: (db: DemoDb) => void;
  reset: () => DemoDb;
  update: (mutate: (db: DemoDb) => DemoDb) => DemoDb;
};

/**
 * Store database demo. Data korup / format lama otomatis diganti seed baru
 * sehingga demo tidak pernah macet karena localStorage bermasalah.
 */
export const createStore = (
  storage: KeyValueStorage = defaultStorage(),
  storageKey: string = DEMO_DB_STORAGE_KEY,
): DemoStore => {
  const load = (): DemoDb => {
    try {
      const raw = storage.getItem(storageKey);
      if (!raw) {
        const seed = buildSeedDb();
        storage.setItem(storageKey, JSON.stringify(seed));
        return seed;
      }
      const parsed: unknown = JSON.parse(raw);
      if (!isValidDb(parsed)) {
        const seed = buildSeedDb();
        storage.setItem(storageKey, JSON.stringify(seed));
        return seed;
      }
      return parsed;
    } catch {
      const seed = buildSeedDb();
      try {
        storage.setItem(storageKey, JSON.stringify(seed));
      } catch {
        // storage penuh / read-only: tetap kembalikan seed in-memory
      }
      return seed;
    }
  };

  return {
    read: load,
    write: (db) => {
      storage.setItem(storageKey, JSON.stringify(db));
    },
    reset: () => {
      const seed = buildSeedDb();
      try {
        storage.setItem(storageKey, JSON.stringify(seed));
      } catch {
        // abaikan, pemanggil tetap menerima seed segar
      }
      return seed;
    },
    update: (mutate) => {
      const next = mutate(load());
      try {
        storage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // abaikan, perubahan tetap berlaku untuk sesi ini
      }
      return next;
    },
  };
};

/** Singleton untuk aplikasi (persist localStorage di browser). */
export const demoStore = createStore();
