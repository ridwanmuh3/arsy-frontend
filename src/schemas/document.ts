import z from "zod";

export const documentSchema = z.object({
  nomor_berkas: z
    .string()
    .min(1, "nomor berkas tidak boleh kosong")
    .regex(/^\d+$/, "nomor berkas hanya boleh berisi angka"),
  nama_pemilik: z.string().min(1, "nama pemilik tidak boleh kosong"),
  desa: z.string().min(1, "desa tidak boleh kosong"),
  kecamatan: z.string().min(1, "kecamatan tidak boleh kosong"),
  kode_lokasi: z
    .string()
    .min(1, "kode lokasi tidak boleh kosong")
    .min(7, "kode lokasi minimal 7 karakter"),
  created_at: z.string().optional(),
});

export type DocumentSchema = z.infer<typeof documentSchema>;
