import type { DocumentSchema } from "../schemas/document";
import type { LoanNoteSchema } from "../schemas/loan-note";
import type { SearchDocumentSchema } from "../schemas/search-document";
import type { UserSchema } from "../schemas/user";

/**
 * Bentuk database demo in-memory. Struktur tiap koleksi mengikuti
 * schema Zod yang dipakai halaman-halaman aplikasi sehingga respons
 * mock tidak pernah melanggar validasi sisi klien.
 */
export type DemoDb = {
  users: UserSchema[];
  documents: DocumentSchema[];
  searchDocuments: SearchDocumentSchema[];
  loanNotes: LoanNoteSchema[];
};

const isoDaysAgo = (days: number, hours = 0): string =>
  new Date(Date.now() - (days * 24 + hours) * 3_600_000).toISOString();

const DEMO_PASSWORD = "demo123";

/**
 * Membangun database awal demo. ID user dibuat sekali di sini lalu
 * dipakai ulang sebagai `created_by_user_id` pada request, sehingga
 * filter "LOKET hanya melihat request sendiri" (History.tsx) berfungsi.
 */
export const buildSeedDb = (): DemoDb => {
  const superAdminId = crypto.randomUUID();
  const adminId = crypto.randomUUID();
  const loketId = crypto.randomUUID();
  const arsipId = crypto.randomUUID();
  const loket2Id = crypto.randomUUID();

  const users: UserSchema[] = [
    {
      id: superAdminId,
      username: "superadmin",
      password: DEMO_PASSWORD,
      role: "SUPER_ADMIN",
      fullname: "Super Admin",
      created_at: isoDaysAgo(90),
      updated_at: isoDaysAgo(90),
    },
    {
      id: adminId,
      username: "admin",
      password: DEMO_PASSWORD,
      role: "ADMIN",
      fullname: "Admin Arsip",
      created_at: isoDaysAgo(60),
      updated_at: isoDaysAgo(30),
    },
    {
      id: loketId,
      username: "loket",
      password: DEMO_PASSWORD,
      role: "LOCKET",
      fullname: "Petugas Loket",
      created_at: isoDaysAgo(45),
      updated_at: isoDaysAgo(45),
    },
    {
      id: arsipId,
      username: "petugasarsip",
      password: DEMO_PASSWORD,
      role: "ADMIN",
      fullname: "Petugas Arsip",
      created_at: isoDaysAgo(20),
      updated_at: isoDaysAgo(20),
    },
    {
      id: loket2Id,
      username: "loketdua",
      password: DEMO_PASSWORD,
      role: "LOCKET",
      fullname: "Petugas Loket Dua",
      created_at: isoDaysAgo(10),
      updated_at: isoDaysAgo(10),
    },
  ];

  const documents: DocumentSchema[] = [
    {
      nomor_berkas: "100201",
      nama_pemilik: "Hendra Gunawan",
      desa: "Sukamaju",
      kecamatan: "Cilodong",
      kode_lokasi: "3276051",
      created_at: isoDaysAgo(80),
    },
    {
      nomor_berkas: "100202",
      nama_pemilik: "Siti Rahayu",
      desa: "Kalibaru",
      kecamatan: "Cilincing",
      kode_lokasi: "3172023",
      created_at: isoDaysAgo(75),
    },
    {
      nomor_berkas: "100203",
      nama_pemilik: "Budi Santoso",
      desa: "Margahayu",
      kecamatan: "Bekasi Timur",
      kode_lokasi: "3275014",
      created_at: isoDaysAgo(70),
    },
    {
      nomor_berkas: "100204",
      nama_pemilik: "Dewi Lestari",
      desa: "Cikarang Kota",
      kecamatan: "Cikarang Utara",
      kode_lokasi: "3216022",
      created_at: isoDaysAgo(55),
    },
    {
      nomor_berkas: "100205",
      nama_pemilik: "Agus Wijaya",
      desa: "Bojonggede",
      kecamatan: "Bojonggede",
      kode_lokasi: "3201037",
      created_at: isoDaysAgo(40),
    },
    {
      nomor_berkas: "100206",
      nama_pemilik: "Rina Marlina",
      desa: "Sawangan",
      kecamatan: "Sawangan",
      kode_lokasi: "3276018",
      created_at: isoDaysAgo(25),
    },
    {
      nomor_berkas: "100207",
      nama_pemilik: "Joko Prasetyo",
      desa: "Pondok Gede",
      kecamatan: "Pondok Gede",
      kode_lokasi: "3275029",
      created_at: isoDaysAgo(12),
    },
    {
      nomor_berkas: "100208",
      nama_pemilik: "Nina Kurnia",
      desa: "Jatiasih",
      kecamatan: "Jatiasih",
      kode_lokasi: "3275031",
      created_at: isoDaysAgo(5),
    },
  ];

  type SeedRequest = {
    owner: string;
    status: "PENDING" | "APPROVED" | "COMPLETED";
    daysAgo: number;
    byLoket2?: boolean;
    changedBy?: string;
  };

  const requestSeeds: SeedRequest[] = [
    { owner: "Hendra Gunawan", status: "COMPLETED", daysAgo: 34, changedBy: "Admin Arsip" },
    { owner: "Siti Rahayu", status: "COMPLETED", daysAgo: 28, changedBy: "Admin Arsip" },
    { owner: "Budi Santoso", status: "APPROVED", daysAgo: 9, changedBy: "Admin Arsip" },
    { owner: "Dewi Lestari", status: "PENDING", daysAgo: 3 },
    { owner: "Agus Wijaya", status: "PENDING", daysAgo: 1, byLoket2: true },
    { owner: "Rina Marlina", status: "PENDING", daysAgo: 0 },
  ];

  const desaByOwner: Record<string, [string, string, string, string]> = {
    "Hendra Gunawan": ["Sukamaju", "Cilodong", "100201", "Hak Milik"],
    "Siti Rahayu": ["Kalibaru", "Cilincing", "100202", "Hak Guna Bangunan"],
    "Budi Santoso": ["Margahayu", "Bekasi Timur", "100203", "Hak Milik"],
    "Dewi Lestari": ["Cikarang Kota", "Cikarang Utara", "100204", "Hak Pakai"],
    "Agus Wijaya": ["Bojonggede", "Bojonggede", "100205", "Hak Milik"],
    "Rina Marlina": ["Sawangan", "Sawangan", "100206", "Hak Guna Bangunan"],
  };

  const searchDocuments: SearchDocumentSchema[] = requestSeeds.map((seed) => {
    const [desa, kecamatan] = desaByOwner[seed.owner]!;
    return {
      id: crypto.randomUUID(),
      nomor_berkas: desaByOwner[seed.owner]![2],
      nama_pemilik: seed.owner,
      desa,
      kecamatan,
      status: seed.status,
      created_at: isoDaysAgo(seed.daysAgo, 4),
      changed_at: isoDaysAgo(Math.max(seed.daysAgo - 1, 0), 2),
      created_by_user_id: seed.byLoket2 ? loket2Id : loketId,
      created_by_locket_officer_name: seed.byLoket2
        ? "Petugas Loket Dua"
        : "Petugas Loket",
      changed_by_archivist_name: seed.changedBy,
    };
  });

  const loanNotes: LoanNoteSchema[] = requestSeeds.map((seed, index) => {
    const [desa, kecamatan, nomorBerkas, jenisHak] = desaByOwner[seed.owner]!;
    return {
      id: crypto.randomUUID(),
      nomor_berkas: nomorBerkas,
      jenis_hak: jenisHak,
      tahun: String(2023 + (index % 3)),
      desa,
      kecamatan,
      keperluan: "Pengecekan berkas untuk keperluan balik nama sertipikat",
      nama_peminjam: seed.owner,
      nama_petugas_arsip: seed.changedBy,
      created_at: isoDaysAgo(seed.daysAgo, 5),
      created_by_user_id: seed.byLoket2 ? loket2Id : loketId,
    };
  });

  return { users, documents, searchDocuments, loanNotes };
};
