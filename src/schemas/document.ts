import z from "zod";

export const documentSchema = z.object({
  nomor_berkas: z
    .string()
    .regex(/\d/)
    .nonempty("nomor berkas tidak boleh kosong"),
  nama_pemilik: z.string().nonempty("nama pemilik tidak boleh kosong"),
  desa: z.string().nonempty("desa tidak boleh kosong"),
  kecamatan: z.string().nonempty("kecamatan tidak boleh kosong"),
  kode_lokasi: z.string().nonempty("kode lokasi tidak boleh kosong"),
  created_at: z.string().optional(),
});

export type DocumentSchema = z.infer<typeof documentSchema>;
