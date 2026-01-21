// src/api/location.api.js
import formApiClient from "../services/formApiClient";

export const getLocations = () => {
  return formApiClient.get("/setup/locations");
};

export const createLocation = (data) => {
  return formApiClient.post("/setup/locations", data);
};

export const updateLocation = (id, data) => {
  return formApiClient.put(`/setup/locations/${id}`, data);
};

export const deleteLocation = (id) => {
  return formApiClient.delete(`/setup/locations/${id}`);
};
