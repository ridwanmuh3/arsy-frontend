import { type RouteProps, Navigate, Outlet } from "react-router";
import { getUserFromToken } from "../lib/auth";

type Props = {
  allowedRoles: string[];
} & RouteProps;

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
