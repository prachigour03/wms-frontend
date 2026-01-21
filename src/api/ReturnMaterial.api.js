import formApiClient from "../services/formApiClient";

// GET all return materials
export const getReturnMaterials = () =>
  formApiClient.get("/transition/return-material");

// CREATE a return material
export const createReturnMaterial = (data) =>
  formApiClient.post("/transition/return-material", data);

// UPDATE a return material
export const updateReturnMaterial = (id, data) =>
  formApiClient.put(`/transition/return-material/${id}`, data);

// DELETE a return material
export const deleteReturnMaterial = (id) =>
  formApiClient.delete(`/transition/return-material/${id}`);
