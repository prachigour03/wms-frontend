import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Pagination, Tooltip, Snackbar, Alert,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";

import {
  getReturnMaterials,
  createReturnMaterial,
  updateReturnMaterial,
  deleteReturnMaterial
} from "../../api/ReturnMaterial.api";
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';

export default function ReturnMaterial() {
    const dispatch = useDispatch();
  const [data, setData] = useState(
    () => {
      const saved = localStorage.getItem("returnMaterials");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [form, setForm] = useState({
    returnNo: "",
    date: "",
    itemName: "",
    quantity: "",
    returnedFrom: "",
    warehouse: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });
  // -------------------- FETCH DATA --------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getReturnMaterials();
        if (response.data.success) setData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch return materials:", error.response?.data || error.message);
      }
    };
    fetchData();
  }, []);

  // -------------------- PAGINATION --------------------
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page]);

  const pageCount = Math.ceil(data.length / rowsPerPage) || 1;

  // -------------------- VALIDATION --------------------
  const validate = () => {
    let temp = {};
    if (!form.returnNo) temp.returnNo = "Return No required";
    if (!form.date) temp.date = "Date required";
    if (!form.itemName) temp.itemName = "Item required";
    if (!form.quantity || isNaN(form.quantity)) temp.quantity = "Valid quantity required";
    if (!form.returnedFrom) temp.returnedFrom = "Returned from required";
    if (!form.warehouse) temp.warehouse = "Warehouse required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // -------------------- SAVE / UPDATE --------------------
  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editId) {
        const response = await updateReturnMaterial(editId, form);
        if (response.data.success) {
          setData(prev => prev.map(d => (d.id === editId ? response.data.data : d)));
        }
      } else {
        const response = await createReturnMaterial(form);
        if (response.data.success) {
          setData(prev => [...prev, response.data.data]);
          dispatch(incrementNotification({
            severity: "success",
            message: "Return Material created successfully",
            path: 'transition/ReturnMaterial',
            time: new Date().toISOString(),
            }));  
            setSnack({ open: true, severity: 'success', message: 'Return Material added' });
        }
      }

      setOpen(false);
      setEditId(null);
      setForm({
        returnNo: "",
        date: "",
        itemName: "",
        quantity: "",
        returnedFrom: "",
        warehouse: "",
        reason: "",
      });
    } catch (error) {
      console.error("Failed to save return material:", error.response?.data || error.message);
    }
  };

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteReturnMaterial(id);
      if (response.data.success) {
        setData(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete return material:", error.response?.data || error.message);
    }
  };

  // -------------------- RENDER --------------------
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Return Material</Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>Add Return Material</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Return No</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Returned From</TableCell>
              <TableCell>Warehouse</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row.returnNo}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.itemName}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.returnedFrom}</TableCell>
                <TableCell>{row.warehouse}</TableCell>
                <TableCell>{row.reason || "-"}</TableCell>
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
        <DialogTitle>{editId ? "Edit Return Material" : "Add Return Material"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Return No" name="returnNo" value={form.returnNo} onChange={handleChange} error={!!errors.returnNo} helperText={errors.returnNo} />
            <TextField type="date" label="Return Date" name="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.date} helperText={errors.date} />
            <TextField label="Item Name" name="itemName" value={form.itemName} onChange={handleChange} error={!!errors.itemName} helperText={errors.itemName} />
            <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleChange} error={!!errors.quantity} helperText={errors.quantity} />
            <TextField label="Returned From" name="returnedFrom" value={form.returnedFrom} onChange={handleChange} error={!!errors.returnedFrom} helperText={errors.returnedFrom} />
            <TextField label="Warehouse" name="warehouse" value={form.warehouse} onChange={handleChange} error={!!errors.warehouse} helperText={errors.warehouse} />
            <TextField label="Reason" name="reason" value={form.reason} onChange={handleChange} multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
