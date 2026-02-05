import React, { useState, useMemo, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { createNotification } from "../../features/notificationSlice";

import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../../api/orderBooking.api.js";

import { getItems } from "../../api/Item.api.js";
import { getLocations } from "../../api/Locations.api.js";

export default function OrderBooking() {
  const dispatch = useDispatch();

  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    tranditionId: "",
    customer: "",
    date: "",
    itemName: "",
    location: "",
    finalRate: "",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  // FETCH DATA
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [orderRes, itemRes, locationRes] = await Promise.all([
          getOrders(),
          getItems(),
          getLocations(),
        ]);

        if (orderRes.data?.success) setOrders(orderRes.data.data);
        if (itemRes.data?.success) setItems(itemRes.data.data);
        if (locationRes.data?.success) setLocations(locationRes.data.data);
      } catch (err) {
        console.error("Fetch error", err);
      }
    };

    fetchAll();
  }, []);

  // PAGINATION
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return orders.slice(start, start + rowsPerPage);
  }, [orders, page]);

  const pageCount = Math.ceil(orders.length / rowsPerPage) || 1;

  // VALIDATION
  const validateForm = () => {
    const newErrors = {};
    if (!form.tranditionId) newErrors.tranditionId = "Required";
    if (!form.customer) newErrors.customer = "Required";
    if (!form.date) newErrors.date = "Required";
    if (!form.itemName) newErrors.itemName = "Required";
    if (!form.location) newErrors.location = "Required";
    if (!form.finalRate) newErrors.finalRate = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        const res = await updateOrder(editId, form);
        if (res.data.success) {
          setOrders((prev) =>
            prev.map((o) => (o.id === editId ? res.data.data : o))
          );
        }
      } else {
        const res = await createOrder(form);
        if (res.data.success) {
          setOrders((prev) => [...prev, res.data.data]);
          dispatch(
            dispatch(
              createNotification({
                title: "New Order Created",
                message: `Order ${form.tranditionId} created successfully`,
                type: "ORDER",
              })
            )

          );
        }
      }

      setOpen(false);
      setEditId(null);
      setForm({
        tranditionId: "",
        customer: "",
        date: "",
        itemName: "",
        location: "",
        finalRate: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (order) => {
    setForm(order);
    setEditId(order.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteOrder(id);
      if (res.data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5">Order Booking</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Order
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>Transition ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((o, i) => (
              <TableRow key={o.id}>
                <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                <TableCell>{o.tranditionId}</TableCell>
                <TableCell>{o.customer}</TableCell>
                <TableCell>{o.itemName || "-"}</TableCell>
                <TableCell>{o.location}</TableCell>
                <TableCell>{o.finalRate}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(o)}>
                    <ModeEdit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(o.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
        count={pageCount}
        page={page}
        onChange={(e, v) => setPage(v)}
      />

      {/* DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Order" : "Add Order"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Transition ID" name="tranditionId" value={form.tranditionId} onChange={handleChange} />
          <TextField fullWidth margin="dense" label="Customer" name="customer" value={form.customer} onChange={handleChange} />
          <TextField fullWidth margin="dense" type="date" name="date" value={form.date} onChange={handleChange} />

          {/* ITEM SELECTOR */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Item</InputLabel>
            <Select name="itemName" value={form.itemName} onChange={handleChange}>
              {items.map((item) => (
                <MenuItem key={item.id} value={item.itemName}>
                  {item.itemName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* LOCATION SELECTOR */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Location</InputLabel>
            <Select name="location" value={form.location} onChange={handleChange}>
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.locationName}>
                  {loc.locationName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField fullWidth margin="dense" label="Final Rate" name="finalRate" value={form.finalRate} onChange={handleChange} />
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

