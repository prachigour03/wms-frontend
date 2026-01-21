import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  Avatar,
  FormControlLabel,
  Checkbox,
  Link as MuiLink,
  Snackbar,
  Alert
} from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import loginImg from '../../assets/loginImg.jpg';
import { Link as RouterLink, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [snack, setSnack] = useState({ open: false, severity: 'info', message: '' });
  const navigate = useNavigate();

//   useEffect(() => {
//   const remembered = localStorage.getItem("rememberUser");
//   if (remembered) setEmail(remembered);

//   const token = localStorage.getItem("token");
//   if (token) {
//     setSnack({
//       open: true,
//       severity: "info",
//       message: "Already signed in — redirecting...",
//     });
//     setTimeout(() => navigate("/"), 700);
//   }
// }, [navigate]);


  const handleLogin = async (e) => {
  e.preventDefault();

  if (!email.trim() || !password) {
    setSnack({
      open: true,
      severity: "warning",
      message: "Please enter email and password.",
    });
    return;
  }

  try {
    const res = await apiClient.post("/login", {
      email,
      password,
    });

    const { token, user } = res.data;

    // Save JWT token
    localStorage.setItem("token", token);

    // Save user (optional)
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Remember email
    if (remember) {
      localStorage.setItem("rememberUser", email);
    } else {
      localStorage.removeItem("rememberUser");
    }

    setSnack({
      open: true,
      severity: "success",
      message: `Welcome back, ${user.name || user.email}`,
    });

    setTimeout(() => navigate("/"), 700);
  } catch (err) {
    setSnack({
      open: true,
      severity: "error",
      message:
        err.response?.data?.message || "Login failed. Please try again.",
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
        background: 'linear-gradient(180deg,#f3f6ff 0%, #f7fbff 100%)'
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 1100,
          borderRadius: 4,
          overflow: "hidden"
        }}
      >
        <Grid container minHeight={600}>
          {/* LEFT SIDE – LOGIN FORM */}
          <Grid
            xs={12}
            md={6}
            sx={{
              p: { xs: 4, md: 6 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                <LockOutlinedIcon sx={{ fontSize: 32 }} />
              </Avatar>

              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                Welcome Back
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Sign in to access your dashboard
              </Typography>
            </Box>

            <Box component="form" noValidate onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <FormControlLabel control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />} label="Remember me" />
                <MuiLink component={RouterLink} to="/ForgetPassword" sx={{ color: 'primary.main' }}>
                  Forgot Password?
                </MuiLink>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 2, py: 1.2, borderRadius: 2 }}
                type="submit"
              >
                Login
              </Button>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Don’t have an account?{' '}
                <MuiLink component={RouterLink} to="/register" sx={{ fontWeight: 600 }}>
                  Register
                </MuiLink>
              </Typography>
            </Box>
          </Grid>

          {/* RIGHT SIDE – ILLUSTRATION + MARKETING */}
          <Grid
            xs={12}
            md={6}
            sx={{
              background:
                "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              position: "relative"
            }}
          >
            <Box textAlign="center" px={6} maxWidth={420}>
              <Box
                component="img"
                src={loginImg}
                alt="Login Illustration"
                sx={{
                  width: "100%",
                  maxWidth: 360,
                  mx: "auto"
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
