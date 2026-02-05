// src/api/location.api.js
import formApiClient from "../services/formApiClient";

export const getLocations = () => {
  return formApiClient.get("/api/forms/setup/locations");
};

export const createLocation = (data) => {
  return formApiClient.post("/api/forms/setup/locations", data);
};

export const updateLocation = (id, data) => {
  return formApiClient.put(`/api/forms/setup/locations/${id}`, data);
};

export const deleteLocation = (id) => {
  return formApiClient.delete(`/api/forms/setup/locations/${id}`);
};
