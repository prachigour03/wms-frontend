import Grid from "@mui/material/Grid";
import React, { useState } from "react";
import { Box, Paper, Avatar, Typography, TextField, Button, Divider, Snackbar, Alert, Link as MuiLink } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import loginImg from "../../assets/loginImg.jpg";
import apiClient from "../../services/apiClient";

export default function ResetPassword() {
  const { token } = useParams(); // token from URL
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  /* ================= RESET PASSWORD ================= */
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Please fill all fields.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnack({
        open: true,
        severity: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    try {
      await apiClient.post(`/reset-password/${token}`, {
        newPassword,
      });

      setSnack({
        open: true,
        severity: "success",
        message: "Password reset successful. Redirecting to login...",
      });

      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message:
          err.response?.data?.message || "Reset link expired or invalid.",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        background: "linear-gradient(180deg,#f3f6ff 0%, #f7fbff 100%)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 1100,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Grid container minHeight={600}>
          {/* LEFT – FORM */}
          <Grid
            sx={{
              p: { xs: 4, md: 6 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }} item xs={ 12 } md={ 6 }>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64 }}>
                <LockOutlinedIcon sx={{ fontSize: 32 }} />
              </Avatar>

              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                Reset Password
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Create a new secure password for your account
              </Typography>
            </Box>

            <Box component="form" noValidate onSubmit={handleResetPassword}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                margin="normal"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 2, py: 1.2, borderRadius: 2 }}
                type="submit"
              >
                Reset Password
              </Button>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body2" sx={{ textAlign: "center" }}>
                Remember your password?{" "}
                <MuiLink
                  component={RouterLink}
                  to="/login"
                  sx={{ fontWeight: 600 }}
                >
                  Login
                </MuiLink>
              </Typography>
            </Box>
          </Grid>

          {/* RIGHT – IMAGE */}
          <Grid
            sx={{
              background:
                "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
            }} item xs={ 12 } md={ 6 }>
            <Box textAlign="center" px={6} maxWidth={420}>
              <Box
                component="img"
                src={loginImg}
                alt="Reset Password Illustration"
                sx={{
                  width: "100%",
                  maxWidth: 360,
                  mx: "auto",
                }}
              />
            </Box>
          </Grid>
        </Grid>

        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          <Alert
            onClose={() => setSnack({ ...snack, open: false })}
            severity={snack.severity}
            sx={{ width: "100%" }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
