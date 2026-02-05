import formApiClient from "../services/formApiClient";

export const getCities = () => {
  return formApiClient.get("/api/forms/setup/cities");
};

export const createCity = (data) => {
  return formApiClient.post("/api/forms/setup/cities", data);
};

export const updateCity = (id, data) => {
  return formApiClient.put(`/api/forms/setup/cities/${id}`, data);
};

export const deleteCity = (id) => {
  return formApiClient.delete(`/api/forms/setup/cities/${id}`);
};
