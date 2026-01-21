import React, { useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Switch,
  Pagination,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ModeEdit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ROWS_PER_PAGE = 5;

const EMPTY_FORM = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  designation: "",
  status: "Active",
};

export default function EmployeeDetails({
  employees = [],
  onDelete,
  onUpdate,
}) {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  /* ---------------- FILTER + SORT + PAGINATION ---------------- */
  const { pageCount, paginatedEmployees } = useMemo(() => {
    let list = Array.isArray(employees) ? [...employees] : [];

    if (search) {
      list = list.filter((emp) =>
        `${emp.firstName || ""} ${emp.lastName || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (sort === "asc") {
      list.sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        )
      );
    }

    if (sort === "desc") {
      list.sort((a, b) =>
        `${b.firstName} ${b.lastName}`.localeCompare(
          `${a.firstName} ${a.lastName}`
        )
      );
    }

    const count = Math.max(1, Math.ceil(list.length / ROWS_PER_PAGE));
    const start = (page - 1) * ROWS_PER_PAGE;

    return {
      pageCount: count,
      paginatedEmployees: list.slice(start, start + ROWS_PER_PAGE),
    };
  }, [employees, search, sort, page]);

  /* ---------------- HANDLERS ---------------- */
  const handleEdit = (emp) => {
    setForm({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      designation: emp.designation,
      status: emp.status,
    });
    setEditId(emp.id);
    setOpen(true);
  };

  const handleSave = () => {
    onUpdate?.(form);
    setSnack({
      open: true,
      severity: "success",
      message: "Employee updated successfully",
    });
    setOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = () => {
    onDelete?.(deleteId);
    setConfirmOpen(false);
    setSnack({
      open: true,
      severity: "info",
      message: "Employee deleted",
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h5">Employee Management</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/employees-list")}
        >
          Add Employee
        </Button>
      </Box>

      {/* SEARCH + SORT */}
      <Box sx={{ display: "flex", gap: 2, px: 2, pb: 2 }}>
        <TextField
          size="small"
          label="Search name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          size="small"
          select
          SelectProps={{ native: true }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">No sort</option>
          <option value="asc">Name A–Z</option>
          <option value="desc">Name Z–A</option>
        </TextField>
      </Box>

      {/* TABLE */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Designation</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedEmployees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No employees found
              </TableCell>
            </TableRow>
          ) : (
            paginatedEmployees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.firstName}</TableCell>
                <TableCell>{emp.lastName}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.phone}</TableCell>
                <TableCell>{emp.designation}</TableCell>
                <TableCell>
                  <Switch checked={emp.status === "Active"} disabled />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(emp)}>
                      <ModeEdit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => {
                        setDeleteId(emp.id);
                        setConfirmOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* PAGINATION */}
      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
          />
        </Box>
      )}

      {/* EDIT MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          {[
            ["firstName", "First Name"],
            ["lastName", "Last Name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["designation", "Designation"],
          ].map(([key, label]) => (
            <TextField
              key={key}
              fullWidth
              margin="dense"
              label={label}
              value={form[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
            />
          ))}

          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">Active</Typography>
            <Switch
              checked={form.status === "Active"}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.checked ? "Active" : "Inactive",
                })
              }
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

      {/* DELETE CONFIRM */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
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
    </TableContainer>
  );
}
