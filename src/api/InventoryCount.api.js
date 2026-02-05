import formApiClient from "../services/formApiClient";

// GET all inventory counts
export const getInventoryCounts = async () => {
  return formApiClient.get("/api/forms/transition/inventory-count");
};

// CREATE inventory count
export const createInventoryCount= async (Data) =>
  formApiClient.post("/api/forms/transition/inventory-count", Data);

// UPDATE inventory count
export const updateInventoryCount = async (id, Data) =>
  formApiClient.put(`/api/forms/transition/inventory-count/${id}`, Data);

// DELETE inventory count
export const deleteInventoryCount = async (id) =>
  formApiClient.delete(`/api/forms/transition/inventory-count/${id}`);
