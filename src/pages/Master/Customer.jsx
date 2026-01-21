import React, { useState, useMemo, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';

import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Pagination,
  Tooltip,
  Switch,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import { 
  createCustomer,
  getCustomers, 
  updateCustomer, 
  deleteCustomer,
} 
from "../../api/Customer.api";


export default function Customer() {
  const dispatch = useDispatch();

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("accountTypes");
    return saved ? JSON.parse(saved) : [];
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    customerName: "",
    customerCode: "",
    mobile: "",
    email: "",
    address: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  // -------------------- FETCH DATA --------------------
    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await getCustomers();
            if (response.data.success) setData(response.data.data);
          } catch (error) {
            console.error("Failed to fetch Account Types:", error.response?.data || error.message);
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
        
    
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const temp = {};

    if (!form.customerName) temp.customerName = "Customer Name is required";
    if (!form.customerCode) temp.customerCode = "Customer Code is required";

    if (!form.mobile) {
      temp.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(form.mobile)) {
      temp.mobile = "Mobile number must be 10 digits";
    }

    if (!form.email) {
      temp.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      temp.email = "Invalid email format";
    }

    if (!form.status || !["Active", "Inactive"].includes(form.status)) {
      temp.status = "Status must be Active or Inactive";
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };
// -------------------------
    // SAVE / UPDATE
    // -------------------------
    const handleSave = async () => {
      if (!validateForm()) return;
  
      try {
        if (editId) {
          const response = await updateCustomer(editId, form);
          if (response.data.success) {
            setData((prev) =>
              prev.map((d) => (d.id === editId ? response.data.data : d))
            );
          }
        } else {
          const response = await createCustomer(form);
          if (response.data.success) {
            setData((prev) => [...prev, response.data.data]);
            dispatch(incrementNotification({
              severity: "success",
              message: "Customer created successfully",
              path: 'master/Customer',
              time: new Date().toISOString(),
              }));
              setSnack({ open: true, severity: 'success', message: 'Customer added' });
          }
        }
  
        setOpen(false);
    setEditId(null);
    setForm({
      customerName: "",
      customerCode: "",
      mobile: "",
      email: "",
      address: "",
      status: "Active",
    });
    setErrors({});
    } catch (error) {
        console.error("Failed to save Account", error.response?.data || error.message);
      }
  };

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setErrors({});
    setOpen(true);
  };

  const handleDelete = async (id) => {
        try {
          const response = await deleteCustomer(id);
          if (response.data.success) {
            setData((prev) => prev.filter((d) => d.id !== id));
          }
        } catch (error) {
          console.error("Failed to delete Account", error.response?.data || error.message);
        }
      };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Customer Master</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Customer
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Customer Code</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
           {paginatedData.map((row, i) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                <TableCell>{row.customerName}</TableCell>
                <TableCell>{row.customerCode}</TableCell>
                <TableCell>{row.mobile}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>
  {new Date(row.created_at).toLocaleDateString()}
</TableCell>

                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(row)}>
                      <ModeEdit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(row.id)}>
                      <Delete />
                    </IconButton>
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

      {/* ADD / EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Customer" : "Add Customer"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Customer Name"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              error={!!errors.customerName}
              helperText={errors.customerName}
            />
            <TextField
              label="Customer Code"
              name="customerCode"
              value={form.customerCode}
              onChange={handleChange}
              error={!!errors.customerCode}
              helperText={errors.customerCode}
            />
            <TextField
              label="Mobile"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              error={!!errors.mobile}
              helperText={errors.mobile}
            />
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              multiline
              rows={2}
            />
            <Switch
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              error={!!errors.status}
              helperText={errors.status}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({
  open: true,
  severity: "success",
  message: editId ? "Customer updated" : "Customer created",
})
}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
