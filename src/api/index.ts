import axios, { AxiosError, type AxiosRequestConfig } from "axios";

type RetryQueueItem = {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: AxiosRequestConfig;
};

const refreshAndRetryQueue: RetryQueueItem[] = [];

let isRefreshing = false;

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
    const originalRequest: AxiosRequestConfig =
      error.config as AxiosRequestConfig;

    if (error.response && error.response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = localStorage.getItem("refresh_token");
          const response = await axios.post("/auth/refresh", {
            refreshToken,
          });
          const { access_token, refresh_token: newRefreshToken } =
            response.data;

          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", newRefreshToken);

          axiosInstance.defaults.headers.common["Authorization"] =
            `Bearer ${access_token}`;

          refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
            axiosInstance
              .request(config)
              .then((response) => resolve(response))
              .catch((err) => reject(err));
          });

          refreshAndRetryQueue.length = 0;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("token refresh failed", refreshError);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise<void>((resolve, reject) => {
        refreshAndRetryQueue.push({ config: originalRequest, resolve, reject });
      });
    }
    return Promise.reject(error);
  },
);

export { axiosInstance };
