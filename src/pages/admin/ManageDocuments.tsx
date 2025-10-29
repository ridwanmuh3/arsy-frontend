import { Add } from "@mui/icons-material";
import {
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
import { isAxiosError } from "axios";
import AddDocumentDialog from "../../components/admin/AddDocumentDialog";
import type { DocumentSchema } from "../../schemas/document";
import { addDocument, findAllDocuments } from "../../api/documents";

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

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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

  const handleAddDocument = async (document: DocumentSchema) => {
    try {
      setIsLoading(true);
      setSnackbarMessage("");

      const result = await addDocument(document);
      if (isAxiosError(result)) {
        console.error(result.code);
        return;
      }

      const fetched = await findAllDocuments();
      if (isAxiosError(fetched)) {
        console.error(fetched.code);
        return;
      }

      setDocuments(fetched);
      setSnackbarMessage("Berkas berhasil ditambahkan");
      setShowSnackbar(true);
      setShowAddDialog(false);
    } catch (error) {
      const err = error as Error;
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetched = await findAllDocuments();

      if (isAxiosError(fetched)) {
        console.error(fetched.code);
        setDocuments([]);
        return;
      }

      setDocuments(fetched);
    } catch (error) {
      const err = error as Error;
      console.error(err.message);
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
      <Box sx={{ paddingLeft: "17rem", paddingBottom: "2rem" }}>
        <Box
          sx={{
            paddingX: "2rem",
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
            >
              Tambah Berkas
            </Button>
          </Box>
          <TableContainer sx={{ boxShadow: 1 }}>
            <Table>
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
                      {isLoading ? <CircularProgress /> : "Belum ada data"}
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
          message={snackbarMessage || "Operasi berhasil"}
        />
      )}
    </Fragment>
  );
};

export default ManageDocuments;
