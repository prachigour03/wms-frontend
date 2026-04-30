import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Pagination,
} from "@mui/material";
import { getInventoryCounts } from "../../api/InventoryCount.api";

const ROWS_PER_PAGE = 10;

const DEFAULT_SUMMARY = {
  inventoryCount: 0,
  itemsInInventory: 0,
  totalInventoryQuantity: 0,
  itemsBelowThreshold: 0,
  itemsOutOfStock: 0,
  lowStockThreshold: 10,
};

const STATUS_OPTIONS = ["all", "In Stock", "Low Stock", "Out of Stock"];

const formatNumber = (value) => {
  const number = Number(value) || 0;
  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatInventoryAge = (days) => {
  const safeDays = Number(days) || 0;
  if (safeDays <= 0) return "Today";
  return safeDays === 1 ? "1 day" : `${safeDays} days`;
};

const getStatusColor = (status) => {
  if (status === "In Stock") return "success";
  if (status === "Low Stock") return "warning";
  return "error";
};

const uniqueOptions = (rows, field) => {
  const values = new Set();
  rows.forEach((row) => {
    const val = String(row?.[field] || "").trim();
    if (val) values.add(val);
  });
  return ["all", ...Array.from(values).sort((a, b) => a.localeCompare(b))];
};

export default function InventoryCount() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    workCategory: "all",
    store: "all",
    city: "all",
    customer: "all",
    materialStatus: "all",
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await getInventoryCounts();
        const payloadRows = Array.isArray(response?.data?.data) ? response.data.data : [];
        setRows(payloadRows);
        setSummary({
          ...DEFAULT_SUMMARY,
          ...(response?.data?.summary || {}),
        });
      } catch (error) {
        setRows([]);
        setSummary(DEFAULT_SUMMARY);
        setSnack({
          open: true,
          severity: "error",
          message: error?.response?.data?.message || "Failed to load inventory data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const filterOptions = useMemo(
    () => ({
      workCategory: uniqueOptions(rows, "workCategory"),
      store: uniqueOptions(rows, "store"),
      city: uniqueOptions(rows, "city"),
      customer: uniqueOptions(rows, "customer"),
      materialStatus: uniqueOptions(rows, "materialStatus"),
    }),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase();

    return rows.filter((row) => {
      if (filters.status !== "all" && row.status !== filters.status) return false;
      if (filters.workCategory !== "all" && row.workCategory !== filters.workCategory) return false;
      if (filters.store !== "all" && row.store !== filters.store) return false;
      if (filters.city !== "all" && row.city !== filters.city) return false;
      if (filters.customer !== "all" && row.customer !== filters.customer) return false;
      if (filters.materialStatus !== "all" && row.materialStatus !== filters.materialStatus) return false;

      if (!searchText) return true;

      const haystack = [
        row.itemCode,
        row.itemName,
        row.customer,
        row.workOrderNo,
      ]
        .map((val) => String(val || "").toLowerCase())
        .join(" ");

      return haystack.includes(searchText);
    });
  }, [filters, rows]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredRows.slice(start, start + ROWS_PER_PAGE);
  }, [filteredRows, page]);

  const cardStats = [
    {
      label: "Inventory Count",
      value: summary.inventoryCount,
      note: "Items in inventory",
    },
    {
      label: "Total Inventory Quantity",
      value: formatNumber(summary.totalInventoryQuantity),
      note: "Total inventory quantity",
    },
    {
      label: "Items Below Threshold",
      value: summary.itemsBelowThreshold,
      note: `Threshold <= ${summary.lowStockThreshold}`,
    },
    {
      label: "Items Out of Stock",
      value: summary.itemsOutOfStock,
      note: "Quantity <= 0",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Inventory
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        {cardStats.map((card) => (
          <Paper key={card.label} sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {card.label}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
              {card.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {card.note}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(180px, 1fr))",
            xl: "repeat(7, minmax(140px, 1fr))",
          },
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <TextField
          placeholder="Search by Item Code, Item Name, Customer"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          size="small"
        />

        <TextField
          select
          label="Status"
          size="small"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Work Category"
          size="small"
          value={filters.workCategory}
          onChange={(e) => setFilters((prev) => ({ ...prev, workCategory: e.target.value }))}
        >
          {filterOptions.workCategory.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Store"
          size="small"
          value={filters.store}
          onChange={(e) => setFilters((prev) => ({ ...prev, store: e.target.value }))}
        >
          {filterOptions.store.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="City"
          size="small"
          value={filters.city}
          onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
        >
          {filterOptions.city.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Customer"
          size="small"
          value={filters.customer}
          onChange={(e) => setFilters((prev) => ({ ...prev, customer: e.target.value }))}
        >
          {filterOptions.customer.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Material Status"
          size="small"
          value={filters.materialStatus}
          onChange={(e) => setFilters((prev) => ({ ...prev, materialStatus: e.target.value }))}
        >
          {filterOptions.materialStatus.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredRows.length} records found
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small" sx={{ minWidth: 2200 }}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Item Code</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Work Order</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Work Category</TableCell>
              <TableCell>Material Status</TableCell>
              <TableCell>Lot Number</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Store</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Inventory Age</TableCell>
              <TableCell>Last Updated</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={17} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : paginatedRows.length > 0 ? (
              paginatedRows.map((row, index) => (
                <TableRow key={`${row.itemCode}-${row.workOrderNo}-${row.lotNumber}-${index}`}>
                  <TableCell>{(page - 1) * ROWS_PER_PAGE + index + 1}</TableCell>
                  <TableCell>{row.itemCode || "-"}</TableCell>
                  <TableCell>{row.itemName || "-"}</TableCell>
                  <TableCell>{row.workOrderNo || "-"}</TableCell>
                  <TableCell>{row.customer || "-"}</TableCell>
                  <TableCell>{row.workCategory || "-"}</TableCell>
                  <TableCell>{row.materialStatus || "-"}</TableCell>
                  <TableCell>{row.lotNumber || "-"}</TableCell>
                  <TableCell align="right">{formatNumber(row.quantity)}</TableCell>
                  <TableCell align="right">{formatNumber(row.rate)}</TableCell>
                  <TableCell align="right">{formatNumber(row.amount)}</TableCell>
                  <TableCell>{row.store || "-"}</TableCell>
                  <TableCell>{row.city || "-"}</TableCell>
                  <TableCell>{row.site || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.status || "Out of Stock"}
                      color={getStatusColor(row.status)}
                    />
                  </TableCell>
                  <TableCell>{formatInventoryAge(row.inventoryAgeDays)}</TableCell>
                  <TableCell>{formatDateTime(row.lastUpdated)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={17} align="center" sx={{ py: 4 }}>
                  No inventory records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        sx={{ mt: 2 }}
        count={pageCount}
        page={page}
        onChange={(_, value) => setPage(value)}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
