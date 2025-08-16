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
import { red } from "@mui/material/colors";
import { Fragment, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { userSchema, type UserSchema } from "../../schemas/user";

type Props = {
  showDialog: boolean;
  showDialogHandler: (e: MouseEvent) => void;
  editUserHandler: (data: UserSchema) => void;
  user: UserSchema;
  isLoading: boolean;
};

// TODO: Edit User Logic
// handling input menggunakan useState serta menambahkan atribut value di setiap element input form
const EditUserDialog = ({
  showDialog,
  showDialogHandler,
  editUserHandler,
  user,
  isLoading,
}: Props) => {
  const form = useForm({
    resolver: zodResolver(userSchema),
  });

  const submitHandler = (data: UserSchema) => {
    editUserHandler({
      id: user.id,
      username: data.username,
      fullname: data.fullname,
      password: data.password,
      role: user.role,
      created_at: user.created_at,
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <Fragment>
      <form onSubmit={form.handleSubmit(submitHandler)} autoComplete="off">
        <Dialog
          fullWidth
          maxWidth="xs"
          open={showDialog}
          onClose={showDialogHandler}
          disablePortal
        >
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
              <FormControl>
                <TextField
                  type="text"
                  variant="outlined"
                  id="username"
                  label="Username"
                  {...form.register("username", { value: user.username })}
                />
                {form.formState.errors.username ? (
                  <span
                    style={{
                      color: red[500],
                      marginTop: "0.7rem",
                      textAlign: "center",
                    }}
                  >
                    {form.formState.errors.username.message}
                  </span>
                ) : null}
              </FormControl>
              <FormControl>
                <TextField
                  type="text"
                  variant="outlined"
                  id="fullname"
                  label="Fullname"
                  {...form.register("fullname", { value: user.fullname })}
                />
                {form.formState.errors.fullname ? (
                  <span
                    style={{
                      color: red[500],
                      marginTop: "0.7rem",
                      textAlign: "center",
                    }}
                  >
                    {form.formState.errors.fullname.message}
                  </span>
                ) : null}
              </FormControl>
              <FormControl>
                <TextField
                  type="password"
                  variant="outlined"
                  id="password"
                  label="Password"
                  {...form.register("password")}
                />
                {form.formState.errors.password ? (
                  <span
                    style={{
                      color: red[500],
                      marginTop: "0.7rem",
                      textAlign: "center",
                    }}
                  >
                    {form.formState.errors.password.message}
                  </span>
                ) : null}
              </FormControl>
              <FormControl>
                <InputLabel id="user-role">Role</InputLabel>
                <Select
                  labelId="user-role"
                  label="Role"
                  defaultValue={user.role}
                  disabled
                  {...form.register("role")}
                >
                  <MenuItem value={"LOCKET"}>Locket</MenuItem>
                  <MenuItem value={"ADMIN"}>Admin</MenuItem>
                </Select>
              </FormControl>
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
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </form>
    </Fragment>
  );
};

export default EditUserDialog;
