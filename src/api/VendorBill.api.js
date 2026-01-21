import formApiClient from "../services/formApiClient";

// GET all vendor bills
export const getVendorBills = () =>
  formApiClient.get("/transition/vendor-bill");

// CREATE a vendor bill
export const createVendorBill = (data) =>
  formApiClient.post("/transition/vendor-bill", data);

// UPDATE a vendor bill
export const updateVendorBill = (id, data) =>
  formApiClient.put(`/transition/vendor-bill/${id}`, data);

// DELETE a vendor bill
export const deleteVendorBill = (id) =>
  formApiClient.delete(`/transition/vendor-bill/${id}`);
