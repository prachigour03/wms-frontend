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
  MenuItem,
  Pagination,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";

// Import API
import {
  getVendorIssueMaterials,
  createVendorIssueMaterial,
  updateVendorIssueMaterial,
  deleteVendorIssueMaterial,
} from "../../api/VendorissueMaterial.api"; // adjust path if needed
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';
export default function VendorIssueMaterial() {
    const dispatch = useDispatch();
  const [data, setData] = useState(
    () => {
      const saved = localStorage.getItem("vendorIssueMaterials");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const [form, setForm] = useState({
    issueNo: "",
    issueDate: "",
    vendorName: "",
    materialName: "",
    quantity: "",
    unit: "",
    status: "Pending",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  // -------------------------
  // FETCH VENDOR ISSUES
  // -------------------------
  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await getVendorIssueMaterials();
      if (response.data && response.data.success) {
        setData(response.data.data);
      } else if (Array.isArray(response.data)) {
        setData(response.data);
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
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page]);

  const pageCount = Math.ceil(data.length / rowsPerPage) || 1;

  // -------------------------
  // VALIDATION
  // -------------------------
  const validate = () => {
    const temp = {};
    if (!form.issueNo) temp.issueNo = "Issue No required";
    if (!form.issueDate) temp.issueDate = "Issue Date required";
    if (!form.vendorName) temp.vendorName = "Vendor Name required";
    if (!form.materialName) temp.materialName = "Material Name required";
    if (!form.quantity || isNaN(form.quantity)) temp.quantity = "Valid quantity required";
    if (!form.unit) temp.unit = "Unit required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // -------------------------
  // SAVE / UPDATE
  // -------------------------
  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editId) {
        const response = await updateVendorIssueMaterial(editId, form);
        if (response.data.success) {
          setData((prev) =>
            prev.map((d) => (d.id === editId ? response.data.data : d))
          );
        }
      } else {
        const response = await createVendorIssueMaterial(form);
        if (response.data.success) {
          setData((prev) => [...prev, response.data.data]);
          dispatch(incrementNotification({
            severity: "success",
            message: "Vendor Issue created successfully",
            path: 'transition/VendorissueMaterial',
            time: new Date().toISOString(),
            }));  
            setSnack({ open: true, severity: 'success', message: 'Vendor Issue added' });
        }
      }

      setOpen(false);
      setEditId(null);
      setForm({
        issueNo: "",
        issueDate: "",
        vendorName: "",
        materialName: "",
        quantity: "",
        unit: "",
        status: "Pending",
      });
    } catch (error) {
      console.error("Failed to save vendor issue:", error.response?.data || error.message);
    }
  };

  // -------------------------
  // EDIT & DELETE
  // -------------------------
  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteVendorIssueMaterial(id);
      if (response.data.success) {
        setData((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete vendor issue:", error.response?.data || error.message);
    }
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Vendor Issue Material</Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>Add Vendor Issue</Button>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Issue No</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Vendor Name</TableCell>
              <TableCell>Material Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row.issueNo}</TableCell>
                <TableCell>{row.issueDate}</TableCell>
                <TableCell>{row.vendorName}</TableCell>
                <TableCell>{row.materialName}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.unit}</TableCell>
                <TableCell>{row.status}</TableCell>
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

      {/* PAGINATION */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} />
      </Box>

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Vendor Issue" : "Add Vendor Issue"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Issue No" name="issueNo" value={form.issueNo} onChange={handleChange} error={!!errors.issueNo} helperText={errors.issueNo} />
            <TextField type="date" label="Issue Date" name="issueDate" value={form.issueDate} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.issueDate} helperText={errors.issueDate} />
            <TextField label="Vendor Name" name="vendorName" value={form.vendorName} onChange={handleChange} error={!!errors.vendorName} helperText={errors.vendorName} />
            <TextField label="Material Name" name="materialName" value={form.materialName} onChange={handleChange} error={!!errors.materialName} helperText={errors.materialName} />
            <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleChange} error={!!errors.quantity} helperText={errors.quantity} />
            <TextField label="Unit" name="unit" value={form.unit} onChange={handleChange} error={!!errors.unit} helperText={errors.unit} />
            <TextField select label="Status" name="status" value={form.status} onChange={handleChange}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Issued">Issued</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
