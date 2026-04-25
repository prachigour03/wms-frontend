import React, { useState, useEffect } from "react";
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
      
      // Auto-propagate Work Order No
      if (name === "workOrderNo") {
        updated.items = prev.items.map(item => ({ ...item, workOrderNo: value }));
      }
      
      // Reset issuedTo if Type changes
      if (name === "type") {
        updated.issuedTo = "";
      }

      return updated;
    });
  };

  const handleItemChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newItems = [...formData.items];
    const val = type === "checkbox" ? checked : value;
    
    newItems[index] = { ...newItems[index], [name]: val };

    // Sync Item
    if (name === "itemCode" || name === "itemName") {
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
            newItems[index].availableQty = selectedItem.stock || 100; // Mock stock
        }
    }

    // Calculations
    const qtyField = moduleType === "issue" ? "qtyIssued" : "quantity";
    if (name === qtyField || name === "rate" || name === "taxRate" || name === "useRateCalc" || name === "itemCode") {
      const qty = parseFloat(newItems[index][qtyField] || 0);
      const rate = parseFloat(newItems[index].rate || 0);
      const taxPercent = parseFloat(newItems[index].taxRate || 0);
      
      const taxAmount = (qty * rate * taxPercent) / 100;
      const lineTotal = qty * rate + taxAmount;
      
      newItems[index].taxAmount = taxAmount.toFixed(2);
      newItems[index].lineTotal = lineTotal.toFixed(2);
    }

    setFormData((prev) => ({ ...prev, items: newItems }));
    updateTotals(newItems);
  };

  const updateTotals = (items) => {
    const grandTotal = items.reduce((sum, item) => sum + parseFloat(item.lineTotal || 0), 0);
    const totalTax = items.reduce((sum, item) => sum + parseFloat(item.taxAmount || 0), 0);
    const totalAmount = grandTotal - totalTax;

    setFormData((prev) => ({
      ...prev,
      grandTotal: grandTotal.toFixed(2),
      totalTax: totalTax.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { workOrderNo: prev.workOrderNo || "" }],
    }));
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: newItems }));
    updateTotals(newItems);
  };

  const isView = mode === "view";
  const isIssueModule = moduleType === "issue";

  return (
    <Box sx={{ p: 2, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="600" color="primary.main">{title}</Typography>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" color="textSecondary">STATUS</Typography>
            <Typography variant="h6" color="warning.main" fontWeight="700">{formData.status || "DRAFT"}</Typography>
          </Box>
        </Stack>

        <Grid container spacing={2.5}>
          {isIssueModule && (
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <TextField
                select fullWidth label="Type" name="type" size="small"
                value={formData.type} onChange={handleHeaderChange} disabled={isView}
              >
                <MenuItem value="Vendor">Vendor</MenuItem>
                <MenuItem value="Employee">Employee</MenuItem>
              </TextField>
            </Grid>
          )}

          {headerFields.map((field) => (
            <Grid item xs={12} sm={6} md={3} lg={2.4} key={field.name}>
              <TextField
                fullWidth label={field.label} name={field.name} size="small"
                value={formData[field.name] || ""} onChange={handleHeaderChange}
                disabled={isView || field.disabled} type={field.type || "text"}
                InputLabelProps={field.type?.includes("date") ? { shrink: true } : {}}
                select={field.select} required={field.required}
              >
                {field.name === "issuedTo" ? (
                    formData.type === "Vendor" 
                    ? masterData.vendors.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)
                    : masterData.employees.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)
                ) : field.options?.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="600">Line Items</Typography>
          {!isView && <Button startIcon={<AddIcon />} variant="contained" onClick={addItemRow} size="small">Add Row</Button>}
        </Stack>

        <TableContainer sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
          <Table stickyHeader size="small" sx={{ minWidth: 2500 }}>
            <TableHead>
              <TableRow sx={{ "& th": { bgcolor: "#f1f3f5", fontWeight: "bold", fontSize: "0.75rem" } }}>
                <TableCell width={50}>#</TableCell>
                <TableCell width={150}>Work Order No</TableCell>
                <TableCell width={180}>Item Code</TableCell>
                <TableCell width={200}>Item Name</TableCell>
                <TableCell width={250}>Item Description</TableCell>
                <TableCell width={150}>Lot Number</TableCell>
                <TableCell width={150}>Work Category</TableCell>
                <TableCell width={150}>Material Status</TableCell>
                {isIssueModule && <TableCell width={120}>Available Qty</TableCell>}
                <TableCell width={120}>{isIssueModule ? "Qty Issued" : "Quantity"}</TableCell>
                <TableCell width={100}>UOM</TableCell>
                <TableCell width={120}>Use Rate Calc</TableCell>
                <TableCell width={120}>Rate</TableCell>
                <TableCell width={120}>Amount</TableCell>
                {isIssueModule && (
                  <>
                    <TableCell width={150}>Service Type</TableCell>
                    <TableCell width={180}>Element/ODF/PO No</TableCell>
                    <TableCell width={150}>Ticket SR No</TableCell>
                    <TableCell width={150}>FAT No</TableCell>
                    <TableCell width={200}>Remarks</TableCell>
                  </>
                )}
                <TableCell width={150}>Store</TableCell>
                {!isView && <TableCell width={80} align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell><TextField fullWidth size="small" name="workOrderNo" value={item.workOrderNo || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                  <TableCell>
                    <TextField select fullWidth size="small" name="itemCode" value={item.itemCode || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView}>
                      {masterData.items.map(i => <MenuItem key={i.itemCode} value={i.itemCode}>{i.itemCode}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField select fullWidth size="small" name="itemName" value={item.itemName || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView}>
                      {masterData.items.map(i => <MenuItem key={i.itemName} value={i.itemName}>{i.itemName}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell><TextField fullWidth size="small" name="itemDescription" value={item.itemDescription || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                  <TableCell><TextField fullWidth size="small" name="lotNumber" value={item.lotNumber || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                  <TableCell>
                    <TextField select fullWidth size="small" name="workCategory" value={item.workCategory || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView}>
                      {masterData.workCategories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField select fullWidth size="small" name="materialStatus" value={item.materialStatus || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView}>
                      {masterData.materialStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  {isIssueModule && <TableCell><Typography variant="body2" color="primary" fontWeight="bold">{item.availableQty || 0}</Typography></TableCell>}
                  <TableCell>
                    <TextField fullWidth size="small" type="number" 
                        name={isIssueModule ? "qtyIssued" : "quantity"} 
                        value={item[isIssueModule ? "qtyIssued" : "quantity"] || 0} 
                        onChange={(e) => handleItemChange(index, e)} disabled={isView} 
                    />
                  </TableCell>
                  <TableCell>
                    <TextField select fullWidth size="small" name="uom" value={item.uom || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView}>
                      {masterData.uoms.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox name="useRateCalc" checked={!!item.useRateCalc} onChange={(e) => handleItemChange(index, e)} disabled={isView} size="small" />
                  </TableCell>
                  <TableCell><TextField fullWidth size="small" type="number" name="rate" value={item.rate || 0} onChange={(e) => handleItemChange(index, e)} disabled={isView || !item.useRateCalc} /></TableCell>
                  <TableCell><Typography variant="body2" fontWeight="600">{item.lineTotal || "0.00"}</Typography></TableCell>
                  
                  {isIssueModule && (
                    <>
                      <TableCell>
                        <TextField select fullWidth size="small" name="serviceType" value={item.serviceType || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView}>
                          {masterData.serviceTypes.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                      </TableCell>
                      <TableCell><TextField fullWidth size="small" name="elementNo" value={item.elementNo || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                      <TableCell><TextField fullWidth size="small" name="ticketSrNo" value={item.ticketSrNo || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                      <TableCell><TextField fullWidth size="small" name="fatNo" value={item.fatNo || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                      <TableCell><TextField fullWidth size="small" name="itemRemarks" value={item.itemRemarks || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView} /></TableCell>
                    </>
                  )}

                  <TableCell>
                    <TextField select fullWidth size="small" name="store" value={item.store || ""} onChange={(e) => handleItemChange(index, e)} disabled={isView}>
                      {masterData.stores.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </TableCell>
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
