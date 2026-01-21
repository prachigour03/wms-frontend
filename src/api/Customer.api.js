import formApiClient from "../services/formApiClient";

export const getCustomers = () => {
  return formApiClient.get("/master/customers");
};

export const createCustomer = (data) => {
  return formApiClient.post("/master/customers", data);
};

export const updateCustomer = (id, data) => {
  return formApiClient.put(`/master/customers/${id}`, data);
};

export const deleteCustomer = (id) => {
  return formApiClient.delete(`/master/customers/${id}`);
};
