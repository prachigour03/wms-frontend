import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Stack, Snackbar, Alert } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import CommonTransitionList from "../../components/Transition/CommonTransitionList";
import CommonTransitionForm from "../../components/Transition/CommonTransitionForm";
import {
  getInwardChallans,
  getInwardChallanById,
  createInwardChallan,
  updateInwardChallan,
  deleteInwardChallan,
  confirmInwardChallan,
  cancelInwardChallan,
} from "../../api/InwardChallan.api";
import { getItems } from "../../api/Item.api";
import { getStores } from "../../api/Store.api";
import { getOrders } from "../../api/orderBooking.api";
import { getCustomers } from "../../api/Customer.api";
import { getSubsidiaries } from "../../api/Subsidiaries.api";
import { getCities } from "../../api/Cities.api";

const InwardChallan = () => {
  const [view, setView] = useState("list");
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState("create");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  
  const [masterData, setMasterData] = useState({
    items: [],
    workOrders: [],
    stores: [],
    customers: [],
    subsidiaries: [],
    cities: [],
    workCategories: ["Category A", "Category B", "Category C"],
    materialStatuses: ["Good", "Damaged", "Refurbished"],
    uoms: ["Nos", "Kg", "Mtr", "Set"],
  });

  const fetchData = async () => {
    try {
      const [challanRes, itemsRes, storeRes, woRes, customerRes, subsidiaryRes, cityRes] = await Promise.all([
        getInwardChallans(),
        getItems(),
        getStores(),
        getOrders(),
        getCustomers(),
        getSubsidiaries(),
        getCities(),
      ]);

      setData(challanRes.data?.data || []);
      
      setMasterData(prev => ({
        ...prev,
        items: itemsRes.data?.data || [],
        stores: (storeRes.data?.data || []).map(s => s.storeName),
        workOrders: (woRes.data?.data || []).map(wo => wo.orderNo),
        customers: (customerRes.data?.data || []).map(c => c.customerName || c.name),
        subsidiaries: (subsidiaryRes.data?.data || []).map(s => s.name),
        cities: (cityRes.data?.data || []).map(c => c.cityName || c.name),
      }));
    } catch (e) {
      console.error("Fetch error:", e);
      showSnack("Failed to fetch data", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSnack = (message, severity = "success") => {
    setSnack({ open: true, message, severity });
  };

  const handleAction = async (action, row) => {
    if (action === "view" || action === "edit") {
      try {
        const res = await getInwardChallanById(row.id);
        setSelectedItem(res.data.data);
        setMode(action);
        setView("form");
      } catch (e) {
        showSnack("Failed to fetch details", "error");
      }
    } else if (action === "confirm") {
      try {
        await confirmInwardChallan(row.id);
        showSnack("Confirmed successfully");
        fetchData();
      } catch (e) {
        showSnack("Failed to confirm", "error");
      }
    } else if (action === "cancel") {
      try {
        await cancelInwardChallan(row.id);
        showSnack("Cancelled successfully");
        fetchData();
      } catch (e) {
        showSnack("Failed to cancel", "error");
      }
    } else if (action === "delete") {
      try {
        await deleteInwardChallan(row.id);
        showSnack("Deleted successfully");
        fetchData();
      } catch (e) {
        showSnack("Failed to delete", "error");
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (mode === "create") {
        await createInwardChallan(formData);
        showSnack("Created successfully");
      } else {
        await updateInwardChallan(formData.id, formData);
        showSnack("Updated successfully");
      }
      setView("list");
      fetchData();
    } catch (e) {
      showSnack(e.response?.data?.message || "Failed to save", "error");
    }
  };

  const columns = [
    { field: "challanNo", label: "Challan No" },
    { field: "customer", label: "Customer" },
    { field: "date", label: "Date" },
    { field: "workOrderNo", label: "Work Order No" },
    { field: "grandTotal", label: "Grand Total" },
  ];

  const headerFields = [
    { name: "challanNo", label: "Challan Number", required: true },
    { 
      name: "customer", 
      label: "Customer", 
      required: true, 
      select: true, 
      options: masterData.customers.map(c => ({ label: c, value: c })) 
    },
    { 
      name: "workOrderNo", 
      label: "Work Order No" 
    },
    { name: "date", label: "Date", type: "datetime-local", required: true },
    { name: "workOrderEndDate", label: "Work Order End Date", type: "datetime-local" },
    { name: "shippedFrom", label: "Shipped From" },
    { name: "shippedTo", label: "Shipped To" },
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
    { name: "transportationMode", label: "Transportation Mode" },
    { name: "vehicleNo", label: "Vehicle No" },
    { name: "moNumber", label: "MO Number" },
    { name: "lrNo", label: "LR No" },
    { name: "tptId", label: "TPT ID" },
    { name: "tptName", label: "TPT Name" },
    { name: "deliveryDate", label: "Delivery Date & Time", type: "datetime-local", required: true },
    { name: "remarks", label: "Remarks" },
  ];

  if (view === "form") {
    return (
      <CommonTransitionForm
        title={mode === "create" ? "Create Inward Challan Entry" : "Inward Challan Entry"}
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
        <Typography variant="h4" fontWeight="bold">Inward Challans</Typography>
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

      <CommonTransitionList
        data={data}
        columns={columns}
        onAction={handleAction}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InwardChallan;
