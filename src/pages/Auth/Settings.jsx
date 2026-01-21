import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Stack,
  Alert
} from "@mui/material";

export default function Settings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSave = (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    const payload = {
      name,
      email,
      darkMode,
      notifications
    };

    console.log("Saved Settings:", payload);

    setMessage({ type: "success", text: "Settings updated successfully" });
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto" }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Settings
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack spacing={3} component="form" onSubmit={handleSave}>
            {/* Profile Section */}
            <Box>
              <Typography variant="h6">Profile Information</Typography>
              <Divider sx={{ my: 1 }} />

              <Stack spacing={2} mt={2}>
                <TextField
                  label="Name"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Stack>
            </Box>

            {/* Password Section */}
            <Box>
              <Typography variant="h6">Change Password</Typography>
              <Divider sx={{ my: 1 }} />

              <Stack spacing={2} mt={2}>
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Stack>
            </Box>

            {/* Preferences */}
            <Box>
              <Typography variant="h6">Preferences</Typography>
              <Divider sx={{ my: 1 }} />

              <Stack spacing={1} mt={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={() => setDarkMode(!darkMode)}
                    />
                  }
                  label="Dark Mode"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications}
                      onChange={() => setNotifications(!notifications)}
                    />
                  }
                  label="Email Notifications"
                />
              </Stack>
            </Box>

            {message.text && (
              <Alert severity={message.type}>{message.text}</Alert>
            )}

            <Box textAlign="right">
              <Button type="submit" variant="contained" size="large">
                Save Changes
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
