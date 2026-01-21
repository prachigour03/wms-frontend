import formApiClient from "../services/formApiClient";

export const getVendors = () => {
  return formApiClient.get("/master/vendors");
};

export const createVendor = (data) => {
  return formApiClient.post("/master/vendors", data);
};

export const updateVendor = (id, data) => {
  return formApiClient.put(`/master/vendors/${id}`, data);
};

export const deleteVendor = (id) => {
  return formApiClient.delete(`/master/vendors/${id}`);
};
