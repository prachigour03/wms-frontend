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
  Snackbar,
  Alert,
  Pagination,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import {
  createChartOfAccount,
  getChartOfAccounts,
  updateChartOfAccount,
  deleteChartOfAccount,
} from "../../api/ChartOfAccount.api.js";
import { useDispatch } from 'react-redux';
import { createNotification } from '../../features/notificationSlice';

export default function ChartOfAccounts() {
  const dispatch = useDispatch();


  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("accountTypes");
    return saved ? JSON.parse(saved) : [];
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    accountName: "",
    accountCode: "",
    accountTypeId: "",
    parentAccountId: "",
    openingBalance: "",
    status: true,
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  // -------------------- FETCH DATA --------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getChartOfAccounts();
        if (response.data.success) setData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch Chart Of Accounts", error.response?.data || error.message);
      }
    };
    fetchData();
  }, []);

  // -------------------- PAGINATION --------------------
  const { pageCount, paginatedAccounts } = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return {
      pageCount: Math.max(1, Math.ceil(data.length / rowsPerPage)),
      paginatedAccounts: data.slice(start, start + rowsPerPage),
    };
  }, [data, page]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleStatusChange = (e) => {
    setForm({ ...form, status: e.target.checked });
  };

  const validateForm = () => {
    const temp = {};
    if (!form.accountName) temp.accountName = "Account Name is required";
    if (!form.accountCode) temp.accountCode = "Account Code is required";
    if (!form.accountTypeId) temp.accountTypeId = "Account Type is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // -------------------- SAVE / UPDATE --------------------
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const dataToSend = { ...form, status: form.status ? "Active" : "Inactive" };
      if (editId) {
        const response = await updateChartOfAccount(editId, dataToSend);
        if (response.data.success) {
          setData((prev) =>
            prev.map((d) => (d.id === editId ? response.data.data : d))
          );
        }
      } else {
        const response = await createChartOfAccount(dataToSend);
        if (response.data.success) {
          setData((prev) => [...prev, response.data.data]);
          dispatch(createNotification({
            severity: "success",
            message: "Chart of Account created successfully",
            path: 'master/ChartOfAccounts',
            time: new Date().toISOString(),
            }));
            setSnack({ open: true, severity: 'success', message: 'Account Type added' });
        }
      }

      setOpen(false);
      setEditId(null);
      setErrors({});
      setForm({
        accountName: "",
        accountCode: "",
        accountTypeId: "",
        parentAccountId: "",
        openingBalance: "",
        status: true,
      });
    } catch (error) {
      console.error("Failed to save Chart of Account", error.response?.data || error.message);
    }
  };

  const handleEdit = (row) => {
    setForm({ ...row, status: row.status === "Active" });
    setEditId(row.id);
    setErrors({});
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteChartOfAccount(id);
      if (response.data.success) {
        setData((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete Account", error.response?.data || error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Chart Of Accounts</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Account
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Account Name</TableCell>
              <TableCell>Account Code</TableCell>
              <TableCell>Account Type</TableCell>
              <TableCell>Parent Account</TableCell>
              <TableCell>Opening Balance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedAccounts.map((row, i) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                <TableCell>{row.accountName}</TableCell>
                <TableCell>{row.accountCode}</TableCell>
                <TableCell>{row.accountTypeId}</TableCell>
                <TableCell>{row.parentAccountId}</TableCell>
                <TableCell>{row.openingBalance}</TableCell>
                <TableCell>{row.status}</TableCell>
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

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} />
      </Box>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Account" : "Add Account"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField autoFocus label="Account Name" name="accountName" value={form.accountName} onChange={handleChange} error={!!errors.accountName} helperText={errors.accountName} />
            <TextField label="Account Code" name="accountCode" value={form.accountCode} onChange={handleChange} error={!!errors.accountCode} helperText={errors.accountCode} />
            <TextField label="Account Type" name="accountTypeId" value={form.accountTypeId} onChange={handleChange} error={!!errors.accountTypeId} helperText={errors.accountTypeId} />
            <TextField label="Parent Account" name="parentAccountId" value={form.parentAccountId} onChange={handleChange} />
            <TextField label="Opening Balance" name="openingBalance" type="number" value={form.openingBalance} onChange={handleChange} />
            <FormControlLabel control={<Switch checked={form.status} onChange={handleStatusChange} />} label="Active" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

