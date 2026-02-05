// src/api/paymentTeam.api.js
import formApiClient from "../services/formApiClient";

export const getPaymentTeams = () => {
  return formApiClient.get("/api/forms/setup/payment-teams");
};

export const createPaymentTeam = (data) => {
  return formApiClient.post("/api/forms/setup/payment-teams", data);
};

export const updatePaymentTeam = (id, data) => {
  return formApiClient.put(`/api/forms/setup/payment-teams/${id}`, data);
};

export const deletePaymentTeam = (id) => {
  return formApiClient.delete(`/api/forms/setup/payment-teams/${id}`);
};
