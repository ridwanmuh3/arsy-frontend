import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { AuthProps, AuthToken } from "../types";
import { AuthContext } from "../stores/auth";
import { useNavigate } from "react-router";
import { loginUser } from "../api/auth";
import { isAxiosError } from "axios";
import { getUserFromToken } from "../lib/auth";

export const AuthProvider = ({ children }: AuthProps) => {
  const storedAccessToken = localStorage.getItem("access_token");
  const storedRefreshToken = localStorage.getItem("refresh_token");
  const initialAccessToken = storedAccessToken ? storedAccessToken : undefined;
  const initialRefreshToken = storedRefreshToken
    ? storedRefreshToken
    : undefined;
  const [token, setToken] = useState<AuthToken | undefined>({
    access_token: initialAccessToken,
    refresh_token: initialRefreshToken,
  });
  const navigate = useNavigate();

  const value = {
    token,
    login: async (
      username: string,
      password: string,
      setError: Dispatch<SetStateAction<string>>,
    ) => {
      const result = await loginUser({
        username,
        password,
      });

      if (isAxiosError(result) && result.response && result.response.status) {
        let errorMessage = "";
        switch (result.response.status) {
          case 400:
            errorMessage = "username atau password tidak valid";
            break;
          case 404:
            errorMessage = "akun pengguna tidak ditemukan";
            break;
          case 500:
            errorMessage = "terjadi kesalahan di server";
        }
        setError(errorMessage);
        return;
      }

      if (!result.access_token || !result.refresh_token) {
        setError("terjadi error");
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
    },
    logout: () => {
      setToken(undefined);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login", { replace: true });
    },
  };

  useEffect(() => {
    if (token && token.access_token && token.refresh_token) {
      localStorage.setItem("access_token", token.access_token);
      localStorage.setItem("refresh_token", token.refresh_token);
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
