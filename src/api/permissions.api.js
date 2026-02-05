import api from "./axios";

/* ======================================================
   PERMISSIONS API
====================================================== */

/**
 * GET ALL PERMISSIONS (GROUPED)
 * GET /api/permissions
 * Permission: permissions:read
 *
 * Response:
 * {
 *   dashboard: [{ key, description }],
 *   users: [{ key, description }],
 *   ...
 * }
 */
export const getAllPermissionsApi = async () => {
  const res = await api.get("/api/permissions");
  return res.data;
};

/**
 * ASSIGN PERMISSION TO ROLE (KEY BASED)
 * POST /api/permissions/assign
 * Permission: roles:update
 *
 * payload = {
 *   roleId,
 *   permissionKey: "users:create"
 * }
 */
export const assignPermissionToRoleApi = async (payload) => {
  const res = await api.post("/api/permissions/assign", payload);
  return res.data;
};

/**
 * DELETE PERMISSION
 * DELETE /api/permissions/:id
 * Permission: permissions:delete
 */
export const deletePermissionApi = async (id) => {
  const res = await api.delete(`/api/permissions/${id}`);
  return res.data;
};
