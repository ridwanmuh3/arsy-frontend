import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import type { MouseEvent } from "react";

type Props = {
  showDialog: boolean;
  showDialogHandler: (e: MouseEvent) => void;
  deleteUserHandler: (userID: string) => void;
  userID: string;
  isLoading: boolean;
};

const DeleteUserDialog = ({
  showDialog,
  showDialogHandler,
  deleteUserHandler,
  userID,
  isLoading,
}: Props) => {
  return (
    <Dialog open={showDialog} onClose={showDialogHandler}>
      <DialogTitle id="delete-user">Hapus pengguna ini?</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-user-dialog">
          Pengguna yang dihapus tidak bisa dikembalikan dan langsung kehilangan
          akses ke aplikasi.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={showDialogHandler}>
          Batal
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => deleteUserHandler(userID)}
          disabled={isLoading}
        >
          {isLoading ? "Memproses..." : "Ya, hapus"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserDialog;
