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
  Snackbar,
  Alert,
  Pagination,
  Tooltip,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import {
  getStates,
  createState,
  updateState,
  deleteState,
} from "../../api/States.api.js";
import { useDispatch } from 'react-redux';
import { createNotification } from '../../features/notificationSlice';

export default function State() {
  const dispatch = useDispatch();

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("states");
    return saved ? JSON.parse(saved) : [];
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  // -------------------- FETCH DATA --------------------
  useEffect(() => {
      const fetchItems = async () => {
        try {
          const response = await getStates();
          if (response.data.success) {
            setData(response.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch items:", error.response?.data || error.message);
        }
      };
  
      fetchItems();
    }, []);
  /* ---------- PAGINATION ---------- */
  const paginatedData = useMemo(() => {
      const start = (page - 1) * rowsPerPage;
      return data.slice(start, start + rowsPerPage);
    }, [data, page]);
  
    const pageCount = Math.ceil(data.length / rowsPerPage) || 1;
  
  /* ---------- FORM HANDLERS ---------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let temp = {};

    if (!form.name) temp.name = "State name is required";

    if (!form.code) temp.code = "State code is required";
    else if (form.code.length < 2 || form.code.length > 5)
      temp.code = "Code must be 2–5 characters";

    const duplicate = data.find(
      (s) => s.code === form.code && s.id !== editId
    );
    if (duplicate) temp.code = "State code already exists";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // -------------------------
      // SAVE / UPDATE
      // -------------------------
      const handleSave = async () => {
        if (!validateForm()) return;
    
        try {
          if (editId) {
            const response = await updateState(editId, form);
            if (response.data.success) {
              setData((prev) =>
                prev.map((d) => (d.id === editId ? response.data.data : d))
              );
            }
          } else {
            const response = await createState(form);
            if (response.data.success) {
              setData((prev) => [...prev, response.data.data]);

              dispatch(createNotification({
                severity: "success",
                message: "State created successfully",
                path: 'setup/States',
                time: new Date().toISOString(),
                }));  
                setSnack({ open: true, severity: 'success', message: 'State added' });  
            }
          }
    
          setOpen(false);
      setEditId(null);
    setForm({ name: "", code: "" });
    setErrors({});
  } catch (error) {
        console.error("Failed to save Account", error.response?.data || error.message);
      }
  };

  const handleEdit = (row) => {
    setForm({ name: row.name, code: row.code });
    setEditId(row.id);
    setErrors({});
    setOpen(true);
  };

  const handleDelete = async (id) => {
          try {
            const response = await deleteState(id);
            if (response.data.success) {
              setData((prev) => prev.filter((d) => d.id !== id));
            }
          } catch (error) {
            console.error("Failed to delete Account", error.response?.data || error.message);
          }
        };

  /* ---------- UI ---------- */
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" mb={2}>
        States
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Add States
      </Button>
</Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>State Name</TableCell>
              <TableCell>State Code</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((s, i) => (
              <TableRow key={s.id}>
                <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.code}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(s)}>
                      <ModeEdit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(s.id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent='flex-end'>
        <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} />
      </Box>

      {/* ADD / EDIT MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit State" : "Add State"}</DialogTitle>
        <DialogContent>
          <Box mt={1} display="flex" flexDirection="row" gap={2}>
            <TextField
              label="State Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />
            <TextField
              label="State Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              error={!!errors.code}
              helperText={errors.code}
              fullWidth
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

