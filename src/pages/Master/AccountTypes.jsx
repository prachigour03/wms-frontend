import React, { useState, useMemo, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { createNotification } from '../../features/notificationSlice';
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
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import { 
  createAccountType,
  getAccountTypes, 
  updateAccountType, 
  deleteAccountType,
} 
from "../../api/AccountType.api";


export default function AccountTypes() {
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
    accountTypeName: "",
    accountCode: "",
    description: "",
    status: "Active",
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
          const response = await getAccountTypes();
          if (response.data.success) setData(response.data.data);
        } catch (error) {
          console.error("Failed to fetch Account Types:", error.response?.data || error.message);
        }
      };
      fetchData();
    }, []);
  
    // -------------------- PAGINATION --------------------
      const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return data.slice(start, start + rowsPerPage);
      }, [data, page]);
    
      const pageCount = Math.ceil(data.length / rowsPerPage) || 1;

  const validateForm = () => {
    const temp = {};
    if (!form.accountTypeName) temp.accountTypeName = "Account Type Name is required";
    if (!form.accountCode) temp.accountCode = "Account Code is required";
    if (!form.status) temp.status = "Status is required";

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
      if (!validateForm()) return;
  
      try {
        const formData = { ...form, status: form.status ? "Active" : "Inactive" };
        if (editId) {
          const response = await updateAccountType(editId, formData);
          if (response.data.success) {
            setData((prev) =>
              prev.map((d) => (d.id === editId ? response.data.data : d))
            );
          }
        } else {
          const response = await createAccountType(form);
          if (response.data.success) {
            setData((prev) => [...prev, response.data.data]);
            dispatch(createNotification({
                        title: 'Account Type added',
                        message: response.data.data?.accountTypeName ? `Account Type "${response.data.data.accountTypeName}" added` : 'Account Type added',
                        path: '/master/AccountTypes',
                        time: new Date().toISOString(),
                      }));
                      setSnack({ open: true, severity: 'success', message: 'Account Type added' });
          }
        }
  
        setOpen(false);
        setEditId(null);
        setForm({
      accountTypeName: "",
      accountCode: "",
      description: "",
      status: "Active",
    });
      } catch (error) {
        const message = error.response?.data?.message || error.message;
      console.error("Failed to save account type:", error.response?.data || error.message);
      setSnack({ open: true, severity: 'error', message });
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
        const response = await deleteAccountType(id);
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
        <Typography variant="h5">Account Types Master</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Account Type
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Account Type Name</TableCell>
              <TableCell>Account Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, i) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                <TableCell>{row.accountTypeName}</TableCell>
                <TableCell>{row.accountCode}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.createdDate}</TableCell>
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
        <DialogTitle>{editId ? "Edit Account Type" : "Add Account Type"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Account Type Name"
              name="accountTypeName"
              value={form.accountTypeName}
              onChange={handleChange}
              error={!!errors.accountTypeName}
              helperText={errors.accountTypeName}
            />
            <TextField
              label="Account Code"
              name="accountCode"
              value={form.accountCode}
              onChange={handleChange}
              error={!!errors.accountCode}
              helperText={errors.accountCode}
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
            <Switch
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              error={!!errors.status}
              helperText={errors.status}
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

