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
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";

import {
  createItem,
  getItems,
  updateItem,
  deleteItem,
} from "../../api/Item.api.js";
import { getItemGroups } from "../../api/ItemGroup.api.js";

import { useDispatch } from "react-redux";
import { createNotification } from "../../features/notificationSlice";

export default function Items() {
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [groups, setGroups] = useState([]);
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
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    getItems().then(res => {
      if (res.data.success) setData(res.data.data);
    });

    getItemGroups().then(res => {
      if (res.data.success) setGroups(res.data.data);
    });
  }, []);

  // ---------------- PAGINATION ----------------
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page]);

  const pageCount = Math.ceil(data.length / rowsPerPage) || 1;
  const getGroupName = (row) => {
    if (row?.itemGroup?.groupName) return row.itemGroup.groupName;
    const byId = groups.find((g) => g.id === row.itemGroupId);
    if (byId?.groupName) return byId.groupName;
    return "-";
  };

  // ---------------- VALIDATION ----------------
  const validate = () => {
    let temp = {};
    if (!form.itemName) temp.itemName = "Item Name required";
    if (!form.itemCode) temp.itemCode = "Item Code required";
    if (!form.itemGroupId) temp.itemGroupId = "Item Group required";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (checked ? "Active" : "Inactive") : value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  // ---------------- SAVE / UPDATE ----------------
  const handleSave = async () => {
    if (!validate()) return;

    try {
      let response;
      if (editId) {
        response = await updateItem(editId, form);
        if (response.data.success) {
          setData(prev =>
            prev.map(d => (d.id === editId ? { ...d, ...form } : d))
          );
        }
      } else {
        response = await createItem(form);
        if (response.data.success) {
          setData(prev => [...prev, response.data.data]);
          dispatch(createNotification({
            title: "Item Added",
            message: `Item "${form.itemName}" added`,
            path: "/master/items",
            time: new Date().toISOString(),
          }));
          setSnack({ open: true, severity: "success", message: "Item added successfully" });
        }
      }

      setOpen(false);
      setEditId(null);
      setForm({ itemName: "", itemCode: "", itemGroupId: "", status: "Active" });
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------- EDIT / DELETE ----------------
  const handleEdit = (row) => {
    setForm({
      itemName: row.itemName,
      itemCode: row.itemCode,
      itemGroupId: row.itemGroupId,
      status: row.status,
    });
    setEditId(row.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const res = await deleteItem(id);
    if (res.data.success) {
      setData(prev => prev.filter(d => d.id !== id));
    }
  };

  // ---------------- RENDER ----------------
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Items Master</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Add Item</Button>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Item Code</TableCell>
              <TableCell>Item Group</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, i) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                <TableCell>{row.itemName}</TableCell>
                <TableCell>{row.itemCode}</TableCell>
                <TableCell>{getGroupName(row)}</TableCell>
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

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} />
      </Box>

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Item" : "Add Item"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Item Name" name="itemName" value={form.itemName} onChange={handleChange} error={!!errors.itemName} helperText={errors.itemName} />
            <TextField label="Item Code" name="itemCode" value={form.itemCode} onChange={handleChange} error={!!errors.itemCode} helperText={errors.itemCode} />

            <TextField
              select
              label="Item Group"
              name="itemGroupId"
              value={form.itemGroupId}
              onChange={handleChange}
              error={!!errors.itemGroupId}
              helperText={errors.itemGroupId}
            >
              {groups.map(g => (
                <MenuItem key={g.id} value={g.id}>{g.groupName}</MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={form.status === "Active"}
                  onChange={handleChange}
                  name="status"
                />
              }
              label="Active"
            />
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

