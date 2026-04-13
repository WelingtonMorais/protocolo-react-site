import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://requestwm.vps-kinghost.net/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/client/register",
  "/auth/employee/register",
  "/auth/check-user-cpf",
  "/auth/validate-password-recovery",
  "/auth/reset-password",
];

api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const isPublicAuth = PUBLIC_AUTH_PATHS.some((p) => url.includes(p));
  const token = localStorage.getItem("token");
  if (token && !isPublicAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error as unknown);
  }
);
