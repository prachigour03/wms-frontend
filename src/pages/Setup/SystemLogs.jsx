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
  Pagination,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
  getSystemLogs,
  createSystemLog,
} from "../../api/SystemLogs.api";

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [filters, setFilters] = useState({
    user: "",
    level: "",
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    user: "",
    module: "",
    action: "",
    level: "",
    ip: "",
  });

  const [errors, setErrors] = useState({});

  // -------------------------
  // FETCH LOGS FROM BACKEND
  // -------------------------
  const fetchLogs = async () => {
    try {
      const res = await getSystemLogs(filters);
      if (res.data?.success) {
        setLogs(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch system logs", error);
    }
  };

  useEffect(() => {
        const fetchItems = async () => {
          try {
            const response = await getSystemLogs();
            if (response.data.success) {
              setLogs(response.data.data);
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
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return logs.slice(start, start + rowsPerPage);
  }, [logs, page]);

  const pageCount = Math.ceil(logs.length / rowsPerPage) || 1;

  // -------------------------
  // FORM HANDLERS
  // -------------------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let temp = {};
    if (!form.user) temp.user = "User is required";
    if (!form.module) temp.module = "Module is required";
    if (!form.action) temp.action = "Action is required";
    if (!form.level) temp.level = "Level is required";
    if (!form.ip) temp.ip = "IP Address is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await createSystemLog(form);
      setOpen(false);
      setForm({ user: "", module: "", action: "", level: "", ip: "" });
      fetchLogs();
    } catch (error) {
      console.error("Failed to create log", error);
    }
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h5">System Logs</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Log
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Search User"
          value={filters.user}
          onChange={(e) =>
            setFilters({ ...filters, user: e.target.value })
          }
        />
        <TextField
          select
          label="Log Level"
          value={filters.level}
          onChange={(e) =>
            setFilters({ ...filters, level: e.target.value })
          }
          sx={{ width: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Info">Info</MenuItem>
          <MenuItem value="Warning">Warning</MenuItem>
          <MenuItem value="Error">Error</MenuItem>
        </TextField>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.map((log, index) => (
              <TableRow key={log.id}>
                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>{log.date}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.level}</TableCell>
                <TableCell>{log.ip}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={(e, v) => setPage(v)}
        />
      </Box>

      {/* Add Log Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Add System Log</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="User" name="user" value={form.user} onChange={handleChange} error={!!errors.user} helperText={errors.user} />
            <TextField label="Module" name="module" value={form.module} onChange={handleChange} error={!!errors.module} helperText={errors.module} />
            <TextField label="Action" name="action" value={form.action} onChange={handleChange} error={!!errors.action} helperText={errors.action} />
            <TextField select label="Level" name="level" value={form.level} onChange={handleChange} error={!!errors.level} helperText={errors.level}>
              <MenuItem value="Info">Info</MenuItem>
              <MenuItem value="Warning">Warning</MenuItem>
              <MenuItem value="Error">Error</MenuItem>
            </TextField>
            <TextField label="IP Address" name="ip" value={form.ip} onChange={handleChange} error={!!errors.ip} helperText={errors.ip} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
