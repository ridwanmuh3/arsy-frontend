import { Navigate } from "react-router";
import { getUserFromToken } from "../lib/auth";

const HOME_BY_ROLE: Record<string, string> = {
  LOCKET: "/peminjaman",
  ADMIN: "/permintaan-berkas",
  SUPER_ADMIN: "/users",
};

/** Redirect `/` ke halaman utama sesuai role agar tidak blank. */
const HomeRedirect = () => {
  const user = getUserFromToken();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={HOME_BY_ROLE[user.role] ?? "/forbidden"} replace />;
};

export default HomeRedirect;
