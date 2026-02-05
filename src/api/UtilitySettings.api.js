// src/api/utilitySettings.api.js
import formApiClient from "../services/formApiClient";

/**
 * GET ALL UTILITY SETTINGS
 */
export const getUtilitySettings = () => {
  return formApiClient.get("/api/forms/setup/utility-settings");
};

/**
 * GET UTILITY SETTING BY KEY
 */
export const getUtilitySettingByKey = (key) => {
  return formApiClient.get(`/api/forms/setup/utility-settings/${key}`);
};

/**
 * CREATE / UPDATE SINGLE SETTING (UPSERT)
 * payload: { key: "dateFormat", value: "YYYY-MM-DD" }
 */
export const upsertUtilitySetting = (data) => {
  return formApiClient.post("/api/forms/setup/utility-settings", data);
};

/**
 * BULK UPDATE SETTINGS (BEST FOR SETTINGS PAGE)
 * payload:
 * {
 *   dateFormat: "YYYY-MM-DD",
 *   timeZone: "Asia/Kolkata",
 *   currency: "INR",
 *   notifications: true,
 *   autoLogout: 30
 * }
 */
export const upsertMultipleUtilitySettings = (data) => {
  return formApiClient.put("/api/forms/setup/utility-settings/bulk", data);
};

/**
 * DELETE SETTING BY KEY
 */
export const deleteUtilitySetting = (key) => {
  return formApiClient.delete(`/api/forms/setup/utility-settings/${key}`);
};
