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

// Import API
import {
  getVendorIssueMaterials,
  createVendorIssueMaterial,
  updateVendorIssueMaterial,
  deleteVendorIssueMaterial,
} from "../../api/VendorissueMaterial.api"; // adjust path if needed
import { useDispatch } from 'react-redux';
import { createNotification } from '../../features/notificationSlice';
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const rowsPerPage = 5;

  const DEFAULT_FORM = {
    issueNo: "",
    issueDate: "",
    vendorName: "",
    materialName: "",
    quantity: "",
    unit: "",
    workOrder: "",
    customer: "",
    issuedBy: "",
    status: "Pending",
  };

  const [form, setForm] = useState(() => ({ ...DEFAULT_FORM }));

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


  const totalIssues = data.length;
  const draftIssues = data.filter((d) => d.status === "Pending").length;
  const confirmedIssues = data.filter((d) => d.status === "Completed").length;
  const issuedIssues = data.filter((d) => d.status === "Issued").length;

  const getRowType = (row) => (row.employeeName ? "Employee" : "Vendor");
  const getRowAmount = (row) =>
    Number(row.totalAmount ?? row.amount ?? row.total ?? 0) || 0;

  const totalAmount = data.reduce((sum, row) => sum + getRowAmount(row), 0);

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((row) => {
      const rowType = getRowType(row);
      const matchesType = typeFilter === "All" || rowType === typeFilter;
      const matchesStatus = statusFilter === "All" || row.status === statusFilter;
      const matchesSearch =
        !query ||
        [
          row.issueNo,
          row.vendorName,
          row.materialName,
          row.unit,
          row.workOrder,
          row.customer,
          row.issuedBy,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [data, search, statusFilter, typeFilter]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);

  const filteredPageCount =
    Math.ceil(filteredData.length / rowsPerPage) || 1;

  useEffect(() => {
    if (page > filteredPageCount) setPage(1);
  }, [filteredPageCount, page]);

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
          dispatch(createNotification({
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
      setForm({ ...DEFAULT_FORM });
    } catch (error) {
      console.error("Failed to save vendor issue:", error.response?.data || error.message);
    }
  };

  // -------------------------
  // EDIT & DELETE
  // -------------------------
  const handleEdit = (row) => {
    setForm({ ...DEFAULT_FORM, ...row });
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
        <Button variant="contained" sx={{ mb: 2 }} onClick={handleOpenCreate}>
          Add Vendor Issue
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }} columns={{ xs: 4, sm: 8, md: 10 }}>
        {[
          { label: "Total Issues", value: totalIssues },
          { label: "Total Amount", value: totalAmount.toLocaleString() },
          { label: "Draft Issues", value: draftIssues },
          { label: "Confirmed Issues", value: confirmedIssues },
          { label: "Issued Materials", value: issuedIssues },
        ].map((card) => (
          <Grid item xs={4} sm={4} md={2} key={card.label}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {card.label}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <TextField
          fullWidth
          placeholder="Search by doc ID, work order, or vendor/employee..."
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
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {["All", "Pending", "Issued", "Completed"].map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {["All", "Vendor", "Employee"].map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Doc ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Vendor/Employee</TableCell>
              <TableCell>Work Orders</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Issued By</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No vendor issue materials found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => {
                const rowType = getRowType(row);
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {row.issueNo}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.materialName || "Material"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.type || "Material"}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {rowType === "Employee"
                            ? row.employeeName
                            : row.vendorName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.quantity ? `${row.quantity} ${row.unit || ""}` : "-"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.workOrder || "-"}</TableCell>
                    <TableCell>{row.customer || "-"}</TableCell>
                    <TableCell>{row.issueDate}</TableCell>
                    <TableCell>{row.issuedBy || "-"}</TableCell>
                    <TableCell>{getRowAmount(row).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.status || "Pending"}
                        color={row.status === "Issued" ? "success" : "default"}
                        variant={row.status === "Issued" ? "filled" : "outlined"}
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
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Pagination count={filteredPageCount} page={page} onChange={(e, v) => setPage(v)} />
      </Box>

      {/* MODAL */}
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{editId ? "Edit Vendor Issue" : "Add Vendor Issue"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Issue No"
                name="issueNo"
                value={form.issueNo}
                onChange={handleChange}
                error={!!errors.issueNo}
                helperText={errors.issueNo}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                label="Issue Date"
                name="issueDate"
                value={form.issueDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.issueDate}
                helperText={errors.issueDate}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vendor Name"
                name="vendorName"
                value={form.vendorName}
                onChange={handleChange}
                error={!!errors.vendorName}
                helperText={errors.vendorName}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Material Name"
                name="materialName"
                value={form.materialName}
                onChange={handleChange}
                error={!!errors.materialName}
                helperText={errors.materialName}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <TextField
                label="Unit"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                error={!!errors.unit}
                helperText={errors.unit}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Issued">Issued</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Work Orders"
                name="workOrder"
                value={form.workOrder}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Customer"
                name="customer"
                value={form.customer}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Issued By"
                name="issuedBy"
                value={form.issuedBy}
                onChange={handleChange}
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
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

