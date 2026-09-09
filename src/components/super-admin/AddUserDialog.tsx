import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { userSchema, type UserSchema } from "../../schemas/user";
import type { MouseEvent } from "react";

type Props = {
  showDialog: boolean;
  showDialogHandler: (e: MouseEvent) => void;
  addUserHandler: (data: UserSchema) => Promise<void>;
  isLoading: boolean;
};

const defaultValues: UserSchema = {
  username: "",
  fullname: "",
  password: "",
  role: "LOCKET",
};

const AddUserDialog = ({
  showDialog,
  showDialogHandler,
  addUserHandler,
  isLoading,
}: Props) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues,
  });

  const submitHandler = async (data: UserSchema) => {
    try {
      await addUserHandler(data);
      reset();
    } catch (error) {
      console.error("Gagal menambah pengguna:", error);
    }
  };

  const handleClose = (e: MouseEvent) => {
    showDialogHandler(e);
    reset();
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={showDialog}
      onClose={handleClose}
      disablePortal
    >
      <form
        onSubmit={handleSubmit(submitHandler)}
        autoComplete="off"
        noValidate
      >
        <DialogTitle align="left" fontSize="2rem" id="add-user">
          Tambah Pengguna
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ paddingTop: "0.5rem" }}>
            <TextField
              type="text"
              variant="outlined"
              id="username"
              label="Username"
              required
              {...register("username")}
              error={!!errors.username}
              helperText={
                errors.username?.message ?? "Minimal 6 karakter, harus unik"
              }
            />

            <TextField
              type="text"
              variant="outlined"
              id="fullname"
              label="Nama lengkap"
              required
              {...register("fullname")}
              error={!!errors.fullname}
              helperText={errors.fullname?.message}
            />

            <TextField
              type="password"
              variant="outlined"
              id="password"
              label="Password"
              required
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message ?? "Minimal 6 karakter"}
            />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel id="user-role">Role</InputLabel>
                  <Select labelId="user-role" label="Role" {...field}>
                    <MenuItem value={"LOCKET"}>Loket</MenuItem>
                    <MenuItem value={"ADMIN"}>Admin</MenuItem>
                    <MenuItem value={"SUPER_ADMIN"}>Super Admin</MenuItem>
                  </Select>
                  {errors.role && (
                    <FormHelperText>{errors.role.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Stack>
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
            {isLoading ? "Memproses..." : "Tambah"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddUserDialog;
