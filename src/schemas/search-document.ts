import z from "zod";

const statusEnum = ["PENDING", "APPROVED", "COMPLETED"];

export const searchDocumentSchema = z.object({
  id: z.uuid().optional(),
  nomor_berkas: z.string().nonempty("nomor berkas tidak boleh kosong"),
  nama_pemilik: z.string().nonempty("nama pemilik tidak boleh kosong"),
  desa: z.string().nonempty("desa tidak boleh kosong"),
  kecamatan: z.string().nonempty("kecamatan tidak boleh kosong"),
  status: z.enum(statusEnum).optional(),
  created_at: z.string().optional(),
  changed_at: z.string().optional(),
  created_by_user_id: z.uuid().optional(),
  changed_by_archivist_name: z.string().optional(),
  created_by_locket_officer_name: z.string().optional(),
});

export type SearchDocumentSchema = z.infer<typeof searchDocumentSchema>;
