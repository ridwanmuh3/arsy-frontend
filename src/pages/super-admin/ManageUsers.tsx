import { Add, Delete, ModeEdit } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import {
  Fragment,
  useCallback,
  useEffect,
  useState,
  type MouseEvent,
} from "react";
import dayjs from "dayjs";
import { isAxiosError } from "axios";

import DeleteUserDialog from "../../components/super-admin/DeleteUserDialog";
import AddUserDialog from "../../components/super-admin/AddUserDialog";
import EditUserDialog from "../../components/super-admin/EditUserDialog";

import type { UserSchema } from "../../schemas/user";
import {
  deleteUser,
  findAllUsers,
  registerUser,
  updateUser,
} from "../../api/users";

const tableColumns = [
  "No",
  "Username",
  "Fullname",
  "Role",
  "Created At",
  "Updated At",
  "Action",
];

const emptyUser: UserSchema = {
  id: "",
  username: "",
  fullname: "",
  role: "",
  password: "",
  created_at: "",
  updated_at: "",
};

const ManageUsers = () => {
  const [users, setUsers] = useState<UserSchema[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSchema>(emptyUser);
  const [selectedUserID, setSelectedUserID] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await findAllUsers();

      if (isAxiosError(response)) {
        console.error(response.code);
        setUsers([]);
        return;
      }

      setUsers(response);
    } catch (err) {
      console.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refreshUsersAfterAction = async (message: string) => {
    await fetchUsers();
    setSnackbar({ open: true, message });
  };

  const addUserHandler = async (user: UserSchema) => {
    try {
      setIsLoading(true);
      const result = await registerUser(user);

      if (isAxiosError(result)) {
        console.error(result.code);
        return;
      }

      await refreshUsersAfterAction("Berhasil menambah pengguna");
      setShowAddDialog(false);
    } catch (err) {
      console.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const editUserHandler = async (user: UserSchema) => {
    try {
      setIsLoading(true);
      const result = await updateUser(user);

      if (isAxiosError(result)) {
        console.error(result.code);
        return;
      }

      await refreshUsersAfterAction("Berhasil mengubah pengguna");
      setShowEditDialog(false);
      setSelectedUser(emptyUser);
    } catch (err) {
      console.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUserHandler = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await deleteUser(id);

      if (isAxiosError(result)) {
        console.error(result.code);
        return;
      }

      await refreshUsersAfterAction("Berhasil menghapus pengguna");
      setShowDeleteDialog(false);
      setSelectedUserID("");
    } catch (err) {
      console.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const toggleAddDialog = (e: MouseEvent) => {
    e.preventDefault();
    setShowAddDialog((prev) => !prev);
  };

  const toggleEditDialog = (e: MouseEvent) => {
    e.preventDefault();
    setShowEditDialog((prev) => !prev);
  };

  const toggleDeleteDialog = (e: MouseEvent) => {
    e.preventDefault();
    setShowDeleteDialog((prev) => !prev);
  };

  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const paginatedData = users.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Fragment>
      <Box sx={{ pl: "17rem", pb: "2rem" }}>
        <Box
          sx={{
            px: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
          }}
        >
          <Box
            sx={{
              pt: "1.2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            <h1>Kelola Pengguna</h1>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              sx={{ height: "3rem" }}
              onClick={toggleAddDialog}
            >
              Tambah Pengguna
            </Button>
          </Box>

          <TableContainer sx={{ boxShadow: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {tableColumns.map((col) => (
                    <TableCell key={col}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData && paginatedData.length > 0 ? (
                  paginatedData.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.fullname}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {dayjs(user.created_at).format("DD MMMM YYYY HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        {dayjs(user.updated_at).format("DD MMMM YYYY HH:mm:ss")}
                      </TableCell>
                      <TableCell sx={{ display: "flex", gap: "1rem" }}>
                        <Button
                          variant="contained"
                          color="warning"
                          startIcon={<ModeEdit />}
                          onClick={(e) => {
                            setSelectedUser(user);
                            toggleEditDialog(e);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Delete />}
                          onClick={(e) => {
                            setSelectedUserID(user.id!);
                            toggleDeleteDialog(e);
                          }}
                        >
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={tableColumns.length} align="center">
                      {isLoading ? <CircularProgress /> : "Belum ada data"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={users.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Baris per halaman:"
            />
          </TableContainer>
        </Box>
      </Box>

      {/* Dialogs */}
      {showAddDialog && (
        <AddUserDialog
          showDialog={showAddDialog}
          showDialogHandler={toggleAddDialog}
          addUserHandler={addUserHandler}
          isLoading={isLoading}
        />
      )}
      {showEditDialog && (
        <EditUserDialog
          showDialog={showEditDialog}
          showDialogHandler={toggleEditDialog}
          editUserHandler={editUserHandler}
          user={selectedUser}
          isLoading={isLoading}
        />
      )}
      {showDeleteDialog && (
        <DeleteUserDialog
          showDialog={showDeleteDialog}
          showDialogHandler={toggleDeleteDialog}
          deleteUserHandler={deleteUserHandler}
          userID={selectedUserID}
          isLoading={isLoading}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={handleSnackbarClose}
        message={snackbar.message}
      />
    </Fragment>
  );
};

export default ManageUsers;
