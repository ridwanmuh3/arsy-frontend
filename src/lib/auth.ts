import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "../types";

export const getUserFromToken = () => {
  const token = localStorage.getItem("access_token");
  let user = undefined;

  if (token) {
    const decoded = jwtDecode<JwtPayload>(token);
    user = {
      sub: decoded.sub,
      username: decoded.username,
      fullname: decoded.fullname,
      role: decoded.role,
    };
  }

  return user;
};
