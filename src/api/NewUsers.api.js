import axiosInstance from "../utils/axios";

export const getUsers = () => {
  return axiosInstance.get("/api/users").then((res) => res.data);
};

export const getUserById = (id) => {
  return axiosInstance.get(`/api/users/${id}`).then((res) => res.data);
};

export const createUser = (data) => {
  return axiosInstance.post("/api/users", data).then((res) => res.data);
};

export const updateUser = (id, data) => {
  return axiosInstance.put(`/api/users/${id}`, data).then((res) => res.data);
};

export const deleteUser = (id) => {
  return axiosInstance.delete(`/api/users/${id}`).then((res) => res.data);
};