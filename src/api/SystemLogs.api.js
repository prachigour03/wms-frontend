// src/api/systemLogs.api.js
import formApiClient from "../services/formApiClient";

/**
 * GET System Logs
 * Supports filters: user, level
 * Example: getSystemLogs({ user: "Admin", level: "Info" })
 */
export const getSystemLogs = (params = {}) => {
  return formApiClient.get("/api/forms/setup/system-logs", { params });
};

/**
 * CREATE System Log
 */
export const createSystemLog = (data) => {
  return formApiClient.post("/api/forms/setup/system-logs", data);
};

/**
 * DELETE System Log
 */
export const deleteSystemLog = (id) => {
  return formApiClient.delete(`/api/forms/setup/system-logs/${id}`);
};
