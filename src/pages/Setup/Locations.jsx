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
  Pagination,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../../api/Locations.api.js";
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';

export default function Location() {
  const dispatch = useDispatch();

  const [locations, setLocations] = useState(
    () => {
      const saved = localStorage.getItem("locations");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const [form, setForm] = useState({
    locationCode: "",
    locationName: "",
    subsidiary: "",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
        const fetchInventory = async () => {
          try {
            const response = await getLocations();
            if (response.data && response.data.success) {
              setLocations(response.data.data);
            } else if (Array.isArray(response.data)) {
              setLocations(response.data);
            } else {
              console.error("Unexpected API response:", response.data);
            }
          } catch (error) {
            console.error("Failed to fetch inventory counts:", error.response?.data || error.message);
          }
        };
    
        fetchInventory();
      }, []);

  // Pagination
  const paginatedLocations = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return locations.slice(start, start + rowsPerPage);
  }, [locations, page]);

  const pageCount = Math.ceil(locations.length / rowsPerPage) || 1;

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validation
  const validateForm = () => {
    let temp = {};
    if (!form.locationCode) temp.locationCode = "Location code is required";
    if (!form.locationName) temp.locationName = "Location name is required";
    if (!form.subsidiary) temp.subsidiary = "Subsidiary is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // Add
  // Add
    const handleSave = async () => {
        if (!validateForm()) return;
    
        try {
          if (editId) {
            const response = await updateLocation(editId, form);
            if (response.data.success) {
              setLocations((prev) =>
                prev.map((d) => (d.id === editId ? response.data.data : d))
              );
            }
          } else {
            const response = await createLocation(form);
            if (response.data.success) {
              setLocations((prev) => [...prev, response.data.data]);
              dispatch(incrementNotification({
                severity: "success",
                message: "Location created successfully",
                path: 'setup/Locations',
                time: new Date().toISOString(),
                }));  
                setSnack({ open: true, severity: 'success', message: `City ${editId ? 'updated' : 'created'}` });
            }
          }
    
          setOpen(false);
          setEditId(null);
    setForm({ locationCode: "", locationName: "", subsidiary: "" });
    setErrors({});
  } catch (error) {
      console.error("Failed to save inventory count:", error.response?.data || error.message);
    }
  };

  // Edit
  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setErrors({});
    setOpen(true);
  } 

  // Delete
  const handleDelete = async (id) => {
        try {
          const response = await deleteLocation(id);
          if (response.data.success) {
            setLocations((prev) => prev.filter((d) => d.id !== id));
          }
        } catch (error) {
          console.error("Failed to delete inventory count:", error.response?.data || error.message);
        }
      };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <Typography variant="h5" sx={{ mb: 2 }}>
        Location
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Add Location
      </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Location Code</TableCell>
              <TableCell>Location Name</TableCell>
              <TableCell>Subsidiary</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedLocations.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>{row.locationCode}</TableCell>
                <TableCell>{row.locationName}</TableCell>
                <TableCell>{row.subsidiary}</TableCell>
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

      <Box sx={{ display: "flex", justifyContent: 'flex-end', mt: 2 }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={(e, v) => setPage(v)}
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {editId ? "Edit Location" : "Add Location"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2, mt: 1 }}>
            <TextField
              label="Location Code"
              name="locationCode"
              value={form.locationCode}
              onChange={handleChange}
              error={!!errors.locationCode}
              helperText={errors.locationCode}
              fullWidth
            />
            <TextField
              label="Location Name"
              name="locationName"
              value={form.locationName}
              onChange={handleChange}
              error={!!errors.locationName}
              helperText={errors.locationName}
              fullWidth
            />
            <TextField
              label="Subsidiary"
              name="subsidiary"
              value={form.subsidiary}
              onChange={handleChange}
              error={!!errors.subsidiary}
              helperText={errors.subsidiary}
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
      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
