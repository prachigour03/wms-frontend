import formApiClient from "../services/formApiClient";

export const getChartOfAccounts = () => {
  return formApiClient.get("/api/forms/master/chart-of-accounts");
};

export const createChartOfAccount = (data) => {
  return formApiClient.post("/api/forms/master/chart-of-accounts", data);
};

export const updateChartOfAccount = (id, data) => {
  return formApiClient.put(`/api/forms/master/chart-of-accounts/${id}`, data);
};

export const deleteChartOfAccount = (id) => {
  return formApiClient.delete(`/api/forms/master/chart-of-accounts/${id}`);
};
 