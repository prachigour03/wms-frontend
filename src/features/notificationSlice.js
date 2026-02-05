// src/features/notificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotifications,
  createNotification as createNotificationApi,
  markAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../api/notification.api";

// ---------------- THUNKS ----------------

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async () => {
    const res = await getNotifications();
    return res.data.data; // assuming API returns { success, data }
  }
);

export const createNotification = createAsyncThunk(
  "notifications/create",
  async (payload) => {
    const safePayload = {
      title: payload?.title || payload?.type || payload?.severity || "System",
      message: payload?.message || "Notification",
    };

    const res = await createNotificationApi(safePayload);
    return res.data?.data || safePayload;
  }
);

export const markAsReads = createAsyncThunk(
  "notifications/markAsRead",
  async (id) => {
    await markAsRead(id);
    return id;
  }
);

export const removeNotification = createAsyncThunk(
  "notifications/remove",
  async (id) => {
    await deleteNotification(id);
    return id;
  }
);

export const clearNotifications = createAsyncThunk(
  "notifications/clear",
  async () => {
    await clearAllNotifications();
  }
);

// ---------------- SLICE ----------------

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      .addCase(markAsReads.fulfilled, (state, action) => {
        const item = state.list.find((n) => n.id === action.payload);
        if (item) item.read = true;
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        state.list = state.list.filter((n) => n.id !== action.payload);
      })
      .addCase(clearNotifications.fulfilled, (state) => {
        state.list = [];
      });
  },
});

export default notificationSlice.reducer;
