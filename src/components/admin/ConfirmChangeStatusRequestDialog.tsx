import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { MouseEvent } from "react";

type Props = {
  showDialog: boolean;
  showDialogHandler: (e: MouseEvent) => void;
  changeSearchRequestStatusHandler: () => Promise<void>;
  isLoading: boolean;
};

const ConfirmChangeStatusRequestDialog = ({
  showDialog,
  showDialogHandler,
  changeSearchRequestStatusHandler,
  isLoading,
}: Props) => {
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={showDialog}
      onClose={showDialogHandler}
    >
      <DialogTitle fontSize="1.5rem" id="confirm-update-status">
        Lanjutkan ke tahap berikutnya?
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
            Status permintaan akan dimajukan satu tahap dan tercatat atas nama
            Anda. Pastikan kondisi berkas di lapangan sudah sesuai.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={showDialogHandler}>
          Batal
        </Button>
        <Button
          variant="contained"
          autoFocus
          disabled={isLoading}
          onClick={changeSearchRequestStatusHandler}
        >
          {isLoading ? "Memproses..." : "Ya, lanjutkan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmChangeStatusRequestDialog;
