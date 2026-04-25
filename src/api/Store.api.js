import formApiClient from "../services/formApiClient";

export const getStores = () =>
  formApiClient.get("/api/forms/master/stores");

export const createStore = (data) =>
  formApiClient.post("/api/forms/master/stores", data);

export const updateStore = (id, data) =>
  formApiClient.put(`/api/forms/master/stores/${id}`, data);

export const deleteStore = (id) =>
  formApiClient.delete(`/api/forms/master/stores/${id}`);
