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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import {
  getInventoryCounts,
  createInventoryCount,
  updateInventoryCount,
  deleteInventoryCount,
} from "../../api/InventoryCount.api";
import { getwarehouses } from "../../api/warehouse.api";
import { getItems } from "../../api/Item.api";
import { useDispatch } from "react-redux";
import { createNotification} from "../../features/notificationSlice";

/* ---------------- VALIDATION ---------------- */
const validationSchema = Yup.object({
  itemCode: Yup.string().required("Item Code is required"),
  itemName: Yup.string().required("Item Name is required"),
  warehouse: Yup.string().required("Warehouse is required"),
  systemQty: Yup.number()
    .typeError("System Qty must be a number")
    .required("Required")
    .min(0, "Must be 0 or more"),
  countedQty: Yup.number()
    .typeError("Counted Qty must be a number")
    .required("Required")
    .min(0, "Must be 0 or more"),
  countDate: Yup.date().required("Count Date is required"),
});

/* ---------------- COMPONENT ---------------- */
export default function InventoryCount() {
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState(null);
  const [page, setPage] = useState(1);
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("countDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const rowsPerPage = 5;

  /* ---------------- NORMALIZE FORM VALUES ---------------- */
  const normalizeValues = (data = {}) => ({
    itemCode: data.itemCode || "",
    itemName: data.itemName || "",
    warehouse: data.warehouse || "",
    systemQty: data.systemQty || "",
    countedQty: data.countedQty || "",
    countDate: data.countDate || "",
  });

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inv, wh, itemsRes] = await Promise.all([
          getInventoryCounts(),
          getwarehouses(),
          getItems(),
        ]);
        setData(Array.isArray(inv?.data?.data) ? inv.data.data : []);
        setWarehouses(Array.isArray(wh?.data?.data) ? wh.data.data : []);
        setItems(Array.isArray(itemsRes?.data?.data) ? itemsRes.data.data : []);
      } catch (error) {
        setSnack({
          open: true,
          severity: "error",
          message: error.response?.data?.message || "Failed to load data",
        });
      }
    };
    fetchData();
  }, []);

  const hasItems = items.length > 0;

  const getVariance = (row) =>
    (Number(row.countedQty) || 0) - (Number(row.systemQty) || 0);
  const getVarianceStatus = (variance) =>
    variance === 0 ? "Matched" : variance > 0 ? "Excess" : "Short";
  const getResultColor = (result) => {
    if (result === "Matched") return "success";
    if (result === "Excess") return "warning";
    return "error";
  };

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, sortOrder]);

  const summaryCounts = useMemo(() => {
    const counts = { total: data.length, matched: 0, excess: 0, short: 0 };
    data.forEach((row) => {
      const result = getVarianceStatus(getVariance(row));
      if (result === "Matched") counts.matched += 1;
      if (result === "Excess") counts.excess += 1;
      if (result === "Short") counts.short += 1;
    });
    return counts;
  }, [data]);

  const filteredData = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = data.filter((row) => {
      if (!term) return true;
      const values = [
        row.itemCode,
        row.itemName,
        row.warehouse,
        row.countDate,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());
      return values.some((v) => v.includes(term));
    });

    const getSortValue = (row) => {
      if (sortBy === "countDate") {
        const dt = row.countDate ? new Date(row.countDate) : null;
        return dt && !Number.isNaN(dt.getTime()) ? dt.getTime() : 0;
      }
      if (sortBy === "itemName") return (row.itemName || "").toLowerCase();
      if (sortBy === "variance") return getVariance(row);
      if (sortBy === "result")
        return getVarianceStatus(getVariance(row));
      return 0;
    };

    filtered.sort((a, b) => {
      const aVal = getSortValue(a);
      const bVal = getSortValue(b);
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, search, sortBy, sortOrder]);

  /* ---------------- PAGINATION ---------------- */
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);
  const pageCount = Math.ceil(filteredData.length / rowsPerPage) || 1;

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (values, { resetForm }) => {
    try {
      if (editId) {
        const res = await updateInventoryCount(editId, values);
        setData((prev) => prev.map((d) => (d.id === editId ? res.data.data : d)));
        setSnack({ open: true, severity: "success", message: "Inventory Count updated successfully" });
      } else {
        const res = await createInventoryCount(values);
        setData((prev) => [...prev, res.data.data]);
        setSnack({ open: true, severity: "success", message: "Inventory Count added successfully" });
      }

      // Redux notification
      dispatch(
        createNotification({
          title: "Inventory Count",
          message: `Inventory Count ${editId ? "updated" : "created"} successfully`,
        })
      );

      resetForm();
      setEditId(null);
      setEditValues(null);
      setOpen(false);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, severity: "error", message: "Failed to save inventory count" });
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (row) => {
    setEditId(row.id);
    setEditValues(normalizeValues(row));
    setOpen(true);
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteInventoryCount(id);
      setData((prev) => prev.filter((d) => d.id !== id));
      setSnack({ open: true, severity: "success", message: "Inventory Count deleted successfully" });
    } catch (err) {
      console.error(err);
      setSnack({ open: true, severity: "error", message: "Failed to delete inventory count" });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Inventory Count</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditId(null);
            setEditValues(null);
            setOpen(true);
          }}
        >
          Add Inventory
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total Counts
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {summaryCounts.total}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Matched
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {summaryCounts.matched}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Excess
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {summaryCounts.excess}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Short
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {summaryCounts.short}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 1 }}>
        <TextField
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 260, flex: 1 }}
        />
        <TextField
          select
          label="Sort By"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="countDate">Count Date</MenuItem>
          <MenuItem value="itemName">Item Name</MenuItem>
          <MenuItem value="variance">Variance</MenuItem>
          <MenuItem value="result">Result</MenuItem>
        </TextField>
        <TextField
          select
          label="Sort Order"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="desc">Desc</MenuItem>
          <MenuItem value="asc">Asc</MenuItem>
        </TextField>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredData.length} records found
      </Typography>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Item Code</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Warehouse</TableCell>
              <TableCell>System Qty</TableCell>
              <TableCell>Counted Qty</TableCell>
              <TableCell>Variance</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>Count Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, i) => {
              const variance = getVariance(row);
              const result = getVarianceStatus(variance);
              return (
                <TableRow key={row.id}>
                  <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                  <TableCell>{row.itemCode}</TableCell>
                  <TableCell>{row.itemName}</TableCell>
                  <TableCell>{row.warehouse}</TableCell>
                  <TableCell>{row.systemQty}</TableCell>
                  <TableCell>{row.countedQty}</TableCell>
                  <TableCell>{variance}</TableCell>
                  <TableCell>
                    <Chip label={result} color={getResultColor(result)} size="small" />
                  </TableCell>
                  <TableCell>{row.countDate}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(row)}>
                      <ModeEdit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(row.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        sx={{ mt: 2 }}
        count={pageCount}
        page={page}
        onChange={(e, v) => setPage(v)}
      />

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit" : "Add"} Inventory</DialogTitle>

        <Formik
          initialValues={editValues || normalizeValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, handleChange, errors, touched, setFieldValue }) => (
            <Form>
              <DialogContent sx={{ display: "grid", gap: 2 }}>
                {hasItems ? (
                  <>
                    <FormControl
                      fullWidth
                      error={Boolean(touched.itemCode && errors.itemCode)}
                    >
                      <InputLabel>Item</InputLabel>
                      <Field
                        as={Select}
                        name="itemCode"
                        value={values.itemCode || ""}
                        label="Item"
                        onChange={(e) => {
                          const code = e.target.value;
                          handleChange(e);
                          const selected = items.find(
                            (item) => item.itemCode === code
                          );
                          if (selected) {
                            setFieldValue("itemName", selected.itemName || "");
                          }
                        }}
                      >
                        <MenuItem value="" disabled>
                          Select item
                        </MenuItem>
                        {items.map((item) => (
                          <MenuItem key={item.id} value={item.itemCode}>
                            {item.itemName} ({item.itemCode})
                          </MenuItem>
                        ))}
                      </Field>
                      <Typography variant="caption" color="error">
                        <ErrorMessage name="itemCode" />
                      </Typography>
                    </FormControl>

                    <Field
                      as={TextField}
                      name="itemName"
                      label="Item Name"
                      fullWidth
                      helperText={<ErrorMessage name="itemName" />}
                      error={Boolean(touched.itemName && errors.itemName)}
                      disabled
                    />
                  </>
                ) : (
                  <>
                    <Field
                      as={TextField}
                      name="itemCode"
                      label="Item Code"
                      fullWidth
                      helperText={<ErrorMessage name="itemCode" />}
                      error={Boolean(touched.itemCode && errors.itemCode)}
                    />
                    <Field
                      as={TextField}
                      name="itemName"
                      label="Item Name"
                      fullWidth
                      helperText={<ErrorMessage name="itemName" />}
                      error={Boolean(touched.itemName && errors.itemName)}
                    />
                  </>
                )}

                <FormControl
                  fullWidth
                  error={Boolean(touched.warehouse && errors.warehouse)}
                >
                  <InputLabel>Warehouse</InputLabel>
                  <Field
                    as={Select}
                    name="warehouse"
                    value={values.warehouse || ""}
                    label="Warehouse"
                    onChange={handleChange}
                  >
                    <MenuItem value="" disabled>
                      Select warehouse
                    </MenuItem>
                    {warehouses.map((w) => (
                      <MenuItem key={w.id} value={w.warehouseName}>
                        {w.warehouseName}
                      </MenuItem>
                    ))}
                  </Field>
                  <Typography variant="caption" color="error">
                    <ErrorMessage name="warehouse" />
                  </Typography>
                </FormControl>

                <Field
                  as={TextField}
                  name="systemQty"
                  type="number"
                  label="System Qty"
                  helperText={<ErrorMessage name="systemQty" />}
                  error={Boolean(touched.systemQty && errors.systemQty)}
                />
                <Field
                  as={TextField}
                  name="countedQty"
                  type="number"
                  label="Counted Qty"
                  helperText={<ErrorMessage name="countedQty" />}
                  error={Boolean(touched.countedQty && errors.countedQty)}
                />
                <Field
                  as={TextField}
                  name="countDate"
                  type="date"
                  label="Count Date"
                  InputLabelProps={{ shrink: true }}
                  helperText={<ErrorMessage name="countDate" />}
                  error={Boolean(touched.countDate && errors.countDate)}
                />
              </DialogContent>

              <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" variant="contained">
                  Save
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>

        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          <Alert severity={snack.severity}>{snack.message}</Alert>
        </Snackbar>
      </Dialog>
    </Box>
  );
}

