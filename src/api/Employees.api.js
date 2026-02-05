import formApiClient from "../services/formApiClient";  

export const getAllEmployees = () => {
  return formApiClient.get("/api/forms/master/employees");
}
export const getEmployeeById = (id) => {
  return formApiClient.get(`/api/forms/master/employees/${id}`);
}   
export const createEmployee = (data) => {
    return formApiClient.post("/api/forms/master/employees", data);
};

export const updateEmployee = (id, data) => {
  return formApiClient.put(`/api/forms/master/employees/${id}`, data);
};

export const deleteEmployee = (id) => {
  return formApiClient.delete(`/api/forms/master/employees/${id}`);
};