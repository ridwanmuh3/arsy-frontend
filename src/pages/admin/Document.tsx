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
import type { DocumentSchema } from "../../schemas/document";
import { isAxiosError } from "axios";
import { useAuth } from "../../hooks/auth";
import { addDocument, findAllDocuments } from "../../api/documents";

const tableColumns = [
  "No",
  "Nama Pemilik",
  "Nomor Berkas",
  "Desa",
  "Kecamatan",
  "Kode Lokasi",
];

type Document = {
  documentNumber: string;
  village: string;
  district: string;
  locationCode: string;
};

const Document = () => {
  const [documents, setDocuments] = useState<DocumentSchema[]>([]);
  const [showAddDocumentDialog, setShowAddDocumentDialogHandler] =
    useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const showAddDocumentHandler = (e: MouseEvent) => {
    e.preventDefault();
    setShowAddDocumentDialogHandler((prevState) => !prevState);
  };

  const addDocumentHandler = async (document: DocumentSchema) => {
    try {
      setIsLoading(true);
      let result = await addDocument(document);
      if (isAxiosError(result)) {
        console.error(result.code);
        if (documents.length === 0) {
          setDocuments([]);
        }
        return;
      }

      result = await findAllDocuments();
      if (isAxiosError(result)) {
        console.error(result.code);
        if (documents.length === 0) {
          setDocuments([]);
        }
        return;
      }
      setDocuments(result);
      setShowAddDocumentDialogHandler((prevState) => !prevState);
      setShowSnackbar(true);
    } catch (error) {
      const err = error as Error;
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const showSnackbarHandler = () => {
    setShowSnackbar(false);
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await findAllDocuments();

      if (isAxiosError(result)) {
        console.error(result.code);
        if (documents.length === 0) {
          setDocuments([]);
        }
        return;
      }

      setDocuments(result);
    } catch (error) {
      const err = error as Error;
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [documents]);

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
            display: "flex",
            gap: "0.5rem",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: "2rem",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1>Kelola Berkas</h1>
            <Button
              sx={{
                height: "2.8rem",
              }}
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={showAddDocumentHandler}
            >
              Tambah Berkas
            </Button>
          </Box>
          <TableContainer
            sx={{
              boxShadow: 1,
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {tableColumns.map((menu) => (
                    <TableCell key={menu}>{menu}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.length > 0 ? (
                  documents.map((data, index) => (
                    <TableRow
                      key={data.nomor_berkas}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{data.nama_pemilik}</TableCell>
                      <TableCell>{data.nomor_berkas}</TableCell>
                      <TableCell>{data.desa}</TableCell>
                      <TableCell>{data.kecamatan}</TableCell>
                      <TableCell>{data.kode_lokasi}</TableCell>
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
          message="Berhasil membuat nota peminjaman"
        />
      )}

      {showAddDocumentDialog && (
        <AddDocumentDialog
          showDialog={showAddDocumentDialog}
          showDialogHandler={showAddDocumentHandler}
          addDocumentHandler={addDocumentHandler}
          isLoading={isLoading}
        />
      )}
    </Fragment>
  );
};

export default Document;
