import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  count: 0,
  list: localStorage.getItem('notifications') ? JSON.parse(localStorage.getItem('notifications')).list : [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    increment(state, action) {
      state.count += 1;
      if (action.payload) {
        state.list.push({
          ...action.payload,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    },

    markAsRead(state, action) {
      const notification = state.list.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.count -= 1;
      }
    },

    removeNotification(state, action) {
      const index = state.list.findIndex(
        (n) => n.id === action.payload
      );
      if (index !== 1) {
        if (!state.list[index].read) {
          state.count -= 1;
        }
        state.list.splice(index, 1);
      }
    },

    clear(state) {
      state.count = 0;
      state.list = [];
    },

    setCount(state, action) {
      state.count = action.payload;
    },
  },
});

export const {
  increment,
  markAsRead,
  removeNotification,
  clear,
  setCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
