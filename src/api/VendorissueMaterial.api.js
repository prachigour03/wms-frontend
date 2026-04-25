import formApiClient from "../services/formApiClient";

const BASE_URL = "/api/forms/transition/vendor-issue-material";

export const getVendorIssueMaterials = () => formApiClient.get(BASE_URL);

export const getVendorIssueMaterialById = (id) => formApiClient.get(`${BASE_URL}/${id}`);

export const createVendorIssueMaterial = (data) => formApiClient.post(BASE_URL, data);

export const updateVendorIssueMaterial = (id, data) => formApiClient.put(`${BASE_URL}/${id}`, data);

export const deleteVendorIssueMaterial = (id) => formApiClient.delete(`${BASE_URL}/${id}`);

export const confirmVendorIssueMaterial = (id) => formApiClient.patch(`${BASE_URL}/${id}/confirm`);

export const cancelVendorIssueMaterial = (id) => formApiClient.patch(`${BASE_URL}/${id}/cancel`);
