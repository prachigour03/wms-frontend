import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

import {
  getCompanyDetails,
  updateCompanyDetail,
  createCompanyDetail,
} from "../../api/CompanyDetail.api";
import { useDispatch } from 'react-redux';
import { increment as incrementNotification } from '../../features/notificationSlice';

/* ---------------- View Field ---------------- */
const ViewField = ({ label, value }) => (
  <Grid item xs={12} md={4}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={500}>
      {value || "-"}
    </Typography>
  </Grid>
);

const emptyCompany = {
  companyName: "",
  companyCode: "",
  gstNumber: "",
  email: "",
  phone: "",
  pinCode: "",
  country: "",
  state: "",
  city: "",
  address: "",
  status: "Active",
};

export default function CompanyDetail() {
  const dispatch = useDispatch();

  const [editMode, setEditMode] = useState(false);
  const [data, setData] = useState(() => {
      const saved = localStorage.getItem("cities");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [initialData, setInitialData] = useState(emptyCompany);
  const [loading, setLoading] = useState(true);
  const [isCreated, setIsCreated] = useState(false); // 🔥 important

  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  /* ---------------- Fetch ---------------- */
  const fetchCompanyDetail = async () => {
    try {
      setLoading(true);
      const res = await getCompanyDetails();

      if (res?.data?.data) {
        setData(res.data.data);
        setInitialData(res.data.data);
        setIsCreated(true); // already created
      } else {
        setIsCreated(false); // not created yet
        setData(emptyCompany);
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetail();
  }, []);

  /* ---------------- Handlers ---------------- */
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (isCreated) {
        // UPDATE
        await updateCompanyDetail(data.id, data);
      } else {
        // CREATE (only once)
        await createCompanyDetail(data);
        setIsCreated(true);
      }
      setEditMode(false);
      fetchCompanyDetail();

      dispatch(incrementNotification({
        severity: "success",
        message: `Company details ${isCreated ? "updated" : "created"} successfully`,
        path: 'setup/CompanyDetail',
        time: new Date().toISOString(),
        }));
        setSnack({ open: true, severity: 'success', message: `Company details ${isCreated ? 'updated' : 'created'} successfully` });
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setData({ ...initialData }); // safe copy
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Company Details</Typography>

        {!editMode ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
          >
            {isCreated ? "Update" : "Create"}
          </Button>
        ) : (
          <Box display="flex" gap={1}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
              Save
            </Button>
            <Button variant="outlined" startIcon={<CloseIcon />} onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        )}
      </Box>

      {/* Card */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Chip
            label={data.status}
            color={data.status === "Active" ? "success" : "default"}
          />
        </Box>
     
             <Divider sx={{ mb: 3 }} />

        {/* VIEW MODE */}
{!editMode && (
  <Grid flex fontSize={35}>
    <ViewField label="Company Name" value={data.companyName} />
    <ViewField label="Company Code" value={data.companyCode} />
    <ViewField label="GST Number" value={data.gstNumber} />
    <ViewField label="Email" value={data.email} />
    <ViewField label="Phone" value={data.phone} />
    <ViewField label="Pin Code" value={data.pinCode} />
    <ViewField label="Country" value={data.country} />
    <ViewField label="State" value={data.state} />
    <ViewField label="City" value={data.city} />

    <Grid item xs={12}>
      <Typography variant="caption">Address</Typography>
      <Typography fontWeight={500}>{data.address || "-"}</Typography>
    </Grid>
  </Grid>
)}


        {/* EDIT MODE */}
        {editMode && (
          <Grid container spacing={3}>
            {Object.keys(emptyCompany).map(
              (key) =>
                key !== "status" && (
                  <Grid item xs={12} md={4} key={key}>
                    <TextField
                      label={key.replace(/([A-Z])/g, " $1")}
                      name={key}
                      value={data[key]}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                )
            )}
          </Grid>
        )}
      </Paper>
      <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
        </Snackbar>
    </Box>
  );
}
