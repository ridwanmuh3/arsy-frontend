import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { documentSchema, type DocumentSchema } from "../../schemas/document";
import type { MouseEvent } from "react";

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
  const form = useForm<DocumentSchema>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      nomor_berkas: "",
      nama_pemilik: "",
      desa: "",
      kecamatan: "",
      kode_lokasi: "",
    },
  });

  const submitHandler = (data: DocumentSchema) => {
    addDocumentHandler(data);
    form.reset();
  };

  const handleClose = (e: MouseEvent) => {
    showDialogHandler(e);
    form.reset();
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={showDialog}
      onClose={handleClose}
      disablePortal
    >
      <form onSubmit={form.handleSubmit(submitHandler)} autoComplete="off">
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
            <TextField
              type="text"
              variant="outlined"
              id="nomor-berkas"
              label="Nomor Berkas"
              {...form.register("nomor_berkas")}
              error={!!form.formState.errors.nomor_berkas}
              helperText={form.formState.errors.nomor_berkas?.message}
            />
            <TextField
              type="text"
              variant="outlined"
              id="nama-pemilik"
              label="Nama Pemilik"
              {...form.register("nama_pemilik")}
              error={!!form.formState.errors.nama_pemilik}
              helperText={form.formState.errors.nama_pemilik?.message}
            />
            <TextField
              type="text"
              variant="outlined"
              id="desa"
              label="Desa"
              {...form.register("desa")}
              error={!!form.formState.errors.desa}
              helperText={form.formState.errors.desa?.message}
            />
            <TextField
              type="text"
              variant="outlined"
              id="kecamatan"
              label="Kecamatan"
              {...form.register("kecamatan")}
              error={!!form.formState.errors.kecamatan}
              helperText={form.formState.errors.kecamatan?.message}
            />
            <TextField
              type="text"
              variant="outlined"
              id="kode-lokasi"
              label="Kode Lokasi"
              {...form.register("kode_lokasi")}
              error={!!form.formState.errors.kode_lokasi}
              helperText={form.formState.errors.kode_lokasi?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
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
      </form>
    </Dialog>
  );
};

export default AddDocumentDialog;
