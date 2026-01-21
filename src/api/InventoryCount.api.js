import formApiClient from "../services/formApiClient";

// GET all inventory counts
export const getInventoryCounts = async () => {
  return formApiClient.get("/transition/inventory-count");
};

// CREATE inventory count
export const createInventoryCount= async (Data) =>
  formApiClient.post("/transition/inventory-count", Data);

// UPDATE inventory count
export const updateInventoryCount = async (id, Data) =>
  formApiClient.put(`/transition/inventory-count/${id}`, Data);

// DELETE inventory count
export const deleteInventoryCount = async (id) =>
  formApiClient.delete(`/transition/inventory-count/${id}`);
