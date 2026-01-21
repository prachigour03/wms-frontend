import React, { useState, useMemo } from "react";
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
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [form, setForm] = useState({
    storeCode: "",
    storeName: "",
    site: "",
    location: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    let temp = {};
    if (!form.storeCode) temp.storeCode = "Store Code is required";
    if (!form.storeName) temp.storeName = "Store Name is required";
    if (!form.site) temp.site = "Site is required";
    if (!form.location) temp.location = "Location is required";

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
      storeCode: "",
      storeName: "",
      site: "",
      location: "",
      status: "Active",
    });
    setEditId(null);
    setErrors({});
    setOpen(true);
  };

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setOpen(true);
  };

  const handleSave = () => {
    if (!validate()) return;

    if (editId) {
      setStores((prev) =>
        prev.map((s) => (s.id === editId ? form : s))
      );
    } else {
      setStores((prev) => [
        ...prev,
        { ...form, id: Date.now().toString() },
      ]);
    }
    setOpen(false);
  };

  const handleDelete = (id) => {
    setStores((prev) => prev.filter((s) => s.id !== id));
  };

  /* ---------------- PAGINATION ---------------- */
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return stores.slice(start, start + rowsPerPage);
  }, [stores, page]);

  const pageCount = Math.ceil(stores.length / rowsPerPage) || 1;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" mb={2}>
        Stores
      </Typography>

      <Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }}>
        Add Store
      </Button>
      </Box>
      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Store Code</TableCell>
              <TableCell>Store Name</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Location</TableCell>
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
                <TableCell>{row.storeCode}</TableCell>
                <TableCell>{row.storeName}</TableCell>
                <TableCell>{row.site}</TableCell>
                <TableCell>{row.location}</TableCell>
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

            {stores.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No stores found
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
          {editId ? "Edit Store" : "Add Store"}
        </DialogTitle>

        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Store Code"
              name="storeCode"
              value={form.storeCode}
              onChange={handleChange}
              error={!!errors.storeCode}
              helperText={errors.storeCode}
              fullWidth
            />

            <TextField
              label="Store Name"
              name="storeName"
              value={form.storeName}
              onChange={handleChange}
              error={!!errors.storeName}
              helperText={errors.storeName}
              fullWidth
            />

            <TextField
              label="Site"
              name="site"
              value={form.site}
              onChange={handleChange}
              error={!!errors.site}
              helperText={errors.site}
              fullWidth
            />

            <TextField
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              error={!!errors.location}
              helperText={errors.location}
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
    </Box>
  );
}
