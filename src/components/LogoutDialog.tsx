import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { Fragment, type MouseEvent } from "react";
import { useNavigate } from "react-router";
import type { AuthContextType } from "../types";

type LogoutDialogProps = {
  showDialog: boolean;
  showDialogHandler: (e: MouseEvent) => void;
  auth: AuthContextType;
};

const LogoutDialog = ({
  showDialog,
  showDialogHandler,
  auth,
}: LogoutDialogProps) => {
  const navigate = useNavigate();

  const logoutHandler = (e: MouseEvent) => {
    e.preventDefault();
    showDialogHandler(e);
    auth.logout();

    navigate("/login", { replace: true });
  };

  return (
    <Fragment>
      <Dialog open={showDialog} onClose={showDialogHandler}>
        <DialogTitle id="logout">Keluar dari aplikasi?</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout dialog">
            Anda harus login kembali untuk mengakses aplikasi.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={showDialogHandler}>
            Batal
          </Button>
          <Button
            sx={{
              backgroundColor: red[500],
            }}
            variant="contained"
            onClick={logoutHandler}
            autoFocus
          >
            Ya, keluar
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default LogoutDialog;
