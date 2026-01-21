import formApiClient from "../services/formApiClient";

export const getCompanyDetails = () => {
  return formApiClient.get("/setup/company-detail");
};

export const createCompanyDetail = (data) => {
  return formApiClient.post("/setup/company-detail", data);
};

export const updateCompanyDetail = (id, data) => {
  return formApiClient.put(`/setup/company-detail/${id}`, data);
};

