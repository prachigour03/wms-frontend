import formApiClient from "../services/formApiClient";

export const getSubsidiaries = () =>
  formApiClient.get("/api/forms/setup/subsidiaries");

export const createSubsidiary = (data) =>
  formApiClient.post("/api/forms/setup/subsidiaries", data);

export const updateSubsidiary = (id, data) =>
  formApiClient.put(`/api/forms/setup/subsidiaries/${id}`, data);

export const deleteSubsidiary = (id) =>
  formApiClient.delete(`/api/forms/setup/subsidiaries/${id}`);
