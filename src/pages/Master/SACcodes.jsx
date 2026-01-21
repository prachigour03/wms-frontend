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

export default function SACcodes() {

  const [codes, setCodes] = useState(() => {
    const saved = localStorage.getItem("sacCodes");
    return saved ? JSON.parse(saved) : [];
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    codeType: "SAC", // SAC or HSN
    code: "",
    description: "",
    gstRate: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
    localStorage.setItem("sacCodes", JSON.stringify(codes));
  }, [codes]);

  // Pagination
  const { pageCount, paginatedCodes } = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return {
      pageCount: Math.max(1, Math.ceil(codes.length / rowsPerPage)),
      paginatedCodes: codes.slice(start, start + rowsPerPage),
    };
  }, [codes, page]);

  // Handle change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validation
  const validateForm = () => {
    const tempErrors = {};
    if (!form.code) tempErrors.code = "Code is required";
    if (!form.description) tempErrors.description = "Description is required";
    if (!form.gstRate) tempErrors.gstRate = "GST Rate is required";
    if (isNaN(form.gstRate))
      tempErrors.gstRate = "GST Rate must be numeric";

    if (!["Active", "Inactive"].includes(form.status))
      tempErrors.status = "Invalid status";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAdd = () => {
    setEditId(null);
    setForm({
      codeType: "SAC",
      code: "",
      description: "",
      gstRate: "",
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
    setCodes((prev) => prev.filter((c) => c.id !== id));
    setSnack({ open: true, severity: "success", message: "Code deleted" });
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editId) {
      setCodes((prev) =>
        prev.map((c) => (c.id === editId ? form : c))
      );
      setSnack({ open: true, severity: "success", message: "Code updated" });
    } else {
      setCodes((prev) => [
        ...prev,
        {
          ...form,
          id: Date.now().toString(),
          createdDate: new Date().toLocaleDateString(),
        },
      ]);
      setSnack({ open: true, severity: "success", message: "Code added" });
    }
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        HSN / SAC Codes
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={handleAdd}>
        Add Code
      </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>GST %</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCodes.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>{row.codeType}</TableCell>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.gstRate}%</TableCell>
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
          {editId ? "Edit Code" : "Add Code"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Code Type (HSN / SAC)"
              name="codeType"
              value={form.codeType}
              onChange={handleChange}
              error={!!errors.codeType}
            />
            <TextField
              label="Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              error={!!errors.code}
              helperText={errors.code}
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
            />
            <TextField
              label="GST Rate (%)"
              name="gstRate"
              value={form.gstRate}
              onChange={handleChange}
              error={!!errors.gstRate}
              helperText={errors.gstRate}
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
