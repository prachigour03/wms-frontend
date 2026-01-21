import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Pagination, Tooltip,
  Snackbar, Alert,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";

import {
  getInwardChallans,
  createInwardChallan,
  updateInwardChallan,
  deleteInwardChallan,
} from "../../api/InwardChallan.api";
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';

export default function InwardChallan() {

  const dispatch = useDispatch();
  const [data, setData] = useState(
    () => {
      const saved = localStorage.getItem("inwardChallans");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [form, setForm] = useState({
    challanNo: "",
    vendor: "",
    challanDate: "",
    itemName: "",
    quantity: "",
    warehouse: "",
    status: "Pending",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });  


  // ---------------------
  // FETCH DATA
  // ---------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getInwardChallans();
        if (response.data.success) setData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch inward challans:", error.response?.data || error.message);
      }
    };
    fetchData();
  }, []);

  // ---------------------
  // PAGINATION
  // ---------------------
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page]);

  const pageCount = Math.ceil(data.length / rowsPerPage) || 1;

  // ---------------------
  // VALIDATION
  // ---------------------
  const validate = () => {
    let temp = {};
    if (!form.challanNo) temp.challanNo = "Challan No required";
    if (!form.vendor) temp.vendor = "Vendor required";
    if (!form.challanDate) temp.challanDate = "Date required";
    if (!form.itemName) temp.itemName = "Item required";
    if (!form.quantity || isNaN(form.quantity)) temp.quantity = "Valid quantity required";
    if (!form.warehouse) temp.warehouse = "Warehouse required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // ---------------------
  // SAVE / UPDATE
  // ---------------------
  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editId) {
        const response = await updateInwardChallan(editId, form);
        if (response.data.success) {
          setData(prev => prev.map(d => (d.id === editId ? response.data.data : d)));
        }
      } else {
        const response = await createInwardChallan(form);
        if (response.data.success) {
          setData(prev => [...prev, response.data.data]);
          dispatch(incrementNotification({
            severity: "success",
            message: "Inward Challan created successfully",
            path: 'transition/InwardChallan',
            time: new Date().toISOString(),
            }));  
            setSnack({ open: true, severity: 'success', message: 'Inward Challan added' });
        }
      }
      setOpen(false);
      setEditId(null);
      setForm({
        challanNo: "",
        vendor: "",
        challanDate: "",
        itemName: "",
        quantity: "",
        warehouse: "",
        status: "Pending",
      });
    } catch (error) {
      console.error("Failed to save inward challan:", error.response?.data || error.message);
    }
  };

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteInwardChallan(id);
      if (response.data.success) {
        setData(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete inward challan:", error.response?.data || error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Inward Challan</Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>Add Inward Challan</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Challan No</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Warehouse</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row.challanNo}</TableCell>
                <TableCell>{row.vendor}</TableCell>
                <TableCell>{row.challanDate}</TableCell>
                <TableCell>{row.itemName}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.warehouse}</TableCell>
                <TableCell>{row.status}</TableCell>
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
        <DialogTitle>{editId ? "Edit Inward Challan" : "Add Inward Challan"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Challan No" name="challanNo" value={form.challanNo} onChange={handleChange} error={!!errors.challanNo} helperText={errors.challanNo} />
            <TextField label="Vendor Name" name="vendor" value={form.vendor} onChange={handleChange} error={!!errors.vendor} helperText={errors.vendor} />
            <TextField type="date" label="Challan Date" name="challanDate" value={form.challanDate} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.challanDate} helperText={errors.challanDate} />
            <TextField label="Item Name" name="itemName" value={form.itemName} onChange={handleChange} error={!!errors.itemName} helperText={errors.itemName} />
            <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleChange} error={!!errors.quantity} helperText={errors.quantity} />
            <TextField label="Warehouse" name="warehouse" value={form.warehouse} onChange={handleChange} error={!!errors.warehouse} helperText={errors.warehouse} />
            <TextField select label="Status" name="status" value={form.status} onChange={handleChange}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Received">Received</MenuItem>
            </TextField>
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
