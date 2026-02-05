import formApiClient from "../services/formApiClient";

export const getVendors = () => {
  return formApiClient.get("/api/forms/master/vendors");
};

export const createVendor = (data) => {
  return formApiClient.post("/api/forms/master/vendors", data);
};

export const updateVendor = (id, data) => {
  return formApiClient.put(`/api/forms/master/vendors/${id}`, data);
};

export const deleteVendor = (id) => {
  return formApiClient.delete(`/api/forms/master/vendors/${id}`);
};
