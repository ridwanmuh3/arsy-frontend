import { Add, DescriptionOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import {
  Fragment,
  useCallback,
  useEffect,
  useState,
  type MouseEvent,
} from "react";
import AddDocumentDialog from "../../components/admin/AddDocumentDialog";
import EmptyState from "../../components/EmptyState";
import type { DocumentSchema } from "../../schemas/document";
import { addDocument, findAllDocuments } from "../../api/documents";
import { useSafePage } from "../../hooks/pagination";

const tableColumns = [
  "No",
  "Nama Pemilik",
  "Nomor Berkas",
  "Desa",
  "Kecamatan",
  "Kode Lokasi",
];

const ManageDocuments = () => {
  const [documents, setDocuments] = useState<DocumentSchema[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error"
  >("success");

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useSafePage(documents.length, rowsPerPage);

  const toggleAddDialog = (e?: MouseEvent) => {
    if (e) e.preventDefault();
    setShowAddDialog((prev) => !prev);
  };

  const toggleSnackbar = () => {
    setShowSnackbar((prev) => !prev);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleAddDocument = async (
    document: DocumentSchema
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setSnackbarMessage("");

      await addDocument(document);
      const fetched = await findAllDocuments();
      setDocuments(fetched);
      setSnackbarSeverity("success");
      setSnackbarMessage("Berkas berhasil ditambahkan");
      setShowSnackbar(true);
      setShowAddDialog(false);
      return true;
    } catch (error) {
      const err = error as Error;
      setSnackbarSeverity("error");
      setSnackbarMessage(err.message);
      setShowSnackbar(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetched = await findAllDocuments();
      setDocuments(fetched);
    } catch (error) {
      const err = error as Error;
      setSnackbarSeverity("error");
      setSnackbarMessage(err.message);
      setShowSnackbar(true);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const paginatedData = documents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              rowGap: "0.75rem",
              gap: "2rem",
            }}
          >
            <h1>Kelola Berkas</h1>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              sx={{ height: "3rem" }}
              onClick={toggleAddDialog}
              disabled={isLoading}
            >
              Tambah Berkas
            </Button>
          </Box>
          <TableContainer sx={{ boxShadow: 1 }}>
            <Table sx={{ "& td": { overflowWrap: "anywhere" } }}>
              <TableHead>
                <TableRow>
                  {tableColumns.map((col) => (
                    <TableCell key={col}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData && paginatedData.length > 0 ? (
                  paginatedData.map((data, index) => (
                    <TableRow key={data.nomor_berkas}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{data.nama_pemilik}</TableCell>
                      <TableCell>{data.nomor_berkas}</TableCell>
                      <TableCell>{data.desa}</TableCell>
                      <TableCell>{data.kecamatan}</TableCell>
                      <TableCell>{data.kode_lokasi}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={tableColumns.length} align="center">
                      {isLoading ? (
                        <CircularProgress />
                      ) : (
                        <EmptyState
                          icon={<DescriptionOutlined />}
                          title="Belum ada berkas"
                          description="Berkas arsip yang didaftarkan akan muncul di sini dan bisa dicari lewat permintaan peminjaman."
                          action={{
                            label: "Tambah berkas",
                            onClick: toggleAddDialog,
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={documents.length}
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

      {showAddDialog && (
        <AddDocumentDialog
          showDialog={showAddDialog}
          showDialogHandler={toggleAddDialog}
          addDocumentHandler={handleAddDocument}
          isLoading={isLoading}
        />
      )}

      {showSnackbar && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={showSnackbar}
          autoHideDuration={2500}
          onClose={toggleSnackbar}
        >
          <Alert severity={snackbarSeverity} onClose={toggleSnackbar}>
            {snackbarMessage || "Operasi berhasil"}
          </Alert>
        </Snackbar>
      )}
    </Fragment>
  );
};

export default ManageDocuments;
