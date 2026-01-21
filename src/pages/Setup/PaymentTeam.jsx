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
  Pagination,
  Tooltip,
  MenuItem,
  Switch,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
// Import API
import {
  getPaymentTeams,
  createPaymentTeam,
  updatePaymentTeam,
  deletePaymentTeam,
} from "../../api/PaymentTeam.api";
export default function PaymentTeam() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const [form, setForm] = useState({
    teamCode: "",
    teamName: "",
    contactPerson: "",
    email: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  // -------------------------
    // FETCH INVENTORY COUNTS
    // -------------------------
    useEffect(() => {
      const fetchInventory = async () => {
        try {
          const response = await getPaymentTeams();
          if (response.data && response.data.success) {
            setData(response.data.data);
          } else if (Array.isArray(response.data)) {
            setData(response.data);
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

  const paginatedTeams = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page]);

  const pageCount = Math.ceil(data.length / rowsPerPage) || 1;

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validation
  const validateForm = () => {
    let temp = {};
    if (!form.teamCode) temp.teamCode = "Team code is required";
    if (!form.teamName) temp.teamName = "Team name is required";
    if (!form.contactPerson) temp.contactPerson = "Contact person is required";
    if (!form.email) temp.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      temp.email = "Invalid email format";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // Add
  const handleSave = async () => {
      if (!validateForm()) return;
  
      try {
        if (editId) {
          const response = await updatePaymentTeam(editId, form);
          if (response.data.success) {
            setData((prev) =>
              prev.map((d) => (d.id === editId ? response.data.data : d))
            );
          }
        } else {
          const response = await createPaymentTeam(form);
          if (response.data.success) {
            setData((prev) => [...prev, response.data.data]);
          }
        }
  
        setOpen(false);
        setEditId(null);
    setForm({
      teamCode: "",
      teamName: "",
      contactPerson: "",
      email: "",
      status: "Active",
    });
    setErrors({});
  } catch (error) {
      console.error("Failed to save inventory count:", error.response?.data || error.message);
    }
  };
  // Edit
  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setErrors({});
    setOpen(true);
  };
  // Delete
  const handleDelete = async (id) => {
      try {
        const response = await deletePaymentTeam(id);
        if (response.data.success) {
          setData((prev) => prev.filter((d) => d.id !== id));
        }
      } catch (error) {
        console.error("Failed to delete inventory count:", error.response?.data || error.message);
      }
    };
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Payment Team
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Add Payment Team
      </Button>
</Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Team Code</TableCell>
              <TableCell>Team Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedTeams.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>{row.teamCode}</TableCell>
                <TableCell>{row.teamName}</TableCell>
                <TableCell>{row.contactPerson}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.createdDate}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(row)}>
                      <ModeEdit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(row.id)}
                    >
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
        <DialogTitle>
          {editId ? "Edit Payment Team" : "Add Payment Team"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Team Code"
              name="teamCode"
              value={form.teamCode}
              onChange={handleChange}
              error={!!errors.teamCode}
              helperText={errors.teamCode}
              fullWidth
            />

            <TextField
              label="Team Name"
              name="teamName"
              value={form.teamName}
              onChange={handleChange}
              error={!!errors.teamName}
              helperText={errors.teamName}
              fullWidth
            />

            <TextField
              label="Contact Person"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              error={!!errors.contactPerson}
              helperText={errors.contactPerson}
              fullWidth
            />

            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
            />

            <Switch
              select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Switch>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
