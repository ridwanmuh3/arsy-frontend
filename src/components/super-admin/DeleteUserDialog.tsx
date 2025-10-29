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
      <DialogTitle id="delete-user">Hapus Pengguna</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-user-dialog">
          Apakah anda yakin ingin menghapus pengguna ?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={showDialogHandler}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => deleteUserHandler(userID)}
          disabled={isLoading}
        >
          Hapus
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserDialog;
