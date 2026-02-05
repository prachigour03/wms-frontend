import React, { useState, useMemo, useEffect } from "react";
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
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../api/Departments.api.js";
import { useDispatch } from 'react-redux';
import { createNotification } from '../../features/notificationSlice';

export default function Department() {
  const dispatch = useDispatch();

  const [departments, setDepartments] = useState(
    () => {
      const saved = localStorage.getItem("departments");
      return saved ? JSON.parse(saved) : [];
    }
  );

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    departmentCode: "",
    departmentName: "",
  });

  const [errors, setErrors] = useState({});

  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
          const fetchInventory = async () => {
            try {
              const response = await getDepartments();
              if (response.data && response.data.success) {
                setDepartments(response.data.data);
              } else if (Array.isArray(response.data)) {
                setDepartments(response.data);
              } else {
                console.error("Unexpected API response:", response.data);
              }
            } catch (error) {
              console.error("Failed to fetch inventory counts:", error.response?.data || error.message);
            }
          };
      
          fetchInventory();
        }, []);
  

  // Pagination
  const { pageCount, paginatedDepartments } = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return {
      pageCount: Math.max(1, Math.ceil(departments.length / rowsPerPage)),
      paginatedDepartments: departments.slice(start, start + rowsPerPage),
    };
  }, [departments, page]);

  // Handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let temp = {};

    if (!form.departmentCode)
      temp.departmentCode = "Department Code is required";
    else if (form.departmentCode.length < 2)
      temp.departmentCode = "Minimum 2 characters";

    const duplicate = departments.find(
      (d) => d.departmentCode === form.departmentCode && d.id !== editId
    );
    if (duplicate) temp.departmentCode = "Code already exists";

    if (!form.departmentName)
      temp.departmentName = "Department Name is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

 const handleSave = async () => {
         if (!validateForm()) return;
     
         try {
           if (editId) {
             const response = await updateDepartment(editId, form);
             if (response.data.success) {
               setDepartments((prev) =>
                 prev.map((d) => (d.id === editId ? response.data.data : d))
               );
             }
           } else {
             const response = await createDepartment(form);
             if (response.data.success) {
               setDepartments((prev) => [...prev, response.data.data]);
                dispatch(createNotification({
                  severity: "success",
                  message: "Department created successfully",
                  path: 'setup/Departments',
                  time: new Date().toISOString(),
                  }));
                  setSnack({ open: true, severity: 'success', message: 'Department added' });
             }
           }
     
           setOpen(false);
           setEditId(null);
    setForm({ departmentCode: "", departmentName: "" });
    setErrors({});
  } catch (error) {
      console.error("Failed to save inventory count:", error.response?.data || error.message);
    }
  };

  const handleEdit = (dept) => {
    setForm(dept);
    setEditId(dept.id);
    setErrors({});
    setOpen(true);
  };

   const handleDelete = async (id) => {
          try {
            const response = await deleteDepartment(id);
            if (response.data.success) {
              setDepartments((prev) => prev.filter((d) => d.id !== id));
            }
          } catch (error) {
            console.error("Failed to delete inventory count:", error.response?.data || error.message);
          }
        };


  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems:"center", justifyContent: "space-between"}}>
        <Typography variant="h5" sx={{ mb: 2 }}>
        Departments
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Add Department
      </Button>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Department Code</TableCell>
              <TableCell>Department Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDepartments.map((d, i) => (
              <TableRow key={d.id}>
                <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                <TableCell>{d.departmentCode}</TableCell>
                <TableCell>{d.departmentName}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(d)}>
                      <ModeEdit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(d.id)}>
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

      {/* ADD / EDIT MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Department" : "Add Department"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2, mt: 1 }}>
            <TextField
              label="Department Code"
              name="departmentCode"
              value={form.departmentCode}
              onChange={handleChange}
              error={!!errors.departmentCode}
              helperText={errors.departmentCode}
              fullWidth
            />
            <TextField
              label="Department Name"
              name="departmentName"
              value={form.departmentName}
              onChange={handleChange}
              error={!!errors.departmentName}
              helperText={errors.departmentName}
              fullWidth
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

      {/* SNACKBAR */}
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

