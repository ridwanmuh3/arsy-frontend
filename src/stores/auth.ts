import { createContext } from "react";
import type { AuthContextType } from "../types";

export const AuthContext = createContext<AuthContextType>({
  token: undefined,
  login: () => {},
  logout: () => {},
});
