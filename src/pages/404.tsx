import { Box, Button, Typography } from "@mui/material";
import { Fragment } from "react";
import { Link } from "react-router";
import { SearchOff } from "@mui/icons-material";

const NotFoundPage = () => {
  return (
    <Fragment>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <Box sx={{ color: "text.disabled", "& svg": { fontSize: "4rem" } }}>
          <SearchOff />
        </Box>
        <Typography variant="h4" component="h1">
          Halaman tidak ditemukan
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: "28rem" }}
        >
          Alamat yang Anda buka salah atau halaman sudah dipindahkan. Kembali
          ke beranda untuk melanjutkan pekerjaan Anda.
        </Typography>
        <Button variant="contained" component={Link} to="/">
          Kembali ke beranda
        </Button>
      </Box>
    </Fragment>
  );
};

export default NotFoundPage;
