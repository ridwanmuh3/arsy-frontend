import { z } from "zod";

export const loanNoteSchema = z.object({
  id: z.uuid().optional(),
  nomor_berkas: z
    .string()
    .regex(/\d/)
    .nonempty("nomor berkas tidak boleh kosong"),
  jenis_hak: z
    .string()
    .nonempty()
    .refine((data) => data !== "default", {
      message: "pilih jenis hak",
    }),
  tahun: z.string().regex(/\d/).nonempty("tahun dokumen tidak boleh kosong"),
  desa: z.string().nonempty("desa tidak boleh kosong"),
  kecamatan: z.string().nonempty("kecamatan tidak boleh kosong"),
  keperluan: z.string().nonempty("keterangan tidak boleh kosong"),
  nama_peminjam: z.string().nonempty("nama pemohon tidak boleh kosong"),
  nama_petugas_arsip: z.string().optional(),
  created_at: z.string().optional(),
  created_by_user_id: z.uuid().optional(),
});

export type LoanNoteSchema = z.infer<typeof loanNoteSchema>;
