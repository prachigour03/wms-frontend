import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  Avatar,
  Snackbar,
  Alert,
  Link as MuiLink
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import registerImg from '../../assets/loginImg.jpg';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import apiClient from "../../services/apiClient";


export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [snack, setSnack] = useState({ open: false, severity: 'info', message: '' });
  const navigate = useNavigate();
  const [name, setName] = useState("");


  const handleRegister = async (e) => {
  e.preventDefault();

  if (!email.trim() || !password || !confirmPassword) {
    setSnack({
      open: true,
      severity: "warning",
      message: "Please fill all fields.",
    });
    return;
  }

  if (password !== confirmPassword) {
    setSnack({
      open: true,
      severity: "error",
      message: "Passwords do not match.",
    });
    return;
  }

  try {
    await apiClient.post("/register", {
      name,
      email,
      password,
    });

    setSnack({
      open: true,
      severity: "success",
      message: "Registration successful. Redirecting to login...",
    });

    setTimeout(() => navigate("/login"), 700);
  } catch (err) {
    setSnack({
      open: true,
      severity: "error",
      message:
        err.response?.data?.message ||
        "Registration failed. Please try again.",
    });
  }
};


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
      <Paper elevation={6} 
      sx={{ width: '100%', 
      maxWidth: 1100, 
      borderRadius: 4, 
      overflow: 'hidden' 
      }}>
        <Grid container minHeight={600}>
          <Grid 
          xs={12} md={6} sx={{ p: { xs: 4, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                <LockOutlinedIcon sx={{ fontSize: 32 }} />
              </Avatar>

              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }} >
                Create account
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Register to get started
              </Typography>
            </Box>

            <Box component="form" noValidate onSubmit={handleRegister} sx={{ maxWidth: 444}} >
              <TextField fullWidth label="Full Name" margin="normal" value={name} onChange={(e) => setName(e.target.value)} />

              <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />

              <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />

              <TextField fullWidth label="Confirm Password" type="password" margin="normal" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

              <Button fullWidth variant="contained" size="large" sx={{ mt: 2, py: 1.2, borderRadius: 2 }} type="submit">Register</Button>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Already have an account?{' '}
                <MuiLink component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
                  Login
                </MuiLink>
              </Typography>

              <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                Forgot password?{' '}
                <MuiLink component={RouterLink} to="/forget-password" sx={{ fontWeight: 600 }}>
                  Reset here
                </MuiLink>
              </Typography>
            </Box>
          </Grid>

          <Grid xs={12} md={6} sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Box textAlign="center" px={6} maxWidth={420}>
              <Box component="img" src={registerImg} alt="Register Illustration" sx={{ width: '100%', maxWidth: 360, mx: 'auto' }} />
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
