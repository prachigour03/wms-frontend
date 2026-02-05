import api from "./axios";

/* ======================================================
   ROLES API
====================================================== */

/**
 * GET ALL ROLES
 * GET /api/roles
 * Permission: roles:read
 */
export const getAllRolesApi = async () => {
  const res = await api.get("/api/roles");
  return res.data;
};

/**
 * GET ROLE BY ID
 * GET /api/roles/:id
 * Permission: roles:read
 */
export const getRoleByIdApi = async (id) => {
  const res = await api.get(`/api/roles/${id}`);
  return res.data;
};

/**
 * CREATE ROLE
 * POST /api/roles
 * Permission: roles:create
 */
export const createRoleApi = async (payload) => {
  const res = await api.post("/api/roles", payload);
  return res.data;
};

/**
 * UPDATE ROLE
 * PUT /api/roles/:id
 * Permission: roles:update
 */
export const updateRoleApi = async (id, payload) => {
  const res = await api.put(`/api/roles/${id}`, payload);
  return res.data;
};

/**
 * DELETE ROLE
 * DELETE /api/roles/:id
 * Permission: roles:delete
 */
export const deleteRoleApi = async (id) => {
  const res = await api.delete(`/api/roles/${id}`);
  return res.data;
};

/**
 * ADD PERMISSION TO ROLE (LEGACY / ID BASED)
 * POST /api/roles/add-permission
 * Permission: roles:update
 */
export const addPermissionToRoleApi = async (payload) => {
  const res = await api.post("/api/roles/add-permission", payload);
  return res.data;
};

