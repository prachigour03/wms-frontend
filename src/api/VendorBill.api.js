import formApiClient from "../services/formApiClient";

// GET all vendor bills
export const getVendorBills = () =>
  formApiClient.get("/api/forms/transition/vendor-bill");

// CREATE a vendor bill
export const createVendorBill = (data) =>
  formApiClient.post("/api/forms/transition/vendor-bill", data);

// UPDATE a vendor bill
export const updateVendorBill = (id, data) =>
  formApiClient.put(`/api/forms/transition/vendor-bill/${id}`, data);

// DELETE a vendor bill
export const deleteVendorBill = (id) =>
  formApiClient.delete(`/api/forms/transition/vendor-bill/${id}`);
