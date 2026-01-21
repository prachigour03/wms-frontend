import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, useTheme, useMediaQuery, Typography } from '@mui/material';

const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_EXPANDED_WIDTH = 260;

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSidebarToggle = () => {
    setSidebarOpen(prev => {
      const newOpen = !prev;
      // when opening on desktop, ensure expanded
      if (newOpen && !isMobile) setSidebarCollapsed(false);
      // when closing on mobile, collapse
      if (!newOpen && isMobile) setSidebarCollapsed(true);
      return newOpen;
    });
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    if (isMobile) setSidebarCollapsed(true);
  }; 

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navbar onMenuClick={handleSidebarToggle} />

      <Box sx={{ display: 'flex', mt: '64px' }}>
        {/* Sidebar */}
        <Sidebar
          open={isMobile ? sidebarOpen : true}
          onClose={handleSidebarClose}
          collapsed={isMobile ? false : sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          variant={isMobile ? 'temporary' : 'permanent'}
        />

        {/* Main Content */}
        <Box
          component="main"
          tabIndex={0}
          sx={{
            flexGrow: 1,
            p: { xs: 1.5, sm: 2.5 },
            backgroundColor: '#f5f5f5',
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',

            /* KEY FIX */
            ml: {
              xs: 0,
              sm: sidebarCollapsed
                ? `${SIDEBAR_COLLAPSED_WIDTH}px`
                : `${SIDEBAR_EXPANDED_WIDTH}px`,
            },

            transition: 'margin-left 0.25s ease',
          }}
        >
          <Outlet />
          <Box
            sx={{
              mt: 'auto',
              pt: 3,
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#ffffff',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                color: '#666666',
                fontSize: '0.875rem',
              }}
            >
              © 2026 ABC Technologies Pvt. Ltd. - All Rights Reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
