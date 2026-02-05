import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { alpha, styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../../api/profile.api';
import { useSelector, useDispatch } from 'react-redux';
import { clearNotifications, markAsReads, fetchNotifications } from '../../features/notificationSlice';
import { useRef } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(
  /\/$/,
  ""
);
const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, "");

/* ================= STYLES ================= */
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  marginLeft: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
}));

const StyledInput = styled(InputBase)(() => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    fontSize: 14,
    minWidth: 120,
  },
}));

/* ================= COMPONENT ================= */
function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const list = useSelector((s) => s.notifications.list);
  const count = list.filter((n) => !n.read).length;
  const prevCountRef = useRef(count);

  const [anchorEl, setAnchorEl] = useState(null);
  const [profile, setProfile] = useState(null);

  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');

  const open = Boolean(anchorEl);
  const notifMenuOpen = Boolean(notifAnchorEl);

  // show a toast when new notifications arrive
  useEffect(() => {
    if (count > prevCountRef.current) {
      const last = list[list.length - 1];
      const msg = last?.message || `${count - prevCountRef.current} new notifications`;
      const id = setTimeout(() => {
        setNotifMsg(msg);
        setNotifOpen(true);
      }, 0);

      return () => clearTimeout(id);
    }

    prevCountRef.current = count;
  }, [count, list]);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    const id = setInterval(() => {
      dispatch(fetchNotifications());
    }, 15000);
    return () => clearInterval(id);
  }, [dispatch]);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getMyProfile();
        if (res?.success) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error("Navbar profile fetch failed", err);
      }
    };
    loadProfile();
  }, []);

  const handleAvatarOpen = (e) => setAnchorEl(e.currentTarget);
  const handleAvatarClose = () => setAnchorEl(null);

  const handleNotifOpen = (e) => {
    setNotifAnchorEl(e.currentTarget);
    dispatch(fetchNotifications());
  };
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const avatarSrc = profile?.profileImage
    ? profile.profileImage.startsWith("http")
      ? profile.profileImage
      : `${BACKEND_URL}${profile.profileImage}`
    : "";

  const avatarFallback =
    profile?.firstName
      ? profile.firstName.charAt(0).toUpperCase()
      : "U";

  return (
    <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>

        {/* LEFT */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit" onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
        </Box>

        {/* RIGHT */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 5.5 }}>

          <IconButton
            color="inherit"
            onClick={handleNotifOpen}
            aria-label="notifications"
          >
            <Badge badgeContent={count} color="error" invisible={count === 0}>
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* DYNAMIC PROFILE AVATAR */}
          <IconButton onClick={handleAvatarOpen}>
            <Avatar
              src={avatarSrc}
              alt={profile?.firstName || "User"}
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#42a5f5',
                fontWeight: 600,
              }}
            >
              {!avatarSrc && avatarFallback}
            </Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={open} onClose={handleAvatarClose}>
            <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
            <MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>

          <Menu anchorEl={notifAnchorEl} open={notifMenuOpen} onClose={handleNotifClose}>
            {list.length > 0 ? [
              ...list.slice(0, 5).map((notif) => (
                <MenuItem
                  key={notif.id}
                  onClick={() => {
                    dispatch(markAsReads(notif.id));
                    handleNotifClose();
                  }}
                  sx={{ maxWidth: 300 }}
                >
                  <Typography variant="body2" noWrap>
                    {notif.message}
                  </Typography>
                </MenuItem>
              )),
              <MenuItem key="view-all" onClick={() => { navigate('/Notification'); handleNotifClose(); }}>
                View All Notifications
              </MenuItem>,
              <MenuItem key="clear-all" onClick={() => { dispatch(clearNotifications()); handleNotifClose(); }}>
                Clear All
              </MenuItem>
            ] : (
              <MenuItem disabled>No notifications</MenuItem>
            )}
          </Menu>
        </Box>
      </Toolbar>

      <Snackbar
        open={notifOpen}
        autoHideDuration={4000}
        onClose={() => setNotifOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setNotifOpen(false)} severity="info" sx={{ width: '100%' }}>
          {notifMsg}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}

export default Navbar;
