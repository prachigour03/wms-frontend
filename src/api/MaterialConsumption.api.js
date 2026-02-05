// src/api/MaterialConsumption.api.js
import formApiClient from "../services/formApiClient";

/**
 * ===============================
 * MATERIAL CONSUMPTION APIs
 * ===============================
 */

// GET all material consumption records
export const getMaterialConsumptions = () =>
  formApiClient.get("/api/forms/transition/material-consumption");

// CREATE material consumption
export const createMaterialConsumption = (materialConsumptionData) =>
  formApiClient.post(
    "/api/forms/transition/material-consumption",
    materialConsumptionData
  );

// UPDATE material consumption
export const updateMaterialConsumption = (id, materialConsumptionData) =>
  formApiClient.put(
    `/api/forms/transition/material-consumption/${id}`,
    materialConsumptionData
  );

// DELETE material consumption
export const deleteMaterialConsumption = (id) =>
  formApiClient.delete(`/api/forms/transition/material-consumption/${id}`);
