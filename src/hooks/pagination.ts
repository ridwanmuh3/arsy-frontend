import { useEffect, useState } from "react";
import { clampPage } from "../lib";

/**
 * State halaman tabel yang otomatis mundur bila data menyusut
 * (mis. setelah hapus) sehingga tabel tidak terjebak di halaman kosong.
 */
export const useSafePage = (itemCount: number, rowsPerPage: number) => {
  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    setPage((current) => clampPage(current, itemCount, rowsPerPage));
  }, [itemCount, rowsPerPage]);

  return [page, setPage] as const;
};
