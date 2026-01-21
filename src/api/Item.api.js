import formApiClient from "../services/formApiClient";

export const getItems = () => {
  return formApiClient.get("/master/items");
};

export const createItem = (data) => {
  return formApiClient.post("/master/items", data);
};

export const updateItem = (id, data) => {
  return formApiClient.put(`/master/items/${id}`, data);
};

export const deleteItem = (id) => {
  return formApiClient.delete(`/master/items/${id}`);
};
