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

export default function TransportationModes() {
  const [modes, setModes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [form, setForm] = useState({
    modeCode: "",
    modeName: "",
    description: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    let temp = {};
    if (!form.modeCode) temp.modeCode = "Mode Code is required";
    if (!form.modeName) temp.modeName = "Mode Name is required";

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
      modeCode: "",
      modeName: "",
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
      setModes((prev) =>
        prev.map((m) => (m.id === editId ? form : m))
      );
    } else {
      setModes((prev) => [
        ...prev,
        { ...form, id: Date.now().toString() },
      ]);
    }
    setOpen(false);
  };

  const handleDelete = (id) => {
    setModes((prev) => prev.filter((m) => m.id !== id));
  };

  /* ---------------- PAGINATION ---------------- */
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return modes.slice(start, start + rowsPerPage);
  }, [modes, page]);

  const pageCount = Math.ceil(modes.length / rowsPerPage) || 1;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" mb={2}>
        Transportation Modes
      </Typography>

      <Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }}>
        Add Transportation Mode
      </Button>
      </Box>
      
      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Mode Code</TableCell>
              <TableCell>Mode Name</TableCell>
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
                <TableCell>{row.modeCode}</TableCell>
                <TableCell>{row.modeName}</TableCell>
                <TableCell>{row.description || "-"}</TableCell>
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

            {modes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No transportation modes found
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
          {editId ? "Edit Transportation Mode" : "Add Transportation Mode"}
        </DialogTitle>

        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Mode Code"
              name="modeCode"
              value={form.modeCode}
              onChange={handleChange}
              error={!!errors.modeCode}
              helperText={errors.modeCode}
              fullWidth
            />

            <TextField
              label="Mode Name"
              name="modeName"
              value={form.modeName}
              onChange={handleChange}
              error={!!errors.modeName}
              helperText={errors.modeName}
              fullWidth
            />

            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
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
