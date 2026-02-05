// src/api/formApi.js
import formApiClient from "../services/formApiClient";

// GET orders (example)
export const getOrders = () => formApiClient.get("/api/forms/o2c/order-booking");

// CREATE order
export const createOrder = (orderData) =>
  formApiClient.post("/api/forms/o2c/order-booking", orderData);

// UPDATE order (example)
export const updateOrder = (id, orderData) =>
  formApiClient.put(`/api/forms/o2c/order-booking/${id}`, orderData);

// DELETE order
export const deleteOrder = (id) =>
  formApiClient.delete(`/api/forms/o2c/order-booking/${id}`);
