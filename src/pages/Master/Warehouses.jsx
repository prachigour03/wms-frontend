import React, { useState, useMemo, useEffect} from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  createwarehouse,
  getwarehouses,
  updatewarehouse,
  deletewarehouse,
 } from "../../api/warehouse.api.js";
 import { useDispatch } from 'react-redux';
 import { increment as incrementNotification } from '../../features/notificationSlice';

export default function Warehouses() {
  const dispatch = useDispatch();

  const [warehouses, setWarehouses] = useState(() => {
    const saved = localStorage.getItem("accountTypes");
    return saved ? JSON.parse(saved) : [];
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [form, setForm] = useState({
    warehouseCode: "",
    warehouseName: "",
    location: "",
    incharge: "",
    contactNo: "",
    address: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
      open: false,
      severity: "success",
      message: "",
    });

  useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await getwarehouses();
            if (response.data.success) setWarehouses(response.data.data);
          } catch (error) {
            console.error("Failed to fetch Warehouses:", error.response?.data || error.message);
          }
        };
        fetchData();
      }, []);
            
  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    let temp = {};
    if (!form.warehouseCode)
      temp.warehouseCode = "Warehouse Code is required";
    if (!form.warehouseName)
      temp.warehouseName = "Warehouse Name is required";
    if (!form.location) temp.location = "Location is required";
    if (!form.contactNo) temp.contactNo = "Contact number is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

   const handleSave = async () => {
        if (!validate()) return;
    
        try {
          if (editId) {
            const response = await updatewarehouse(editId, form);
            if (response.data.success) {
              setWarehouses((prev) =>
                prev.map((w) => (w.id === editId ? response.data.data : w))
              );
            }
          } else {
            const response = await createwarehouse(form);
            if (response.data.success) {
              setWarehouses((prev) => [...prev, response.data.data]);
              dispatch(incrementNotification({
                severity: "success",
                message: "Warehouse created successfully",
                path: 'master/Warehouses',
                time: new Date().toISOString(),
                }));
                setSnack({ open: true, severity: 'success', message: 'Warehouse added' });
            }
          }
    
          setOpen(false);
          setEditId(null);
    setForm({
      warehouseCode: "",
      warehouseName: "",
      location: "",
      incharge: "",
      contactNo: "",
      address: "",
      status: "Active",
    });
      } catch (error) {
        console.error("Failed to save Account", error.response?.data || error.message);
      }
    };

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setErrors({});
    setOpen(true);
  };

  const handleDelete = async (id) => {
        try {
          const response = await deletewarehouse(id);
          if (response.data.success) {
            setWarehouses((prev) => prev.filter((w) => w.id !== id));
          }
        } catch (error) {
          console.error("Failed to delete Warehouse", error.response?.data || error.message);
        }
      };

  /* ---------------- PAGINATION ---------------- */
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return warehouses.slice(start, start + rowsPerPage);
  }, [warehouses, page]);

  const pageCount = Math.ceil(warehouses.length / rowsPerPage) || 1;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" mb={2}>
        Warehouses
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Add Warehouse
      </Button>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Warehouse Code</TableCell>
              <TableCell>Warehouse Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Incharge</TableCell>
              <TableCell>Contact No.</TableCell>
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
                <TableCell>{row.warehouseCode}</TableCell>
                <TableCell>{row.warehouseName}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell>{row.incharge}</TableCell>
                <TableCell>{row.contactNo}</TableCell>
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

            {warehouses.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No warehouses found
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
          {editId ? "Edit Warehouse" : "Add Warehouse"}
        </DialogTitle>

        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Warehouse Code"
              name="warehouseCode"
              value={form.warehouseCode}
              onChange={handleChange}
              error={!!errors.warehouseCode}
              helperText={errors.warehouseCode}
              fullWidth
            />

            <TextField
              label="Warehouse Name"
              name="warehouseName"
              value={form.warehouseName}
              onChange={handleChange}
              error={!!errors.warehouseName}
              helperText={errors.warehouseName}
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
              label="Incharge"
              name="incharge"
              value={form.incharge}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Contact No."
              name="contactNo"
              value={form.contactNo}
              onChange={handleChange}
              error={!!errors.contactNo}
              helperText={errors.contactNo}
              fullWidth
            />

            <TextField
              label="Address"
              name="address"
              value={form.address}
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
