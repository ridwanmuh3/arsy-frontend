import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type { TokenResponse } from "../types";

type RetriableAxiosRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

type RetryQueueItem = {
  resolve: (value: AxiosResponse) => void;
  reject: (error: unknown) => void;
  config: RetriableAxiosRequestConfig;
};

const refreshAndRetryQueue: RetryQueueItem[] = [];
let isRefreshing = false;

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    if (typeof message === "string" && message.trim()) {
      return message;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Terjadi kesalahan tidak diketahui.";
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
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | RetriableAxiosRequestConfig
      | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      originalRequest.url !== "/auth/refresh" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (!refreshToken) {
            throw new Error("refresh token is missing");
          }

          const baseURL = axiosInstance.defaults.baseURL;
          const response = await axios.post<{ data: TokenResponse }>(
            `${baseURL}/auth/refresh`,
            {
              refresh_token: refreshToken,
            }
          );

          const { access_token, refresh_token: newRefreshToken } =
            response.data.data;

          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", newRefreshToken);

          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${access_token}`;

          refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
            axiosInstance
              .request(config)
              .then((response) => resolve(response))
              .catch((err) => reject(err));
          });
          refreshAndRetryQueue.length = 0;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed", refreshError);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          refreshAndRetryQueue.forEach(({ reject }) => reject(refreshError));
          refreshAndRetryQueue.length = 0;

          if (window.location.pathname !== "/login") {
            window.location.assign("/login");
          }

          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise<AxiosResponse>((resolve, reject) => {
        refreshAndRetryQueue.push({ config: originalRequest, resolve, reject });
      });
    }

    return Promise.reject(error);
  }
);

export { axiosInstance };
