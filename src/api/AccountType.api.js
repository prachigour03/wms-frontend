import formApiClient from "../services/formApiClient";

export const getAccountTypes = () => {
  return formApiClient.get("/master/account-types");
};

export const createAccountType = (data) => {
  return formApiClient.post("/master/account-types", data);
};

export const updateAccountType = (id, data) => {
  return formApiClient.put(`/master/account-types/${id}`, data);
};

export const deleteAccountType = (id) => {
  return formApiClient.delete(`/master/account-types/${id}`);
};