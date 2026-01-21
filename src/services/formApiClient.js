// src/api/formApiClient.js
import axios from "axios";

const formApiClient = axios.create({
  baseURL: "http://localhost:5001/api/forms", // base URL for all forms
  withCredentials: true, // in case you need cookies/session
});

// Optional: request interceptor (e.g., add auth token if needed)
formApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // optional if forms are protected
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: response interceptor
formApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Form API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default formApiClient;
