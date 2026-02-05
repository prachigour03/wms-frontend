import formApiClient from "../services/formApiClient";

export const getAccountTypes = () => {
  return formApiClient.get("/api/forms/master/account-types");
};

export const createAccountType = (data) => {
  return formApiClient.post("/api/forms/master/account-types", data);
};

export const updateAccountType = (id, data) => {
  return formApiClient.put(`/api/forms/master/account-types/${id}`, data);
};

export const deleteAccountType = (id) => {
  return formApiClient.delete(`/api/forms/master/account-types/${id}`);
};