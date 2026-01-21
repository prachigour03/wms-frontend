import formApiClient from "../services/formApiClient";

export const getCities = () => {
  return formApiClient.get("/setup/cities");
};

export const createCity = (data) => {
  return formApiClient.post("/setup/cities", data);
};

export const updateCity = (id, data) => {
  return formApiClient.put(`/setup/cities/${id}`, data);
};

export const deleteCity = (id) => {
  return formApiClient.delete(`/setup/cities/${id}`);
};
