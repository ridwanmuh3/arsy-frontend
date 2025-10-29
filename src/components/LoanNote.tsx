import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useRef, type MouseEvent } from "react";
import { useReactToPrint } from "react-to-print";
import { Close, Print } from "@mui/icons-material";
import type { LoanNoteSchema } from "../schemas/loan-note";
import dayjs from "dayjs";
import "dayjs/locale/id";

type Props = {
  showLoanNote: boolean;
  showLoanNoteHandler: (e: MouseEvent) => void;
  loanNote: LoanNoteSchema;
};

const LoanNote = ({ showLoanNote, showLoanNoteHandler, loanNote }: Props) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bon-${loanNote.nama_peminjam}-${loanNote.tahun}`,
    onAfterPrint: () => console.log("Print/Save selesai"),
    pageStyle: "landscape",
  });

  return (
    <Dialog
      open={showLoanNote}
      onClose={showLoanNoteHandler}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: { xs: "95%", sm: "90%", md: "60rem" },
          maxWidth: "60rem",
          fontFamily: "serif",
          maxHeight: { xs: "90vh", md: "auto" },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: { xs: "0.4rem 1rem", md: "0.6rem 2rem" },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" component="h2">
            Bon
          </Typography>
          <IconButton
            onClick={handlePrint}
            size="small"
            aria-label="Print nota"
            title="Unduh atau Print Nota"
          >
            <Print />
          </IconButton>
        </Box>
        <IconButton onClick={showLoanNoteHandler} aria-label="Tutup nota">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        ref={printRef}
        sx={{
          p: {
            xs: "1.5rem 1rem 2rem",
            sm: "1.5rem 2rem 2.5rem",
            md: "1.5rem 4rem 3rem",
          },
        }}
      >
        {/* Judul */}
        <Box>
          <Typography
            variant="h6"
            component="h2"
            textAlign="center"
            sx={{
              fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
              mt: "1.8rem",
            }}
          >
            NOTA PEMINJAMAN BUKU TANAH / SURAT UKUR / WARKAH
          </Typography>
        </Box>

        {/* Tabel Data */}
        <Box sx={{ my: { xs: "1.5rem", md: "2rem" } }}>
          <Table sx={{ width: "100%" }}>
            <TableBody>
              {[
                ["Jenis Hak", loanNote.jenis_hak],
                ["Tahun", loanNote.tahun],
                ["Desa", loanNote.desa],
                ["Kecamatan", loanNote.kecamatan],
                ["Keperluan", loanNote.keperluan],
              ].map(([label, value]) => (
                <TableRow key={label}>
                  <TableCell
                    sx={{
                      border: "none",
                      p: { xs: "6px 8px 6px 0", md: "8px 16px 8px 0" },
                      fontSize: { xs: "0.95rem", md: "1.1rem" },
                      width: { xs: "35%", sm: "25%" },
                    }}
                  >
                    {label}
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "none",
                      p: { xs: "6px 0", md: "8px 0" },
                      fontSize: { xs: "0.95rem", md: "1.1rem" },
                    }}
                  >
                    : {value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Tanggal */}
        <Box
          sx={{
            textAlign: "right",
            fontSize: { xs: "1rem", md: "1.1rem" },
            mb: { xs: "1rem", md: "1.2rem" },
          }}
        >
          Pangandaran,&nbsp;
          {dayjs(loanNote.created_at).locale("id").format("DD MMMM YYYY")}
        </Box>

        {/* Tanda Tangan */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: { xs: "0.5rem", sm: "2rem", md: "4rem" },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: "2rem", sm: "0" },
          }}
        >
          {[
            { title: "Peminjam", name: loanNote.nama_peminjam },
            {
              title: "Mengetahui\nPetugas Arsip",
              name: loanNote.nama_petugas_arsip,
            },
          ].map((person) => (
            <Box
              key={person.title}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: { xs: "3rem", md: "3.5rem" },
              }}
            >
              <Typography
                variant="body1"
                textAlign="center"
                sx={{ fontSize: { xs: "0.95rem", md: "1rem" } }}
              >
                {person.title.split("\n").map((line, i) => (
                  <Box key={i} component="span">
                    {line}
                    <br />
                  </Box>
                ))}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontSize: { xs: "0.95rem", md: "1rem" } }}
              >
                {person.name}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Catatan */}
        <Box sx={{ mt: { xs: "1.2rem", md: "1.4rem" }, lineHeight: 1 }}>
          {[
            [
              "Bagian ",
              "peminjam",
              " ataupun ",
              "petugas arsip",
              " di paraf sebagai penguat",
            ],
            [
              "Harap diisi bagian ",
              "keperluan",
              " untuk memudahkan inventarisir apabila terjadi kehilangan",
            ],
          ].map((line, i) => (
            <Typography
              key={i}
              variant="body2"
              component="p"
              sx={{ fontSize: { xs: "0.7rem", md: "0.8rem" } }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                *
              </Box>{" "}
              {line.map((part, j) =>
                j % 2 === 1 ? (
                  <Box key={j} component="span" sx={{ fontWeight: "bold" }}>
                    {part}
                  </Box>
                ) : (
                  part
                )
              )}
            </Typography>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoanNote;
