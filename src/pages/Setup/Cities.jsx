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
  Pagination,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import {
  getCities,
  createCity,
  updateCity,
  deleteCity,
} from "../../api/Cities.api.js";
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';

export default function Cities() {
  const dispatch = useDispatch();

  const [cities, setCities] = useState(
    () => {
      const saved = localStorage.getItem("cities");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [form, setForm] = useState({
    cityName: "",
    stateName: "",
    stateCode: "",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  // -------------------------
  // FETCH CITIES
  // -------------------------
  const fetchCities = async () => {
    try {
      const response = await getCities();
      if (response.data && response.data.success) {
        setCities(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCities(response.data);
      } else {
        console.error("Unexpected API response:", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch cities:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await getCities();
      if (response.data && response.data.success) {
        setCities(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCities(response.data);
      } else {
        console.error("Unexpected API response:", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch vendor issues:", error.response?.data || error.message);
    }
  };

  fetchData();
}, []);

  // -------------------------
  // PAGINATION
  // -------------------------
  const paginatedCities = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return cities.slice(start, start + rowsPerPage);
  }, [cities, page]);

  const pageCount = Math.ceil(cities.length / rowsPerPage) || 1;

  // -------------------------
  // FORM HANDLERS
  // -------------------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let temp = {};
    if (!form.cityName) temp.cityName = "City name is required";
    if (!form.stateName) temp.stateName = "State name is required";
    if (!form.stateCode) temp.stateCode = "State code is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleAdd = () => {
    setForm({ cityName: "", stateName: "", stateCode: "" });
    setEditId(null);
    setErrors({});
    setOpen(true);
  };

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setErrors({});
    setOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editId) {
        await updateCity(editId, form);
      } else {
        await createCity(form);
      }
      fetchCities();
      setOpen(false);

      dispatch(incrementNotification({
        severity: "success",
        message: `City ${editId ? 'updated' : 'created'} successfully`,
        path: 'setup/Cities',
        time: new Date().toISOString(), 
        }));
        setSnack({ open: true, severity: 'success', message: `City ${editId ? 'updated' : 'created'}` });

    } catch (error) {
      console.error("Failed to save city:", error.response?.data || error.message);

    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCity(id);
      fetchCities();
    } catch (error) {
      console.error("Failed to delete city:", error.response?.data || error.message);
    }
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Cities</Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={handleAdd}>Add City</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>City Name</TableCell>
              <TableCell>State Name</TableCell>
              <TableCell>State Code</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCities.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row.cityName}</TableCell>
                <TableCell>{row.stateName}</TableCell>
                <TableCell>{row.stateCode}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(row)}><ModeEdit /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(row.id)}><Delete /></IconButton>
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

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit City" : "Add City"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="City Name" name="cityName" value={form.cityName} onChange={handleChange} error={!!errors.cityName} helperText={errors.cityName} fullWidth />
            <TextField label="State Name" name="stateName" value={form.stateName} onChange={handleChange} error={!!errors.stateName} helperText={errors.stateName} fullWidth />
            <TextField label="State Code" name="stateCode" value={form.stateCode} onChange={handleChange} error={!!errors.stateCode} helperText={errors.stateCode} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>

        <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
        </Snackbar>
      </Dialog>
    </Box>
  );
}
