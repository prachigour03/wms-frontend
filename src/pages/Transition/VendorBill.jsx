import Grid from "@mui/material/Grid";
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
  Divider,
  Chip,
  Stack,
  InputAdornment,
} from "@mui/material";
import { Delete, ModeEdit, FileDownload, Search } from "@mui/icons-material";

import {
  getVendorBills,
  createVendorBill,
  updateVendorBill,
  deleteVendorBill,
} from "../../api/VendorBill.api";
import { useDispatch } from "react-redux";
import { createNotification } from "../../features/notificationSlice";

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (value) => {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function VendorBills() {
  const dispatch = useDispatch();
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("vendorBills");
    return saved ? JSON.parse(saved) : [];
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const rowsPerPage = 5;

  const DEFAULT_FORM = {
    billNo: "",
    billDate: "",
    vendorName: "",
    invoiceNo: "",
    invoiceDate: "",
    amount: "",
    gstAmount: "",
    totalAmount: "",
    status: "Pending",
  };

  const [form, setForm] = useState(() => ({ ...DEFAULT_FORM }));

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getVendorBills();
        if (response.data.success) setData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch vendor bills:", error.response?.data || error.message);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((row) => {
      const matchesSearch =
        !query ||
        [row.billNo, row.vendorName, row.invoiceNo]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || row.status === statusFilter;

      const rowDate = row.billDate || "";
      const matchesFrom = !fromDate || (rowDate && rowDate >= fromDate);
      const matchesTo = !toDate || (rowDate && rowDate <= toDate);

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
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

  const validate = () => {
    let temp = {};
    if (!form.billNo) temp.billNo = "Bill No required";
    if (!form.billDate) temp.billDate = "Bill date required";
    if (!form.vendorName) temp.vendorName = "Vendor name required";
    if (!form.invoiceNo) temp.invoiceNo = "Invoice No required";
    if (!form.invoiceDate) temp.invoiceDate = "Invoice date required";
    if (!form.amount || isNaN(form.amount)) temp.amount = "Valid amount required";
    if (!form.gstAmount || isNaN(form.gstAmount)) temp.gstAmount = "Valid GST amount required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const calculateTotal = (amount, gst) => (Number(amount) || 0) + (Number(gst) || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };

    if (name === "amount" || name === "gstAmount") {
      updatedForm.totalAmount = calculateTotal(
        name === "amount" ? value : form.amount,
        name === "gstAmount" ? value : form.gstAmount
      );
    }

    setForm(updatedForm);
    setErrors({ ...errors, [name]: "" });
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editId) {
        const response = await updateVendorBill(editId, form);
        if (response.data.success) {
          setData((prev) => prev.map((d) => (d.id === editId ? response.data.data : d)));
          dispatch(
            createNotification({
              title: "Vendor Bill",
              message: "Vendor Bill updated successfully",
            })
          );
          setSnack({ open: true, severity: "success", message: "Vendor Bill updated" });
        }
      } else {
        const response = await createVendorBill(form);
        if (response.data.success) {
          setData((prev) => [...prev, response.data.data]);
          dispatch(
            createNotification({
              title: "Vendor Bill",
              message: "Vendor Bill created successfully",
            })
          );
          setSnack({ open: true, severity: "success", message: "Vendor Bill added" });
        }
      }

      setOpen(false);
      setEditId(null);
      setForm({ ...DEFAULT_FORM });
    } catch (error) {
      console.error("Failed to save vendor bill:", error.response?.data || error.message);
    }
  };

  const handleEdit = (row) => {
    setForm({ ...DEFAULT_FORM, ...row });
    setEditId(row.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteVendorBill(id);
      if (response.data.success) {
        setData((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete vendor bill:", error.response?.data || error.message);
    }
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

  const buildBillHtml = (bill) => {
    const safe = (value) => (value == null || value === "" ? "--" : value);
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Vendor Bill ${safe(bill.billNo)}</title>
    <style>
      * { box-sizing: border-box; font-family: Arial, sans-serif; }
      body { margin: 24px; color: #1f2933; }
      .header { display: flex; justify-content: space-between; align-items: center; }
      .title { font-size: 20px; font-weight: 700; }
      .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; background: #f0f4f8; }
      .section { margin-top: 16px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .label { color: #52606d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.02em; }
      .value { font-weight: 600; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      td { padding: 8px 0; border-bottom: 1px solid #e0e6ed; }
      td:last-child { text-align: right; }
      .total { font-weight: 700; }
      .note { margin-top: 16px; font-size: 12px; color: #7b8794; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="title">Vendor Bill</div>
      <div class="badge">${safe(bill.status || "Pending")}</div>
    </div>
    <div class="section">
      <div class="grid">
        <div>
          <div class="label">Bill No</div>
          <div class="value">${safe(bill.billNo)}</div>
        </div>
        <div>
          <div class="label">Bill Date</div>
          <div class="value">${safe(formatDate(bill.billDate))}</div>
        </div>
        <div>
          <div class="label">Vendor</div>
          <div class="value">${safe(bill.vendorName)}</div>
        </div>
        <div>
          <div class="label">Invoice</div>
          <div class="value">${safe(bill.invoiceNo)}</div>
          <div class="label" style="margin-top: 6px;">Invoice Date</div>
          <div class="value">${safe(formatDate(bill.invoiceDate))}</div>
        </div>
      </div>
    </div>
    <div class="section">
      <table>
        <tbody>
          <tr>
            <td>Base Amount</td>
            <td>${formatCurrency(bill.amount)}</td>
          </tr>
          <tr>
            <td>GST</td>
            <td>${formatCurrency(bill.gstAmount)}</td>
          </tr>
          <tr>
            <td class="total">Total</td>
            <td class="total">${formatCurrency(bill.totalAmount)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="note">This is a system generated bill and does not require a signature.</div>
    <script>
      window.onload = function () { window.print(); };
    </script>
  </body>
</html>`;
  };

  const handleDownload = (bill) => {
    const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!win) {
      setSnack({
        open: true,
        severity: "error",
        message: "Popup blocked. Please allow popups to download the bill.",
      });
      return;
    }
    win.document.open();
    win.document.write(buildBillHtml(bill));
    win.document.close();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Vendor Bills
        </Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={handleOpenCreate}>
          Add Vendor Bill
        </Button>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by bill no, vendor, or invoice..."
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
          sx={{ minWidth: 150 }}
        >
          {["All", "Pending", "Approved", "Paid"].map((status) => (
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
          sx={{ minWidth: 160 }}
        />
        <TextField
          type="date"
          label="To Date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Bill No</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Invoice No</TableCell>
              <TableCell>Bill Date</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No vendor bills found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow key={row.id} hover>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{row.billNo}</TableCell>
                  <TableCell>{row.vendorName}</TableCell>
                  <TableCell>{row.invoiceNo}</TableCell>
                  <TableCell>{formatDate(row.billDate)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.totalAmount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      color={row.status === "Paid" ? "success" : row.status === "Approved" ? "info" : "warning"}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Download">
                      <IconButton onClick={() => handleDownload(row)}>
                        <FileDownload />
                      </IconButton>
                    </Tooltip>
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} />
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>{editId ? "Edit Vendor Bill" : "Add Vendor Bill"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={ 12 } md={ 6 }>
              <Stack spacing={2}>
                <TextField
                  label="Bill No"
                  name="billNo"
                  value={form.billNo}
                  onChange={handleChange}
                  error={!!errors.billNo}
                  helperText={errors.billNo}
                />
                <TextField
                  type="date"
                  label="Bill Date"
                  name="billDate"
                  value={form.billDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.billDate}
                  helperText={errors.billDate}
                />
                <TextField
                  label="Vendor Name"
                  name="vendorName"
                  value={form.vendorName}
                  onChange={handleChange}
                  error={!!errors.vendorName}
                  helperText={errors.vendorName}
                />
                <TextField
                  label="Invoice No"
                  name="invoiceNo"
                  value={form.invoiceNo}
                  onChange={handleChange}
                  error={!!errors.invoiceNo}
                  helperText={errors.invoiceNo}
                />
                <TextField
                  type="date"
                  label="Invoice Date"
                  name="invoiceDate"
                  value={form.invoiceDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.invoiceDate}
                  helperText={errors.invoiceDate}
                />
                <TextField
                  label="Amount"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  error={!!errors.amount}
                  helperText={errors.amount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">INR</InputAdornment>,
                  }}
                />
                <TextField
                  label="GST Amount"
                  name="gstAmount"
                  value={form.gstAmount}
                  onChange={handleChange}
                  error={!!errors.gstAmount}
                  helperText={errors.gstAmount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">INR</InputAdornment>,
                  }}
                />
                <TextField
                  label="Total Amount"
                  value={form.totalAmount}
                  InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">INR</InputAdornment> }}
                />
                <TextField select label="Status" name="status" value={form.status} onChange={handleChange}>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                </TextField>
              </Stack>
            </Grid>

            <Grid item xs={ 12 } md={ 6 }>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={700}>
                    Vendor Bill
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={form.status || "Pending"} size="small" />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FileDownload />}
                      onClick={() => handleDownload(form)}
                    >
                      Download
                    </Button>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Bill No: <strong>{form.billNo || "--"}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bill Date: <strong>{formatDate(form.billDate)}</strong>
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={ 6 }>
                    <Typography variant="subtitle2" color="text.secondary">
                      From
                    </Typography>
                    <Typography fontWeight={600}>InfoBeans Pvt. Ltd.</Typography>
                    <Typography variant="body2" color="text.secondary">
                      301, Business Park
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Indore, MP 452001
                    </Typography>
                  </Grid>
                  <Grid item xs={ 6 }>
                    <Typography variant="subtitle2" color="text.secondary">
                      Bill To
                    </Typography>
                    <Typography fontWeight={600}>{form.vendorName || "--"}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Invoice No: {form.invoiceNo || "--"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Invoice Date: {formatDate(form.invoiceDate)}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Base Amount</TableCell>
                      <TableCell align="right">{formatCurrency(form.amount)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>GST</TableCell>
                      <TableCell align="right">{formatCurrency(form.gstAmount)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatCurrency(form.totalAmount)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.secondary">
                  This is a system generated bill and does not require a signature.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} sx={{ width: "100%" }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
