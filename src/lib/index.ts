import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/id";
import type { LoanNoteSchema } from "../schemas/loan-note";
import type { SearchDocumentSchema } from "../schemas/search-document";

dayjs.extend(localizedFormat);
dayjs.locale("id");

export const DATETIME_FALLBACK = "—";

export const dateTimeHandler = () => {
  return dayjs(Date.now()).format("YYYY-MM-DD HH:mm");
};

/** Format tanggal-waktu Indonesia; aman untuk nilai kosong/invalid. */
export const formatDateTime = (value?: string): string => {
  if (!value) return DATETIME_FALLBACK;
  const parsed = dayjs(value);
  if (!parsed.isValid()) return DATETIME_FALLBACK;
  return parsed.format("DD MMMM YYYY HH:mm:ss");
};

/** Format tanggal Indonesia (tanpa jam); aman untuk nilai kosong/invalid. */
export const formatDate = (value?: string): string => {
  if (!value) return DATETIME_FALLBACK;
  const parsed = dayjs(value);
  if (!parsed.isValid()) return DATETIME_FALLBACK;
  return parsed.format("DD MMMM YYYY");
};

/**
 * Mencari bon yang dimiliki request lewat nomor berkas (identitas stabil),
 * bukan nama pemohon yang bisa duplikat atau salah ketik.
 */
export const findLoanNoteForRequest = (
  loanNotes: LoanNoteSchema[],
  request: Partial<
    Pick<SearchDocumentSchema, "nomor_berkas" | "nama_pemilik">
  >,
): LoanNoteSchema | undefined => {
  if (request.nomor_berkas) {
    const byNumber = loanNotes.find(
      (note) => note.nomor_berkas === request.nomor_berkas,
    );
    if (byNumber) return byNumber;
  }
  return loanNotes.find((note) => note.nama_peminjam === request.nama_pemilik);
};

/** Batas atas halaman agar paginasi tidak menunjuk halaman kosong. */
export const clampPage = (
  page: number,
  itemCount: number,
  rowsPerPage: number,
): number => {
  if (rowsPerPage <= 0) return 0;
  const maxPage = Math.max(0, Math.ceil(itemCount / rowsPerPage) - 1);
  if (page > maxPage) return maxPage;
  return page < 0 ? 0 : page;
};
