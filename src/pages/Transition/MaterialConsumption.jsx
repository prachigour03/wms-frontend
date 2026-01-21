import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Pagination, Tooltip, Snackbar, Alert,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";

import {
  getMaterialConsumptions,
  createMaterialConsumption,
  updateMaterialConsumption,
  deleteMaterialConsumption
} from "../../api/MaterialConsumption.api";
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';

export default function MaterialConsumption() {
    const dispatch = useDispatch();
  const [data, setData] = useState(
    () => {
      const saved = localStorage.getItem("materialConsumptions");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [form, setForm] = useState({
    consumptionNo: "",
    date: "",
    itemName: "",
    quantity: "",
    department: "",
    warehouse: "",
    remarks: "",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  // --------------------- FETCH DATA ---------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMaterialConsumptions();
        if (response.data.success) setData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch material consumptions:", error.response?.data || error.message);
      }
    };
    fetchData();
  }, []);

  // --------------------- PAGINATION ---------------------
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page]);

  const pageCount = Math.ceil(data.length / rowsPerPage) || 1;

  // --------------------- VALIDATION ---------------------
  const validate = () => {
    let temp = {};
    if (!form.consumptionNo) temp.consumptionNo = "Consumption No required";
    if (!form.date) temp.date = "Date required";
    if (!form.itemName) temp.itemName = "Item required";
    if (!form.quantity || isNaN(form.quantity)) temp.quantity = "Valid quantity required";
    if (!form.department) temp.department = "Department required";
    if (!form.warehouse) temp.warehouse = "Warehouse required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // --------------------- SAVE / UPDATE ---------------------
  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editId) {
        const response = await updateMaterialConsumption(editId, form);
        if (response.data.success) {
          setData(prev => prev.map(d => (d.id === editId ? response.data.data : d)));
        }
      } else {
        const response = await createMaterialConsumption(form);
        if (response.data.success) {
          setData(prev => [...prev, response.data.data]);
          dispatch(incrementNotification({
            severity: "success",
            message: "Material Consumption created successfully",
            path: 'transition/MaterialConsumption',
            time: new Date().toISOString(),
            }));  
            setSnack({ open: true, severity: 'success', message: 'Material Consumption added' });
        }
      }

      setOpen(false);
      setEditId(null);
      setForm({
        consumptionNo: "",
        date: "",
        itemName: "",
        quantity: "",
        department: "",
        warehouse: "",
        remarks: "",
      });
    } catch (error) {
      console.error("Failed to save material consumption:", error.response?.data || error.message);
    }
  };

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteMaterialConsumption(id);
      if (response.data.success) {
        setData(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete material consumption:", error.response?.data || error.message);
    }
  };

  // --------------------- RENDER ---------------------
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Material Consumption</Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>Add Material Consumption</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Consumption No</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Warehouse</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row.consumptionNo}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.itemName}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.warehouse}</TableCell>
                <TableCell>{row.remarks || "-"}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(row)}><ModeEdit /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(row.id)}><Delete /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Material Consumption" : "Add Material Consumption"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Consumption No" name="consumptionNo" value={form.consumptionNo} onChange={handleChange} error={!!errors.consumptionNo} helperText={errors.consumptionNo} />
            <TextField type="date" label="Date" name="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.date} helperText={errors.date} />
            <TextField label="Item Name" name="itemName" value={form.itemName} onChange={handleChange} error={!!errors.itemName} helperText={errors.itemName} />
            <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleChange} error={!!errors.quantity} helperText={errors.quantity} />
            <TextField label="Department" name="department" value={form.department} onChange={handleChange} error={!!errors.department} helperText={errors.department} />
            <TextField label="Warehouse" name="warehouse" value={form.warehouse} onChange={handleChange} error={!!errors.warehouse} helperText={errors.warehouse} />
            <TextField label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar 
        open={snack.open} 
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
