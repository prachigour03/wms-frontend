import React, { useState, useEffect, useMemo } from "react";
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
  Switch,
  Tooltip,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
} from "@mui/material";
import { Delete, ModeEdit, ExpandMore } from "@mui/icons-material";

import {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../api/Employees.api";

const ROWS_PER_PAGE = 5;
const DEFAULT_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  designation: "",
  status: "Active",
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState(() => ({ ...DEFAULT_FORM }));

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  /* ================= FETCH EMPLOYEES ================= */
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await getAllEmployees();
      setEmployees(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= PAGINATION ================= */
  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return employees.slice(start, start + ROWS_PER_PAGE);
  }, [employees, page]);

  const pageCount = Math.ceil(employees.length / ROWS_PER_PAGE) || 1;

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName) newErrors.firstName = "Required";
    if (!form.lastName) newErrors.lastName = "Required";
    if (!form.email) newErrors.email = "Required";
    if (!form.phone) newErrors.phone = "Required";
    if (!editId && !form.password) newErrors.password = "Required";
    if (!form.designation) newErrors.designation = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editId) {
        await updateEmployee(editId, form);
        setSnack({ open: true, severity: "success", message: "Employee updated" });
      } else {
        await createEmployee(form);
        setSnack({ open: true, severity: "success", message: "Employee created" });
      }

      setOpen(false);
      setEditId(null);
      setForm({ ...DEFAULT_FORM });

      fetchEmployees();
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message: err?.response?.data?.message || "Operation failed",
      });
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (emp) => {
    setForm({
      ...DEFAULT_FORM,
      ...emp,
      password: "",
    });
    setEditId(emp.id);
    setOpen(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      setSnack({ open: true, severity: "info", message: "Employee deleted" });
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UI ================= */
  const isActive = form.status === "Active";

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5">Employee Management</Typography>
        <Button variant="contained" onClick={handleOpenCreate}>
          Add Employee
        </Button>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedEmployees.map((emp, i) => (
              <TableRow key={emp.id}>
                <TableCell>{(page - 1) * ROWS_PER_PAGE + i + 1}</TableCell>
                <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                <TableCell>{emp.email}</TableCell>
              <TableCell>{emp.phone}</TableCell>
              <TableCell>{emp.designation}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={emp.status || "Inactive"}
                  color={emp.status === "Active" ? "success" : "default"}
                  variant={emp.status === "Active" ? "filled" : "outlined"}
                />
              </TableCell>
              <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(emp)}>
                      <ModeEdit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(emp.id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <Pagination
        sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
        count={pageCount}
        page={page}
        onChange={(e, v) => setPage(v)}
      />

      {/* DIALOG */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editId ? "Edit Employee" : "Add Employee"}</DialogTitle>
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
                Employee Details
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
              <Typography fontWeight={600}>Profile</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="First Name"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    error={Boolean(errors.firstName)}
                    helperText={errors.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Last Name"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    error={Boolean(errors.lastName)}
                    helperText={errors.lastName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Designation"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    error={Boolean(errors.designation)}
                    helperText={errors.designation}
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

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={600}>Contact</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    error={Boolean(errors.phone)}
                    helperText={errors.phone}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={600}>Security</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required={!editId}
                    type="password"
                    label="Password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    error={Boolean(errors.password)}
                    helperText={
                      errors.password ||
                      (editId ? "Leave blank to keep current password." : "")
                    }
                  />
                </Grid>
              </Grid>
              <Typography variant="caption" color="text.secondary">
                {editId
                  ? "Updating the password is optional."
                  : "Password is required for new employees."}
              </Typography>
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

      {/* SNACKBAR */}
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
