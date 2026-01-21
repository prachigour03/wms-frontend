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
  MenuItem,
  Pagination,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  createVendor,
  getVendors,
  updateVendor,
  deleteVendor,  
 } from "../../api/Vendor.api";

export default function Vendors() {
  const dispatch = useDispatch();

  const [vendors, setVendors] = useState(() => {
    const saved = localStorage.getItem("accountTypes");
    return saved ? JSON.parse(saved) : [];
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [form, setForm] = useState({
    vendorCode: "",
    vendorName: "",
    contactPerson: "",
    phone: "",
    email: "",
    gstNumber: "",
    address: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
      open: false,
      severity: "success",
      message: "",
    });

  useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await getVendors();
            if (response.data.success) setVendors(response.data.data);
          } catch (error) {
            console.error("Failed to fetch Vendors:", error.response?.data || error.message);
          }
        };
        fetchData();
      }, []);

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    let temp = {};
    if (!form.vendorCode) temp.vendorCode = "Vendor Code is required";
    if (!form.vendorName) temp.vendorName = "Vendor Name is required";
    if (!form.phone) temp.phone = "Phone number is required";
    if (!form.email) temp.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email))
      temp.email = "Enter a valid email";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSave = async () => {
        if (!validate()) return;
    
        try {
          if (editId) {
            const response = await updateVendor(editId, form);
            if (response.data.success) {
              setVendors((prev) =>
                prev.map((v) => (v.id === editId ? response.data.data : v ))
              );
            }
          } else {
            const response = await createVendor(form);
            if (response.data.success) {
              setVendors((prev) => [...prev, response.data.data]);
              dispatch(incrementNotification({
                severity: "success",
                message: "Vendor created successfully",
                path: 'master/Vendors',
                time: new Date().toISOString(),
                }));
                setSnack({ open: true, severity: 'success', message: 'Vendor added' });
            }
          }
    
          setOpen(false);
          setEditId(null);
    setForm({
      vendorCode: "",
      vendorName: "",
      contactPerson: "",
      phone: "",
      email: "",
      gstNumber: "",
      address: "",
      status: "Active",
    });
        } catch (error) {
          console.error("Failed to save Vendor", error.response?.data || error.message);
        } 
      };

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
        try {
          const response = await deleteVendor(id);
          if (response.data.success) {
            setVendors((prev) => prev.filter((v) => v.id !== id));
          } 
        } catch (error) {
          console.error("Failed to delete Vendor", error.response?.data || error.message);
        }
      };
  /* ---------------- PAGINATION ---------------- */
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return vendors.slice(start, start + rowsPerPage);
  }, [vendors, page]);

  const pageCount = Math.ceil(vendors.length / rowsPerPage) || 1;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" mb={2}>
        Vendors
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Add Vendor
      </Button>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Vendor Code</TableCell>
              <TableCell>Vendor Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>GST No.</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>{row.vendorCode}</TableCell>
                <TableCell>{row.vendorName}</TableCell>
                <TableCell>{row.contactPerson}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.gstNumber}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(row)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(row.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {vendors.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No vendors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Pagination
          count={pageCount}
          page={page}
          onChange={(e, v) => setPage(v)}
        />
      </Box>

      {/* ADD / EDIT MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {editId ? "Edit Vendor" : "Add Vendor"}
        </DialogTitle>

        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Vendor Code"
              name="vendorCode"
              value={form.vendorCode}
              onChange={handleChange}
              error={!!errors.vendorCode}
              helperText={errors.vendorCode}
              fullWidth
            />

            <TextField
              label="Vendor Name"
              name="vendorName"
              value={form.vendorName}
              onChange={handleChange}
              error={!!errors.vendorName}
              helperText={errors.vendorName}
              fullWidth
            />

            <TextField
              label="Contact Person"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              fullWidth
            />

            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
            />

            <TextField
              label="GST Number"
              name="gstNumber"
              value={form.gstNumber}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              multiline
              rows={2}
              fullWidth
            />

            <TextField
              select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
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
              onClose={() => setSnack({ ...snack, open: false })}
            >
              <Alert severity={snack.severity}>{snack.message}</Alert>
            </Snackbar>
    </Box>
  );
}
