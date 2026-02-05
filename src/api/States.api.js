// src/api/states.api.js
import formApiClient from "../services/formApiClient";

export const getStates = () => {
  return formApiClient.get("/api/forms/setup/states");
};

export const createState = (data) => {
  return formApiClient.post("/api/forms/setup/states", data);
};

export const updateState = (id, data) => {
  return formApiClient.put(`/api/forms/setup/states/${id}`, data);
};

export const deleteState = (id) => {
  return formApiClient.delete(`/api/forms/setup/states/${id}`);
};
