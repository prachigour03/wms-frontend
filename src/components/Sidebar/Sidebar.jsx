import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import companyLogo from "../../assets/logo1.png";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Divider,
  Tooltip,
  Collapse,
} from "@mui/material";

import { Close, KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import PushPin from "@mui/icons-material/PushPin";
import PushPinOutlined from "@mui/icons-material/PushPinOutlined";

import { SIDEBAR_CONFIG } from "../../config/sidebarConfig";
import { useAuth } from "../../auth/AuthContext";

const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 260;

const Sidebar = ({ open, onClose, collapsed, setCollapsed }) => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const isMobile = useMediaQuery("(max-width:600px)");

  const isCollapsed = collapsed ?? true;
  const [expandedMap, setExpandedMap] = useState({});
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setCollapsed(!pinned);
    }
  }, [pinned, setCollapsed, isMobile]);

  const handleMouseEnter = () => {
    if (isMobile || pinned || !isCollapsed) return;
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    if (isMobile || pinned || isCollapsed) return;
    setCollapsed(true);
  };

  const handlePinToggle = useCallback(() => {
    if (isMobile) return;
    setPinned((prev) => !prev);
  }, [isMobile]);

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      onClose?.();
    },
    [navigate, onClose]
  );

  const filterItems = useCallback(
    (items) => {
      return items
        .map((item) => {
          const children = item.children ? filterItems(item.children) : [];
          const hasAccess = item.permission ? hasPermission(item.permission) : true;

          if (children.length > 0) {
            return { ...item, children };
          }

          if (hasAccess) {
            return { ...item, children: [] };
          }

          return null;
        })
        .filter(Boolean);
    },
    [hasPermission]
  );

  const visibleItems = useMemo(() => filterItems(SIDEBAR_CONFIG), [filterItems]);

  const isItemActive = useCallback(
    (item) => {
      if (item.path) {
        return pathname === item.path || pathname.startsWith(item.path + "/");
      }

      if (item.children?.length) {
        return item.children.some(isItemActive);
      }

      return false;
    },
    [pathname]
  );

  useEffect(() => {
    const expandActive = (items, map = {}) => {
      items.forEach((item) => {
        const key = item.path || item.text;
        if (item.children?.length && isItemActive(item)) {
          map[key] = true;
          expandActive(item.children, map);
        }
      });
      return map;
    };

    setExpandedMap((prev) => ({
      ...expandActive(visibleItems),
      ...prev,
    }));
  }, [visibleItems, isItemActive]);

  const toggleExpand = useCallback((key) => {
    setExpandedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const drawerWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const SidebarItem = ({ item, depth = 0 }) => {
    const hasChildren = item.children?.length > 0;
    const isActive = isItemActive(item);
    const key = item.path || item.text;
    const expanded = expandedMap[key] ?? false;
    const Icon = item.icon;

    return (
      <Box>
        <Tooltip title={isCollapsed ? item.text : ""} placement="right">
          <ListItem disablePadding>
            <ListItemButton
              selected={isActive}
              onClick={() =>
                hasChildren ? toggleExpand(key) : handleNavigate(item.path)
              }
              sx={{
                borderRadius: 2,
                pl: isCollapsed ? 1 : 2 + depth * 2,
                justifyContent: isCollapsed ? "center" : "flex-start",
                backgroundColor: isActive ? "rgba(25,118,210,0.08)" : "transparent",
                color: isActive ? "primary.main" : "inherit",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isCollapsed ? 0 : 1.5,
                  color: isActive ? "primary.main" : "inherit",
                }}
              >
                {Icon ? <Icon fontSize="small" /> : null}
              </ListItemIcon>

              {!isCollapsed && (
                <>
                  <ListItemText primary={item.text} />
                  {hasChildren && (expanded ? <KeyboardArrowDown /> : <KeyboardArrowUp />)}
                </>
              )}
            </ListItemButton>
          </ListItem>
        </Tooltip>

        {!isCollapsed && hasChildren && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List sx={{ pl: 1 }}>
              {item.children.map((child) => (
                <SidebarItem key={child.path || child.text} item={child} depth={depth + 1} />
              ))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const drawerContent = useMemo(
    () => (
      <>
        <Box
          sx={{
            position: "relative",
            p: 2,
            height: isCollapsed ? 80 : 140,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#e6f2ee",
          }}
        >
          <Box
            component="img"
            src={companyLogo}
            alt="Company Logo"
            sx={{
              width: isCollapsed ? 36 : 64,
              height: "auto",
              transition: "all 0.25s ease",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
            }}
          >
            {!isMobile && !isCollapsed && (
              <IconButton size="small" onClick={handlePinToggle}>
                {pinned ? <PushPin fontSize="small" /> : <PushPinOutlined fontSize="small" />}
              </IconButton>
            )}

            {isMobile && (
              <IconButton size="small" onClick={onClose}>
                <Close fontSize="small" />
              </IconButton>
            )}
          </Box>

          {!isCollapsed && (
            <Box
              sx={{
                mt: 1,
                fontSize: 16,
                fontWeight: 600,
                color: "#0b6b5f",
              }}
            >
              ABC Technologies
            </Box>
          )}
        </Box>

        <Divider />

        <List sx={{ p: 1 }}>
          {visibleItems.map((item) => (
            <SidebarItem key={item.path || item.text} item={item} />
          ))}
        </List>
      </>
    ),
    [
      isCollapsed,
      isMobile,
      handlePinToggle,
      onClose,
      pinned,
      visibleItems,
      expandedMap,
      pathname,
    ]
  );

  return (
    <>
      <Drawer
        variant="permanent"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            top: 64,
            height: "calc(100vh - 64px)",
            transition: "width 0.25s",
            overflowX: "hidden",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          disableEnforceFocus: true,
          disableAutoFocus: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: EXPANDED_WIDTH,
            top: 64,
            height: "calc(100vh - 64px)",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
