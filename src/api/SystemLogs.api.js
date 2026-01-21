// src/api/systemLogs.api.js
import formApiClient from "../services/formApiClient";

/**
 * GET System Logs
 * Supports filters: user, level
 * Example: getSystemLogs({ user: "Admin", level: "Info" })
 */
export const getSystemLogs = (params = {}) => {
  return formApiClient.get("/setup/system-logs", { params });
};

/**
 * CREATE System Log
 */
export const createSystemLog = (data) => {
  return formApiClient.post("/setup/system-logs", data);
};

/**
 * DELETE System Log
 */
export const deleteSystemLog = (id) => {
  return formApiClient.delete(`/setup/system-logs/${id}`);
};
