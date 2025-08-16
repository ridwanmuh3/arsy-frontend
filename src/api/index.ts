import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

type AxiosConfig = InternalAxiosRequestConfig & {
  _retry: boolean;
};

const axiosInstance = axios.create({
  baseURL: "http://localhost:9000/api/v1",
  timeout: 5000,
});

axiosInstance.interceptors.request.use(
  (request) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      request.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: AxiosConfig = error.config as AxiosConfig;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post("/auth/refresh", {
          refreshToken,
        });
        const { access_token, refresh_token: newRefreshToken } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", newRefreshToken);
        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${access_token}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("token refresh failed", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export { axiosInstance };
