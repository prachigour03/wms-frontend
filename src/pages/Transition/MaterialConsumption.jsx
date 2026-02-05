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
  Grid,
  Chip,
  InputAdornment,
  Stack,
} from "@mui/material";
import { Delete, ModeEdit, Search } from "@mui/icons-material";

import {
  getMaterialConsumptions,
  createMaterialConsumption,
  updateMaterialConsumption,
  deleteMaterialConsumption
} from "../../api/MaterialConsumption.api";
import { useDispatch } from 'react-redux';
import { createNotification } from '../../features/notificationSlice';

export default function MaterialConsumption() {
    const dispatch = useDispatch();
  const [data, setData] = useState(
    () => {
      const saved = localStorage.getItem("materialConsumptions");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const rowsPerPage = 5;

  const DEFAULT_FORM = {
    consumptionNo: "",
    date: "",
    type: "Vendor",
    vendorEmployee: "",
    workOrder: "",
    site: "",
    totalAmount: "",
    status: "Draft",
    itemName: "",
    quantity: "",
    department: "",
    warehouse: "",
    remarks: "",
  };

  const [form, setForm] = useState(() => ({ ...DEFAULT_FORM }));

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  // --------------------- FETCH DATA ---------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMaterialConsumptions();
        if (response.data.success) setData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch material consumptions:", error.response?.data || error.message);
      }
    };
    fetchData();
  }, []);

  // --------------------- FILTERS + PAGINATION ---------------------
  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((row) => {
      const rowStatus = row.status || "Draft";
      const matchesStatus = statusFilter === "All" || rowStatus === statusFilter;

      const matchesSearch =
        !query ||
        [row.consumptionNo, row.workOrder, row.vendorEmployee]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const rowDate = row.date || "";
      const matchesFrom = !fromDate || (rowDate && rowDate >= fromDate);
      const matchesTo = !toDate || (rowDate && rowDate <= toDate);

      return matchesStatus && matchesSearch && matchesFrom && matchesTo;
    });
  }, [data, search, statusFilter, fromDate, toDate]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);

  const pageCount = Math.ceil(filteredData.length / rowsPerPage) || 1;

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [pageCount, page]);

  // --------------------- VALIDATION ---------------------
  const validate = () => {
    let temp = {};
    if (!form.consumptionNo) temp.consumptionNo = "Consumption No required";
    if (!form.date) temp.date = "Date required";
    if (!form.itemName) temp.itemName = "Item required";
    if (!form.quantity || isNaN(form.quantity)) temp.quantity = "Valid quantity required";
    if (!form.department) temp.department = "Department required";
    if (!form.warehouse) temp.warehouse = "Warehouse required";
    if (form.totalAmount && isNaN(form.totalAmount)) temp.totalAmount = "Valid amount required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setForm({ ...DEFAULT_FORM });
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setErrors({});
  };

  // --------------------- SAVE / UPDATE ---------------------
  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editId) {
        const response = await updateMaterialConsumption(editId, form);
        if (response.data.success) {
          setData(prev => prev.map(d => (d.id === editId ? response.data.data : d)));
        }
      } else {
        const response = await createMaterialConsumption(form);
        if (response.data.success) {
          setData(prev => [...prev, response.data.data]);
          dispatch(createNotification({
            severity: "success",
            message: "Material Consumption created successfully",
            path: 'transition/MaterialConsumption',
            time: new Date().toISOString(),
            }));  
            setSnack({ open: true, severity: 'success', message: 'Material Consumption added' });
        }
      }

      setOpen(false);
      setEditId(null);
      setForm({ ...DEFAULT_FORM });
    } catch (error) {
      console.error("Failed to save material consumption:", error.response?.data || error.message);
    }
  };

  const handleEdit = (row) => {
    setForm({ ...DEFAULT_FORM, ...row });
    setEditId(row.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteMaterialConsumption(id);
      if (response.data.success) {
        setData(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete material consumption:", error.response?.data || error.message);
    }
  };

  // --------------------- RENDER ---------------------
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Material Consumption</Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={handleOpenCreate}>
          Add Material Consumption
        </Button>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by doc ID, work order, vendor/employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Status Filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {["All", "Draft", "Confirmed", "Cancelled"].map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type="date"
          label="From Date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 170 }}
        />
        <TextField
          type="date"
          label="To Date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 170 }}
        />
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Doc ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Vendor/Employee</TableCell>
              <TableCell>Work Orders</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Consumption Date</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No material consumptions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {row.consumptionNo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.itemName || "Item"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{row.type || "Vendor"}</TableCell>
                  <TableCell>{row.vendorEmployee || "-"}</TableCell>
                  <TableCell>{row.workOrder || "-"}</TableCell>
                  <TableCell>{row.site || "-"}</TableCell>
                  <TableCell>{row.date || "-"}</TableCell>
                  <TableCell>{Number(row.totalAmount ?? 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.status || "Draft"}
                      color={
                        row.status === "Confirmed"
                          ? "success"
                          : row.status === "Cancelled"
                          ? "error"
                          : "default"
                      }
                      variant={row.status === "Draft" ? "outlined" : "filled"}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(row)}><ModeEdit /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(row.id)}><Delete /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} />
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{editId ? "Edit Material Consumption" : "Add Material Consumption"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Doc ID"
                name="consumptionNo"
                value={form.consumptionNo}
                onChange={handleChange}
                error={!!errors.consumptionNo}
                helperText={errors.consumptionNo}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                label="Consumption Date"
                name="date"
                value={form.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.date}
                helperText={errors.date}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Type"
                name="type"
                value={form.type}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="Vendor">Vendor</MenuItem>
                <MenuItem value="Employee">Employee</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vendor/Employee"
                name="vendorEmployee"
                value={form.vendorEmployee}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Work Order"
                name="workOrder"
                value={form.workOrder}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Site"
                name="site"
                value={form.site}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total Amount"
                name="totalAmount"
                value={form.totalAmount}
                onChange={handleChange}
                error={!!errors.totalAmount}
                helperText={errors.totalAmount}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Confirmed">Confirmed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Item Name"
                name="itemName"
                value={form.itemName}
                onChange={handleChange}
                error={!!errors.itemName}
                helperText={errors.itemName}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                error={!!errors.quantity}
                helperText={errors.quantity}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
                error={!!errors.department}
                helperText={errors.department}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Warehouse"
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                error={!!errors.warehouse}
                helperText={errors.warehouse}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Remarks"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
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

