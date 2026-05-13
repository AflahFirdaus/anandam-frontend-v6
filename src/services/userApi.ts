import axios from "axios";

const userApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE}/api/v1`, 
  timeout: 20000,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ================= REQUEST =================
userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("user_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ================= RESPONSE =================
userApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/register")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return userApi(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("user_refresh_token");

        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE}/api/v1/user/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );

        const newAccessToken = res.data.access_token;

        localStorage.setItem("user_token", newAccessToken);

        isRefreshing = false;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return userApi(originalRequest);

      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);

        localStorage.removeItem("user_token");
        localStorage.removeItem("user_refresh_token");

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default userApi;