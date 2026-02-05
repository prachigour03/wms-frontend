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
  Chip,
} from "@mui/material";

import { getSystemLogs } from "../../api/SystemLogs.api.js";
import { getAllUsersApi } from "../../api/users.api.js";

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // -------------------------
  // FETCH LOGS FROM BACKEND
  // -------------------------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [logRes, userRes] = await Promise.all([
          getSystemLogs(),
          getAllUsersApi(),
        ]);

        if (logRes.data?.success) {
          setLogs(logRes.data.data || []);
        }

        const userList = userRes?.users || [];
        setUsers(Array.isArray(userList) ? userList : []);
      } catch (error) {
        console.error("Failed to fetch system logs:", error);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, sortOrder]);

  const resolveUserName = (value) => {
    if (!value) return "N/A";
    const byId = users.find((u) => u.id === value);
    if (byId) return byId.name || byId.email || value;
    const byName = users.find(
      (u) => u.name === value || u.email === value
    );
    if (byName) return byName.name || byName.email || value;
    return value;
  };

  const getTimestamp = (log) => {
    const raw = log.createdAt || log.date;
    if (!raw) return "-";
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return raw;
    return dt.toLocaleString();
  };

  const getRecordId = (log) =>
    log.recordId || log.record_id || log.entityId || log.entity_id || "-";

  const getChangedFields = (log) => {
    if (log.changedFields) return log.changedFields;
    if (log.changed_fields) return log.changed_fields;
    const action = (log.action || "").toLowerCase();
    if (action.includes("create") || action.includes("add")) return "New record";
    if (action.includes("update") || action.includes("edit")) return "Updated fields";
    if (action.includes("delete") || action.includes("remove")) return "Deleted record";
    return "-";
  };

  const getStatusLabel = (log) => {
    if (log.status) return String(log.status).toUpperCase();
    const level = (log.level || "").toLowerCase();
    if (level === "error") return "ERROR";
    if (level === "warning") return "WARNING";
    if (level === "info") return "SUCCESS";
    return "SUCCESS";
  };

  const getStatusColor = (status) => {
    if (status === "ERROR") return "error";
    if (status === "WARNING") return "warning";
    return "success";
  };

  const getDuration = (log) => {
    const raw =
      log.duration ||
      log.durationMs ||
      log.duration_ms ||
      log.executionTime;
    if (raw == null) return "N/A";
    if (typeof raw === "number") return `${raw} ms`;
    return String(raw);
  };
    
  // -------------------------
  // PAGINATION
  // -------------------------
  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();
    const sorted = [...logs].filter((log) => {
      if (!term) return true;
      const values = [
        log.user,
        log.module,
        log.action,
        log.level,
        log.ip,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());
      return values.some((v) => v.includes(term));
    });

    const getSortValue = (log) => {
      if (sortBy === "timestamp") {
        const raw = log.createdAt || log.date;
        const dt = raw ? new Date(raw) : null;
        return dt && !Number.isNaN(dt.getTime()) ? dt.getTime() : 0;
      }
      if (sortBy === "model") return (log.module || "").toLowerCase();
      if (sortBy === "action") return (log.action || "").toLowerCase();
      if (sortBy === "user") return resolveUserName(log.user).toLowerCase();
      return 0;
    };

    sorted.sort((a, b) => {
      const aVal = getSortValue(a);
      const bVal = getSortValue(b);
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [logs, search, sortBy, sortOrder, users]);

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredLogs.slice(start, start + rowsPerPage);
  }, [filteredLogs, page]);

  const pageCount = Math.ceil(filteredLogs.length / rowsPerPage) || 1;

  const actionCounts = useMemo(() => {
    const counts = { create: 0, update: 0, delete: 0 };
    logs.forEach((log) => {
      const action = (log.action || "").toLowerCase();
      if (action.includes("create") || action.includes("add") || action.includes("new")) {
        counts.create += 1;
        return;
      }
      if (action.includes("update") || action.includes("edit")) {
        counts.update += 1;
        return;
      }
      if (action.includes("delete") || action.includes("remove")) {
        counts.delete += 1;
      }
    });
    return counts;
  }, [logs]);

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">System Logs</Typography>
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
            Total Logs
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {logs.length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Create Operations
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {actionCounts.create}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Update Operations
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {actionCounts.update}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Delete Operations
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {actionCounts.delete}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 1 }}>
        <TextField
          placeholder="Search logs..."
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
          <MenuItem value="timestamp">Timestamp</MenuItem>
          <MenuItem value="model">Model</MenuItem>
          <MenuItem value="action">Action</MenuItem>
          <MenuItem value="user">Performed By</MenuItem>
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
        {filteredLogs.length} logs found
      </Typography>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Record ID</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Changed Fields</TableCell>
              <TableCell>Performed By</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{getTimestamp(log)}</TableCell>
                <TableCell>{log.module || "-"}</TableCell>
                <TableCell>{getRecordId(log)}</TableCell>
                <TableCell>{log.action || "-"}</TableCell>
                <TableCell>{getChangedFields(log)}</TableCell>
                <TableCell>{resolveUserName(log.user)}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(log)}
                    color={getStatusColor(getStatusLabel(log))}
                    size="small"
                  />
                </TableCell>
                <TableCell>{getDuration(log)}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedLog(log);
                      setDetailsOpen(true);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
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
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth>
        <DialogTitle>Log Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 1.5, mt: 1 }}>
            <Typography variant="body2">
              <strong>Timestamp:</strong> {selectedLog ? getTimestamp(selectedLog) : "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Model:</strong> {selectedLog?.module || "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Action:</strong> {selectedLog?.action || "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Performed By:</strong> {selectedLog ? resolveUserName(selectedLog.user) : "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {selectedLog ? getStatusLabel(selectedLog) : "-"}
            </Typography>
            <Typography variant="body2">
              <strong>IP:</strong> {selectedLog?.ip || "-"}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
