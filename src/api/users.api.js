import api from "./axios";

/* ======================================================
   USERS API
====================================================== */

/**
 * GET ALL USERS
 * GET /api/users
 * Permission: users:read
 */
export const getAllUsersApi = async () => {
  const res = await api.get("/api/users");
  return res.data;
};

/**
 * GET USER BY ID
 * GET /api/users/:id
 * Permission: users:read
 */
export const getUserByIdApi = async (id) => {
  const res = await api.get(`/api/users/${id}`);
  return res.data;
};

/**
 * CREATE USER (ADMIN)
 * POST /api/users
 * Permission: users:create
 */
export const createUserApi = async (payload) => {
  const res = await api.post("/api/users", payload);
  return res.data;
};

/**
 * UPDATE USER
 * PUT /api/users/:id
 * Permission: users:update
 */
export const updateUserApi = async (id, payload) => {
  const res = await api.put(`/api/users/${id}`, payload);
  return res.data;
};

/**
 * DELETE USER
 * DELETE /api/users/:id
 * Permission: users:delete
 */
export const deleteUserApi = async (id) => {
  const res = await api.delete(`/api/users/${id}`);
  return res.data;
};
