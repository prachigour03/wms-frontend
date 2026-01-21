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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import { Formik, Form, Field} from "formik";
import * as Yup from "yup";

import {
  getInventoryCounts,
  createInventoryCount,
  updateInventoryCount,
  deleteInventoryCount,
} from "../../api/InventoryCount.api";
import { getwarehouses } from "../../api/warehouse.api";
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';

/* ---------------- VALIDATION ---------------- */
const validationSchema = Yup.object({
  itemCode: Yup.string().required("Item Code is required"),
  itemName: Yup.string().required("Item Name is required"),
  warehouse: Yup.string().required("Warehouse is required"),
  systemQty: Yup.number().required("Required").positive(),
  countedQty: Yup.number().required("Required").positive(),
  countDate: Yup.date().required("Count Date is required"),
  status: Yup.boolean(),
});

/* ---------------- COMPONENT ---------------- */
export default function InventoryCount() {
  const dispatch = useDispatch();

  const [data, setData] = useState(
    () => {
      const saved = localStorage.getItem("inventoryCounts");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [warehouses, setWarehouses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState(null);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const normalizeValues = (data = {}) => ({
  itemCode: data.itemCode ?? "",
  itemName: data.itemName ?? "",
  warehouse: data.warehouse ?? "",
  systemQty: data.systemQty ?? "",
  countedQty: data.countedQty ?? "",
  countDate: data.countDate ?? "",
  status: data.status ?? true,
});

  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const inv = await getInventoryCounts();
        const wh = await getwarehouses();
        setData(Array.isArray(inv?.data?.data) ? inv.data.data : []);
        setWarehouses(Array.isArray(wh?.data?.data) ? wh.data.data : []);
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

  /* ---------------- PAGINATION ---------------- */
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (values, { resetForm }) => {
    try {
      if (editId) {
        const res = await updateInventoryCount(editId, values);
        setData((prev) =>
          prev.map((d) => (d.id === editId ? res.data.data : d))
        );
      } else {
        const res = await createInventoryCount(values);
        setData((prev) => [...prev, res.data.data]);
      dispatch(incrementNotification({
        severity: "success",
        message: `Inventory Count ${editId ? 'updated' : 'created'} successfully`,
        path: 'transition/InventoryCount',
        time: new Date().toISOString(),
        }));  
        setSnack({ open: true, severity: 'success', message: `Inventory Count ${editId ? 'updated' : 'added'}` });
      }
      resetForm();
      setEditId(null);
      setEditValues(null);
      setOpen(false);
    } catch (err) {
      console.error("Save failed", err);
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
    await deleteInventoryCount(id);
    setData((prev) => prev.filter((d) => d.id !== id));
  };

  /* ---------------- UI ---------------- */
  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between">
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
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, i) => (
              <TableRow key={row.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{row.itemCode}</TableCell>
                <TableCell>{row.itemName}</TableCell>
                <TableCell>{row.warehouse}</TableCell>
                <TableCell>{row.systemQty}</TableCell>
                <TableCell>{row.countedQty}</TableCell>
                <TableCell>{row.status ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(row)}>
                    <ModeEdit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(row.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        sx={{ mt: 2 }}
        count={Math.ceil(data.length / rowsPerPage)}
        page={page}
        onChange={(e, v) => setPage(v)}
      />

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit" : "Add"} Inventory</DialogTitle>

        <Formik 
        initialValues={editValues ? normalizeValues(editValues) : normalizeValues() }
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
        >
          {({ values, handleChange }) => (
            <Form>
              <DialogContent sx={{ display: "grid", gap: 2 }}>
                <Field as={TextField} name="itemCode" label="Item Code" fullWidth />
                <Field as={TextField} name="itemName" label="Item Name" fullWidth />

                <FormControl fullWidth>
                  <InputLabel>Warehouse</InputLabel>
                  <Field as={Select}
                  name="warehouse"
                  value={values.warehouse || ""}
                  label="Warehouse"
                  onChange={handleChange}
                  >
                    {warehouses.map((w) => (
                      <MenuItem key={w.id} value={w.warehouseName}>
                        {w.warehouseName}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>

                <Field as={TextField} name="systemQty" type="number" label="System Qty" />
                <Field as={TextField} name="countedQty" type="number" label="Counted Qty" />
                <Field
                  as={TextField}
                  name="countDate"
                  type="date"
                  label="Count Date"
                  InputLabelProps={{ shrink: true }}
                />

                <FormControlLabel
                  control={
                    <Switch
                    checked={Boolean(values.status)}
                    onChange={(e) =>
                      handleChange({
                        target: {
                        name: "status",
                        value: e.target.checked,
                      },
                    })
                    }
                    />
                  }
                  label={values.status ? "Active" : "Inactive"}
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
