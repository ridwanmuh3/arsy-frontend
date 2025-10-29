import { Route, Routes } from "react-router";
import SearchDocumentRequest from "./pages/admin/SearchDocumentRequest";
import History from "./pages/admin/History";
import ManageDocuments from "./pages/admin/ManageDocuments";
import Login from "./pages/Login";
import ManageUsers from "./pages/super-admin/ManageUsers";
import ProtectedRoute from "./components/ProtectedRoute";
import LoanNote from "./pages/locket/CreateSearchDocumentRequest";
import Layout from "./components/Layout";
import ForbiddenPage from "./pages/403";

const App = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN", "LOCKET"]} />
        }
      >
        <Route path="/" element={<Layout />}>
          <Route
            element={<ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} />}
          >
            <Route
              path="permintaan-berkas"
              element={<SearchDocumentRequest />}
            />
            <Route path="berkas" element={<ManageDocuments />} />
          </Route>
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["LOCKET", "ADMIN", "SUPER_ADMIN"]}
              />
            }
          >
            <Route path="riwayat-permintaan" element={<History />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["LOCKET"]} />}>
            <Route path="peminjaman" element={<LoanNote />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
            <Route path="users" element={<ManageUsers />} />
          </Route>
        </Route>
      </Route>
      <Route path="/login" index element={<Login />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
    </Routes>
  );
};

export default App;
