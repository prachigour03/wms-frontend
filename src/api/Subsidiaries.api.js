import formApiClient from "../services/formApiClient";

export const getSubsidiaries = () =>
  formApiClient.get("/setup/subsidiaries");

export const createSubsidiary = (data) =>
  formApiClient.post("/setup/subsidiaries", data);

export const updateSubsidiary = (id, data) =>
  formApiClient.put(`/setup/subsidiaries/${id}`, data);

export const deleteSubsidiary = (id) =>
  formApiClient.delete(`/setup/subsidiaries/${id}`);
