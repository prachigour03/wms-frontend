import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        gap: 2,
        px: 2,
      }}
    >
      <Typography variant="h4" fontWeight={700}>
        Access Denied
      </Typography>
      <Typography color="text.secondary">
        You do not have permission to view this page.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")}>Go to Dashboard</Button>
    </Box>
  );
};

export default Unauthorized;
