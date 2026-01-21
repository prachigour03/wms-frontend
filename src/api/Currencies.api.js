import formApiClient from "../services/formApiClient";

// GET all currencies
export const getCurrencies = () => {
  return formApiClient.get("/setup/currencies");
};

// GET currency by ID
export const getCurrencyById = (id) => {
  return formApiClient.get(`/setup/currencies/${id}`);
};

// CREATE new currency
export const createCurrency = (data) => {
  return formApiClient.post("/setup/currencies", data);
};

// UPDATE currency by ID
export const updateCurrency = (id, data) => {
  return formApiClient.put(`/setup/currencies/${id}`, data);
};

// DELETE currency by ID
export const deleteCurrency = (id) => {
  return formApiClient.delete(`/setup/currencies/${id}`);
};
