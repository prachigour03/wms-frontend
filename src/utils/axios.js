import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/auth", // fallback to proxy
});

// Add Authorization header automatically if token exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // get JWT from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);


export default axiosInstance;
