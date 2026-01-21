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
  Pagination,
  Tooltip,
  Snackbar,
  Alert,
  Switch,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";

// API
import {
  createItem,
  getItems,
  updateItem,
  deleteItem,
} from "../../api/Item.api";
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';

export default function Items() {
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const [form, setForm] = useState({
    itemName: "",
    itemCode: "",
    itemGroupId: "",
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
        const response = await getItems();
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

  // -------------------------
  // VALIDATION
  // -------------------------
  const validate = () => {
    let temp = {};
    if (!form.itemName) temp.itemName = "Item Name required";
    if (!form.itemCode) temp.itemCode = "Item Code required";
    if (!form.itemGroupId) temp.itemGroupId = "Item Group required";
    if (!form.status) temp.status = "Status required";

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
        const response = await updateItem(editId, form);
        if (response.data.success) {
          setData((prev) =>
            prev.map((d) => (d.id === editId ? response.data.data : d))
          );
        }
      } else {
        const response = await createItem(form);
        if (response.data.success) {
          setData((prev) => [...prev, response.data.data]);
          dispatch(incrementNotification({
            title: 'Item added',
            message: response.data.data?.itemName ? `Item "${response.data.data.itemName}" added` : 'Item added',
            path: '/master/items',
            time: new Date().toISOString(),
          }));
          setSnack({ open: true, severity: 'success', message: 'Item added' });
        }
      }

      setOpen(false);
      setEditId(null);
      setForm({
        itemName: "",
        itemCode: "",
        itemGroupId: "",
        status: "Active",
      });
    } catch (error) {
      console.error("Failed to save item:", error.response?.data || error.message);
    }
  };

  // -------------------------
  // EDIT & DELETE
  // -------------------------
  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setErrors({});
    setOpen(true);
  };


  const handleDelete = async (id) => {
    try {
      const response = await deleteItem(id);
      if (response.data.success) {
        setData((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete item:", error.response?.data || error.message);
    }
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Items Master</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Item
        </Button>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Item Code</TableCell>
              <TableCell>Item Group</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row.itemName}</TableCell>
                <TableCell>{row.itemCode}</TableCell>
                <TableCell>{row.itemGroupId}</TableCell>
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

      {/* PAGINATION */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} />
      </Box>

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Item" : "Add Item"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Item Name"
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              error={!!errors.itemName}
              helperText={errors.itemName}
            />
            <TextField
              label="Item Code"
              name="itemCode"
              value={form.itemCode}
              onChange={handleChange}
              error={!!errors.itemCode}
              helperText={errors.itemCode}
            />
            <TextField
  label="Item Group"
  name="itemGroupId"          // ✅ FIXED
  value={form.itemGroupId}    // ✅ FIXED
  onChange={handleChange}
  error={!!errors.itemGroupId}
  helperText={errors.itemGroupId}
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
