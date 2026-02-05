import React, { useState, useCallback, useMemo } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import { Box, useTheme, useMediaQuery, Typography } from "@mui/material";

const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_EXPANDED_WIDTH = 260;

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Stable UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Memoized handlers (important)
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Derived sidebar props (stable)
  const sidebarProps = useMemo(
    () => ({
      open: isMobile ? sidebarOpen : true,
      onClose: handleSidebarClose,
      collapsed: isMobile ? false : sidebarCollapsed,
      setCollapsed: setSidebarCollapsed,
      variant: isMobile ? "temporary" : "permanent",
    }),
    [isMobile, sidebarOpen, sidebarCollapsed, handleSidebarClose]
  );

  const marginLeft = useMemo(() => {
    if (isMobile) return 0;
    return sidebarCollapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_EXPANDED_WIDTH;
  }, [isMobile, sidebarCollapsed]);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Navbar onMenuClick={handleSidebarToggle} />

      <Box sx={{ display: "flex", mt: "64px" }}>
        {/* Sidebar */}
        <Sidebar {...sidebarProps} />

        {/* Main Content */}
        <Box
          component="main"
          tabIndex={0}
          sx={{
            flexGrow: 1,
            p: { xs: 1.5, sm: 2.5 },
            backgroundColor: "#f5f5f5",
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            ml: { xs: 0, sm: `${marginLeft}px` },
            transition: "margin-left 0.25s ease",
          }}
        >
          {/* ROUTED CONTENT */}
          <Outlet />

          {/* FOOTER */}
          <Box
            component="footer"
            sx={{
              py: 2,
              mt: 78,
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#ffffff",
              position: "fixed",
              bottom: 0,
              alignItems: "anchor-center",
              width: "100%"
            }}
          >
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: "#666666",
                fontSize: "0.875rem",
              }}
            >
              © 2026 ABC Technologies Pvt. Ltd. – All Rights Reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
