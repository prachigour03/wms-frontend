import formApiClient from "../services/formApiClient";

export const getwarehouses = () => {
  return formApiClient.get("/api/forms/master/warehouses");
}

export const createwarehouse = (data) => {
    return formApiClient.post("/api/forms/master/warehouses", data);
}

export const updatewarehouse = (id, data) => {
    return formApiClient.put(`/api/forms/master/warehouses/${id}`, data);
}

export const deletewarehouse = (id) => {
    return formApiClient.delete(`/api/forms/master/warehouses/${id}`);
}

