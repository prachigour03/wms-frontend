import Grid from "@mui/material/Grid";
import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, TextField, MenuItem, Switch, FormControlLabel, Button, Divider } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SaveIcon from "@mui/icons-material/Save";

import {
  getUtilitySettings,
  upsertMultipleUtilitySettings,
} from "../../api/UtilitySettings.api.js";

export default function UtilitySettings() {
  const [settings, setSettings] = useState({
    dateFormat: "",
    timeZone: "",
    currency: "",
    notifications: true,
    autoLogout: "",
  });

  const [errors, setErrors] = useState({});

  // 🔹 LOAD SETTINGS FROM BACKEND
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getUtilitySettings();
        if (res.data?.success) {
          const obj = {};
          res.data.data.forEach((item) => {
            obj[item.key] = item.value;
          });
          setSettings((prev) => ({ ...prev, ...obj }));
        }
      } catch (err) {
        console.error("Failed to load utility settings", err);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    let temp = {};
    if (!settings.dateFormat) temp.dateFormat = "Required";
    if (!settings.timeZone) temp.timeZone = "Required";
    if (!settings.currency) temp.currency = "Required";
    if (!settings.autoLogout) temp.autoLogout = "Required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // 🔹 SAVE SETTINGS (BULK UPSERT)
  const handleSave = async () => {
    if (!validate()) return;

    try {
      await upsertMultipleUtilitySettings(settings);
      alert("Utility Settings Saved Successfully");
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save settings");
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f7fb", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
        <SettingsIcon color="primary" />
        <Typography variant="h5" fontWeight="bold">
          Utility Settings
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          General Configuration
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={ 12 } md={ 6 }>
            <TextField
              select
              fullWidth
              label="Date Format"
              name="dateFormat"
              value={settings.dateFormat}
              onChange={handleChange}
              error={!!errors.dateFormat}
              helperText={errors.dateFormat}
            >
              <MenuItem value="DD-MM-YYYY">DD-MM-YYYY</MenuItem>
              <MenuItem value="MM-DD-YYYY">MM-DD-YYYY</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={ 12 } md={ 6 }>
            <TextField
              select
              fullWidth
              label="Time Zone"
              name="timeZone"
              value={settings.timeZone}
              onChange={handleChange}
              error={!!errors.timeZone}
              helperText={errors.timeZone}
            >
              <MenuItem value="IST">IST</MenuItem>
              <MenuItem value="UTC">UTC</MenuItem>
              <MenuItem value="EST">EST</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={ 12 } md={ 6 }>
            <TextField
              select
              fullWidth
              label="Default Currency"
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              error={!!errors.currency}
              helperText={errors.currency}
            >
              <MenuItem value="INR">INR</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={ 12 } md={ 6 }>
            <TextField
              select
              fullWidth
              label="Auto Logout (Minutes)"
              name="autoLogout"
              value={settings.autoLogout}
              onChange={handleChange}
              error={!!errors.autoLogout}
              helperText={errors.autoLogout}
            >
              <MenuItem value="10">10 Minutes</MenuItem>
              <MenuItem value="20">20 Minutes</MenuItem>
              <MenuItem value="30">30 Minutes</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <NotificationsActiveIcon fontSize="small" /> Notifications
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications}
                onChange={handleChange}
                name="notifications"
              />
            }
            label="Enable System Notifications"
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
