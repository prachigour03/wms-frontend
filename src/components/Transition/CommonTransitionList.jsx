import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";

const CommonTransitionList = ({ data, onAction, columns }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleAction = (action) => {
    onAction(action, selectedRow);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Draft": return "default";
      case "Confirmed": return "success";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f5f5f5" }}>
            {columns.map((col) => (
              <TableCell key={col.field} sx={{ fontWeight: "bold" }}>{col.label}</TableCell>
            ))}
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={col.field}>{row[col.field]}</TableCell>
              ))}
              <TableCell>
                <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
              </TableCell>
              <TableCell>
                <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleAction("view")}>View</MenuItem>
        {selectedRow?.status === "Draft" && [
          <MenuItem key="edit" onClick={() => handleAction("edit")}>Edit</MenuItem>,
          <MenuItem key="confirm" onClick={() => handleAction("confirm")}>Confirm</MenuItem>,
          <MenuItem key="delete" onClick={() => handleAction("delete")}>Delete</MenuItem>,
        ]}
        {selectedRow?.status !== "Cancelled" && (
          <MenuItem onClick={() => handleAction("cancel")}>Cancel</MenuItem>
        )}
      </Menu>
    </TableContainer>
  );
};

export default CommonTransitionList;
