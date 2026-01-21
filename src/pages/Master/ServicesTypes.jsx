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

export default function ServicesTypes() {
  const [services, setServices] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [form, setForm] = useState({
    serviceTypeCode: "",
    serviceTypeName: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    let temp = {};

    if (!form.serviceTypeCode)
      temp.serviceTypeCode = "Service Type Code is required";

    if (!form.serviceTypeName)
      temp.serviceTypeName = "Service Type Name is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleAdd = () => {
    setForm({ serviceTypeCode: "", serviceTypeName: "", status: "Active" });
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
      setServices((prev) =>
        prev.map((s) => (s.id === editId ? form : s))
      );
    } else {
      setServices((prev) => [
        ...prev,
        { ...form, id: Date.now().toString() },
      ]);
    }
    setOpen(false);
  };

  const handleDelete = (id) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  /* ---------------- PAGINATION ---------------- */
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return services.slice(start, start + rowsPerPage);
  }, [services, page]);

  const pageCount = Math.ceil(services.length / rowsPerPage) || 1;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" mb={2}>
        Services Types
      </Typography>

      <Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }}>
        Add Service Type
      </Button>
      </Box>
      
      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Service Type Code</TableCell>
              <TableCell>Service Type Name</TableCell>
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
                <TableCell>{row.serviceTypeCode}</TableCell>
                <TableCell>{row.serviceTypeName}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(row)}>
                      <Edit />
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
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} />
      </Box>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {editId ? "Edit Service Type" : "Add Service Type"}
        </DialogTitle>

        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Service Type Code"
              name="serviceTypeCode"
              value={form.serviceTypeCode}
              onChange={handleChange}
              error={!!errors.serviceTypeCode}
              helperText={errors.serviceTypeCode}
              fullWidth
            />

            <TextField
              label="Service Type Name"
              name="serviceTypeName"
              value={form.serviceTypeName}
              onChange={handleChange}
              error={!!errors.serviceTypeName}
              helperText={errors.serviceTypeName}
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
