// apiClient.js
import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const normalizedApiBase = rawApiUrl
  .replace(/\/+$/, "")
  .replace(/\/api\/auth$/i, "")
  .replace(/\/api$/i, "");

const apiClient = axios.create({
  baseURL: `${normalizedApiBase}/api/auth`,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
