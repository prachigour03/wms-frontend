import formApiClient from "../services/formApiClient";

const BASE_URL = "/api/forms/transition/return-material";

export const getReturnMaterials = () => formApiClient.get(BASE_URL);

export const getReturnMaterialById = (id) => formApiClient.get(`${BASE_URL}/${id}`);

export const createReturnMaterial = (data) => formApiClient.post(BASE_URL, data);

export const updateReturnMaterial = (id, data) => formApiClient.put(`${BASE_URL}/${id}`, data);

export const deleteReturnMaterial = (id) => formApiClient.delete(`${BASE_URL}/${id}`);

export const confirmReturnMaterial = (id) => formApiClient.patch(`${BASE_URL}/${id}/confirm`);

export const cancelReturnMaterial = (id) => formApiClient.patch(`${BASE_URL}/${id}/cancel`);
