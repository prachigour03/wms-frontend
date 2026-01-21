import { createSlice } from "@reduxjs/toolkit";

const employeeSlice = createSlice({
  name: "employees",
  initialState: { list: [], selected: null },
  reducers: {
    setEmployees(state, action) {
      state.list = action.payload;
    },
    setSelectedEmployee(state, action) {
      state.selected = action.payload;
    },
    clearEmployees(state) {
      state.list = [];
      state.selected = null;
    },
  },
});

export const { setEmployees, setSelectedEmployee, clearEmployees } = employeeSlice.actions;
export default employeeSlice.reducer;