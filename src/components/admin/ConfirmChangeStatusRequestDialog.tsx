import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Fragment, type MouseEvent } from "react";

type Props = {
  showDialog: boolean;
  showDialogHandler: (e: MouseEvent) => void;
  changeSearchRequestStatusHandler: () => void;
  isLoading: boolean;
};

const ConfirmChangeStatusRequestDialog = ({
  showDialog,
  showDialogHandler,
  changeSearchRequestStatusHandler,
  isLoading,
}: Props) => {
  return (
    <Fragment>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={showDialog}
        onClose={showDialogHandler}
      >
        <DialogTitle fontSize="1.5rem" id="confirm-update-status">
          Ubah Status Request
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <Typography align="center" lineHeight={1.8} variant="body1">
              Apakah anda yakin ingin mengubah status request? Pastikan Anda
              hanya mengubah status request setelah memverifikasi bahwa
              perubahan tersebut benar-benar mencerminkan kondisi di
              lapangan.{" "}
            </Typography>
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
            onClick={(e: MouseEvent) => {
              e.preventDefault();
              changeSearchRequestStatusHandler();
            }}
          >
            Ubah Status
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default ConfirmChangeStatusRequestDialog;
