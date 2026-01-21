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

export default function ItemRateMaster() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("itemRates");
    return saved ? JSON.parse(saved) : [];
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    itemName: "",
    itemCode: "",
    unit: "",
    rate: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
    localStorage.setItem("itemRates", JSON.stringify(items));
  }, [items]);

  const { pageCount, paginatedItems } = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const pageCount = Math.max(1, Math.ceil(items.length / rowsPerPage));
    return {
      pageCount,
      paginatedItems: items.slice(start, start + rowsPerPage),
    };
  }, [items, page]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!form.itemName) tempErrors.itemName = "Item Name is required";
    if (!form.itemCode) tempErrors.itemCode = "Item Code is required";
    if (!form.unit) tempErrors.unit = "Unit is required";
    if (!form.rate) tempErrors.rate = "Rate is required";
    else if (isNaN(form.rate)) tempErrors.rate = "Rate must be a number";
    if (!form.status || !["Active", "Inactive"].includes(form.status))
      tempErrors.status = "Status must be Active or Inactive";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAdd = () => {
    setEditId(null);
    setForm({ itemName: "", itemCode: "", unit: "", rate: "", status: "Active" });
    setErrors({});
    setOpen(true);
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
    setErrors({});
    setOpen(true);
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSnack({ open: true, severity: "success", message: "Item deleted" });
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editId) {
      setItems((prev) => prev.map((i) => (i.id === editId ? form : i)));
      setSnack({ open: true, severity: "success", message: "Item updated" });
    } else {
      setItems((prev) => [
        ...prev,
        { ...form, id: Date.now().toString(), createdDate: new Date().toLocaleDateString() },
      ]);
      setSnack({ open: true, severity: "success", message: "Item added" });
    }
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Item Rate Master
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={handleAdd}>
          Add Item
        </Button>
      </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Item Code</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.map((item, i) => (
              <TableRow key={item.id}>
                <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                <TableCell>{item.itemName}</TableCell>
                <TableCell>{item.itemCode}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.rate}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.createdDate}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(item)}>
                      <ModeEdit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(item.id)}>
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
        <DialogTitle>{editId ? "Edit Item" : "Add Item"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Item Name"
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              fullWidth
              error={!!errors.itemName}
              helperText={errors.itemName}
            />
            <TextField
              label="Item Code"
              name="itemCode"
              value={form.itemCode}
              onChange={handleChange}
              fullWidth
              error={!!errors.itemCode}
              helperText={errors.itemCode}
            />
            <TextField
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              fullWidth
              error={!!errors.unit}
              helperText={errors.unit}
            />
            <TextField
              label="Rate"
              name="rate"
              value={form.rate}
              onChange={handleChange}
              fullWidth
              error={!!errors.rate}
              helperText={errors.rate}
            />
            <Switch
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              fullWidth
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
