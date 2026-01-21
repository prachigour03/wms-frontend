import formApiClient from "../services/formApiClient";

export const getDepartments = () => {
  return formApiClient.get("/setup/departments");
};

export const createDepartment = (data) => {
  return formApiClient.post("/setup/departments", data);
};

export const updateDepartment = (id, data) => {
  return formApiClient.put(`/setup/departments/${id}`, data);
};

export const deleteDepartment = (id) => {
  return formApiClient.delete(`/setup/departments/${id}`);
};
