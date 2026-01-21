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
  MenuItem,
  Switch,
  Snackbar,
  Alert,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
// API
import {
  createSubsidiary,
  getSubsidiaries,
  updateSubsidiary,
  deleteSubsidiary,
} from "../../api/Subsidiaries.api";
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';

export default function Subsidiaries() {
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const [form, setForm] = useState({
    name: "",
    currency: "",
    parentSubsidiary: "",
    state: "",
    gstNumber: "",
    validFrom: "",
    address: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

   // -------------------------
    // FETCH ITEMS
    // -------------------------
    useEffect(() => {
      const fetchItems = async () => {
        try {
          const response = await getSubsidiaries();
          if (response.data.success) {
            setData(response.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch items:", error.response?.data || error.message);
        }
      };
  
      fetchItems();
    }, []);
  
    // -------------------------
    // PAGINATION
    // -------------------------
    const paginatedData = useMemo(() => {
      const start = (page - 1) * rowsPerPage;
      return data.slice(start, start + rowsPerPage);
    }, [data, page]);
  
    const pageCount = Math.ceil(data.length / rowsPerPage) || 1;
  
  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validation
  const validateForm = () => {
    let temp = {};
    if (!form.name) temp.name = "Subsidiary name is required";
    if (!form.currency) temp.currency = "Currency is required";
    if (!form.state) temp.state = "State is required";
    if (!form.gstNumber) temp.gstNumber = "GST number is required";
    if (!form.validFrom) temp.validFrom = "Valid from date is required";
    if (!form.address) temp.address = "Address is required";

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
          const response = await updateSubsidiary(editId, form);
          if (response.data.success) {
            setData((prev) =>
              prev.map((d) => (d.id === editId ? response.data.data : d))
            );
          }
        } else {
          const response = await createSubsidiary(form);
          if (response.data.success) {
            setData((prev) => [...prev, response.data.data]);

            dispatch(incrementNotification({
              severity: "success",
              message: "Subsidiary created successfully",
              path: 'setup/Subsidiaries',
              time: new Date().toISOString(),
              }));  
              setSnack({ open: true, severity: 'success', message: 'Subsidiary added' });
          }
        }
  
        setOpen(false);
        setEditId(null);
    setForm({
      name: "",
      currency: "",
      parentSubsidiary: "",
      state: "",
      gstNumber: "",
      validFrom: "",
      address: "",
      status: "Active",
    });
    setErrors({});

  } catch (error) {
      console.error("Failed to save item:", error.response?.data || error.message);
    }
  };

  // Edit
  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setErrors({});
    setOpen(true);
  };

  
    const handleDelete = async (id) => {
      try {
        const response = await deleteSubsidiary(id);
        if (response.data.success) {
          setData((prev) => prev.filter((d) => d.id !== id));
        }
      } catch (error) {
        console.error("Failed to delete item:", error.response?.data || error.message);
      }
    };
  
  

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Subsidiaries
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Add Subsidiary
      </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Subsidiary Name</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Parent Subsidiary</TableCell>
              <TableCell>State</TableCell>
              <TableCell>GST Number</TableCell>
              <TableCell>Valid From</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.currency}</TableCell>
                <TableCell>{row.parentSubsidiary || "-"}</TableCell>
                <TableCell>{row.state}</TableCell>
                <TableCell>{row.gstNumber}</TableCell>
                <TableCell>{row.validFrom}</TableCell>
                <TableCell>{row.address}</TableCell>
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
          {editId ? "Edit Subsidiary" : "Add Subsidiary"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Subsidiary Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />

            <TextField
              label="Currency"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              error={!!errors.currency}
              helperText={errors.currency}
              fullWidth
            />

            <TextField
              label="Parent Subsidiary"
              name="parentSubsidiary"
              value={form.parentSubsidiary}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
              error={!!errors.state}
              helperText={errors.state}
              fullWidth
            />

            <TextField
              label="GST Number"
              name="gstNumber"
              value={form.gstNumber}
              onChange={handleChange}
              error={!!errors.gstNumber}
              helperText={errors.gstNumber}
              fullWidth
            />

            <TextField
              type="date"
              label="Valid From"
              name="validFrom"
              InputLabelProps={{ shrink: true }}
              value={form.validFrom}
              onChange={handleChange}
              error={!!errors.validFrom}
              helperText={errors.validFrom}
              fullWidth
            />

            <TextField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
              fullWidth
            />

            <Switch
              select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Switch>
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
        <Alert severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
