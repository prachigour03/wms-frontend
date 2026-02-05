import formApiClient from "../services/formApiClient";

export const getItemGroups = () => {
  return formApiClient.get("/api/forms/master/item-groups");
};

export const createItemGroup = (data) => {
  return formApiClient.post("/api/forms/master/item-groups", data);
};

export const updateItemGroup = (id, data) => {
  return formApiClient.put(`/api/forms/master/item-groups/${id}`, data);
};

export const deleteItemGroup = (id) => {
  return formApiClient.delete(`/api/forms/master/item-groups/${id}`);
};
