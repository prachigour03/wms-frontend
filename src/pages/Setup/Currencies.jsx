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
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import {
  getCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
} from "../../api/Currencies.api.js";
import { useDispatch } from 'react-redux';
import { createNotification } from '../../features/notificationSlice';

export default function Currencies() {
  const dispatch = useDispatch();

  const [data, setData] = useState(
    () => {
      const saved = localStorage.getItem("currencies");
      return saved ? JSON.parse(saved) : [];
    }
  );

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    symbol: "",
    country: "",
    decimals: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

   useEffect(() => {
      const fetchItems = async () => {
        try {
          const response = await getCurrencies();
          if (response.data.success) {
            setData(response.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch items:", error.response?.data || error.message);
        }
      };
  
      fetchItems();
    }, []);

  /* ---------------- PAGINATION ---------------- */
  const { pageCount, paginatedData } = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return {
      pageCount: Math.max(1, Math.ceil(data.length / rowsPerPage)),
      paginatedData: data.slice(start, start + rowsPerPage),
    };
  }, [data, page]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let temp = {};

    if (!form.code) temp.code = "Currency code is required";
    else if (form.code.length < 2 || form.code.length > 5)
      temp.code = "Code must be 2–5 characters";

    const duplicate = data.find(
      (c) => c.code === form.code && c.id !== editId
    );
    if (duplicate) temp.code = "Currency code already exists";

    if (!form.name) temp.name = "Currency name is required";
    if (!form.symbol) temp.symbol = "Symbol is required";
    if (!form.country) temp.country = "Country is required";

    if (!form.decimals) temp.decimals = "Decimals required";
    else if (isNaN(form.decimals)) temp.decimals = "Must be a number";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSave = async () => {
      if (!validateForm()) return;
  
      try {
        if (editId) {
          const response = await updateCurrency(editId, form);
          if (response.data.success) {
            setData((prev) =>
              prev.map((d) => (d.id === editId ? response.data.data : d))
            );
          }
        } else {
          const response = await createCurrency(form);
          if (response.data.success) {
            setData((prev) => [...prev, response.data.data]);
            dispatch(createNotification({
              severity: "success",
              message: "Currency created successfully",
              path: 'setup/Currencies',
              time: new Date().toISOString(),
              }));
              setSnack({ open: true, severity: 'success', message: 'Currency added' }); 
          }
        }
  
        setOpen(false);
        setEditId(null);
        setErrors({});
    setForm({
      code: "",
      name: "",
      symbol: "",
      country: "",
      decimals: "",
      status: "Active",
    });
    setErrors({});
    setOpen(true);
  } catch (error) {
      console.error("Failed to save Chart of Account", error.response?.data || error.message);
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
        const response = await deleteCurrency(id);
        if (response.data.success) {
          setData((prev) => prev.filter((d) => d.id !== id));
        }
      } catch (error) {
        console.error("Failed to delete Account", error.response?.data || error.message);
      }
    };


  /* ---------------- CSV IMPORT ---------------- */
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rows = event.target.result.split("\n").slice(1);

      const imported = rows
        .filter((r) => r.trim())
        .map((r) => {
          const [code, name, symbol, country, decimals, status] = r.split(",");
          return {
            code: code?.trim(),
            name: name?.trim(),
            symbol: symbol?.trim(),
            country: country?.trim(),
            decimals: decimals?.trim(),
            status: status?.trim() || "Active",
          };
        });

      try {
        await Promise.all(imported.map(currency => createCurrency(currency)));
        fetch();
        setSnack({ open: true, severity: "success", message: "CSV imported" });
      } catch (error) {
        console.error("Failed to import CSV:", error);
        setSnack({ open: true, severity: "error", message: "Failed to import CSV" });
      }
    };

    reader.readAsText(file);
  };

  /* ---------------- UI ---------------- */
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", justifyContent: "space-between"}}>
        <Typography variant="h5" mb={2}>Currencies</Typography>

              <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", justifyContent: "space-between"}}>
        <Button variant="contained" onClick={() => setOpen(true)}>Add Currency</Button>

        <Button variant="outlined" component="label" >
          Import CSV
          <input hidden type="file" accept=".csv" onChange={handleCSVUpload} />
        </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Decimals</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((c, i) => (
              <TableRow key={c.id}>
                <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                <TableCell>{c.code}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.symbol}</TableCell>
                <TableCell>{c.country}</TableCell>
                <TableCell>{c.decimals}</TableCell>
                <TableCell>{c.status}</TableCell>
                <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(c)}>
                      <ModeEdit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(c.id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>  
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} />
      </Box>

      {/* FORM MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Currency" : "Add Currency"}</DialogTitle>
        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column-reverse" gap={2}>
            {["code", "name", "symbol", "country", "decimals", "status"].map((field) => (
              <TextField
                key={field}
                label={field.toUpperCase()}
                name={field}
                value={form[field]}
                onChange={handleChange}
                error={!!errors[field]}
                helperText={errors[field]}
                fullWidth
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
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

