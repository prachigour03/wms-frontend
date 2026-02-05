import formApiClient from "../services/formApiClient";

export const getItems = () => {
  return formApiClient.get("/api/forms/master/items");
};

export const createItem = (data) => {
  return formApiClient.post("/api/forms/master/items", data);
};

export const updateItem = (id, data) => {
  return formApiClient.put(`/api/forms/master/items/${id}`, data);
};

export const deleteItem = (id) => {
  return formApiClient.delete(`/api/forms/master/items/${id}`);
};
