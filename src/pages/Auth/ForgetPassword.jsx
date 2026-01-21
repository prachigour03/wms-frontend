import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Avatar,
  Typography,
  TextField,
  Button,
  Divider,
  Snackbar,
  Alert,
  Link as MuiLink
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import loginImg from '../../assets/loginImg.jpg';
import apiClient from "../../services/apiClient";

export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState('email'); // 'email' | 'verify' | 'reset'
  const [snack, setSnack] = useState({ open: false, severity: 'info', message: '' });
  const [otpInput, setOtpInput] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const navigate = useNavigate();

  const sendOtp = async (e) => {
  e.preventDefault();

  if (!email.trim()) {
    setSnack({ open: true, severity: "warning", message: "Please enter your email." });
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


  const resendOtp = () => {
    if (resendTimer > 0) return;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000;
    localStorage.setItem(`passwordReset:${email}`, JSON.stringify({ otp, expires }));
    console.log(`Resent OTP for ${email}: ${otp}`);
    setSnack({ open: true, severity: 'info', message: 'OTP resent (simulated).' });
    setResendTimer(60);
  };

  const verifyOtp = async (e) => {
  e.preventDefault();

  if (!otpInput.trim()) {
    setSnack({ open: true, severity: "warning", message: "Please enter OTP." });
    return;
  }

  try {
    await apiClient.post("/verify-otp", {
      email,
      otp: otpInput,
    });

    setSnack({
      open: true,
      severity: "success",
      message: "OTP verified. Please set new password.",
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

  const resetPassword = async (e) => {
  e.preventDefault();

  if (!newPassword || !confirmNewPassword) {
    setSnack({ open: true, severity: "warning", message: "Please fill all fields." });
    return;
  }

  if (newPassword !== confirmNewPassword) {
    setSnack({ open: true, severity: "error", message: "Passwords do not match." });
    return;
  }

  try {
    await apiClient.post("/reset-password", {
      email,
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
      message: err.response?.data?.message || "Password reset failed.",
    });
  }
};


  // countdown for resend button
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(180deg,#f3f6ff 0%, #f7fbff 100%)'
      }}
    >
      <Paper 
      elevation={6} 
      sx={{ 
        width: '100%', 
        maxWidth: 1100, 
        borderRadius: 4, 
        overflow: 'hidden' 
        }}>
        <Grid container minHeight={600}>
          <Grid 
          xs={12}
          md={6} 
          sx={{ 
            p: { xs: 4, md: 6 }, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center' 
            }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                <LockOutlinedIcon sx={{ fontSize: 32 }} />
              </Avatar>

              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                Forgot Password
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Enter your email and we'll simulate a password reset link.
              </Typography>
            </Box>

            <Box>
              {stage === 'email' && (
                <Box component="form" noValidate onSubmit={sendOtp}>
                  <TextField
                    fullWidth
                    label="Email"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                  />

                  <Button fullWidth variant="contained" size="large" sx={{ mt: 2, py: 1.2, borderRadius: 2 }} type="submit">
                    Send OTP
                  </Button>
                </Box>
              )}

              {stage === 'verify' && (
                <Box component="form" noValidate onSubmit={verifyOtp}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    OTP sent to 
                    <strong>{email}</strong>. 
                    Please check your inbox (OTP shown in console for now).
                  </Typography>

                  <TextField
                    fullWidth
                    label="Enter OTP"
                    margin="normal"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                  />

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                    <Button variant="contained" type="submit">Verify OTP</Button>
                    <Button onClick={resendOtp} disabled={resendTimer > 0}>Resend {resendTimer > 0 ? `(${resendTimer}s)` : ''}</Button>
                    <Button onClick={() => setStage('email')}>Back</Button>
                  </Box>
                </Box>
              )}

              {stage === 'reset' && (
                <Box component="form" noValidate onSubmit={resetPassword}>
                  <TextField fullWidth label="New Password" margin="normal" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <TextField fullWidth label="Confirm New Password" margin="normal" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />

                  <Button fullWidth variant="contained" size="large" sx={{ mt: 2, py: 1.2, borderRadius: 2 }} type="submit">
                    Reset Password
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Remembered your password?{' '}
                <MuiLink component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
                  Login
                </MuiLink>
                {' '}·{' '}
                <MuiLink component={RouterLink} to="/register" sx={{ fontWeight: 600 }}>
                  Register
                </MuiLink>
              </Typography>

              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                After reset you'll be redirected to <MuiLink component={RouterLink} to="/login">Login</MuiLink>.
              </Typography>
            </Box>
          </Grid>

          {/* RIGHT SIDE – ILLUSTRATION + MARKETING */}
          <Grid 
           xs={12} 
           md={6} 
           sx={{ 
            background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            justifyContent: 'center', 
            position: 'relative'
             }}
             >
            <Box textAlign="center" px={6} maxWidth={420}>
              <Box 
              component="img" 
              src={loginImg} 
              alt="Forgot Password Illustration" 
              sx={{ 
                width: '100%', 
                maxWidth: 360, 
                mx: 'auto' 
              }} 
                />
            </Box>
          </Grid>
        </Grid>

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
