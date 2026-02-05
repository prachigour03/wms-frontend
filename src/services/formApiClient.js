import axios from "axios";

const formApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true, 
});

// Optional: request interceptor 
formApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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
