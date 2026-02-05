import {
  getNotifications,
  markAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../api/notification.api";

export const fetchNotifications = async () => {
  const res = await getNotifications();
  return res.data.data;
};

export const readNotification = async (id) => {
  await markAsRead(id);
  return id;
};

export const removeNotificationApi = async (id) => {
  await deleteNotification(id);
  return id;
};

export const clearNotificationsApi = async () => {
  await clearAllNotifications();
};
