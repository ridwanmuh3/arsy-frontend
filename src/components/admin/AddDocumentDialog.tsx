import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { Fragment, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { documentSchema, type DocumentSchema } from "../../schemas/document";

type Props = {
  showDialog: boolean;
  showDialogHandler: (e: MouseEvent) => void;
  addDocumentHandler: (data: DocumentSchema) => void;
  isLoading: boolean;
};

const AddDocumentDialog = ({
  showDialog,
  showDialogHandler,
  addDocumentHandler,
  isLoading,
}: Props) => {
  const form = useForm({ resolver: zodResolver(documentSchema) });

  const submitHandler = (data: DocumentSchema) => {
    addDocumentHandler(data);
  };

  return (
    <Fragment>
      <form onSubmit={form.handleSubmit(submitHandler)} autoComplete="off">
        <Dialog
          fullWidth
          maxWidth="xs"
          open={showDialog}
          onClose={showDialogHandler}
          disablePortal
        >
          <DialogTitle align="left" fontSize="2rem" id="add-document">
            Tambah Berkas
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                paddingY: "0.5rem",
              }}
            >
              <FormControl>
                <TextField
                  type="text"
                  variant="outlined"
                  id="nomor-berkas"
                  label="Nomor Berkas"
                  {...form.register("nomor_berkas")}
                />
                {form.formState.errors.nomor_berkas ? (
                  <span
                    style={{
                      color: red[500],
                      marginTop: "0.7rem",
                      textAlign: "center",
                    }}
                  >
                    {form.formState.errors.nomor_berkas.message}
                  </span>
                ) : null}
              </FormControl>
              <FormControl>
                <TextField
                  type="text"
                  variant="outlined"
                  id="nama-pemilik"
                  label="Nama Pemilik"
                  {...form.register("nama_pemilik")}
                />
                {form.formState.errors.nama_pemilik ? (
                  <span
                    style={{
                      color: red[500],
                      marginTop: "0.7rem",
                      textAlign: "center",
                    }}
                  >
                    {form.formState.errors.nama_pemilik.message}
                  </span>
                ) : null}
              </FormControl>
              <FormControl>
                <TextField
                  type="text"
                  variant="outlined"
                  id="desa"
                  label="Desa"
                  {...form.register("desa")}
                />
                {form.formState.errors.desa ? (
                  <span
                    style={{
                      color: red[500],
                      marginTop: "0.7rem",
                      textAlign: "center",
                    }}
                  >
                    {form.formState.errors.desa.message}
                  </span>
                ) : null}
              </FormControl>
              <FormControl>
                <TextField
                  type="text"
                  variant="outlined"
                  id="kecamatan"
                  label="Kecamatan"
                  {...form.register("kecamatan")}
                />
                {form.formState.errors.kecamatan ? (
                  <span
                    style={{
                      color: red[500],
                      marginTop: "0.7rem",
                      textAlign: "center",
                    }}
                  >
                    {form.formState.errors.kecamatan.message}
                  </span>
                ) : null}
              </FormControl>
              <FormControl>
                <TextField
                  type="text"
                  variant="outlined"
                  id="kode-lokasi"
                  label="Kode Lokasi"
                  {...form.register("kode_lokasi")}
                />
                {form.formState.errors.kode_lokasi ? (
                  <span
                    style={{
                      color: red[500],
                      marginTop: "0.7rem",
                      textAlign: "center",
                    }}
                  >
                    {form.formState.errors.kode_lokasi.message}
                  </span>
                ) : null}
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={showDialogHandler}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              autoFocus
              disabled={isLoading}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </form>
    </Fragment>
  );
};

export default AddDocumentDialog;
