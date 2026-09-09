import {
  Box,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  Snackbar,
  IconButton,
  TablePagination,
} from "@mui/material";
import { Fragment, useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { findAllSearchDocumentsRequest } from "../../api/search-documents";
import { blue, green, grey } from "@mui/material/colors";
import { getUserFromToken } from "../../lib/auth";
import { formatDateTime } from "../../lib";
import { useSafePage } from "../../hooks/pagination";
import type { SearchDocumentSchema } from "../../schemas/search-document";
import EmptyState from "../../components/EmptyState";
import { History as HistoryIcon, Refresh } from "@mui/icons-material";

const tableColumns = [
  "No",
  "Nama Pemohon",
  "Nomor Berkas",
  "Desa",
  "Kecamatan",
  "Petugas Loket",
  "Waktu Request",
  "Status",
  "Diubah oleh Petugas Arsip",
  "Waktu Diubah",
];

const History = () => {
  const [historyData, setHistoryData] = useState<SearchDocumentSchema[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useSafePage(historyData.length, rowsPerPage);

  const user = getUserFromToken();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const data = await findAllSearchDocumentsRequest();

      if (isAxiosError(data)) {
        console.error(data.code);
        setHistoryData([]);
        return;
      }

      setHistoryData(data);
    } catch (error) {
      const message = (error as Error).message;
      console.error(message);
      setErrorMessage(`Gagal memuat riwayat: ${message}. Tekan Refresh untuk mencoba lagi.`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data sesuai user (LOCKET hanya melihat request sendiri)
  const currentHistoryForUser =
    historyData && historyData.length > 0 && user?.role === "LOCKET"
      ? historyData.filter((d) => d.created_by_user_id === user?.id)
      : historyData;

  // Data untuk halaman saat ini
  const paginatedData = currentHistoryForUser.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handler pagination
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Fragment>
      <Box
        sx={{
          paddingLeft: { xs: 0, md: "17rem" },
          paddingBottom: "2rem",
        }}
      >
        <Box
          sx={{
            paddingX: { xs: "1rem", md: "2rem" },
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
          }}
        >
          <Box
            sx={{
              paddingTop: "0.8rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              rowGap: "0.5rem",
              gap: "2rem",
            }}
          >
            <h1>Riwayat Permintaan Pencarian Berkas</h1>
            <IconButton
              sx={{ minWidth: "2.75rem", minHeight: "2.75rem" }}
              title="Refresh"
              aria-label="Muat ulang data riwayat"
              onClick={() => fetchData()}
            >
              <Refresh color="primary" />
            </IconButton>
          </Box>

          <TableContainer sx={{ boxShadow: 1 }}>
            <Table sx={{ "& td": { overflowWrap: "anywhere" } }}>
              <TableHead>
                <TableRow>
                  {tableColumns.map((name) => (
                    <TableCell key={name}>{name}</TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedData && paginatedData.length > 0 ? (
                  paginatedData.map((data, index) => (
                    <TableRow
                      key={data.nomor_berkas}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{data.nama_pemilik}</TableCell>
                      <TableCell>{data.nomor_berkas}</TableCell>
                      <TableCell>{data.desa}</TableCell>
                      <TableCell>{data.kecamatan}</TableCell>
                      <TableCell>
                        {data.created_by_locket_officer_name}
                      </TableCell>
                      <TableCell>{formatDateTime(data.created_at)}</TableCell>
                      <TableCell>
                        <Chip
                          sx={{
                            backgroundColor:
                              data.status === "PENDING"
                                ? grey[100]
                                : data.status === "APPROVED"
                                ? blue[100]
                                : green[100],
                            color: grey[800],
                          }}
                          label={data.status}
                        />
                      </TableCell>
                      <TableCell>
                        {data.changed_by_archivist_name
                          ? data.changed_by_archivist_name
                          : "Belum diketahui"}
                      </TableCell>
                      <TableCell>{formatDateTime(data.changed_at)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell align="center" colSpan={tableColumns.length}>
                      {isLoading ? (
                        <CircularProgress />
                      ) : (
                        <EmptyState
                          icon={<HistoryIcon />}
                          title="Belum ada riwayat"
                          description={
                            user?.role === "LOCKET"
                              ? "Permintaan peminjaman yang Anda buat akan tercatat di sini beserta statusnya."
                              : "Seluruh permintaan pencarian berkas akan tercatat di sini beserta statusnya."
                          }
                          action={
                            user?.role === "LOCKET"
                              ? {
                                  label: "Buat permintaan baru",
                                  to: "/peminjaman",
                                }
                              : undefined
                          }
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* 🔽 Tambahkan Pagination di bawah tabel */}
            <TablePagination
              component="div"
              count={currentHistoryForUser.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Baris per halaman:"
            />
          </TableContainer>
        </Box>
      </Box>

      {errorMessage !== "" && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={errorMessage !== ""}
          autoHideDuration={4000}
          onClose={() => setErrorMessage("")}
          message={errorMessage}
        />
      )}
    </Fragment>
  );
};

export default History;
