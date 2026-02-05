import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import employeeReducer from "../features/employeeSlice";
import notificationReducer from "../features/notificationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    notifications: notificationReducer,
  },
});


export default store;