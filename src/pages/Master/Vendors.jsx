import React, { useState, useMemo, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { createNotification } from '../../features/notificationSlice';

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
  Pagination,
  Tooltip,
  Snackbar,
  Alert,
  Switch,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
} from "@mui/material";
import { Edit, Delete, ExpandMore } from "@mui/icons-material";
import {
  createVendor,
  getVendors,
  updateVendor,
  deleteVendor,  
 } from "../../api/vendor.api.js";

const DEFAULT_FORM = {
  vendorCode: "",
  vendorName: "",
  contactPerson: "",
  phone: "",
  email: "",
  gstNumber: "",
  address: "",
  status: "Active",
};

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

  const [form, setForm] = useState(() => ({ ...DEFAULT_FORM }));

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

  const handleOpenCreate = () => {
    setEditId(null);
    setForm({ ...DEFAULT_FORM });
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setErrors({});
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
              dispatch(createNotification({
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
          setForm({ ...DEFAULT_FORM });
        } catch (error) {
          console.error("Failed to save Vendor", error.response?.data || error.message);
        } 
      };

  const handleEdit = (row) => {
    setForm({ ...DEFAULT_FORM, ...row });
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
  const isActive = form.status === "Active";

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" mb={2}>
        Vendors
      </Typography>

      <Button variant="contained" onClick={handleOpenCreate} sx={{ mb: 2 }}>
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
                <TableCell>
                  <Chip
                    size="small"
                    label={row.status || "Inactive"}
                    color={row.status === "Active" ? "success" : "default"}
                    variant={row.status === "Active" ? "filled" : "outlined"}
                  />
                </TableCell>
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
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          {editId ? "Edit Vendor" : "Add Vendor"}
        </DialogTitle>

        <DialogContent dividers>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Vendor Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Fields marked * are required
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Chip
                size="small"
                label={editId ? "Editing" : "New"}
                color={editId ? "default" : "info"}
                variant={editId ? "outlined" : "filled"}
              />
              <Chip
                size="small"
                label={isActive ? "Active" : "Inactive"}
                color={isActive ? "success" : "default"}
                variant={isActive ? "filled" : "outlined"}
              />
            </Box>
          </Box>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={600}>Basic Info</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Vendor Code"
                    name="vendorCode"
                    value={form.vendorCode}
                    onChange={handleChange}
                    error={!!errors.vendorCode}
                    helperText={errors.vendorCode}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Vendor Name"
                    name="vendorName"
                    value={form.vendorName}
                    onChange={handleChange}
                    error={!!errors.vendorName}
                    helperText={errors.vendorName}
                    required
                    fullWidth
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={600}>Primary Contact</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Contact Person"
                    name="contactPerson"
                    value={form.contactPerson}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                    fullWidth
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={600}>Compliance</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="GST Number"
                    name="gstNumber"
                    value={form.gstNumber}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={600}>Address & Status</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isActive}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            status: e.target.checked ? "Active" : "Inactive",
                          })
                        }
                      />
                    }
                    label={isActive ? "Active" : "Inactive"}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
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

