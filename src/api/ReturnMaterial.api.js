import formApiClient from "../services/formApiClient";

// GET all return materials
export const getReturnMaterials = () =>
  formApiClient.get("/api/forms/transition/return-material");

// CREATE a return material
export const createReturnMaterial = (data) =>
  formApiClient.post("/api/forms/transition/return-material", data);

// UPDATE a return material
export const updateReturnMaterial = (id, data) =>
  formApiClient.put(`/api/forms/transition/return-material/${id}`, data);

// DELETE a return material
export const deleteReturnMaterial = (id) =>
  formApiClient.delete(`/api/forms/transition/return-material/${id}`);
