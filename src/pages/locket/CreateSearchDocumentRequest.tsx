import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { loanNoteSchema, type LoanNoteSchema } from "../../schemas/loan-note";
import { dateTimeHandler } from "../../lib";
import LoanNote from "../../components/LoanNote";
import { isAxiosError } from "axios";
import { createLoanNote } from "../../api/loan-note";
import { createSearchDocumentRequest } from "../../api/search-documents";

const CreateSearchDocumentRequest = () => {
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [showLoanNote, setShowLoanNote] = useState<boolean>(false);
  const [loanNoteData, setLoanNoteData] = useState<LoanNoteSchema>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(loanNoteSchema),
  });

  const submitHandler = async (data: LoanNoteSchema) => {
    try {
      setIsLoading(true);
      setLoanNoteData(data);

      let result = await createLoanNote(data);
      if (isAxiosError(result)) {
        console.error(result.code);
        return;
      }

      result = await createSearchDocumentRequest({
        nomor_berkas: data.nomor_berkas,
        nama_pemilik: data.nama_peminjam,
        desa: data.desa,
        kecamatan: data.kecamatan,
      });
      if (isAxiosError(result)) {
        console.error(result.code);
        return;
      }

      setShowSnackbar(true);
      form.reset();
    } catch (err) {
      const e = err as Error;
      console.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const showLoanNoteHandler = () => {
    setShowLoanNote((prev) => !prev);
  };

  const showSnackbarHandler = () => {
    setShowSnackbar((prev) => !prev);
  };

  return (
    <Fragment>
      <Box sx={{ paddingLeft: "17rem", paddingBottom: "2rem" }}>
        <Box
          sx={{
            paddingX: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
          }}
        >
          <h1>Buat Request Peminjaman Berkas</h1>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
            maxWidth="sm"
            component="form"
            onSubmit={form.handleSubmit(submitHandler)}
          >
            <FormControl>
              <TextField
                type="text"
                variant="outlined"
                id="nama-pemohon"
                label="Nama Pemohon"
                {...form.register("nama_peminjam")}
              />
            </FormControl>
            <FormControl>
              <TextField
                type="text"
                variant="outlined"
                id="nomor-berkas"
                label="Nomor Berkas"
                {...form.register("nomor_berkas")}
              />
            </FormControl>
            <FormControl>
              <TextField
                type="number"
                variant="outlined"
                id="tahun"
                label="Tahun"
                {...form.register("tahun")}
              />
            </FormControl>
            <FormControl
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "1.5rem",
              }}
            >
              <TextField
                type="text"
                variant="outlined"
                id="desa"
                label="Desa"
                fullWidth
                {...form.register("desa")}
              />
              <TextField
                type="text"
                variant="outlined"
                id="kecamatan"
                label="Kecamatan"
                fullWidth
                {...form.register("kecamatan")}
              />
            </FormControl>
            <FormControl>
              <InputLabel id="jenis-peminjaman">Jenis Hak</InputLabel>
              <Select
                labelId="jenis-peminjaman"
                label="Jenis Hak"
                defaultValue={"default"}
                {...form.register("jenis_hak")}
              >
                <MenuItem value={"default"} disabled>
                  Pilih Jenis Hak
                </MenuItem>
                <MenuItem value="SHM">SHM</MenuItem>
                <MenuItem value="HGB">HGB</MenuItem>
                <MenuItem value="HP">HP</MenuItem>
                <MenuItem value="WAKAF">WAKAF</MenuItem>
                <MenuItem value="SHT">SHT</MenuItem>
              </Select>
            </FormControl>
            <FormControl>
              <TextField
                variant="outlined"
                type="datetime-local"
                id="tanggal-peminjaman"
                label="Tanggal Peminjaman"
                {...form.register("created_at", {
                  value: dateTimeHandler(),
                })}
              />
            </FormControl>
            <FormControl>
              <TextField
                type="text"
                id="keterangan"
                label="Keterangan"
                {...form.register("keperluan")}
              />
            </FormControl>
            <FormControl
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "1.5rem",
              }}
            >
              <Button
                variant="outlined"
                fullWidth
                disabled={!loanNoteData}
                onClick={() => setShowLoanNote((prevState) => !prevState)}
              >
                Lihat Nota
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                fullWidth
              >
                Buat Permintaan
              </Button>
            </FormControl>
          </Box>
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
      {loanNoteData && (
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
          <LoanNote
            showLoanNoteHandler={showLoanNoteHandler}
            loanNote={loanNoteData}
          />
        </Box>
      )}
    </Fragment>
  );
};

export default CreateSearchDocumentRequest;
