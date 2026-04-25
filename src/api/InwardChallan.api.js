import formApiClient from "../services/formApiClient";

const BASE_URL = "/api/forms/transition/inward-challan";

export const getInwardChallans = () => formApiClient.get(BASE_URL);

export const getInwardChallanById = (id) => formApiClient.get(`${BASE_URL}/${id}`);

export const createInwardChallan = (data) => formApiClient.post(BASE_URL, data);

export const updateInwardChallan = (id, data) => formApiClient.put(`${BASE_URL}/${id}`, data);

export const deleteInwardChallan = (id) => formApiClient.delete(`${BASE_URL}/${id}`);

export const confirmInwardChallan = (id) => formApiClient.patch(`${BASE_URL}/${id}/confirm`);

export const cancelInwardChallan = (id) => formApiClient.patch(`${BASE_URL}/${id}/cancel`);
