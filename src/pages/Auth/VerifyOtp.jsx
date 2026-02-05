import Grid from "@mui/material/Grid";
import React, { useState } from "react";
import { Box, Paper, Avatar, Typography, TextField, Button, Divider, Snackbar, Alert, Link as MuiLink } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import loginImg from "../../assets/loginImg.jpg";
import apiClient from "../../services/apiClient";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  // email passed from ForgetPassword page
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  /* ================= VERIFY OTP ================= */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Please enter OTP.",
      });
      return;
    }

    try {
      await apiClient.post("/verify-otp", {
        email,
        otp,
      });

      setSnack({
        open: true,
        severity: "success",
        message: "OTP verified successfully.",
      });

      setTimeout(() => {
        navigate("/reset-password", { state: { email, otp } });
      }, 700);
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message: err.response?.data?.message || "Invalid or expired OTP.",
      });
    }
  };

  if (!email) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography>
          Invalid access.{" "}
          <MuiLink component={RouterLink} to="/forgot-password">
            Go back
          </MuiLink>
        </Typography>
      </Box>
    );
  }

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
          {/* LEFT SIDE */}
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
                Verify OTP
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Enter the OTP sent to <strong>{email}</strong>
              </Typography>
            </Box>

            <Box component="form" noValidate onSubmit={handleVerifyOtp}>
              <TextField
                fullWidth
                label="Enter OTP"
                margin="normal"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 2, py: 1.2, borderRadius: 2 }}
                type="submit"
              >
                Verify OTP
              </Button>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body2" sx={{ textAlign: "center" }}>
                Didn’t receive OTP?{" "}
                <MuiLink component={RouterLink} to="/forgot-password" sx={{ fontWeight: 600 }}>
                  Resend
                </MuiLink>
              </Typography>
            </Box>
          </Grid>

          {/* RIGHT SIDE */}
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
                alt="Verify OTP Illustration"
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
