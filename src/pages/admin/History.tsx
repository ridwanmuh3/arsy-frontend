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
} from "@mui/material";
import { Fragment, useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { findAllSearchDocumentsRequest } from "../../api/search-documents";
import dayjs from "dayjs";
import { blue, green, grey } from "@mui/material/colors";
import { getUserFromToken } from "../../lib/auth";
import type { SearchDocumentSchema } from "../../schemas/search-document";
import { Refresh } from "@mui/icons-material";

dayjs().locale();

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
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const user = getUserFromToken();

  const showSnackbarHandler = () => {
    setShowSnackbar((prevState) => !prevState);
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await findAllSearchDocumentsRequest();
      if (isAxiosError(data)) {
        console.error(data.code);
        if (historyData.length === 0) {
          setHistoryData([]);
        }
        return;
      }

      setHistoryData(data);
    } catch (error) {
      const err = error as Error;
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [historyData]);

  useEffect(() => {
    fetchData();
  }, []);

  const currentHistoryForUser =
    historyData && historyData.length > 0 && user?.role === "LOCKET"
      ? historyData.filter((d) => d.created_by_user_id === user?.sub)
      : historyData;

  return (
    <Fragment>
      <Box
        sx={{
          paddingLeft: "17rem",
          paddingBottom: "2rem",
        }}
      >
        <Box
          sx={{
            paddingX: "2rem",
            paddingY: "0.5rem",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "2rem",
            }}
          >
            <h1>Riwayat Permintaan Pencarian Berkas</h1>
            <IconButton
              sx={{
                height: "2.5rem",
              }}
              title="Refresh"
              onClick={() => {
                fetchData();
              }}
            >
              <Refresh color="primary" />
            </IconButton>
          </Box>

          <TableContainer
            sx={{
              boxShadow: 1,
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {tableColumns.map((name) => (
                    <TableCell key={name}>{name}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {currentHistoryForUser && currentHistoryForUser.length > 0 ? (
                  currentHistoryForUser.map((data, index) => (
                    <TableRow
                      key={data.nomor_berkas}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{data.nama_pemilik}</TableCell>
                      <TableCell>{data.nomor_berkas}</TableCell>
                      <TableCell>{data.desa}</TableCell>
                      <TableCell>{data.kecamatan}</TableCell>
                      <TableCell>
                        {data.created_by_locket_officer_name}
                      </TableCell>
                      <TableCell>
                        {dayjs(data.created_at).format("DD MMMM YYYY HH:mm:ss")}
                      </TableCell>
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
                      <TableCell>
                        {dayjs(data.changed_at).format("DD MMMM YYYY HH:mm:ss")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell align="center" colSpan={tableColumns.length}>
                      {isLoading ? <CircularProgress /> : "Belum ada data"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
      {showSnackbar && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={showSnackbar}
          autoHideDuration={2500}
          onClose={showSnackbarHandler}
          message="Terdapat perubahan data request pencarian"
        />
      )}
    </Fragment>
  );
};

export default History;
