import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Stack, Snackbar, Alert } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import CommonTransitionList from "../../components/Transition/CommonTransitionList";
import CommonTransitionForm from "../../components/Transition/CommonTransitionForm";
import {
  getMaterialConsumptions,
  getMaterialConsumptionById,
  createMaterialConsumption,
  updateMaterialConsumption,
  deleteMaterialConsumption,
  confirmMaterialConsumption,
  cancelMaterialConsumption,
} from "../../api/MaterialConsumption.api";
import { getItems } from "../../api/Item.api";
import { getwarehouses } from "../../api/warehouse.api";
import { getSubsidiaries } from "../../api/Subsidiaries.api";
import { getCities } from "../../api/Cities.api";
import { getDepartments } from "../../api/Departments.api";

const MaterialConsumption = () => {
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
    departments: [],
    workCategories: ["Category A", "Category B", "Category C"],
    materialStatuses: ["Good", "Damaged", "Refurbished"],
    uoms: ["Nos", "Kg", "Mtr", "Set"],
  });

  const fetchData = async () => {
    try {
      const [mainRes, itemsRes, warehouseRes, subsidiaryRes, cityRes, deptRes] = await Promise.all([
        getMaterialConsumptions(),
        getItems(),
        getwarehouses(),
        getSubsidiaries(),
        getCities(),
        getDepartments(),
      ]);

      setData(mainRes.data?.data || []);
      setMasterData(prev => ({
        ...prev,
        items: itemsRes.data?.data || [],
        stores: (warehouseRes.data?.data || []).map(w => w.warehouseName || w.name),
        subsidiaries: (subsidiaryRes.data?.data || []).map(s => s.name),
        cities: (cityRes.data?.data || []).map(c => c.cityName || c.name),
        departments: (deptRes.data?.data || []).map(d => d.name || d.departmentName),
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
        const res = await getMaterialConsumptionById(row.id);
        setSelectedItem(res.data.data);
        setMode(action);
        setView("form");
      } catch (e) { showSnack("Failed to fetch details", "error"); }
    } else if (action === "confirm") {
      try {
        await confirmMaterialConsumption(row.id);
        showSnack("Confirmed successfully");
        fetchData();
      } catch (e) { showSnack("Failed to confirm", "error"); }
    } else if (action === "cancel") {
      try {
        await cancelMaterialConsumption(row.id);
        showSnack("Cancelled successfully");
        fetchData();
      } catch (e) { showSnack("Failed to cancel", "error"); }
    } else if (action === "delete") {
      try {
        await deleteMaterialConsumption(row.id);
        showSnack("Deleted successfully");
        fetchData();
      } catch (e) { showSnack("Failed to delete", "error"); }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (mode === "create") { await createMaterialConsumption(formData); showSnack("Created successfully"); }
      else { await updateMaterialConsumption(formData.id, formData); showSnack("Updated successfully"); }
      setView("list");
      fetchData();
    } catch (e) { showSnack(e.response?.data?.message || "Failed to save", "error"); }
  };

  const columns = [
    { field: "consumptionNo", label: "Consumption No" },
    { field: "department", label: "Department" },
    { field: "date", label: "Date" },
    { field: "consumedBy", label: "Consumed By" },
    { field: "grandTotal", label: "Grand Total" },
  ];

  const headerFields = [
    { name: "consumptionNo", label: "Consumption Number", required: true },
    { 
      name: "department", 
      label: "Department",
      select: true,
      options: masterData.departments.map(d => ({ label: d, value: d }))
    },
    { name: "consumedBy", label: "Consumed By" },
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
        title={mode === "create" ? "Create Material Consumption Entry" : "Material Consumption Entry"}
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
        <Typography variant="h4" fontWeight="bold">Material Consumptions</Typography>
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

export default MaterialConsumption;
