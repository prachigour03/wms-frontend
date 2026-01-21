import formApiClient from "../services/formApiClient";

export const getChartOfAccounts = () => {
  return formApiClient.get("/master/chart-of-accounts");
};

export const createChartOfAccount = (data) => {
  return formApiClient.post("/master/chart-of-accounts", data);
};

export const updateChartOfAccount = (id, data) => {
  return formApiClient.put(`/master/chart-of-accounts/${id}`, data);
};

export const deleteChartOfAccount = (id) => {
  return formApiClient.delete(`/master/chart-of-accounts/${id}`);
};
 