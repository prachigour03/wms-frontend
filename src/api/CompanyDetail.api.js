import formApiClient from "../services/formApiClient";

export const getCompanyDetails = () => {
  return formApiClient.get("/api/forms/setup/company-detail");
};

export const createCompanyDetail = (data) => {
  return formApiClient.post("/api/forms/setup/company-detail", data);
};

export const updateCompanyDetail = (id, data) => {
  return formApiClient.put(`/api/forms/setup/company-detail/${id}`, data);
};

