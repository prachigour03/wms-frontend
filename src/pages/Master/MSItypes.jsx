import React, { useState, useMemo, useEffect } from "react";
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

export default function MSItypes() {
  const [msiTypes, setMsiTypes] = useState(() => {
    const saved = localStorage.getItem("msiTypes");
    return saved ? JSON.parse(saved) : [];
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    msiCode: "",
    msiName: "",
    description: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
    localStorage.setItem("msiTypes", JSON.stringify(msiTypes));
  }, [msiTypes]);

  // Pagination
  const { pageCount, paginatedMsiTypes } = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return {
      pageCount: Math.max(1, Math.ceil(msiTypes.length / rowsPerPage)),
      paginatedMsiTypes: msiTypes.slice(start, start + rowsPerPage),
    };
  }, [msiTypes, page]);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validation
  const validateForm = () => {
    const tempErrors = {};
    if (!form.msiCode) tempErrors.msiCode = "MSI Code is required";
    if (!form.msiName) tempErrors.msiName = "MSI Name is required";
    if (!["Active", "Inactive"].includes(form.status))
      tempErrors.status = "Status must be Active or Inactive";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAdd = () => {
    setEditId(null);
    setForm({
      msiCode: "",
      msiName: "",
      description: "",
      status: "Active",
    });
    setErrors({});
    setOpen(true);
  };

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setErrors({});
    setOpen(true);
  };

  const handleDelete = (id) => {
    setMsiTypes((prev) => prev.filter((m) => m.id !== id));
    setSnack({ open: true, severity: "success", message: "MSI Type deleted" });
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editId) {
      setMsiTypes((prev) =>
        prev.map((m) => (m.id === editId ? form : m))
      );
      setSnack({ open: true, severity: "success", message: "MSI Type updated" });
    } else {
      setMsiTypes((prev) => [
        ...prev,
        {
          ...form,
          id: Date.now().toString(),
          createdDate: new Date().toLocaleDateString(),
        },
      ]);
      setSnack({ open: true, severity: "success", message: "MSI Type added" });
    }
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        MSI Types
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={handleAdd}>
        Add MSI Type
      </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>MSI Code</TableCell>
              <TableCell>MSI Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMsiTypes.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>{row.msiCode}</TableCell>
                <TableCell>{row.msiName}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.createdDate}</TableCell>
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
        <Pagination
          count={pageCount}
          page={page}
          onChange={(e, v) => setPage(v)}
        />
      </Box>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {editId ? "Edit MSI Type" : "Add MSI Type"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="MSI Code"
              name="msiCode"
              value={form.msiCode}
              onChange={handleChange}
              error={!!errors.msiCode}
              helperText={errors.msiCode}
            />
            <TextField
              label="MSI Name"
              name="msiName"
              value={form.msiName}
              onChange={handleChange}
              error={!!errors.msiName}
              helperText={errors.msiName}
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
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
