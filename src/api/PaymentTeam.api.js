// src/api/paymentTeam.api.js
import formApiClient from "../services/formApiClient";

export const getPaymentTeams = () => {
  return formApiClient.get("/setup/payment-teams");
};

export const createPaymentTeam = (data) => {
  return formApiClient.post("/setup/payment-teams", data);
};

export const updatePaymentTeam = (id, data) => {
  return formApiClient.put(`/setup/payment-teams/${id}`, data);
};

export const deletePaymentTeam = (id) => {
  return formApiClient.delete(`/setup/payment-teams/${id}`);
};
