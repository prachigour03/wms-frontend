// src/hooks/useCrudNotification.js
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  fetchNotifications,
  markAsReads,
  removeNotification,
  clearNotifications,
} from "../features/notificationSlice";

export const useCrudNotification = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return {
    list,
    loading,
    markRead: (id) => dispatch(markAsReads(id)),
    remove: (id) => dispatch(removeNotification(id)),
    clearAll: () => dispatch(clearNotifications()),
  };
};
