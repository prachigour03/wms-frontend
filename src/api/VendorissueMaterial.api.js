import formApiClient from "../services/formApiClient";

// GET all vendor issues
export const getVendorIssueMaterials = () =>
  formApiClient.get("/api/forms/transition/vendor-issue-material");

// CREATE a vendor issue
export const createVendorIssueMaterial = (data) =>
  formApiClient.post("/api/forms/transition/vendor-issue-material", data);

// UPDATE a vendor issue
export const updateVendorIssueMaterial = (id, data) =>
  formApiClient.put(`/api/forms/transition/vendor-issue-material/${id}`, data);

// DELETE a vendor issue
export const deleteVendorIssueMaterial = (id) =>
  formApiClient.delete(`/api/forms/transition/vendor-issue-material/${id}`);
