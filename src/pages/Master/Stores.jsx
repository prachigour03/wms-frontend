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
  MenuItem,
  Pagination,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { getStores, createStore, updateStore, deleteStore } from "../../api/Store.api";
import { getSubsidiaries } from "../../api/Subsidiaries.api";

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [subsidiaries, setSubsidiaries] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [form, setForm] = useState({
    storeName: "",
    subsidiary: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [storeRes, subRes] = await Promise.all([getStores(), getSubsidiaries()]);
      setStores(storeRes.data?.data || []);
      setSubsidiaries(subRes.data?.data || []);
    } catch (e) {
      showSnack("Failed to fetch data", "error");
    }
  };

  const showSnack = (message, severity = "success") => {
    setSnack({ open: true, message, severity });
  };

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    let temp = {};
    if (!form.storeName) temp.storeName = "Store Name is required";
    if (!form.subsidiary) temp.subsidiary = "Subsidiary is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleAdd = () => {
    setForm({
      storeName: "",
      subsidiary: "",
      status: "Active",
    });
    setEditId(null);
    setErrors({});
    setOpen(true);
  };

  const handleEdit = (row) => {
    setForm({
      storeName: row.storeName,
      subsidiary: row.subsidiary,
      status: row.status,
    });
    setEditId(row.id);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editId) {
        await updateStore(editId, form);
        showSnack("Store updated successfully");
      } else {
        await createStore(form);
        showSnack("Store created successfully");
      }
      setOpen(false);
      fetchData();
    } catch (e) {
      showSnack(e.response?.data?.message || "Failed to save", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this store?")) {
      try {
        await deleteStore(id);
        showSnack("Store deleted successfully");
        fetchData();
      } catch (e) {
        showSnack("Failed to delete", "error");
      }
    }
  };

  /* ---------------- PAGINATION ---------------- */
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return stores.slice(start, start + rowsPerPage);
  }, [stores, page]);

  const pageCount = Math.ceil(stores.length / rowsPerPage) || 1;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Store Master
        </Typography>

        <Button variant="contained" onClick={handleAdd} startIcon={<AddIcon />}>
          Add Store
        </Button>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Sr. No.</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Store Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Subsidiary</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>{row.storeName}</TableCell>
                <TableCell>{row.subsidiary}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(row)} size="small" color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(row.id)}
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {stores.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No stores found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Pagination
          count={pageCount}
          page={page}
          onChange={(e, v) => setPage(v)}
          color="primary"
        />
      </Box>

      {/* ADD / EDIT MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editId ? "Edit Store" : "Add Store"}
        </DialogTitle>

        <DialogContent dividers>
          <Box mt={1} display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Store Name"
              name="storeName"
              value={form.storeName}
              onChange={handleChange}
              error={!!errors.storeName}
              helperText={errors.storeName}
              fullWidth
              size="small"
              required
            />

            <TextField
              select
              label="Subsidiary"
              name="subsidiary"
              value={form.subsidiary}
              onChange={handleChange}
              error={!!errors.subsidiary}
              helperText={errors.subsidiary}
              fullWidth
              size="small"
              required
            >
              {subsidiaries.map((sub) => (
                <MenuItem key={sub.id} value={sub.name}>
                  {sub.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              fullWidth
              size="small"
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Minimal AddIcon if not imported
const AddIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
