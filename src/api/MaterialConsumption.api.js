import formApiClient from "../services/formApiClient";

const BASE_URL = "/api/forms/transition/material-consumption";

export const getMaterialConsumptions = () => formApiClient.get(BASE_URL);

export const getMaterialConsumptionById = (id) => formApiClient.get(`${BASE_URL}/${id}`);

export const createMaterialConsumption = (data) => formApiClient.post(BASE_URL, data);

export const updateMaterialConsumption = (id, data) => formApiClient.put(`${BASE_URL}/${id}`, data);

export const deleteMaterialConsumption = (id) => formApiClient.delete(`${BASE_URL}/${id}`);

export const confirmMaterialConsumption = (id) => formApiClient.patch(`${BASE_URL}/${id}/confirm`);

export const cancelMaterialConsumption = (id) => formApiClient.patch(`${BASE_URL}/${id}/cancel`);
