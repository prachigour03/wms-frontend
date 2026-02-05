import api from "./axios";

/**
 * Get all notifications
 */
export const getNotifications = async () => {
  return await api.get("/api/notifications");
};

/**
 * Create a new notification
 */
export const createNotification = async (payload) => {
  return await api.post("/api/notifications", payload);
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (id) => {
  return await api.patch(`/api/notifications/${id}/read`);
};

/**
 * Delete a single notification
 */
export const deleteNotification = async (id) => {
  return await api.delete(`/api/notifications/${id}`);
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async () => {
  return await api.delete("/api/notifications");
};
