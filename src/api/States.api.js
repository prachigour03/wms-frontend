// src/api/states.api.js
import formApiClient from "../services/formApiClient";

export const getStates = () => {
  return formApiClient.get("/setup/states");
};

export const createState = (data) => {
  return formApiClient.post("/setup/states", data);
};

export const updateState = (id, data) => {
  return formApiClient.put(`/setup/states/${id}`, data);
};

export const deleteState = (id) => {
  return formApiClient.delete(`/setup/states/${id}`);
};
