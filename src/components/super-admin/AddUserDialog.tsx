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
  addUserHandler: (data: UserSchema) => void;
  isLoading: boolean;
};

const AddUserDialog = ({
  showDialog,
  showDialogHandler,
  addUserHandler,
  isLoading,
}: Props) => {
  const form = useForm({ resolver: zodResolver(userSchema) });

  const submitHandler = (data: UserSchema) => {
    addUserHandler(data);
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
            Tambah Pengguna
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
                  {...form.register("username")}
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
                  {...form.register("fullname")}
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
                  defaultValue={"LOCKET"}
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
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </form>
    </Fragment>
  );
};

export default AddUserDialog;
