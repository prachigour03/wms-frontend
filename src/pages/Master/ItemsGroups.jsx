import React, { useState, useMemo, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';
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
// API
import {
  createItemGroup,
  getItemGroups,
  updateItemGroup,
  deleteItemGroup,
} from "../../api/ItemGroup.api";

export default function ItemsGroups() {
  const dispatch = useDispatch();

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("itemGroups");
    return saved ? JSON.parse(saved) : [];
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    groupCode: "",
    groupName: "",
    description: "",
    status: true,
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
        const response = await getItemGroups();
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


  // Form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleStatusChange = (e) => {
    setForm({ ...form, status: e.target.checked });
    setErrors({ ...errors, status: "" });
  };

  // Validation
  const validateForm = () => {
    const tempErrors = {};
    if (!form.groupCode) tempErrors.groupCode = "Group Code is required";
    if (!form.groupName) tempErrors.groupName = "Group Name is required";
    if (typeof form.status !== 'boolean')
      tempErrors.status = "Status must be a boolean";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
// -------------------------
  // SAVE / UPDATE
  // -------------------------
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const formData = { ...form, status: form.status ? "Active" : "Inactive" };
      if (editId) {
        const response = await updateItemGroup(editId, formData);
        if (response.data.success) {
          setData((prev) =>
            prev.map((d) => (d.id === editId ? response.data.data : d))
          );
        }
      } else {
        const response = await createItemGroup(formData);
        if (response.data.success) {
          setData((prev) => [...prev, response.data.data]);
          dispatch(incrementNotification({
            title: 'Item Group added',
            message: response.data.data?.groupName ? `Item Group "${response.data.data.groupName}" added` : 'Item Group added',
            path: '/master/ItemsGroups',
            time: new Date().toISOString(),
          }));
          setSnack({ open: true, severity: 'success', message: 'Item Group added' });
        }
      }

      setOpen(false);
    setEditId(null);
    setForm({
      groupCode: "",
      groupName: "",
      description: "",
      status: true,
    });
  } catch (error) {
      const message = error.response?.data?.message || error.message;
      console.error("Failed to save item:", error.response?.data || error.message);
      setSnack({ open: true, severity: 'error', message });
    }
  };

  const handleEdit = (group) => {
    setForm({
      ...group,
      status: group.status === "Active" || group.status === true,
    });
    setEditId(group.id);
    setErrors({});
    setOpen(true);
  }; 

    const handleDelete = async (id) => {
      try {
        const response = await deleteItemGroup(id);
        if (response.data.success) {
          setData((prev) => prev.filter((d) => d.id !== id));
        }
      } catch (error) {
        console.error("Failed to delete item:", error.response?.data || error.message);
      }
    };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Item Groups
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Add Item Group
      </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Group Code</TableCell>
              <TableCell>Group Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((group, index) => (
              <TableRow key={group.id}>
                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>{group.groupCode}</TableCell>
                <TableCell>{group.groupName}</TableCell>
                <TableCell>{group.description}</TableCell>
                <TableCell>{group.status ? "Active" : "Inactive"}</TableCell>
                <TableCell>{group.createdDate}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(group)}>
                      <ModeEdit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(group.id)}>
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
        <Pagination
          count={pageCount}
          page={page}
          onChange={(e, v) => setPage(v)}
        />
      </Box>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Item Group" : "Add Item Group"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Group Code"
              name="groupCode"
              value={form.groupCode}
              onChange={handleChange}
              error={!!errors.groupCode}
              helperText={errors.groupCode}
              autoFocus
            />
            <TextField
              label="Group Name"
              name="groupName"
              value={form.groupName}
              onChange={handleChange}
              error={!!errors.groupName}
              helperText={errors.groupName}
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.status}
                  onChange={handleStatusChange}
                />
              }
              label="Active"
            />
            {errors.status && (
              <Typography color="error" variant="body2">
                {errors.status}
              </Typography>
            )}
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
