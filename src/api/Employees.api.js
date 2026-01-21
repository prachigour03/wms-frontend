import formApiClient from "../services/formApiClient";  

export const getEmployees = () => {
  return formApiClient.get("/master/employees");
}
export const getEmployeeById = (id) => {
  return formApiClient.get(`/master/employees/${id}`);
}   
export const createEmployee = (data) => {
    return formApiClient.post("/master/employees", data);
};

export const updateEmployee = (id, data) => {
  return formApiClient.put(`/master/employees/${id}`, data);
};

export const deleteEmployee = (id) => {
  return formApiClient.delete(`/master/employees/${id}`);
};