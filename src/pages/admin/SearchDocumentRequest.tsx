import {
  Box,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Snackbar,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { blue, green, grey } from "@mui/material/colors";
import { Fragment, type MouseEvent, useEffect, useState } from "react";
import { Refresh, Visibility } from "@mui/icons-material";
import dayjs from "dayjs";
import {
  findAllSearchDocumentsRequest,
  updateStatusSearchDocumentRequest,
} from "../../api/search-documents";
import { isAxiosError } from "axios";
import { type LoanNoteSchema } from "../../schemas/loan-note";
import { findAllLoanNotes } from "../../api/loan-note";
import LoanNote from "../../components/LoanNote";
import type { SearchDocumentSchema } from "../../schemas/search-document";
import ConfirmChangeStatusRequestDialog from "../../components/admin/ConfirmChangeStatusRequestDialog";

const tableColumns = [
  "No",
  "Petugas Loket",
  "Waktu Request",
  "Status",
  "Diubah Oleh",
  "Waktu Update",
  "Lihat Bon",
];

const SearchDocumentRequest = () => {
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [searchDocumentData, setSearchDocumentData] = useState<
    SearchDocumentSchema[]
  >([]);
  const [showLoanNote, setShowLoanNote] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [loanNoteData, setLoanNoteData] = useState<LoanNoteSchema[]>([]);
  const [currentLoanNote, setCurrentLoanNote] = useState<LoanNoteSchema>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [requestID, setRequestID] = useState<string>("");

  const showConfirmDialogHandler = (e: MouseEvent) => {
    e.preventDefault();
    setShowConfirmDialog((prevState) => !prevState);
  };

  const showSnackbarHandler = () => {
    setShowSnackbar((prevState) => !prevState);
  };

  const changeSearchRequestStatusHandler = async () => {
    try {
      setIsLoading(true);
      const data = searchDocumentData.find((d) => d.id === requestID);
      if (!data) {
        console.error("data tidak ditemukan, requestID:", requestID);
        return;
      }

      let state = data.status;
      if (data) {
        if (state === "PENDING") {
          state = "APPROVED";
        } else if (state === "APPROVED") {
          state = "COMPLETED";
        } else {
          state = "COMPLETED";
        }
      }

      const result = await updateStatusSearchDocumentRequest({
        ...data,
        status: state,
      });
      if (isAxiosError(result)) {
        console.error(result.code);
        return;
      }

      const fetchedSearchDocumentsRequest =
        await findAllSearchDocumentsRequest();
      if (isAxiosError(fetchedSearchDocumentsRequest)) {
        console.error(fetchedSearchDocumentsRequest.code);
        return;
      }

      setSearchDocumentData(fetchedSearchDocumentsRequest);
      setShowSnackbar(true);
    } catch (error) {
      const err = error as Error;
      console.error(err.message);
    } finally {
      setRequestID("");
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const showNotificationHandler = () => {
    setShowNotification((prevState) => !prevState);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const fetchedSearchDocumentsRequest =
        await findAllSearchDocumentsRequest();
      if (isAxiosError(fetchedSearchDocumentsRequest)) {
        console.error(fetchedSearchDocumentsRequest.code);
        return;
      }

      if (
        fetchedSearchDocumentsRequest.length > searchDocumentData.length &&
        fetchedSearchDocumentsRequest.some(
          (doc: SearchDocumentSchema) => doc.status !== "COMPLETED",
        )
      ) {
        setShowNotification(true);
      }
      setSearchDocumentData(fetchedSearchDocumentsRequest);

      const fetchedLoanNotes = await findAllLoanNotes();
      if (isAxiosError(fetchedLoanNotes)) {
        console.error(fetchedLoanNotes.code);
        return;
      }

      setLoanNoteData(fetchedLoanNotes);
    } catch (error) {
      const err = error as Error;
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
            <h1>Permintaan Pencarian Berkas</h1>
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
                {searchDocumentData && searchDocumentData.length > 0 ? (
                  searchDocumentData.map((data, index) => (
                    <TableRow
                      key={data.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {data.created_by_locket_officer_name}
                      </TableCell>
                      <TableCell>
                        {dayjs(data.created_at).format(
                          "DD MMMM YYYY HH:mm:ss",
                        )}{" "}
                      </TableCell>
                      <TableCell>
                        <Button
                          sx={{
                            backgroundColor:
                              data.status === "PENDING"
                                ? grey[100]
                                : data.status === "APPROVED"
                                  ? blue[100]
                                  : green[100],
                            color: grey[800],
                          }}
                          onClick={(e: MouseEvent) => {
                            e.preventDefault();
                            setRequestID(data.id!);
                            setShowConfirmDialog((prevState) => !prevState);
                          }}
                          disabled={isLoading || data.status === "COMPLETED"}
                        >
                          {data.status}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {data.changed_by_archivist_name
                          ? data.changed_by_archivist_name
                          : "Belum Diketahui"}
                      </TableCell>
                      <TableCell>
                        {dayjs(data.changed_at).format("DD MMMM YYYY HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<Visibility />}
                          onClick={() => {
                            const borrowerName = data.nama_pemilik;
                            const currentLoan = loanNoteData.find(
                              (val) => val.nama_peminjam === borrowerName,
                            );

                            if (!currentLoan) {
                              console.error(
                                "Loan not found for borrower:",
                                borrowerName,
                              );
                              return;
                            }

                            setCurrentLoanNote(currentLoan);
                            setShowLoanNote(true);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={tableColumns.length} align="center">
                      {isLoading ? <CircularProgress /> : "Belum ada data"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
      {showLoanNote && (
        <Box
          sx={{
            display: showLoanNote ? "block" : "none",
            backgroundColor: "#00000050",
            position: "fixed",
            inset: 0,
            zIndex: 150,
            paddingY: "1rem",
            overflowY: "auto",
          }}
        >
          {
            <LoanNote
              showLoanNoteHandler={setShowLoanNote}
              loanNote={currentLoanNote!}
            />
          }
        </Box>
      )}
      {showConfirmDialog && (
        <ConfirmChangeStatusRequestDialog
          showDialog={showConfirmDialog}
          showDialogHandler={showConfirmDialogHandler}
          changeSearchRequestStatusHandler={changeSearchRequestStatusHandler}
          isLoading={isLoading}
        />
      )}
      {showSnackbar && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={showSnackbar}
          autoHideDuration={2500}
          onClose={showSnackbarHandler}
          message="Berhasil mengubah status request"
        />
      )}
      {showNotification && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={showNotification}
          autoHideDuration={2500}
          onClose={showNotificationHandler}
          message="Terdapat request pencarian berkas baru"
        />
      )}
    </Fragment>
  );
};

export default SearchDocumentRequest;
