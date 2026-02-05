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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../../api/Locations.api.js";
import { getSubsidiaries } from "../../api/Subsidiaries.api.js";
import { useDispatch } from "react-redux";
import { createNotification } from "../../features/notificationSlice";

export default function Location() {
  const dispatch = useDispatch();

  const [locations, setLocations] = useState([]);
  const [subsidiaries, setSubsidiaries] = useState([]);
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

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, subRes] = await Promise.all([
          getLocations(),
          getSubsidiaries(),
        ]);

        setLocations(Array.isArray(locRes?.data?.data) ? locRes.data.data : []);
        setSubsidiaries(
          Array.isArray(subRes?.data?.data) ? subRes.data.data : [],
        );
      } catch (err) {
        console.error(err);
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to load data",
        });
      }
    };

    fetchData();
  }, []);

  /* ---------------- PAGINATION ---------------- */
  const paginatedLocations = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return locations.slice(start, start + rowsPerPage);
  }, [locations, page]);

  const pageCount = Math.ceil(locations.length / rowsPerPage) || 1;

  const getSubsidiaryLabel = (value) => {
    if (!value) return "";
    const byId = subsidiaries.find((s) => s.id === value);
    if (byId?.name) return byId.name;
    const byName = subsidiaries.find((s) => s.name === value);
    if (byName?.name) return byName.name;
    return value;
  };

  /* ---------------- FORM HANDLERS ---------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const temp = {};
    if (!form.locationCode) temp.locationCode = "Location code is required";
    if (!form.locationName) temp.locationName = "Location name is required";
    if (!form.subsidiary) temp.subsidiary = "Subsidiary is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editId) {
        const res = await updateLocation(editId, form);
        setLocations((prev) =>
          prev.map((l) => (l.id === editId ? res.data.data : l)),
        );
      } else {
        const res = await createLocation(form);
        setLocations((prev) => [...prev, res.data.data]);

        dispatch(
          dispatch(
            createNotification({
              title: "Location",
              message: "Location created successfully",
            })
          ),
        );
      }

      setOpen(false);
      setEditId(null);
      setForm({ locationCode: "", locationName: "", subsidiary: "" });
      setErrors({});
    } catch (err) {
      console.error(err);
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to save location",
      });
    }
  };

  const handleEdit = (row) => {
    setForm({
      locationCode: row.locationCode,
      locationName: row.locationName,
      subsidiary: row.subsidiary,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteLocation(id);
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error(err);
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to delete location",
      });
    }
  };

  console.log(subsidiaries);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Location</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditId(null);
            setForm({ locationCode: "", locationName: "", subsidiary: "" });
            setErrors({});
            setOpen(true);
          }}
        >
          Add Location
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Location Code</TableCell>
              <TableCell>Location Name</TableCell>
              <TableCell>Subsidiary</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedLocations.map((row, i) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                <TableCell>{row.locationCode}</TableCell>
                <TableCell>{row.locationName}</TableCell>
                <TableCell>
                  {getSubsidiaryLabel(row.subsidiary)}
                </TableCell>

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
          onChange={(_, v) => setPage(v)}
        />
      </Box>

      {/* ADD / EDIT MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Location" : "Add Location"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Location Code"
              name="locationCode"
              value={form.locationCode}
              onChange={handleChange}
              error={!!errors.locationCode}
              helperText={errors.locationCode}
            />
            <TextField
              label="Location Name"
              name="locationName"
              value={form.locationName}
              onChange={handleChange}
              error={!!errors.locationName}
              helperText={errors.locationName}
            />
            <FormControl fullWidth error={!!errors.subsidiary}>
              <InputLabel>Subsidiary</InputLabel>
              <Select
                as={Select}
                name="subsidiary"
                value={form.subsidiary || ""}
                onChange={handleChange}
                label="Subsidiary"
              >
                {subsidiaries.map((s) => {
                  return (
                    <MenuItem key={s.id} value={s.name}>
                      {s.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
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

