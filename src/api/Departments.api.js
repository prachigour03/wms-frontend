import formApiClient from "../services/formApiClient";

export const getDepartments = () => {
  return formApiClient.get("/api/forms/setup/departments");
};

export const createDepartment = (data) => {
  return formApiClient.post("/api/forms/setup/departments", data);
};

export const updateDepartment = (id, data) => {
  return formApiClient.put(`/api/forms/setup/departments/${id}`, data);
};

export const deleteDepartment = (id) => {
  return formApiClient.delete(`/api/forms/setup/departments/${id}`);
};
