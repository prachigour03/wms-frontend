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
import { Edit, Delete } from "@mui/icons-material";

export default function WorkCategories() {

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("accountTypes");
    return saved ? JSON.parse(saved) : [];
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [form, setForm] = useState({
    categoryCode: "",
    categoryName: "",
    description: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    let temp = {};
    if (!form.categoryCode)
      temp.categoryCode = "Category Code is required";
    if (!form.categoryName)
      temp.categoryName = "Category Name is required";

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
      categoryCode: "",
      categoryName: "",
      description: "",
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
      setCategories((prev) =>
        prev.map((c) => (c.id === editId ? form : c))
      );
    } else {
      setCategories((prev) => [
        ...prev,
        { ...form, id: Date.now().toString() },
      ]);
    }
    setOpen(false);
  };

  const handleDelete = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  /* ---------------- PAGINATION ---------------- */
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return categories.slice(start, start + rowsPerPage);
  }, [categories, page]);

  const pageCount = Math.ceil(categories.length / rowsPerPage) || 1;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" mb={2}>
        Work Categories
      </Typography>

      <Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }}>
        Add Work Category
      </Button>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Category Code</TableCell>
              <TableCell>Category Name</TableCell>
              <TableCell>Description</TableCell>
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
                <TableCell>{row.categoryCode}</TableCell>
                <TableCell>{row.categoryName}</TableCell>
                <TableCell>{row.description}</TableCell>
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

            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No work categories found
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
          {editId ? "Edit Work Category" : "Add Work Category"}
        </DialogTitle>

        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Category Code"
              name="categoryCode"
              value={form.categoryCode}
              onChange={handleChange}
              error={!!errors.categoryCode}
              helperText={errors.categoryCode}
              fullWidth
            />

            <TextField
              label="Category Name"
              name="categoryName"
              value={form.categoryName}
              onChange={handleChange}
              error={!!errors.categoryName}
              helperText={errors.categoryName}
              fullWidth
            />

            <TextField
              label="Description"
              name="description"
              value={form.description}
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
    </Box>
  );
}
