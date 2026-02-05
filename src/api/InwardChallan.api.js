import formApiClient from "../services/formApiClient";

// GET all inward challans
export const getInwardChallans = () =>
  formApiClient.get("/api/forms/transition/inward-challan");

// CREATE inward challan
export const createInwardChallan = (data) =>
  formApiClient.post("/api/forms/transition/inward-challan", data);

// UPDATE inward challan
export const updateInwardChallan = (id, data) =>
  formApiClient.put(`/api/forms/transition/inward-challan/${id}`, data);

// DELETE inward challan
export const deleteInwardChallan = (id) =>
  formApiClient.delete(`/api/forms/transition/inward-challan/${id}`);
