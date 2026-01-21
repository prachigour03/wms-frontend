import React, { useState, useEffect, useMemo } from "react";
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

export default function ServicesRateMaster() {
  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem("servicesRateMaster");
    return saved ? JSON.parse(saved) : [];
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [form, setForm] = useState({
    serviceName: "",
    serviceCategory: "",
    rate: "",
    uom: "",
    taxPercent: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    localStorage.setItem("servicesRateMaster", JSON.stringify(rates));
  }, [rates]);

  /* Pagination */
  const { paginatedData, pageCount } = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return {
      paginatedData: rates.slice(start, start + rowsPerPage),
      pageCount: Math.max(1, Math.ceil(rates.length / rowsPerPage)),
    };
  }, [rates, page]);

  /* Handle change */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  /* Validation */
  const validateForm = () => {
    const temp = {};
    if (!form.serviceName) temp.serviceName = "Service name is required";
    if (!form.serviceCategory)
      temp.serviceCategory = "Service category is required";
    if (!form.rate || Number(form.rate) <= 0)
      temp.rate = "Valid rate required";
    if (!form.uom) temp.uom = "UOM is required";
    if (!form.taxPercent || form.taxPercent < 0)
      temp.taxPercent = "Valid tax % required";
    if (!["Active", "Inactive"].includes(form.status))
      temp.status = "Invalid status";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  /* Add */
  const handleAdd = () => {
    setEditId(null);
    setForm({
      serviceName: "",
      serviceCategory: "",
      rate: "",
      uom: "",
      taxPercent: "",
      status: "Active",
    });
    setErrors({});
    setOpen(true);
  };

  /* Edit */
  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setErrors({});
    setOpen(true);
  };

  /* Delete */
  const handleDelete = (id) => {
    setRates((prev) => prev.filter((r) => r.id !== id));
    setSnack({
      open: true,
      message: "Service rate deleted",
      severity: "success",
    });
  };

  /* Save */
  const handleSave = () => {
    if (!validateForm()) return;

    if (editId) {
      setRates((prev) =>
        prev.map((r) => (r.id === editId ? form : r))
      );
      setSnack({
        open: true,
        message: "Service rate updated",
        severity: "success",
      });
    } else {
      setRates((prev) => [
        ...prev,
        {
          ...form,
          id: Date.now().toString(),
          createdDate: new Date().toLocaleDateString(),
        },
      ]);
      setSnack({
        open: true,
        message: "Service rate added",
        severity: "success",
      });
    }
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Services Rate Master
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={handleAdd}>
        Add Service Rate
      </Button>
      </Box> 

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Service Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>UOM</TableCell>
              <TableCell>Tax %</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>{row.serviceName}</TableCell>
                <TableCell>{row.serviceCategory}</TableCell>
                <TableCell>{row.rate}</TableCell>
                <TableCell>{row.uom}</TableCell>
                <TableCell>{row.taxPercent}%</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.createdDate}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(row)}>
                      <ModeEdit />
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
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={(e, v) => setPage(v)}
        />
      </Box>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {editId ? "Edit Service Rate" : "Add Service Rate"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Service Name"
              name="serviceName"
              value={form.serviceName}
              onChange={handleChange}
              error={!!errors.serviceName}
              helperText={errors.serviceName}
            />
            <TextField
              label="Service Category"
              name="serviceCategory"
              value={form.serviceCategory}
              onChange={handleChange}
              error={!!errors.serviceCategory}
              helperText={errors.serviceCategory}
            />
            <TextField
              label="Rate"
              name="rate"
              type="number"
              value={form.rate}
              onChange={handleChange}
              error={!!errors.rate}
              helperText={errors.rate}
            />
            <TextField
              label="UOM"
              name="uom"
              value={form.uom}
              onChange={handleChange}
              error={!!errors.uom}
              helperText={errors.uom}
            />
            <TextField
              label="Tax %"
              name="taxPercent"
              type="number"
              value={form.taxPercent}
              onChange={handleChange}
              error={!!errors.taxPercent}
              helperText={errors.taxPercent}
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
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
