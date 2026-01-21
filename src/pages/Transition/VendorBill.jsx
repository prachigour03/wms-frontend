import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Pagination, Tooltip,
  Snackbar, Alert,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";

import {
  getVendorBills,
  createVendorBill,
  updateVendorBill,
  deleteVendorBill
} from "../../api/VendorBill.api";
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';

export default function VendorBills() {
    const dispatch = useDispatch();
  const [data, setData] = useState(
    () => {
      const saved = localStorage.getItem("vendorBills");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [form, setForm] = useState({
    billNo: "",
    billDate: "",
    vendorName: "",
    invoiceNo: "",
    invoiceDate: "",
    amount: "",
    gstAmount: "",
    totalAmount: "",
    status: "Pending",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  // -------------------- FETCH DATA --------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getVendorBills();
        if (response.data.success) setData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch vendor bills:", error.response?.data || error.message);
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
    if (!form.billNo) temp.billNo = "Bill No required";
    if (!form.billDate) temp.billDate = "Bill date required";
    if (!form.vendorName) temp.vendorName = "Vendor name required";
    if (!form.invoiceNo) temp.invoiceNo = "Invoice No required";
    if (!form.invoiceDate) temp.invoiceDate = "Invoice date required";
    if (!form.amount || isNaN(form.amount)) temp.amount = "Valid amount required";
    if (!form.gstAmount || isNaN(form.gstAmount)) temp.gstAmount = "Valid GST amount required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // -------------------- AUTO CALCULATE TOTAL --------------------
  const calculateTotal = (amount, gst) => (Number(amount) || 0) + (Number(gst) || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };

    if (name === "amount" || name === "gstAmount") {
      updatedForm.totalAmount = calculateTotal(
        name === "amount" ? value : form.amount,
        name === "gstAmount" ? value : form.gstAmount
      );
    }

    setForm(updatedForm);
    setErrors({ ...errors, [name]: "" });
  };

  // -------------------- SAVE / UPDATE --------------------
  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editId) {
        const response = await updateVendorBill(editId, form);
        if (response.data.success) {
          setData(prev => prev.map(d => (d.id === editId ? response.data.data : d)));
        }
      } else {
        const response = await createVendorBill(form);
        if (response.data.success) {
          setData(prev => [...prev, response.data.data]);
          dispatch(incrementNotification({
            severity: "success",
            message: "Vendor Bill created successfully",
            path: 'transition/VendorBill',
            time: new Date().toISOString(),
            }));  
            setSnack({ open: true, severity: 'success', message: 'Vendor Bill added' });
        }
      }

      setOpen(false);
      setEditId(null);
      setForm({
        billNo: "",
        billDate: "",
        vendorName: "",
        invoiceNo: "",
        invoiceDate: "",
        amount: "",
        gstAmount: "",
        totalAmount: "",
        status: "Pending",
      });
    } catch (error) {
      console.error("Failed to save vendor bill:", error.response?.data || error.message);
    }
  };

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteVendorBill(id);
      if (response.data.success) {
        setData(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete vendor bill:", error.response?.data || error.message);
    }
  };

  // -------------------- RENDER --------------------
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Vendor Bills</Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>Add Vendor Bill</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Bill No</TableCell>
              <TableCell>Bill Date</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Invoice No</TableCell>
              <TableCell>Invoice Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>GST</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row.billNo}</TableCell>
                <TableCell>{row.billDate}</TableCell>
                <TableCell>{row.vendorName}</TableCell>
                <TableCell>{row.invoiceNo}</TableCell>
                <TableCell>{row.invoiceDate}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.gstAmount}</TableCell>
                <TableCell>{row.totalAmount}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>
                  <Tooltip title="Edit"><IconButton onClick={() => handleEdit(row)}><ModeEdit /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(row.id)}><Delete /></IconButton></Tooltip>
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
        <DialogTitle>{editId ? "Edit Vendor Bill" : "Add Vendor Bill"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Bill No" name="billNo" value={form.billNo} onChange={handleChange} error={!!errors.billNo} helperText={errors.billNo} />
            <TextField type="date" label="Bill Date" name="billDate" value={form.billDate} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.billDate} helperText={errors.billDate} />
            <TextField label="Vendor Name" name="vendorName" value={form.vendorName} onChange={handleChange} error={!!errors.vendorName} helperText={errors.vendorName} />
            <TextField label="Invoice No" name="invoiceNo" value={form.invoiceNo} onChange={handleChange} error={!!errors.invoiceNo} helperText={errors.invoiceNo} />
            <TextField type="date" label="Invoice Date" name="invoiceDate" value={form.invoiceDate} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.invoiceDate} helperText={errors.invoiceDate} />
            <TextField label="Amount" name="amount" value={form.amount} onChange={handleChange} error={!!errors.amount} helperText={errors.amount} />
            <TextField label="GST Amount" name="gstAmount" value={form.gstAmount} onChange={handleChange} error={!!errors.gstAmount} helperText={errors.gstAmount} />
            <TextField label="Total Amount" value={form.totalAmount} InputProps={{ readOnly: true }} />
            <TextField select label="Status" name="status" value={form.status} onChange={handleChange}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
            </TextField>
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
