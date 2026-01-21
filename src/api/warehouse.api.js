import formApiClient from "../services/formApiClient";

export const getwarehouses = () => {
  return formApiClient.get("/master/warehouses");
}

export const createwarehouse = (data) => {
    return formApiClient.post("/master/warehouses", data);
}

export const updatewarehouse = (id, data) => {
    return formApiClient.put(`/master/warehouses/${id}`, data);
}

export const deletewarehouse = (id) => {
    return formApiClient.delete(`/master/warehouses/${id}`);
}

