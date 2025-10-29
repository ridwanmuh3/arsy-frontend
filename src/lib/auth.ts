import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "../types";

export const getUserFromToken = () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (decoded && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("access_token");
      return null;
    }

    return {
      id: decoded.sub,
      username: decoded.username,
      fullname: decoded.fullname,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Failed to decode token:", error);
    localStorage.removeItem("access_token");
    return null;
  }
};
