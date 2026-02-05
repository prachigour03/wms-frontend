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
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid,
  Chip,
  InputAdornment,
  Stack,
} from "@mui/material";
import { Delete, ModeEdit, Search } from "@mui/icons-material";

import {
  getInwardChallans,
  createInwardChallan,
  updateInwardChallan,
  deleteInwardChallan,
} from "../../api/InwardChallan.api";
import { getVendors } from "../../api/vendor.api";
import { getItems } from "../../api/Item.api";
import { getwarehouses } from "../../api/warehouse.api";

import { useDispatch } from 'react-redux';
import { createNotification } from '../../features/notificationSlice';

export default function InwardChallan() {
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [workCategoryFilter, setWorkCategoryFilter] = useState("All");
  const [storeFilter, setStoreFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [materialStatusFilter, setMaterialStatusFilter] = useState("All");
  const rowsPerPage = 5;

  const DEFAULT_FORM = {
    challanNo: "",
    vendor: "",
    itemName: "",
    warehouse: "",
    challanDate: "",
    quantity: "",
    workOrder: "",
    workCategory: "",
    store: "",
    customer: "",
    city: "",
    site: "",
    vehicleNo: "",
    transporter: "",
    deliveryDate: "",
    grandTotal: "",
    materialStatus: "",
    status: "Pending",
  };

  const [form, setForm] = useState(() => ({ ...DEFAULT_FORM }));

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });  

  // ---------------------
  // FETCH DATA
  // ---------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [challanRes, vendorRes, itemRes, warehouseRes] = await Promise.all([
          getInwardChallans(),
          getVendors(),
          getItems(),
          getwarehouses(),
        ]);

        setData(challanRes.data?.data || []);
        setVendors(vendorRes.data?.data || []);
        setItems(itemRes.data?.data || []);
        setWarehouses(warehouseRes.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error.response?.data || error.message);
      }
    };
    fetchData();
  }, []);

  // ---------------------
  // SUMMARY + FILTERS
  // ---------------------
  const totalChallans = data.length;
  const totalInwardAmount = data.reduce(
    (sum, row) => sum + Number(row.grandTotal ?? 0),
    0
  );
  const draftCount = data.filter((d) => d.status === "Pending").length;
  const confirmedCount = data.filter((d) => d.status === "Received").length;
  const cancelledCount = data.filter((d) => d.status === "Cancelled").length;

  const uniqueOptions = (key) => {
    const values = data
      .map((row) => row[key])
      .filter((value) => value != null && String(value).trim() !== "");
    return ["All", ...Array.from(new Set(values))];
  };

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((row) => {
      const matchesSearch =
        !query ||
        [row.challanNo, row.workOrder, row.transporter]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || row.status === statusFilter;
      const matchesWorkCategory =
        workCategoryFilter === "All" || row.workCategory === workCategoryFilter;
      const matchesStore =
        storeFilter === "All" || row.store === storeFilter;
      const matchesCity =
        cityFilter === "All" || row.city === cityFilter;
      const matchesCustomer =
        customerFilter === "All" || row.customer === customerFilter;
      const matchesMaterialStatus =
        materialStatusFilter === "All" ||
        row.materialStatus === materialStatusFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesWorkCategory &&
        matchesStore &&
        matchesCity &&
        matchesCustomer &&
        matchesMaterialStatus
      );
    });
  }, [
    data,
    search,
    statusFilter,
    workCategoryFilter,
    storeFilter,
    cityFilter,
    customerFilter,
    materialStatusFilter,
  ]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);

  const pageCount = Math.ceil(filteredData.length / rowsPerPage) || 1;

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [pageCount, page]);

  // ---------------------
  // VALIDATION & CHANGE
  // ---------------------
  const validate = () => {
    let temp = {};
    if (!form.challanNo) temp.challanNo = "Challan No required";
    if (!form.vendor) temp.vendor = "Vendor required";
    if (!form.itemName) temp.itemName = "Item required";
    if (!form.warehouse) temp.warehouse = "Warehouse required";
    if (!form.challanDate) temp.challanDate = "Date required";
    if (!form.quantity || isNaN(form.quantity)) temp.quantity = "Valid quantity required";
    if (form.grandTotal && isNaN(form.grandTotal))
      temp.grandTotal = "Valid amount required";

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

  // ---------------------
  // SAVE / UPDATE
  // ---------------------
  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editId) {
        const response = await updateInwardChallan(editId, form);
        if (response.data.success) {
          setData(prev => prev.map(d => (d.id === editId ? response.data.data : d)));
        }
      } else {
        const response = await createInwardChallan(form);
        if (response.data.success) {
          setData(prev => [...prev, response.data.data]);
          dispatch(createNotification({
            severity: "success",
            message: "Inward Challan created successfully",
            path: 'transition/InwardChallan',
            time: new Date().toISOString(),
          }));
          setSnack({ open: true, severity: 'success', message: 'Inward Challan added' });
        }
      }

      setOpen(false);
      setEditId(null);
      setForm({ ...DEFAULT_FORM });
    } catch (error) {
      console.error("Failed to save inward challan:", error.response?.data || error.message);
    }
  };

  const handleEdit = (row) => {
    setForm({ ...DEFAULT_FORM, ...row });
    setEditId(row.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteInwardChallan(id);
      if (response.data.success) {
        setData(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete inward challan:", error.response?.data || error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Inward Challan Entry</Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={handleOpenCreate}>
          Add Inward Challan
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }} columns={{ xs: 4, sm: 8, md: 10 }}>
        {[
          { label: "Total Challans", value: totalChallans },
          { label: "Total Inward Amount", value: totalInwardAmount.toLocaleString() },
          { label: "Draft", value: draftCount },
          { label: "Confirmed", value: confirmedCount },
          { label: "Cancelled", value: cancelledCount },
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

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by challan number, work order, or transporter..."
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
          {["All", "Pending", "Received", "Cancelled"].map((status) => (
            <MenuItem key={status} value={status}>
              {status === "Pending" ? "Draft" : status === "Received" ? "Confirmed" : status}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Work Category"
          value={workCategoryFilter}
          onChange={(e) => setWorkCategoryFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {uniqueOptions("workCategory").map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Store"
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          {uniqueOptions("store").map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="City"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          {uniqueOptions("city").map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Customer"
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {uniqueOptions("customer").map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Material Status"
          value={materialStatusFilter}
          onChange={(e) => setMaterialStatusFilter(e.target.value)}
          sx={{ minWidth: 170 }}
        >
          {uniqueOptions("materialStatus").map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Challan No.</TableCell>
              <TableCell>Work Order</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Vehicle No.</TableCell>
              <TableCell>Delivery Date</TableCell>
              <TableCell>Grand Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No inward challans found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {row.challanNo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.vendor || "Vendor"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{row.workOrder || "-"}</TableCell>
                  <TableCell>{row.customer || "-"}</TableCell>
                  <TableCell>{row.city || "-"}</TableCell>
                  <TableCell>{row.site || "-"}</TableCell>
                  <TableCell>{row.vehicleNo || "-"}</TableCell>
                  <TableCell>{row.deliveryDate || row.challanDate || "-"}</TableCell>
                  <TableCell>
                    {Number(row.grandTotal ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        row.status === "Pending"
                          ? "Draft"
                          : row.status === "Received"
                          ? "Confirmed"
                          : row.status || "Draft"
                      }
                      color={
                        row.status === "Received"
                          ? "success"
                          : row.status === "Cancelled"
                          ? "error"
                          : "default"
                      }
                      variant={row.status === "Pending" ? "outlined" : "filled"}
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
        <DialogTitle>{editId ? "Edit Inward Challan" : "Add Inward Challan"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Challan No"
                name="challanNo"
                value={form.challanNo}
                onChange={handleChange}
                error={!!errors.challanNo}
                helperText={errors.challanNo}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                label="Challan Date"
                name="challanDate"
                value={form.challanDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.challanDate}
                helperText={errors.challanDate}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.vendor}>
                <InputLabel>Vendor</InputLabel>
                <Select name="vendor" value={form.vendor} onChange={handleChange} label="Vendor">
                  {vendors.map((v) => (
                    <MenuItem key={v.id} value={v.vendorName}>
                      {v.vendorName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.vendor ? <FormHelperText>{errors.vendor}</FormHelperText> : null}
              </FormControl>
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
                label="Work Order"
                name="workOrder"
                value={form.workOrder}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Work Category"
                name="workCategory"
                value={form.workCategory}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Store"
                name="store"
                value={form.store}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                name="city"
                value={form.city}
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
                label="Transporter"
                name="transporter"
                value={form.transporter}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Vehicle No."
                name="vehicleNo"
                value={form.vehicleNo}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                label="Delivery Date"
                name="deliveryDate"
                value={form.deliveryDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.itemName}>
                <InputLabel>Item</InputLabel>
                <Select name="itemName" value={form.itemName} onChange={handleChange} label="Item">
                  {items.map((i) => (
                    <MenuItem key={i.id} value={i.itemName}>
                      {i.itemName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.itemName ? <FormHelperText>{errors.itemName}</FormHelperText> : null}
              </FormControl>
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
              <FormControl fullWidth error={!!errors.warehouse}>
                <InputLabel>Warehouse</InputLabel>
                <Select name="warehouse" value={form.warehouse} onChange={handleChange} label="Warehouse">
                  {warehouses.map((w) => (
                    <MenuItem key={w.id} value={w.warehouseName}>
                      {w.warehouseName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.warehouse ? <FormHelperText>{errors.warehouse}</FormHelperText> : null}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Material Status"
                name="materialStatus"
                value={form.materialStatus}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Grand Total"
                name="grandTotal"
                value={form.grandTotal}
                onChange={handleChange}
                error={!!errors.grandTotal}
                helperText={errors.grandTotal}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={form.status} onChange={handleChange} label="Status">
                  <MenuItem value="Pending">Draft</MenuItem>
                  <MenuItem value="Received">Confirmed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
        </Snackbar>
      </Dialog>
    </Box>
  );
}

