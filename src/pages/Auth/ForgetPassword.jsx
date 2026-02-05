import Grid from "@mui/material/Grid";
import React, { useState, useEffect } from "react";
import { Box, Paper, Avatar, Typography, TextField, Button, Divider, Snackbar, Alert, Link as MuiLink } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import loginImg from "../../assets/loginImg.jpg";
import apiClient from "../../services/apiClient";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("email"); // email | verify | reset
  const [resendTimer, setResendTimer] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const navigate = useNavigate();

  /* ================= SEND OTP ================= */
  const sendOtp = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Please enter your email.",
      });
      return;
    }

    try {
      await apiClient.post("/forgot-password", { email });

      setSnack({
        open: true,
        severity: "success",
        message: "OTP sent to your email.",
      });

      setStage("verify");
      setResendTimer(60);
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message: err.response?.data?.message || "Email not found.",
      });
    }
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async (e) => {
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
      await apiClient.post("/verify-otp", { email, otp });

      setSnack({
        open: true,
        severity: "success",
        message: "OTP verified. Set a new password.",
      });

      setStage("reset");
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message: err.response?.data?.message || "Invalid OTP.",
      });
    }
  };

  /* ================= RESET PASSWORD ================= */
  const resetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmNewPassword) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Please fill all fields.",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setSnack({
        open: true,
        severity: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    try {
      await apiClient.post("/reset-password", {
        email,
        otp,
        newPassword,
      });

      setSnack({
        open: true,
        severity: "success",
        message: "Password updated. Redirecting to login...",
      });

      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message:
          err.response?.data?.message || "Password reset failed.",
      });
    }
  };

  /* ================= RESEND TIMER ================= */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(
      () => setResendTimer((t) => Math.max(0, t - 1)),
      1000
    );
    return () => clearInterval(timer);
  }, [resendTimer]);

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
      <Paper elevation={6} sx={{ width: "100%", maxWidth: 1100, borderRadius: 4 }}>
        <Grid container minHeight={600}>
          <Grid sx={{ p: { xs: 4, md: 6 } }} item xs={ 12 } md={ 6 }>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64, mx: "auto" }}>
                <LockOutlinedIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                Forgot Password
              </Typography>
            </Box>

            {stage === "email" && (
              <Box component="form" onSubmit={sendOtp}>
                <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button fullWidth variant="contained" size="large" sx={{ mt: 2 }} type="submit">
                  Send OTP
                </Button>
              </Box>
            )}

            {stage === "verify" && (
              <Box component="form" onSubmit={verifyOtp}>
                <TextField fullWidth label="Enter OTP" margin="normal" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <Button variant="contained" type="submit">Verify OTP</Button>
                <Button onClick={sendOtp} disabled={resendTimer > 0} sx={{ ml: 1 }}>
                  Resend {resendTimer > 0 && `(${resendTimer}s)`}
                </Button>
              </Box>
            )}

            {stage === "reset" && (
              <Box component="form" onSubmit={resetPassword}>
                <TextField fullWidth label="New Password" type="password" margin="normal" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <TextField fullWidth label="Confirm New Password" type="password" margin="normal" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                <Button fullWidth variant="contained" size="large" sx={{ mt: 2 }} type="submit">
                  Reset Password
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />
            <Typography textAlign="center">
              <MuiLink component={RouterLink} to="/login">Login</MuiLink> ·{" "}
              <MuiLink component={RouterLink} to="/register">Register</MuiLink>
            </Typography>
          </Grid>

          <Grid sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "center" }} item xs={ 12 } md={ 6 }>
            <Box component="img" src={loginImg} sx={{ maxWidth: 360 }} />
          </Grid>
        </Grid>

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity={snack.severity}>{snack.message}</Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
