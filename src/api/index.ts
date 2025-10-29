import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

type RetryQueueItem = {
  resolve: (value: AxiosResponse) => void;
  reject: (error: any) => void;
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
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      originalRequest.url !== "/auth/refresh"
    ) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = localStorage.getItem("refresh_token");

          const baseURL = axiosInstance.defaults.baseURL;
          const response = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } =
            response.data;

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

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed", refreshError);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

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
