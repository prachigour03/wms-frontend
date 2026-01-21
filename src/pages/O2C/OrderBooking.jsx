import React, { useState, useMemo, useEffect} from "react";

import {
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  Paper,
  TableHead, 
  TableRow, 
  IconButton, 
  Typography, 
  Button,
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Snackbar, 
  Alert, 
  Pagination,
  Tooltip,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { ModeEdit } from "@mui/icons-material";
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';
import { 
  getOrders, 
  createOrder, 
  updateOrder, 
  deleteOrder 
} from "../../api/orderBooking.api";

export default function OrderBooking() {
    const dispatch = useDispatch();

  const [orders, setOrders] = useState(
    () => {
      const saved = localStorage.getItem("orders");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    tranditionId: "",
    customer: "",
    date: "",
    location: "",
    finalRate: "",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, severity: "info", message: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getOrders();
        if (response.data && response.data.success) {
          setOrders(response.data.data);
        } else if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          console.error("Unexpected API response:", response.data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error.response?.data || error.message);
      }
    };
  
    fetchData();
  }, []);

  // Save orders to localStorage whenever orders state changes
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);


  // PAGINATION WITH SEARCH & SORT
    const paginatedOrders = useMemo(() => {
      const start = (page - 1) * rowsPerPage;
      return orders.slice(start, start + rowsPerPage);
    }, [orders, page]);
  
    const pageCount = Math.ceil(orders.length / rowsPerPage) || 1;


  //Validation can be added here
  const validateForm = () => {
    const newErrors = {};
    if (!form.tranditionId) newErrors.tranditionId = "Transition ID is required";
    if (!form.customer) newErrors.customer = "Customer is required";
    if (!form.date) newErrors.date = "Date is required";
    if (!form.location) newErrors.location = "Location is required";
    if (!form.finalRate) newErrors.finalRate = "Final Rate is required";

    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // SAVE
  const handleSave = async () => {
      if (!validateForm()) return;
  
      try {
        if (editId) {
          const response = await updateOrder(editId, form);
          if (response.data.success) {
            setOrders((prev) =>
              prev.map((d) => (d.id === editId ? response.data.data : d))
            );
          }
        } else {
          const response = await createOrder(form);
          if (response.data.success) {
            setOrders((prev) => [...prev, response.data.data]);
            dispatch(incrementNotification({
              severity: "success",
              message: "Order created successfully",
              path: 'transition/OrderBooking',
              time: new Date().toISOString(),
              }));  
              setSnack({ open: true, severity: 'success', message: 'Order added' });
          }
        }
  
        setOpen(false);
        setEditId(null);
        setForm({
          tranditionId: "",
          customer: "",
          date: "",
          location: "",
          finalRate: "",
        });
      } catch (error) {
        console.error("Failed to save vendor issue:", error.response?.data || error.message);
      }
    };

  // EDIT
  const handleEdit = (order) => {
    setForm(order);
    setEditId(order.id);
    setOpen(true);
  };

  // DELETE
  const handleDelete = async (id) => {
      try {
        const response = await deleteOrder(id);
        if (response.data.success) {
          setOrders((prev) => prev.filter((d) => d.id !== id));
        }
      } catch (error) {
        console.error("Failed to delete order:", error.response?.data || error.message);
      }
    };


  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Order Booking</Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>Add Order</Button>
      </Box>

      <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>S.no</TableCell>
            <TableCell>Transition ID</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Final Rate</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedOrders.map((order, i) => (
            <TableRow key={order.id}>
              <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
              <TableCell>{order.tranditionId}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.location}</TableCell>
              <TableCell>{order.finalRate}</TableCell>
              <TableCell>
                <Tooltip title="Edit">
                  <IconButton onClick={() => handleEdit(order)}><ModeEdit /></IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton color="error" onClick={() => handleDelete(order.id)}><Delete /></IconButton>
                </Tooltip>
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "flex-end", py: 2 }}>
        <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Order" : "Add Order"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField fullWidth margin="dense" label="Transition ID" name="tranditionId" value={form.tranditionId} onChange={handleChange} helperText={errors.tranditionId} />
          <TextField fullWidth margin="dense" label="Customer" name="customer" value={form.customer} onChange={handleChange} error={!!errors.customer} helperText={errors.customer} />
          <TextField fullWidth margin="dense" label="Date" name="date" value={form.date} onChange={handleChange} error={!!errors.date} helperText={errors.date} />
          <TextField fullWidth margin="dense" label="Location" name="location" value={form.location} onChange={handleChange} error={!!errors.location} helperText={errors.location} />
          <TextField fullWidth margin="dense" label="Final Rate" name="finalRate" value={form.finalRate} onChange={handleChange} error={!!errors.finalRate} helperText={errors.finalRate} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}