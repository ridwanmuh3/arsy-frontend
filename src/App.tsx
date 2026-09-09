import { lazy, Suspense, type JSX } from "react";
import { Route, Routes } from "react-router";
import { Box, CircularProgress } from "@mui/material";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import HomeRedirect from "./components/HomeRedirect";

// Code-split per route: halaman admin/berat tidak ikut membebani
// first load (mis. Login hanya memuat Login + shell).
const Login = lazy(() => import("./pages/Login"));
const ForbiddenPage = lazy(() => import("./pages/403"));
const NotFoundPage = lazy(() => import("./pages/404"));
const SearchDocumentRequest = lazy(
  () => import("./pages/admin/SearchDocumentRequest"),
);
const History = lazy(() => import("./pages/admin/History"));
const ManageDocuments = lazy(() => import("./pages/admin/ManageDocuments"));
const ManageUsers = lazy(() => import("./pages/super-admin/ManageUsers"));
const LoanNote = lazy(
  () => import("./pages/locket/CreateSearchDocumentRequest"),
);

const PageLoader = () => (
  <Box
    sx={{
      minHeight: "50vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
    role="status"
    aria-label="Memuat halaman"
  >
    <CircularProgress />
  </Box>
);

const withLoader = (element: JSX.Element) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

const App = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN", "LOCKET"]} />
        }
      >
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeRedirect />} />
          <Route
            element={<ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} />}
          >
            <Route
              path="permintaan-berkas"
              element={withLoader(<SearchDocumentRequest />)}
            />
            <Route path="berkas" element={withLoader(<ManageDocuments />)} />
          </Route>
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["LOCKET", "ADMIN", "SUPER_ADMIN"]}
              />
            }
          >
            <Route
              path="riwayat-permintaan"
              element={withLoader(<History />)}
            />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["LOCKET"]} />}>
            <Route path="peminjaman" element={withLoader(<LoanNote />)} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
            <Route path="users" element={withLoader(<ManageUsers />)} />
          </Route>
        </Route>
      </Route>
      <Route path="/login" element={withLoader(<Login />)} />
      <Route path="/forbidden" element={withLoader(<ForbiddenPage />)} />
      <Route path="*" element={withLoader(<NotFoundPage />)} />
    </Routes>
  );
};

export default App;
