import axios from "axios";
import { env } from "../config/env.js";
import { getToken, setToken, clearAuthStorage } from "./storage.js";

let refreshPromise = null;

export const api = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;

    if (status !== 401 || !originalRequest) return Promise.reject(error);

    const url = String(originalRequest?.url || "");
    const isLogin = url.includes("/api/v1/auth/login");
    const isRefresh = url.includes("/api/v1/auth/refresh");

    if (isLogin) return Promise.reject(error);

    if (isRefresh || originalRequest._retry) {
      clearAuthStorage();
      if (window.location.pathname !== "/") window.location.href = "/";
      return Promise.reject(error);
    }

    const currentToken = getToken();
    if (!currentToken) {
      clearAuthStorage();
      if (window.location.pathname !== "/") window.location.href = "/";
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post("/api/v1/auth/refresh", null, {
            baseURL: env.API_BASE_URL,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`
            },
            timeout: 30000
          })
          .then((r) => r.data)
          .then((data) => {
            const t = data?.token || data?.access_token;
            if (!t) throw new Error("No token returned from refresh.");
            setToken(t);
            return t;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshErr) {
      clearAuthStorage();
      if (window.location.pathname !== "/") window.location.href = "/";
      return Promise.reject(refreshErr);
    }
  }
);
