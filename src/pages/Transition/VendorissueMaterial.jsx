import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Stack, Snackbar, Alert } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import CommonTransitionList from "../../components/Transition/CommonTransitionList";
import CommonTransitionForm from "../../components/Transition/CommonTransitionForm";
import {
  getVendorIssueMaterials,
  getVendorIssueMaterialById,
  createVendorIssueMaterial,
  updateVendorIssueMaterial,
  deleteVendorIssueMaterial,
  confirmVendorIssueMaterial,
  cancelVendorIssueMaterial,
} from "../../api/VendorissueMaterial.api";
import { getItems } from "../../api/Item.api";
import { getStores } from "../../api/Store.api";
import { getCustomers } from "../../api/Customer.api";
import { getSubsidiaries } from "../../api/Subsidiaries.api";
import { getCities } from "../../api/Cities.api";
import { getVendors } from "../../api/vendor.api";
import { getAllEmployees } from "../../api/Employees.api";

const VendorissueMaterial = () => {
  const [view, setView] = useState("list");
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState("create");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const [masterData, setMasterData] = useState({
    items: [],
    stores: [],
    customers: [],
    subsidiaries: [],
    cities: [],
    vendors: [],
    employees: [],
    workCategories: ["Cable", "Hardware", "Software"],
    materialStatuses: ["Good", "Damaged", "Refurbished"],
    uoms: ["Nos", "Kg", "Mtr", "Set"],
    serviceTypes: ["Installation", "Maintenance", "Repair"],
  });

  const fetchData = async () => {
    try {
      const [mainRes, itemsRes, storeRes, customerRes, subsidiaryRes, cityRes, vendorRes, empRes] = await Promise.all([
        getVendorIssueMaterials(),
        getItems(),
        getStores(),
        getCustomers(),
        getSubsidiaries(),
        getCities(),
        getVendors(),
        getAllEmployees(),
      ]);

      setData(mainRes.data?.data || []);
      setMasterData(prev => ({
        ...prev,
        items: itemsRes.data?.data || [],
        stores: (storeRes.data?.data || []).map(s => s.storeName),
        customers: (customerRes.data?.data || []).map(c => c.customerName || c.name),
        subsidiaries: (subsidiaryRes.data?.data || []).map(s => s.name),
        cities: (cityRes.data?.data || []).map(c => c.cityName || c.name),
        vendors: (vendorRes.data?.data || []).map(v => v.vendorName || v.name),
        employees: (empRes.data?.data || []).map(e => e.employeeName || e.name),
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
        const res = await getVendorIssueMaterialById(row.id);
        setSelectedItem(res.data.data);
        setMode(action);
        setView("form");
      } catch (e) { showSnack("Failed to fetch details", "error"); }
    } else if (action === "confirm") {
      try {
        await confirmVendorIssueMaterial(row.id);
        showSnack("Confirmed successfully");
        fetchData();
      } catch (e) { showSnack("Failed to confirm", "error"); }
    } else if (action === "cancel") {
      try {
        await cancelVendorIssueMaterial(row.id);
        showSnack("Cancelled successfully");
        fetchData();
      } catch (e) { showSnack("Failed to cancel", "error"); }
    } else if (action === "delete") {
      try {
        await deleteVendorIssueMaterial(row.id);
        showSnack("Deleted successfully");
        fetchData();
      } catch (e) { showSnack("Failed to delete", "error"); }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (mode === "create") { await createVendorIssueMaterial(formData); showSnack("Created successfully"); }
      else { await updateVendorIssueMaterial(formData.id, formData); showSnack("Updated successfully"); }
      setView("list");
      fetchData();
    } catch (e) { showSnack(e.response?.data?.message || "Failed to save", "error"); }
  };

  const columns = [
    { field: "issueNo", label: "Issue No" },
    { field: "issuedTo", label: "Issued To" },
    { field: "customer", label: "Customer" },
    { field: "date", label: "Date" },
    { field: "grandTotal", label: "Grand Total" },
  ];

  const headerFields = [
    { name: "issueNo", label: "Issue Number", required: true },
    { name: "issuedTo", label: "Issued To (Vendor/Employee)", required: true, select: true },
    { name: "team", label: "Team" },
    { 
      name: "customer", 
      label: "Customer", 
      required: true, 
      select: true, 
      options: masterData.customers.map(c => ({ label: c, value: c })) 
    },
    { 
      name: "subsidiary", 
      label: "Subsidiary", 
      required: true, 
      select: true, 
      options: masterData.subsidiaries.map(s => ({ label: s, value: s })) 
    },
    { 
      name: "city", 
      label: "City", 
      select: true, 
      options: masterData.cities.map(c => ({ label: c, value: c })) 
    },
    { name: "site", label: "Site" },
    { name: "date", label: "Issue Date & Time", type: "datetime-local", required: true },
    { name: "supervisorName", label: "Supervisor Name" },
    { name: "remarks", label: "Remarks" },
  ];

  if (view === "form") {
    return (
      <CommonTransitionForm
        title={mode === "create" ? "Create Issue Material" : "Issue Material Entry"}
        headerFields={headerFields}
        initialData={selectedItem}
        mode={mode}
        moduleType="issue"
        onSave={handleSave}
        onCancel={() => setView("list")}
        masterData={masterData}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Issue Materials</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setMode("create");
            setSelectedItem({ date: new Date().toISOString().slice(0, 16), status: "Draft", type: "Vendor" });
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

export default VendorissueMaterial;
