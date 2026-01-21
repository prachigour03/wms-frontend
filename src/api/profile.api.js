import axios from "axios";

/* ================================
   AXIOS INSTANCE
================================ */
const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api/forms/profile", // ✅ FIXED
});

/* ================================
   REQUEST INTERCEPTOR (JWT)
================================ */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================================
   RESPONSE INTERCEPTOR
================================ */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired. Logging out...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* ================================
   PROFILE APIs
================================ */

/** Create profile (ADMIN) */
export const createProfile = async (formData) => {
  const res = await axiosInstance.post("/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/** Get logged-in user profile */
export const getMyProfile = async () => {
  const res = await axiosInstance.get("/me");
  return res.data;
};

/** Get profile by ID (ADMIN) */
export const getProfileById = async (id) => {
  const res = await axiosInstance.get(`/${id}`);
  return res.data;
};

/** Update profile with image */
export const updateProfile = async (id, formData) => {
  const res = await axiosInstance.put(`/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/** Update profile JSON (no image) */
export const updateProfileData = async (id, data) => {
  const res = await axiosInstance.put(`/${id}`, data);
  return res.data;
};

/** Delete profile (ADMIN) */
export const deleteProfile = async (id) => {
  const res = await axiosInstance.delete(`/${id}`);
  return res.data;
};
