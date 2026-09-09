import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { userSchema, type UserSchema } from "../../schemas/user";

type Props = {
  showDialog: boolean;
  showDialogHandler: (e: MouseEvent) => void;
  editUserHandler: (data: UserSchema) => void;
  user: UserSchema;
  isLoading: boolean;
};

const EditUserDialog = ({
  showDialog,
  showDialogHandler,
  editUserHandler,
  user,
  isLoading,
}: Props) => {
  const form = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      fullname: "",
      password: "",
      role: "LOCKET",
    },
  });

  useEffect(() => {
    if (showDialog) {
      form.reset({
        username: user.username,
        fullname: user.fullname,
        password: "",
        role: user.role,
      });
    }
  }, [user, showDialog, form]);

  const submitHandler = (data: UserSchema) => {
    editUserHandler({
      id: user.id,
      username: data.username,
      fullname: data.fullname,
      password: data.password,
      role: data.role,
      created_at: user.created_at,
      updated_at: new Date().toISOString(),
    });
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
        <DialogTitle align="left" fontSize="2rem" id="add-user">
          Edit Pengguna
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
              id="username"
              label="Username"
              {...form.register("username")}
              error={!!form.formState.errors.username}
              helperText={form.formState.errors.username?.message}
            />
            <TextField
              type="text"
              variant="outlined"
              id="fullname"
              label="Nama lengkap"
              required
              {...form.register("fullname")}
              error={!!form.formState.errors.fullname}
              helperText={form.formState.errors.fullname?.message}
            />
            <TextField
              type="password"
              variant="outlined"
              id="password"
              label="Password"
              {...form.register("password")}
              error={!!form.formState.errors.password}
              helperText={
                form.formState.errors.password?.message ||
                "*Kosongkan jika tidak ingin mengubah password"
              }
            />
            <FormControl fullWidth>
              <InputLabel id="user-role">Role</InputLabel>
              <Select
                labelId="user-role"
                label="Role"
                value={user.role || ""}
                disabled
                {...form.register("role")}
              >
                <MenuItem value={"LOCKET"}>Loket</MenuItem>
                <MenuItem value={"ADMIN"}>Admin</MenuItem>
                <MenuItem value={"SUPER_ADMIN"}>Super Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="contained"
            autoFocus
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Simpan"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditUserDialog;
