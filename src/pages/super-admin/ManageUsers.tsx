import { Add, Delete, ModeEdit } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Pagination,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Fragment,
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from "react";
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
import { useAuth } from "../../hooks/auth";
import { isAxiosError } from "axios";
import dayjs from "dayjs";

const tableColumns = [
  "No",
  "Username",
  "Fullname",
  "Role",
  "Created At",
  "Updated At",
  "Action",
];

const ManageUsers = () => {
  const [users, setUsers] = useState<UserSchema[]>([]);
  const [userID, setUserID] = useState<string>("");
  const [user, setUser] = useState<UserSchema>({
    username: "",
    role: "",
    fullname: "",
    password: "",
    created_at: "",
    updated_at: "",
    id: "",
  });
  const [page, setPage] = useState<number>(1);
  const [showAddUserDialog, setShowAddUserDialog] = useState<boolean>(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState<boolean>(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] =
    useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const auth = useAuth();

  const changePageIndexHandler = (_: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const showAddUserDialogHandler = (e: MouseEvent) => {
    e.preventDefault();
    setShowAddUserDialog((prevState) => !prevState);
  };
  const showEditUserDialogHandler = (e: MouseEvent) => {
    e.preventDefault();
    setShowEditUserDialog((prevState) => !prevState);
  };

  const showDeleteUserDialogHandler = (e: MouseEvent) => {
    e.preventDefault();
    setShowDeleteUserDialog((prevState) => !prevState);
  };

  const showSnackbarHandler = () => {
    setShowSnackbar((prevState) => !prevState);
  };

  const addUserHandler = async (user: UserSchema) => {
    try {
      setSnackbarMessage("");
      setIsLoading(true);
      const result = await registerUser(auth.token!, user);
      if (isAxiosError(result)) {
        console.error(result.code);
        if (users.length === 0) {
          setUsers([]);
        }
        return;
      }

      const fetchedUsers = await findAllUsers(auth.token!);
      if (isAxiosError(fetchedUsers)) {
        console.error(fetchedUsers.code);
        if (users.length === 0) {
          setUsers([]);
        }
        return;
      }

      setSnackbarMessage("Berhasil menambah user");
      setUsers(fetchedUsers);
      setShowSnackbar(true);
      setShowAddUserDialog((prevState) => !prevState);
    } catch (err: unknown) {
      const e = err as Error;
      console.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Edit User Logic
  const editUserHandler = async (updatedUser: UserSchema) => {
    try {
      setSnackbarMessage("");
      setIsLoading(true);
      const result = await updateUser(auth.token!, updatedUser);
      if (isAxiosError(result)) {
        console.error(result.code);
        if (users.length === 0) {
          setUsers([]);
        }
        return;
      }

      const fetchedUsers = await findAllUsers(auth.token!);
      if (isAxiosError(fetchedUsers)) {
        console.error(fetchedUsers.code);
        if (users.length === 0) {
          setUsers([]);
        }
        return;
      }

      setSnackbarMessage("Berhasil mengubah user");
      setUsers(fetchedUsers);
      setUser({
        username: "",
        role: "",
        fullname: "",
        password: "",
        created_at: "",
        updated_at: "",
        id: "",
      });
      setShowSnackbar(true);
      setShowEditUserDialog((prevState) => !prevState);
    } catch (err) {
      const e = err as Error;
      console.log(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUserHandler = async (userID: string) => {
    try {
      setSnackbarMessage("");
      setIsLoading(true);
      const result = await deleteUser(auth.token!, userID);
      if (isAxiosError(result)) {
        console.error(result.code);
        setUsers([]);
        return;
      }

      const fetchedUsers = await findAllUsers(auth.token!);
      if (isAxiosError(fetchedUsers)) {
        console.error(fetchedUsers.code);
        setUsers([]);
        return;
      }

      setSnackbarMessage("Berhasil menghapus user");
      setUsers(fetchedUsers);
      setUserID("");
      setShowSnackbar(true);
      setShowDeleteUserDialog((prevState) => !prevState);
    } catch (err) {
      const e = err as Error;
      console.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const usersPerPage = 10;
  const indexOfLast = page * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = users
    ? users
        .filter((user: UserSchema) => user.role !== "SUPER_ADMIN")
        .slice(indexOfFirst, indexOfLast)
    : [];
  const totalPages = Math.ceil(users.length / usersPerPage);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await findAllUsers(auth.token!);
      if (isAxiosError(fetchedUsers)) {
        console.error(fetchedUsers.code);
        if (users.length === 0) {
          setUsers([]);
        }
        return;
      }

      setUsers(fetchedUsers);
    } catch (err) {
      const e = err as Error;
      console.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [users, auth.token]);

  useEffect(() => {
    if (page > 1 && users.length <= usersPerPage) {
      setPage((prevPage) => prevPage - 1);
    }
  }, [page, users]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers();
    }, 4800);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Fragment>
      <Box
        sx={{
          paddingLeft: "17rem",
          paddingBottom: "2rem",
        }}
      >
        <Box
          sx={{
            paddingX: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.8rem",
          }}
        >
          <Box
            sx={{
              paddingTop: "2rem",
              display: "flex",
              gap: "4rem",
              justifyContent: "space-between",
            }}
          >
            <h1
              style={{
                lineHeight: 0,
              }}
            >
              Kelola Pengguna
            </h1>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={showAddUserDialogHandler}
            >
              Tambah Pengguna
            </Button>
          </Box>
          <TableContainer
            sx={{
              boxShadow: 1,
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {tableColumns.map((name) => (
                    <TableCell key={name}>{name}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((data, index) => (
                    <TableRow
                      key={data.id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell>{index + 1 + indexOfFirst}</TableCell>
                      <TableCell>{data.username}</TableCell>
                      <TableCell>{data.fullname}</TableCell>
                      <TableCell>{data.role}</TableCell>
                      <TableCell>
                        {dayjs(data.created_at).format("DD MMMM YYYY HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        {dayjs(data.updated_at).format("DD MMMM YYYY HH:mm:ss")}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: "flex",
                          gap: "1rem",
                        }}
                      >
                        <Button
                          variant="contained"
                          color="warning"
                          startIcon={<ModeEdit />}
                          onClick={(e: MouseEvent) => {
                            setUser({
                              username: data.username,
                              role: data.role,
                              fullname: data.fullname,
                              password: data.password,
                              created_at: data.created_at,
                              updated_at: data.updated_at,
                              id: data.id,
                            });
                            setUserID(data.id!);
                            showEditUserDialogHandler(e);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Delete />}
                          onClick={(e: MouseEvent) => {
                            setUserID(data.id!);
                            showDeleteUserDialogHandler(e);
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
          </TableContainer>
          <Box>
            {currentUsers.length > 0 ? (
              <Pagination
                count={totalPages}
                page={page}
                onChange={changePageIndexHandler}
              />
            ) : null}
          </Box>
        </Box>
      </Box>
      {showAddUserDialog && (
        <AddUserDialog
          showDialog={showAddUserDialog}
          showDialogHandler={showAddUserDialogHandler}
          addUserHandler={addUserHandler}
          isLoading={isLoading}
        />
      )}
      {showEditUserDialog && (
        <EditUserDialog
          showDialog={showEditUserDialog}
          showDialogHandler={showEditUserDialogHandler}
          editUserHandler={editUserHandler}
          user={user}
          isLoading={isLoading}
        />
      )}
      {showDeleteUserDialog && (
        <DeleteUserDialog
          showDialog={showDeleteUserDialog}
          showDialogHandler={showDeleteUserDialogHandler}
          deleteUserHandler={deleteUserHandler}
          userID={userID}
          isLoading={isLoading}
        />
      )}
      {showSnackbar && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={showSnackbar}
          autoHideDuration={2500}
          onClose={showSnackbarHandler}
          message={snackbarMessage}
        />
      )}
    </Fragment>
  );
};

export default ManageUsers;
