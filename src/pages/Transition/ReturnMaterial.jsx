import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Stack, Snackbar, Alert } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import CommonTransitionList from "../../components/Transition/CommonTransitionList";
import CommonTransitionForm from "../../components/Transition/CommonTransitionForm";
import {
  getReturnMaterials,
  getReturnMaterialById,
  createReturnMaterial,
  updateReturnMaterial,
  deleteReturnMaterial,
  confirmReturnMaterial,
  cancelReturnMaterial,
} from "../../api/ReturnMaterial.api";
import { getItems } from "../../api/Item.api";
import { getwarehouses } from "../../api/warehouse.api";
import { getSubsidiaries } from "../../api/Subsidiaries.api";
import { getCities } from "../../api/Cities.api";

const ReturnMaterial = () => {
  const [view, setView] = useState("list");
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState("create");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const [masterData, setMasterData] = useState({
    items: [],
    stores: [],
    subsidiaries: [],
    cities: [],
    workCategories: ["Category A", "Category B", "Category C"],
    materialStatuses: ["Good", "Damaged", "Refurbished"],
    uoms: ["Nos", "Kg", "Mtr", "Set"],
  });

  const fetchData = async () => {
    try {
      const [mainRes, itemsRes, warehouseRes, subsidiaryRes, cityRes] = await Promise.all([
        getReturnMaterials(),
        getItems(),
        getwarehouses(),
        getSubsidiaries(),
        getCities(),
      ]);

      setData(mainRes.data?.data || []);
      setMasterData(prev => ({
        ...prev,
        items: itemsRes.data?.data || [],
        stores: (warehouseRes.data?.data || []).map(w => w.warehouseName || w.name),
        subsidiaries: (subsidiaryRes.data?.data || []).map(s => s.name),
        cities: (cityRes.data?.data || []).map(c => c.cityName || c.name),
      }));
    } catch (e) {
      showSnack("Failed to fetch data", "error");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showSnack = (message, severity = "success") => {
    setSnack({ open: true, message, severity });
  };

  const handleAction = async (action, row) => {
    if (action === "view" || action === "edit") {
      try {
        const res = await getReturnMaterialById(row.id);
        setSelectedItem(res.data.data);
        setMode(action);
        setView("form");
      } catch (e) { showSnack("Failed to fetch details", "error"); }
    } else if (action === "confirm") {
      try {
        await confirmReturnMaterial(row.id);
        showSnack("Confirmed successfully");
        fetchData();
      } catch (e) { showSnack("Failed to confirm", "error"); }
    } else if (action === "cancel") {
      try {
        await cancelReturnMaterial(row.id);
        showSnack("Cancelled successfully");
        fetchData();
      } catch (e) { showSnack("Failed to cancel", "error"); }
    } else if (action === "delete") {
      try {
        await deleteReturnMaterial(row.id);
        showSnack("Deleted successfully");
        fetchData();
      } catch (e) { showSnack("Failed to delete", "error"); }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (mode === "create") { await createReturnMaterial(formData); showSnack("Created successfully"); }
      else { await updateReturnMaterial(formData.id, formData); showSnack("Updated successfully"); }
      setView("list");
      fetchData();
    } catch (e) { showSnack(e.response?.data?.message || "Failed to save", "error"); }
  };

  const columns = [
    { field: "returnNo", label: "Return No" },
    { field: "returnFrom", label: "Return From" },
    { field: "date", label: "Date" },
    { field: "returnType", label: "Return Type" },
    { field: "grandTotal", label: "Grand Total" },
  ];

  const headerFields = [
    { name: "returnNo", label: "Return Number", required: true },
    { name: "returnFrom", label: "Return From" },
    { name: "returnType", label: "Return Type" },
    { name: "date", label: "Date", type: "datetime-local", required: true },
    { 
      name: "city", 
      label: "City", 
      required: true, 
      select: true, 
      options: masterData.cities.map(c => ({ label: c, value: c })) 
    },
    { name: "site", label: "Site" },
    { 
      name: "store", 
      label: "Store", 
      select: true, 
      options: masterData.stores.map(s => ({ label: s, value: s })) 
    },
    { 
      name: "subsidiary", 
      label: "Subsidiary", 
      required: true, 
      select: true, 
      options: masterData.subsidiaries.map(s => ({ label: s, value: s })) 
    },
    { name: "remarks", label: "Remarks" },
  ];

  if (view === "form") {
    return (
      <CommonTransitionForm
        title={mode === "create" ? "Create Return Material Entry" : "Return Material Entry"}
        headerFields={headerFields}
        initialData={selectedItem}
        mode={mode}
        onSave={handleSave}
        onCancel={() => setView("list")}
        masterData={masterData}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Return Materials</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setMode("create");
            setSelectedItem({ date: new Date().toISOString().slice(0, 16), status: "Draft" });
            setView("form");
          }}
        >
          Create New
        </Button>
      </Stack>
      <CommonTransitionList data={data} columns={columns} onAction={handleAction} />
      <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} sx={{ width: "100%" }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ReturnMaterial;
