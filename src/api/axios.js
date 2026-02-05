import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ======================================================
   REQUEST INTERCEPTOR → ATTACH JWT
====================================================== */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ======================================================
   RESPONSE INTERCEPTOR → HANDLE ERRORS
====================================================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // ❌ Unauthorized / Token Expired
    if (status === 401 || status === 403) {
      localStorage.clear();

      // prevent infinite reload loop
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(
      error?.response?.data || { message: "Something went wrong" }
    );
  }
);

export default api;
