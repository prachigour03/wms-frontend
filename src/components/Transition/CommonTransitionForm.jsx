import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  Stack,
  Divider,
  Card,
  CardContent,
  Checkbox,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";

const CommonTransitionForm = ({
  title,
  headerFields,
  initialData,
  onSave,
  onCancel,
  mode = "edit",
  moduleType = "standard", // e.g., 'issue' for Issue Material
  masterData = {
    items: [],
    inventoryRows: [],
    issueData: [],
    consumptionData: [],
    workCategories: ["Category A", "Category B", "Category C"],
    materialStatuses: ["Good", "Damaged", "Refurbished"],
    stores: [],
    uoms: ["Nos", "Kg", "Mtr", "Set"],
    employees: [],
    vendors: [],
    serviceTypes: ["Service A", "Service B"],
  },
}) => {
  const [formData, setFormData] = useState({
    ...initialData,
    type: initialData?.type || "Vendor",
    items: initialData?.items || [{}],
  });
  const isView = mode === "view" || formData.status === "Confirmed" || formData.status === "Cancelled";
  const isIssueModule = moduleType === "issue";
  const isConsumptionModule = moduleType === "consumption";
  const isReturnModule = moduleType === "return";

  const getStatusColor = (status) => {
    switch (String(status || "DRAFT").toUpperCase()) {
      case "CONFIRMED": return "success.main";
      case "CANCELLED": return "error.main";
      case "ISSUED": return "info.main";
      case "DRAFT": return "warning.main";
      default: return "primary.main";
    }
  };

  const normalizeKey = (value) => String(value || "").trim().toLowerCase();
  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getCustomerInventoryRows = (customerValue) => {
    if (!isIssueModule) return [];
    const targetCustomer = normalizeKey(customerValue);
    if (!targetCustomer) return [];

    const rows = Array.isArray(masterData.inventoryRows) ? masterData.inventoryRows : [];
    return rows
      .filter(
        (row) =>
          normalizeKey(row.customer) === targetCustomer && toNumber(row.quantity) > 0
      )
      .sort((a, b) => {
        const woCompare = String(a.workOrderNo || "").localeCompare(String(b.workOrderNo || ""));
        if (woCompare !== 0) return woCompare;
        return String(a.itemCode || "").localeCompare(String(b.itemCode || ""));
      });
  };

  const getRecipientValue = (data) => data.issuedTo || data.consumedBy || data.returnFrom || "";

  const getIssuedMaterialRows = (recipientValue) => {
    if (!isConsumptionModule && !isReturnModule) return [];
    const target = normalizeKey(recipientValue);
    if (!target) return [];

    const issueData = Array.isArray(masterData.issueData) ? masterData.issueData : [];
    
    const consolidatedMap = new Map();
    issueData.forEach(issue => {
        const status = String(issue.status || "").toUpperCase();
        if (normalizeKey(issue.issuedTo) === target && (status === "CONFIRMED" || status === "ISSUED")) {
            const items = Array.isArray(issue.items) ? issue.items : [];
            items.forEach(item => {
                const key = `${normalizeKey(item.itemCode)}|${normalizeKey(item.workOrderNo)}`;
                const itemQty = toNumber(item.qtyIssued || item.quantity);
                if (consolidatedMap.has(key)) {
                    const existing = consolidatedMap.get(key);
                    existing.qtyIssued = toNumber(existing.qtyIssued) + itemQty;
                } else {
                    consolidatedMap.set(key, {
                        ...item,
                        qtyIssued: itemQty,
                        issueNo: issue.issueNo,
                        customer: issue.customer,
                        subsidiary: issue.subsidiary,
                        city: issue.city,
                        site: issue.site
                    });
                }
            });
        }
    });
    return Array.from(consolidatedMap.values());
  };

  const issueInventoryRows = getCustomerInventoryRows(formData.customer);
  const currentRecipient = getRecipientValue(formData);
  const consumptionIssuedRows = getIssuedMaterialRows(currentRecipient);

  const issueWorkOrderOptions = useMemo(() => {
    let rows = [];
    if (isIssueModule) {
      rows = issueInventoryRows;
    } else if (isConsumptionModule || isReturnModule) {
      rows = getIssuedMaterialRows(currentRecipient);
    }
    
    const map = new Map();
    rows.forEach((row) => {
      const key = String(row.workOrderNo || "").trim();
      if (key && !map.has(key)) map.set(key, key);
    });
    return Array.from(map.values());
  }, [isIssueModule, isConsumptionModule, isReturnModule, issueInventoryRows, currentRecipient, masterData.issueData]);

  const issueItemCodeOptions = useMemo(() => {
    const map = new Map();
    issueInventoryRows.forEach((row) => {
      const code = String(row.itemCode || "").trim();
      if (code && !map.has(code)) map.set(code, code);
    });
    return Array.from(map.values());
  }, [issueInventoryRows]);

  const issueItemNameOptions = useMemo(() => {
    const map = new Map();
    issueInventoryRows.forEach((row) => {
      const name = String(row.itemName || "").trim();
      if (name && !map.has(name)) map.set(name, name);
    });
    return Array.from(map.values());
  }, [issueInventoryRows]);

  const getMasterItem = (itemCode, itemName) =>
    masterData.items.find((item) => item.itemCode === itemCode) ||
    masterData.items.find((item) => item.itemName === itemName);

  const getConsumedQty = (itemCode, workOrderNo, issuedTo) => {
    const consumptionData = Array.isArray(masterData.consumptionData) ? masterData.consumptionData : [];
    let totalConsumed = 0;
    consumptionData.forEach(consumption => {
        const consumedBy = consumption.consumedBy || consumption.issuedTo;
        if (normalizeKey(consumedBy) === normalizeKey(issuedTo)) {
            const items = Array.isArray(consumption.items) ? consumption.items : [];
            items.forEach(item => {
                if (normalizeKey(item.itemCode) === normalizeKey(itemCode) && 
                    normalizeKey(item.workOrderNo) === normalizeKey(workOrderNo)) {
                    totalConsumed += toNumber(item.quantity || item.qtyConsumed);
                }
            });
        }
    });
    return totalConsumed;
  };

  const getReturnedQty = (itemCode, workOrderNo, issuedTo) => {
    const returnData = Array.isArray(masterData.returnData) ? masterData.returnData : [];
    let totalReturned = 0;
    returnData.forEach(ret => {
        const returnFrom = ret.returnFrom;
        if (normalizeKey(returnFrom) === normalizeKey(issuedTo)) {
            const items = Array.isArray(ret.items) ? ret.items : [];
            items.forEach(item => {
                if (normalizeKey(item.itemCode) === normalizeKey(itemCode) && 
                    normalizeKey(item.workOrderNo) === normalizeKey(workOrderNo)) {
                    totalReturned += toNumber(item.quantity);
                }
            });
        }
    });
    return totalReturned;
  };

  const calculateLineValues = (item) => {
    const qtyField = isIssueModule ? "qtyIssued" : (isConsumptionModule ? "qtyConsumed" : "quantity");
    const qty = toNumber(item[qtyField]);
    const rate = toNumber(item.rate);
    const taxPercent = toNumber(item.taxRate || 0);
    const taxAmount = (qty * rate * taxPercent) / 100;
    const lineTotal = qty * rate + taxAmount;

    if (isIssueModule || isConsumptionModule || isReturnModule) {
      const result = {
        ...item,
        taxAmount: taxAmount.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
      };
      if (isIssueModule) {
          result.qtyIssued = qty;
          result.quantity = qty;
      } else if (isConsumptionModule) {
          result.qtyConsumed = qty;
          result.quantity = qty;
          result.balanceQty = toNumber(item.qtyIssued) - qty;
          result.issuedAmount = (toNumber(item.qtyIssued) * rate).toFixed(2);
          result.consumedAmount = (qty * rate).toFixed(2);
          result.balanceAmount = (result.balanceQty * rate).toFixed(2);
      } else if (isReturnModule) {
          result.quantity = qty;
      }
      return result;
    }

    return {
      ...item,
      taxAmount: taxAmount.toFixed(2),
      lineTotal: lineTotal.toFixed(2),
    };
  };

  const mapIssuedToConsumptionItem = (issuedItem, existingItem = {}) => {
    const preparedItem = {
        ...existingItem,
        issueNo: issuedItem.issueNo || "",
        workOrderNo: issuedItem.workOrderNo || "",
        itemCode: issuedItem.itemCode || "",
        itemName: issuedItem.itemName || "",
        itemDescription: issuedItem.itemDescription || "",
        workCategory: issuedItem.workCategory || "",
        mbNumber: existingItem.mbNumber || "",
        orderNo: existingItem.orderNo || "",
        elementNo: issuedItem.elementNo || "",
        fatNo: issuedItem.fatNo || "",
        ticketSrNo: issuedItem.ticketSrNo || "",
        qtyIssued: toNumber(issuedItem.qtyIssued),
        qtyConsumed: toNumber(existingItem.qtyConsumed || 0),
        uom: issuedItem.uom || "",
        rate: toNumber(issuedItem.rate),
        ods: existingItem.ods || "",
        itemRemarks: existingItem.itemRemarks || "",
    };
    return calculateLineValues(preparedItem);
  };

  const mapIssuedToReturnItem = (issuedItem, existingItem = {}) => {
    const preparedItem = {
        ...existingItem,
        workOrderNo: issuedItem.workOrderNo || "",
        itemCode: issuedItem.itemCode || "",
        itemName: issuedItem.itemName || "",
        itemDescription: issuedItem.itemDescription || "",
        workCategory: issuedItem.workCategory || "",
        uom: issuedItem.uom || "",
        rate: toNumber(issuedItem.rate),
        quantity: toNumber(existingItem.quantity || 0),
        qtyIssued: toNumber(issuedItem.qtyIssued),
        itemRemarks: existingItem.itemRemarks || "",
        store: issuedItem.store || "",
    };
    return calculateLineValues(preparedItem);
  };


  const calculateTotals = (items) => {
    const safeItems = Array.isArray(items) ? items : [];
    const grandTotal = safeItems.reduce(
      (sum, item) => sum + toNumber(item.lineTotal),
      0
    );
    const totalTax = safeItems.reduce(
      (sum, item) => sum + toNumber(item.taxAmount),
      0
    );
    const totalAmount = grandTotal - totalTax;
    return {
      grandTotal: grandTotal.toFixed(2),
      totalTax: totalTax.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  };

  const mapInventoryRowToItem = (inventoryRow, existingItem = {}) => {
    const matchedItem = getMasterItem(inventoryRow.itemCode, inventoryRow.itemName) || {};
    const preparedItem = {
      ...existingItem,
      workOrderNo: inventoryRow.workOrderNo || existingItem.workOrderNo || "",
      itemCode: inventoryRow.itemCode || existingItem.itemCode || "",
      itemName: inventoryRow.itemName || existingItem.itemName || "",
      itemDescription:
        existingItem.itemDescription || matchedItem.description || "",
      hsnSac: existingItem.hsnSac || matchedItem.hsnCode || "",
      lotNumber: inventoryRow.lotNumber || existingItem.lotNumber || "",
      workCategory:
        inventoryRow.workCategory || existingItem.workCategory || "",
      materialStatus:
        inventoryRow.materialStatus || existingItem.materialStatus || "",
      availableQty: toNumber(inventoryRow.quantity),
      qtyIssued: toNumber(existingItem.qtyIssued),
      quantity: toNumber(existingItem.quantity || existingItem.qtyIssued),
      uom: existingItem.uom || matchedItem.uom || "",
      useRateCalc: existingItem.useRateCalc ?? true,
      rate:
        inventoryRow.rate != null
          ? toNumber(inventoryRow.rate)
          : toNumber(existingItem.rate || matchedItem.purchasePrice),
      store: inventoryRow.store || existingItem.store || formData.store || "",
      serviceType: existingItem.serviceType || "",
      elementNo: existingItem.elementNo || "",
      ticketSrNo: existingItem.ticketSrNo || "",
      fatNo: existingItem.fatNo || "",
      itemRemarks: existingItem.itemRemarks || "",
    };

    return calculateLineValues(preparedItem);
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        type: initialData.type || "Vendor",
        items: initialData.items && initialData.items.length > 0 ? initialData.items : [{}],
      });
    }
  }, [initialData]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "workOrderNo") {
        updated.items = prev.items.map(item => ({ ...item, workOrderNo: value }));
        
        if (isIssueModule && mode === "create" && value && updated.customer) {
          const customerRows = getCustomerInventoryRows(updated.customer);
          const filteredRows = customerRows.filter(
            row => normalizeKey(row.workOrderNo) === normalizeKey(value)
          );
          if (filteredRows.length > 0) {
            updated.items = filteredRows.map(row => mapInventoryRowToItem(row));
          }
          return { ...updated, ...calculateTotals(updated.items) };
        }
      }

      if (name === "type") {
        updated.issuedTo = "";
        updated.consumedBy = "";
        updated.returnFrom = "";
      }

      if ((isConsumptionModule || isReturnModule) && (name === "consumedBy" || name === "issuedTo" || name === "returnFrom") && mode === "create") {
          const issuedRows = getIssuedMaterialRows(value);
          const mapper = isConsumptionModule ? mapIssuedToConsumptionItem : mapIssuedToReturnItem;
          updated.items = issuedRows.length > 0
            ? (updated.workOrderNo 
                ? issuedRows.filter(r => normalizeKey(r.workOrderNo) === normalizeKey(updated.workOrderNo)).map(row => mapper(row))
                : issuedRows.map(row => mapper(row)))
            : [{}];
          return { ...updated, ...calculateTotals(updated.items) };
      }

      if ((isConsumptionModule || isReturnModule) && name === "workOrderNo" && mode === "create" && value && getRecipientValue(updated)) {
          const issuedRows = getIssuedMaterialRows(getRecipientValue(updated));
          const mapper = isConsumptionModule ? mapIssuedToConsumptionItem : mapIssuedToReturnItem;
          const filteredRows = issuedRows.filter(
            row => normalizeKey(row.workOrderNo) === normalizeKey(value)
          );
          if (filteredRows.length > 0) {
            updated.items = filteredRows.map(row => mapper(row));
          }
          return { ...updated, ...calculateTotals(updated.items) };
      }

      if (isIssueModule && name === "customer" && mode === "create") {
        const customerRows = getCustomerInventoryRows(value);
        updated.items = customerRows.length > 0
          ? customerRows.map((row) => mapInventoryRowToItem(row))
          : [{}];
        return { ...updated, ...calculateTotals(updated.items) };
      }

      return updated;
    });
  };

  const handleItemChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newItems = [...formData.items];
    let val = type === "checkbox" ? checked : value;
    
    if (isIssueModule && name === "qtyIssued") {
      const available = toNumber(newItems[index].availableQty);
      if (toNumber(val) > available) {
        alert(`Cannot issue more than available quantity (${available})`);
        val = available;
      }
    }

    if (isConsumptionModule && name === "qtyConsumed") {
        const issued = toNumber(newItems[index].qtyIssued);
        if (toNumber(val) > issued) {
            alert(`Cannot consume more than issued quantity (${issued})`);
            val = issued;
        }
    }

    if (isReturnModule && name === "quantity") {
        const issued = toNumber(newItems[index].qtyIssued);
        const recipient = getRecipientValue(formData);
        const consumed = getConsumedQty(newItems[index].itemCode, newItems[index].workOrderNo, recipient);
        const returned = getReturnedQty(newItems[index].itemCode, newItems[index].workOrderNo, recipient);
        const available = issued - consumed - returned;
        if (toNumber(val) > available) {
            alert(`Cannot return more than available quantity (${available})`);
            val = available;
        }
    }

    newItems[index] = { ...newItems[index], [name]: val };

    if (isIssueModule && name === "workOrderNo") {
      const matchedInventoryRow = issueInventoryRows.find(
        (row) =>
          normalizeKey(row.workOrderNo) === normalizeKey(val) &&
          (
            normalizeKey(row.itemCode) === normalizeKey(newItems[index].itemCode) ||
            normalizeKey(row.itemName) === normalizeKey(newItems[index].itemName)
          )
      );
      if (matchedInventoryRow) {
        newItems[index] = mapInventoryRowToItem(matchedInventoryRow, newItems[index]);
      }
    }

    if ((isConsumptionModule || isReturnModule) && (name === "itemCode" || name === "itemName")) {
        const rows = consumptionIssuedRows;
        const mapper = isConsumptionModule ? mapIssuedToConsumptionItem : mapIssuedToReturnItem;
        const matchedIssuedRow = rows.find(
            row => (name === "itemCode" ? normalizeKey(row.itemCode) : normalizeKey(row.itemName)) === normalizeKey(val)
        );
        if (matchedIssuedRow) {
            newItems[index] = mapper(matchedIssuedRow, newItems[index]);
        }
    }

    if (name === "itemCode" || name === "itemName") {
      let matchedInventoryRow = null;
      if (isIssueModule) {
        matchedInventoryRow =
          issueInventoryRows.find(
            (row) =>
              (name === "itemCode"
                ? normalizeKey(row.itemCode) === normalizeKey(value)
                : normalizeKey(row.itemName) === normalizeKey(value)) &&
              (!newItems[index].workOrderNo ||
                normalizeKey(row.workOrderNo) === normalizeKey(newItems[index].workOrderNo))
          ) ||
          issueInventoryRows.find((row) =>
            name === "itemCode"
              ? normalizeKey(row.itemCode) === normalizeKey(value)
              : normalizeKey(row.itemName) === normalizeKey(value)
          );
      }

      if (matchedInventoryRow) {
        newItems[index] = mapInventoryRowToItem(matchedInventoryRow, newItems[index]);
      } else if (!isConsumptionModule && !isReturnModule) {
        const selectedItem = masterData.items.find(i =>
          name === "itemCode" ? i.itemCode === value : i.itemName === value
        );
        if (selectedItem) {
          newItems[index].itemCode = selectedItem.itemCode;
          newItems[index].itemName = selectedItem.itemName;
          newItems[index].itemDescription = selectedItem.description;
          newItems[index].hsnSac = selectedItem.hsnCode;
          newItems[index].uom = selectedItem.uom;
          newItems[index].rate = selectedItem.purchasePrice || 0;
          if (newItems[index].availableQty == null) {
            newItems[index].availableQty = 0;
          }
        }
      }
    }

    const qtyField = isIssueModule ? "qtyIssued" : (isConsumptionModule ? "qtyConsumed" : "quantity");
    if (
      name === qtyField ||
      name === "rate" ||
      name === "taxRate" ||
      name === "useRateCalc" ||
      name === "itemCode" ||
      name === "itemName" ||
      name === "workOrderNo"
    ) {
      newItems[index] = calculateLineValues(newItems[index]);
    }

    setFormData((prev) => ({ ...prev, items: newItems }));
    updateTotals(newItems);
  };

  const updateTotals = (items) => {
    setFormData((prev) => ({ ...prev, ...calculateTotals(items) }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          workOrderNo: prev.workOrderNo || "",
          customer: prev.customer || "",
          availableQty: 0,
          qtyIssued: 0,
        },
      ],
    }));
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: newItems }));
    updateTotals(newItems);
  };

  return (
    <Box sx={{ p: 2, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="600" color="primary.main">{title}</Typography>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" color="textSecondary">STATUS</Typography>
            <Typography variant="h6" color={getStatusColor(formData.status)} fontWeight="700">{formData.status || "DRAFT"}</Typography>
          </Box>
        </Stack>

        <Grid container spacing={2.5}>
          {(isIssueModule || isConsumptionModule || isReturnModule) && (
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <TextField
                select fullWidth label="Type" name="type" size="small"
                value={formData.type || "Vendor"} onChange={handleHeaderChange} disabled={isView}
              >
                <MenuItem value="Vendor">Vendor</MenuItem>
                <MenuItem value="Employee">Employee</MenuItem>
              </TextField>
            </Grid>
          )}

          {headerFields.map((field) => {
            const isRecipientField = ["issuedTo", "consumedBy", "returnFrom"].includes(field.name);
            return (
              <Grid item xs={12} sm={6} md={3} lg={2.4} key={field.name}>
                <TextField
                  fullWidth 
                  label={isRecipientField ? (formData.type === "Vendor" ? "Vendor Name" : "Employee Name") : field.label} 
                  name={field.name} size="small"
                  value={formData[field.name] || (field.multiSelect ? [] : "")} 
                  onChange={handleHeaderChange}
                  disabled={isView || field.disabled} type={field.type || "text"}
                  InputLabelProps={field.type?.includes("date") ? { shrink: true } : {}}
                  select={field.select} required={field.required}
                  SelectProps={field.multiSelect ? { multiple: true } : {}}
                >
                  {isRecipientField ? (
                      formData.type === "Vendor" 
                      ? masterData.vendors.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)
                      : masterData.employees.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)
                  ) : field.name === "workOrderNo" && (isIssueModule || isConsumptionModule || isReturnModule) ? (
                    [<MenuItem key="none" value="">Select Work Order</MenuItem>, 
                     ...issueWorkOrderOptions.map(wo => <MenuItem key={wo} value={wo}>{wo}</MenuItem>)]
                  ) : field.options?.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="600">Line Items</Typography>
          {!isView && <Button startIcon={<AddIcon />} variant="contained" onClick={addItemRow} size="small">Add Row</Button>}
        </Stack>
        {isIssueModule && !formData.customer && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Select customer to auto-load available line items and work orders.
          </Typography>
        )}
        {isIssueModule && formData.customer && issueInventoryRows.length === 0 && (
          <Typography variant="body2" color="warning.main" sx={{ mb: 1.5 }}>
            No available inventory found for this customer.
          </Typography>
        )}

        <TableContainer sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
          <Table stickyHeader size="small" sx={{ minWidth: 2500 }}>
            <TableHead>
              <TableRow sx={{ "& th": { bgcolor: "#f1f3f5", fontWeight: "bold", fontSize: "0.75rem" } }}>
                <TableCell width={50}>#</TableCell>
                <TableCell width={150}>Work Order No</TableCell>
                <TableCell width={180}>Item Code</TableCell>
                <TableCell width={200}>Item Name</TableCell>
                <TableCell width={250}>Item Description</TableCell>
                {!isConsumptionModule && <TableCell width={150}>Lot Number</TableCell>}
                <TableCell width={150}>Work Category</TableCell>
                {isConsumptionModule && (
                    <>
                        <TableCell width={120}>MB Number</TableCell>
                        <TableCell width={120}>Order No</TableCell>
                        <TableCell width={150}>Element No/ODF/PO No</TableCell>
                        <TableCell width={120}>FAT Number</TableCell>
                        <TableCell width={120}>Ticket / SR No</TableCell>
                    </>
                )}
                {!isConsumptionModule && <TableCell width={150}>Material Status</TableCell>}
                {isIssueModule && <TableCell width={120}>Available Qty</TableCell>}
                {(isConsumptionModule || isReturnModule) && <TableCell width={120}>Qty Issued</TableCell>}
                {isReturnModule && <TableCell width={150}>Available Qty to Return</TableCell>}

                <TableCell width={120}>
                    {isIssueModule ? "Qty Issued" : (isConsumptionModule ? "Qty Consumed" : "Quantity")}
                </TableCell>
                
                {isConsumptionModule && <TableCell width={120}>Balance Qty</TableCell>}
                <TableCell width={100}>UOM</TableCell>
                {!isConsumptionModule && <TableCell width={120}>Use Rate Calc</TableCell>}
                <TableCell width={120}>Rate</TableCell>
                
                {isConsumptionModule && (
                    <>
                        <TableCell width={120}>Issued Amount</TableCell>
                        <TableCell width={120}>Consumed Amount</TableCell>
                        <TableCell width={120}>Balance Amount</TableCell>
                        <TableCell width={100}>ODS</TableCell>
                    </>
                )}
                {!isConsumptionModule && <TableCell width={120}>Amount</TableCell>}

                {!isConsumptionModule && isIssueModule && (
                  <>
                    <TableCell width={150}>Service Type</TableCell>
                    <TableCell width={180}>Element/ODF/PO No</TableCell>
                    <TableCell width={150}>Ticket SR No</TableCell>
                    <TableCell width={150}>FAT No</TableCell>
                  </>
                )}
                <TableCell width={200}>Remarks</TableCell>
                {!isConsumptionModule && <TableCell width={150}>Store</TableCell>}
                {!isView && <TableCell width={80} align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {isIssueModule || isConsumptionModule || isReturnModule ? (
                      <TextField
                        select={isIssueModule || isConsumptionModule || isReturnModule}
                        fullWidth
                        size="small"
                        name="workOrderNo"
                        value={item.workOrderNo || ""}
                        onChange={(e) => handleItemChange(index, e)}
                        disabled={isView || (isIssueModule && !formData.customer) || ((isConsumptionModule || isReturnModule) && !getRecipientValue(formData))}
                      >
                        {(isIssueModule || isConsumptionModule || isReturnModule) ? (
                            [<MenuItem key="none" value="">Select Work Order</MenuItem>,
                             ...issueWorkOrderOptions.map((workOrderNo) => (
                                <MenuItem key={workOrderNo} value={workOrderNo}>{workOrderNo}</MenuItem>
                             ))]
                        ) : null}
                      </TextField>
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        name="workOrderNo"
                        value={item.workOrderNo || ""}
                        onChange={(e) => handleItemChange(index, e)}
                        disabled={isView}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      name="itemCode"
                      value={item.itemCode || ""}
                      onChange={(e) => handleItemChange(index, e)}
                      disabled={isView || (isIssueModule && !formData.customer) || ((isConsumptionModule || isReturnModule) && !getRecipientValue(formData))}
                    >
                      {(isIssueModule ? issueItemCodeOptions : ((isConsumptionModule || isReturnModule) ? Array.from(new Set(consumptionIssuedRows.map(r => r.itemCode))) : masterData.items.map((i) => i.itemCode))).map((itemCode) => (
                        <MenuItem key={itemCode} value={itemCode}>{itemCode}</MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      name="itemName"
                      value={item.itemName || ""}
                      onChange={(e) => handleItemChange(index, e)}
                      disabled={isView || (isIssueModule && !formData.customer) || ((isConsumptionModule || isReturnModule) && !getRecipientValue(formData))}
                    >
                      {(isIssueModule ? issueItemNameOptions : ((isConsumptionModule || isReturnModule) ? Array.from(new Set(consumptionIssuedRows.map(r => r.itemName))) : masterData.items.map((i) => i.itemName))).map((itemName) => (
                        <MenuItem key={itemName} value={itemName}>{itemName}</MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell><TextField fullWidth size="small" name="itemDescription" value={item.itemDescription || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                  {!isConsumptionModule && <TableCell><TextField fullWidth size="small" name="lotNumber" value={item.lotNumber || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>}
                  <TableCell>
                    <TextField select fullWidth size="small" name="workCategory" value={item.workCategory || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView}>
                      {masterData.workCategories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  </TableCell>

                  {isConsumptionModule && (
                      <>
                        <TableCell><TextField fullWidth size="small" name="mbNumber" value={item.mbNumber || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                        <TableCell><TextField fullWidth size="small" name="orderNo" value={item.orderNo || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                        <TableCell><TextField fullWidth size="small" name="elementNo" value={item.elementNo || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                        <TableCell><TextField fullWidth size="small" name="fatNo" value={item.fatNo || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                        <TableCell><TextField fullWidth size="small" name="ticketSrNo" value={item.ticketSrNo || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                      </>
                  )}

                  {!isConsumptionModule && (
                      <TableCell>
                        <TextField select fullWidth size="small" name="materialStatus" value={item.materialStatus || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView}>
                          {masterData.materialStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                      </TableCell>
                  )}

                  {isIssueModule && <TableCell><Typography variant="body2" color="primary" fontWeight="bold">{item.availableQty || 0}</Typography></TableCell>}
                  {(isConsumptionModule || isReturnModule) && <TableCell><Typography variant="body2" color="primary" fontWeight="bold">{item.qtyIssued || 0}</Typography></TableCell>}
                  {isReturnModule && (
                    <TableCell>
                      <Typography variant="body2" color="secondary" fontWeight="bold">
                        {toNumber(item.qtyIssued) - getConsumedQty(item.itemCode, item.workOrderNo, getRecipientValue(formData))}
                      </Typography>
                    </TableCell>
                  )}
                  
                  <TableCell>
                    <TextField fullWidth size="small" type="number" 
                        name={isIssueModule ? "qtyIssued" : (isConsumptionModule ? "qtyConsumed" : "quantity")} 
                        value={item[isIssueModule ? "qtyIssued" : (isConsumptionModule ? "qtyConsumed" : "quantity")] || 0} 
                        onChange={(e) => handleItemChange(index, e)} disabled={isView} 
                    />
                  </TableCell>

                  {isConsumptionModule && <TableCell><Typography variant="body2" fontWeight="bold">{item.balanceQty || 0}</Typography></TableCell>}
                  
                  <TableCell>
                    <TextField select fullWidth size="small" name="uom" value={item.uom || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView}>
                      {masterData.uoms.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  
                  {!isConsumptionModule && (
                    <TableCell align="center">
                        <Checkbox name="useRateCalc" checked={!!item.useRateCalc} onChange={(e) => handleItemChange(index, e)} disabled={isView} size="small" />
                    </TableCell>
                  )}

                  <TableCell><TextField fullWidth size="small" type="number" name="rate" value={item.rate || 0} onChange={(e) => handleItemChange(index, e)} disabled={isView || (!isConsumptionModule && !item.useRateCalc)} /></TableCell>
                  
                  {isConsumptionModule && (
                      <>
                        <TableCell><Typography variant="body2">{item.issuedAmount || "0.00"}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontWeight="600">{item.consumedAmount || "0.00"}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{item.balanceAmount || "0.00"}</Typography></TableCell>
                        <TableCell><TextField fullWidth size="small" name="ods" value={item.ods || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                      </>
                  )}

                  {!isConsumptionModule && <TableCell><Typography variant="body2" fontWeight="600">{item.lineTotal || "0.00"}</Typography></TableCell>}
                  
                  {!isConsumptionModule && isIssueModule && (
                    <>
                      <TableCell>
                        <TextField select fullWidth size="small" name="serviceType" value={item.serviceType || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView}>
                          {masterData.serviceTypes.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                      </TableCell>
                      <TableCell><TextField fullWidth size="small" name="elementNo" value={item.elementNo || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                      <TableCell><TextField fullWidth size="small" name="ticketSrNo" value={item.ticketSrNo || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                      <TableCell><TextField fullWidth size="small" name="fatNo" value={item.fatNo || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                    </>
                  )}
                  
                  <TableCell><TextField fullWidth size="small" name="itemRemarks" value={item.itemRemarks || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>

                  {!isConsumptionModule && (
                      <TableCell>
                        <TextField select fullWidth size="small" name="store" value={item.store || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView}>
                          {masterData.stores.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                      </TableCell>
                  )}

                  {!isView && (
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => removeItemRow(index)} size="small"><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>Attachments</Typography>
            <Box sx={{ border: "2px dashed #dee2e6", p: 4, textAlign: "center", borderRadius: 2, bgcolor: "#f8f9fa" }}>
              <UploadIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
              <Typography variant="body1">Upload New Documents</Typography>
              <Typography variant="caption" color="textSecondary">Max size: 10MB • Multiple files allowed</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6">Total Amount:</Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="800">₹{formData.grandTotal || "0.00"}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>Back to List</Button>
        {!isView && <Button variant="contained" color="primary" onClick={() => onSave(formData)}>Save & Update</Button>}
      </Box>
    </Box>
  );
};

export default CommonTransitionForm;
