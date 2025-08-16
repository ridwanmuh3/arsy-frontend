import { Box, IconButton } from "@mui/material";
import { Fragment, type Dispatch, type SetStateAction } from "react";
import "../styles/loan-note.css";
import { Close } from "@mui/icons-material";
import { grey } from "@mui/material/colors";
import type { LoanNoteSchema } from "../schemas/loan-note";
import dayjs from "dayjs";
import "dayjs/locale/id";

type Props = {
  showLoanNoteHandler: Dispatch<SetStateAction<boolean>>;
  loanNote: LoanNoteSchema;
};

const LoanNote = ({ showLoanNoteHandler, loanNote }: Props) => {
  return (
    <Fragment>
      <Box
        className="nota-peminjaman"
        sx={{
          width: "60rem",
          backgroundColor: "white",
          position: "relative",
          top: "50%",
          left: "50%",
          zIndex: 1000,
          transform: "translate(-50%, -50%)",
          borderRadius: "4px",
        }}
      >
        <Box
          sx={{
            padding: "0.2rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "4rem",
            borderBottom: "1px solid",
            borderBottomColor: grey[500],
          }}
        >
          <h2>Bon</h2>
          <IconButton
            onClick={() => {
              showLoanNoteHandler(false);
            }}
          >
            <Close />
          </IconButton>
        </Box>
        <Box
          sx={{
            padding: "1.5rem 4rem 3rem",
          }}
        >
          <Box>
            <h2>NOTA PEMINJAMAN BUKU TANAH/ SURAT UKUR/ WARKAH</h2>
          </Box>
          <Box>
            <table className="informasi-peminjaman">
              <tbody>
                <tr>
                  <td>Jenis Hak</td>
                  <td>: {loanNote.jenis_hak}</td>
                </tr>
                <tr>
                  <td>Tahun</td>
                  <td>: {loanNote.tahun}</td>
                </tr>
                <tr>
                  <td>Desa</td>
                  <td>: {loanNote.desa}</td>
                </tr>
                <tr>
                  <td>Kecamatan</td>
                  <td>: {loanNote.kecamatan}</td>
                </tr>
                <tr>
                  <td>Keperluan</td>
                  <td>: {loanNote.keperluan}</td>
                </tr>
              </tbody>
            </table>
          </Box>
          <Box sx={{ marginBottom: "-1.5rem" }}>
            <p className="tempat-tanggal">
              Pangandaran,{" "}
              {dayjs(loanNote.created_at).locale("id").format("DD MMMM YYYY")}
            </p>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              paddingX: "4rem",
            }}
          >
            <Box
              sx={{
                width: "fit-content",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "3.5rem",
              }}
            >
              <p>
                {" "}
                <br />
                Peminjam
              </p>
              <p>{loanNote.nama_peminjam}</p>
            </Box>
            <Box
              sx={{
                width: "fit-content",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "3.5rem",
              }}
            >
              <p style={{ textAlign: "center" }}>
                <span>Mengetahui</span>
                <br />
                <span>Petugas Arsip</span>
              </p>
              <p>{loanNote.nama_petugas_arsip}</p>
            </Box>
          </Box>
          <Box className="catatan">
            <p>
              <b>*</b>Bagian <b>peminjam</b> ataupun <b>petugas arsip</b> di
              paraf sebagai penguat
            </p>
            <p>
              *Harap diisi bagian <b>keperluan</b> untuk memudahkan invetarisir
              apabila terjadi kehilangan
            </p>
          </Box>
        </Box>
      </Box>
    </Fragment>
  );
};

export default LoanNote;
