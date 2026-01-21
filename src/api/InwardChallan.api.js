import formApiClient from "../services/formApiClient";

// GET all inward challans
export const getInwardChallans = () =>
  formApiClient.get("/transition/inward-challan");

// CREATE inward challan
export const createInwardChallan = (data) =>
  formApiClient.post("/transition/inward-challan", data);

// UPDATE inward challan
export const updateInwardChallan = (id, data) =>
  formApiClient.put(`/transition/inward-challan/${id}`, data);

// DELETE inward challan
export const deleteInwardChallan = (id) =>
  formApiClient.delete(`/transition/inward-challan/${id}`);
