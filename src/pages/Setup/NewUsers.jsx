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
  Pagination,
  Tooltip,
  MenuItem,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";

export default function NewUsers() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  // Pagination
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return users.slice(start, start + rowsPerPage);
  }, [users, page]);

  const pageCount = Math.ceil(users.length / rowsPerPage) || 1;

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validation
  const validateForm = () => {
    let temp = {};
    if (!form.name) temp.name = "Name is required";
    if (!form.email) temp.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      temp.email = "Invalid email format";
    if (!form.role) temp.role = "Role is required";
    if (!form.department) temp.department = "Department is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // Add
  const handleAdd = () => {
    setForm({
      name: "",
      email: "",
      role: "",
      department: "",
      status: "Active",
    });
    setEditId(null);
    setErrors({});
    setOpen(true);
  };

  // Edit
  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setErrors({});
    setOpen(true);
  };

  // Save
  const handleSave = () => {
    if (!validateForm()) return;

    if (editId) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editId ? { ...form, id: editId } : u))
      );
    } else {
      setUsers((prev) => [
        ...prev,
        {
          ...form,
          id: Date.now().toString(),
          createdDate: new Date().toLocaleDateString(),
        },
      ]);
    }
    setOpen(false);
  };

  // Delete
  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Users
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={handleAdd}>
        Add User
      </Button>
</Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedUsers.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>{row.department}</TableCell>
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

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {editId ? "Edit User" : "Add User"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />

            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
            />

            <TextField
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
              error={!!errors.role}
              helperText={errors.role}
              fullWidth
            />

            <TextField
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
              error={!!errors.department}
              helperText={errors.department}
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
