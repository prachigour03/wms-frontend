import formApiClient from "../services/formApiClient";

export const getItemGroups = () => {
  return formApiClient.get("/master/item-groups");
};

export const createItemGroup = (data) => {
  return formApiClient.post("/master/item-groups", data);
};

export const updateItemGroup = (id, data) => {
  return formApiClient.put(`/master/item-groups/${id}`, data);
};

export const deleteItemGroup = (id) => {
  return formApiClient.delete(`/master/item-groups/${id}`);
};
