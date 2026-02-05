import formApiClient from "../services/formApiClient";

export const getCustomers = () => {
  return formApiClient.get("/api/forms/master/customers");
};

export const createCustomer = (data) => {
  return formApiClient.post("/api/forms/master/customers", data);
};

export const updateCustomer = (id, data) => {
  return formApiClient.put(`/api/forms/master/customers/${id}`, data);
};

export const deleteCustomer = (id) => {
  return formApiClient.delete(`/api/forms/master/customers/${id}`);
};
