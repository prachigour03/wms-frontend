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

export default function MaterialStatus() {
  const [statuses, setStatuses] = useState(() => {
    const saved = localStorage.getItem("materialStatus");
    return saved ? JSON.parse(saved) : [];
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    statusCode: "",
    statusName: "",
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
    localStorage.setItem("materialStatus", JSON.stringify(statuses));
  }, [statuses]);

  // Pagination
  const { pageCount, paginatedStatuses } = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return {
      pageCount: Math.max(1, Math.ceil(statuses.length / rowsPerPage)),
      paginatedStatuses: statuses.slice(start, start + rowsPerPage),
    };
  }, [statuses, page]);

  // Form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validation
  const validateForm = () => {
    const tempErrors = {};
    if (!form.statusCode) tempErrors.statusCode = "Status Code is required";
    if (!form.statusName) tempErrors.statusName = "Status Name is required";
    if (!["Active", "Inactive"].includes(form.status))
      tempErrors.status = "Status must be Active or Inactive";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAdd = () => {
    setEditId(null);
    setForm({
      statusCode: "",
      statusName: "",
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
    setStatuses((prev) => prev.filter((s) => s.id !== id));
    setSnack({ open: true, severity: "success", message: "Status deleted" });
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editId) {
      setStatuses((prev) =>
        prev.map((s) => (s.id === editId ? form : s))
      );
      setSnack({ open: true, severity: "success", message: "Status updated" });
    } else {
      setStatuses((prev) => [
        ...prev,
        {
          ...form,
          id: Date.now().toString(),
          createdDate: new Date().toLocaleDateString(),
        },
      ]);
      setSnack({ open: true, severity: "success", message: "Status added" });
    }
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Material Status
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={handleAdd}>
        Add Material Status
      </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Status Code</TableCell>
              <TableCell>Status Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStatuses.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>{row.statusCode}</TableCell>
                <TableCell>{row.statusName}</TableCell>
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
          {editId ? "Edit Material Status" : "Add Material Status"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Status Code"
              name="statusCode"
              value={form.statusCode}
              onChange={handleChange}
              error={!!errors.statusCode}
              helperText={errors.statusCode}
            />
            <TextField
              label="Status Name"
              name="statusName"
              value={form.statusName}
              onChange={handleChange}
              error={!!errors.statusName}
              helperText={errors.statusName}
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
