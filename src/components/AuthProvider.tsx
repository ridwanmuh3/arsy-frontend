import {
  useState,
  type Dispatch,
  type SetStateAction,
  useMemo, // Impor useMemo
} from "react";
import type { AuthProps, AuthToken } from "../types";
import { AuthContext } from "../stores/auth";
import { useNavigate } from "react-router";
import { loginUser } from "../api/auth";
import { isAxiosError } from "axios";
import { getUserFromToken } from "../lib/auth";

export const AuthProvider = ({ children }: AuthProps) => {
  const getInitialState = (): AuthToken | undefined => {
    const storedAccessToken = localStorage.getItem("access_token");
    const storedRefreshToken = localStorage.getItem("refresh_token");

    if (storedAccessToken && storedRefreshToken) {
      return {
        access_token: storedAccessToken,
        refresh_token: storedRefreshToken,
      };
    }
    return undefined;
  };

  const [token, setToken] = useState<AuthToken | undefined>(getInitialState);
  const navigate = useNavigate();

  const value = useMemo(
    () => ({
      token,
      login: async (
        username: string,
        password: string,
        setError: Dispatch<SetStateAction<string>>
      ) => {
        try {
          const result = await loginUser({
            username,
            password,
          });

          if (!result || !result.access_token || !result.refresh_token) {
            setError("Terjadi error: data token tidak diterima.");
            return;
          }

          localStorage.setItem("access_token", result.access_token);
          localStorage.setItem("refresh_token", result.refresh_token);
          setToken({
            refresh_token: result.refresh_token,
            access_token: result.access_token,
          });

          const user = getUserFromToken();
          if (!user) {
            navigate("/login");
            return;
          }

          if (user.role === "LOCKET") {
            navigate("/peminjaman");
          } else if (user.role === "ADMIN") {
            navigate("/permintaan-berkas");
          } else if (user.role === "SUPER_ADMIN") {
            navigate("/users");
          }
        } catch (e: unknown) {
          let errorMessage = "Terjadi kesalahan tidak diketahui.";

          if (isAxiosError(e) && e.response) {
            switch (e.response.status) {
              case 400:
                errorMessage = "Username atau password tidak valid";
                break;
              case 404:
                errorMessage = "Akun pengguna tidak ditemukan";
                break;
              case 500:
                errorMessage = "Terjadi kesalahan di server";
                break;
              default:
                errorMessage = e.response.data?.message || e.message;
            }
          } else if (e instanceof Error) {
            errorMessage = e.message;
          }

          setError(errorMessage);
        }
      },
      logout: () => {
        setToken(undefined);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login", { replace: true });
      },
    }),
    [token, navigate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
