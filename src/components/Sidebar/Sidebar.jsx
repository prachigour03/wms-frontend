import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';

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

} from '@mui/material';

import {
  Dashboard,
  Settings,
  Close,
  KeyboardArrowUp,
  KeyboardArrowDown,
  PersonAdd,
  LocationCity,
  LocationOn,
  AttachMoney,
  Public,
  AccountTree,
  Payment,
  Apartment,
  History,
  Inventory2,
  Assessment,
  ShoppingCart,
  KeyboardReturn,
  ReceiptLong,
  LocalShipping,
  AccountBalance,
  Build,
  Category,
  GroupWork,
  Code,
  ListAlt,
  Article,
  HomeWork,
  Work,
  People,
  Straighten,
} from '@mui/icons-material';

import BusinessSharp from '@mui/icons-material/BusinessSharp';
import ShoppingCartSharp from '@mui/icons-material/ShoppingCartSharp';
import SellSharp from '@mui/icons-material/SellSharp';
import ReceiptLongSharp from '@mui/icons-material/ReceiptLongSharp';
import PushPin from '@mui/icons-material/PushPin';
import PushPinOutlined from '@mui/icons-material/PushPinOutlined';

const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 260;

/* ===== MENU CONFIG ===== */
const navItems = [
  { text: 'Dashboard', icon: Dashboard, path: '/' },

  {
    text: 'Setup',
    icon: Settings,
    children: [
      { text: 'Company Details', path: '/setup/companyDetail', icon: Inventory2 },
      { text: 'Currencies', path: '/setup/Currencies', icon: AttachMoney },
      { text: 'States', path: '/setup/States', icon: Public },
      { text: 'Departments', path: '/setup/Departments', icon: AccountTree },
      { text: 'Locations', path: '/setup/Locations', icon: LocationOn },
      { text: 'New Users', path: '/setup/NewUsers', icon: PersonAdd },
      { text: 'Payment Team', path: '/setup/PaymentTeam', icon: Payment },
      { text: 'Cities', path: '/setup/Cities', icon: LocationCity },
      { text: 'Subsidiaries', path: '/setup/Subsidiaries', icon: Apartment },
      { text: 'System Logs', path: '/setup/SystemLogs', icon: History },
      { text: 'Utility Settings', path: '/setup/UtilitySettings', icon: Settings },
    ],
  },

  {
    text: 'Master',
    icon: BusinessSharp,
    children: [
       { text: 'Account Types', path: '/master/AccountTypes', icon: AccountBalance },
      { text: 'Chart of Accounts', path: '/master/ChartOfAccounts', icon: AccountTree},
      { text: 'Customer', path: '/master/Customer', icon: PersonAdd },
      { text: 'Employees', path: '/Employees/EmployeeDetails', icon: PersonAdd },
      { text: 'Item Rate Master', path: '/master/ItemRateMaster', icon: Inventory2 },
      { text: 'Items', path: '/master/items', icon: Inventory2 },
      { text: 'Material Status', path: '/master/MaterialStatus', icon: Build },
      { text: 'MSI Type', path: '/master/MSItypes', icon: Category},
      { text: 'Item Group', path: '/master/ItemsGroups', icon: GroupWork },
      { text: 'HSN/SAC Codes', path: '/master/SACcodes', icon: Code },
      { text: 'Service Categories', path: '/master/ServiceCategories',icon: Category },
      { text: 'Service Rate Master', path: '/master/ServicesRateMaster',icon: ListAlt},
      { text: 'Service Types', path: '/master/ServicesTypes',icon: Article },
      { text: 'Sites', path: '/master/Sites', icon: HomeWork },
      { text: 'Stores', path: '/master/Stores',icon: Straighten },
      { text: 'Transportation Modes', path: '/master/TransportationModes', icon: LocalShipping },
      { text: 'UOM', path: '/master/Uom', icon: Straighten },
      { text: 'Vendors', path: '/master/Vendors', icon: People },
      { text: 'Warehouses', path: '/master/Warehouses',icon: HomeWork },
      { text: 'Work Categories', path: '/master/WorkCategories',icon: Work },
    ],
  },

  {
    text: 'Transition',
    icon: ReceiptLongSharp,
    children: [
      { text: 'Inventory Count', path: '/transition/InventoryCount', icon: Inventory2 },
      { text: 'Inward Challan', path: '/transition/InwardChallan', icon: Assessment },
      { text: 'Material Consumption', path: '/transition/MaterialConsumption', icon: ShoppingCart },
      { text: 'Return Material', path: '/transition/ReturnMaterial', icon: KeyboardReturn },
      { text: 'Vendor Bill', path: '/transition/VendorBill', icon: ReceiptLong },
      { text: 'Vendor Issue Material', path: '/transition/VendorIssueMaterial', icon: LocalShipping },
    ],
  },

  {
    text: 'O2C',
    icon: SellSharp,
    children: [
      { text: 'Order Booking', path: '/O2C/OrderBooking', icon: ShoppingCartSharp },
    ],
  },
];

const Sidebar = ({ open, onClose, collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const isMobile = useMediaQuery('(max-width:600px)');

  const isCollapsed = collapsed ?? true;
  const [expandedMenu, setExpandedMenu] = useState(() => {
    const active = navItems.find(item =>
      item.children?.some(child => child.path === pathname)
    );
    return active?.text || null;
  });
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
    setPinned(prev => !prev);
  }, [isMobile]);

  const handleNavigate = useCallback((path) => {
    // set active parent menu when navigating to a child route
    const parent = navItems.find(item => item.children?.some(child => child.path === path));
    if (parent) setExpandedMenu(parent.text);
    else setExpandedMenu(null);
    navigate(path);
    onClose?.();
  }, [navigate, onClose]);

  const drawerWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const drawerContent = useMemo(() => (
    <>
      <Box
        sx={{
          p: 3,
          height: 100,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '0 0 8px 8px',
          background: 'linear-gradient(135deg, #0b6b5f, #1976d2)',
          color: '#fff',
        }}
      >
        <Dashboard />

        {!isMobile && !isCollapsed && (
          <IconButton onClick={handlePinToggle} sx={{ color: '#fff' }}>
            {pinned ?  <PushPin /> : <PushPinOutlined />}
          </IconButton>
        )}

        {isMobile && (
          <IconButton onClick={onClose} sx={{ color: '#fff' }}>
            <Close /> 
          </IconButton>
        )}
      </Box>

      <Divider />

      <List sx={{ p: 1 }}>
        {navItems.map(item => {
          const hasChildren = Boolean(item.children);
          const expanded = expandedMenu === item.text;

          return (
            <Box key={item.text}>
              <Tooltip title={isCollapsed ? item.text : ''} placement="right">
                <ListItem disablePadding>
                  {(() => {
                    const isActive = hasChildren
                      ? item.children.some(child => pathname === child.path || pathname.startsWith(child.path + '/'))
                      : item.path === pathname || pathname.startsWith(item.path + '/');

                    return (
                      <ListItemButton
                        selected={isActive}
                        onClick={() =>
                          hasChildren
                            ? setExpandedMenu(expanded ? null : item.text)
                            : handleNavigate(item.path)
                        }
                        sx={{
                          borderRadius: 2,
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          backgroundColor: isActive ? 'rgba(25,118,210,0.08)' : 'transparent',
                          color: isActive ? 'primary.main' : 'inherit',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 1.5, color: isActive ? 'primary.main' : 'inherit' }}>
                          <item.icon fontSize="small" />
                        </ListItemIcon>

                        {!isCollapsed && (
                          <>
                            <ListItemText primary={item.text} />
                            {hasChildren &&
                              (expanded ? <KeyboardArrowDown /> : <KeyboardArrowUp />)}
                          </>
                        )}
                      </ListItemButton>
                    );
                  })()}
                </ListItem>
              </Tooltip>

              {!isCollapsed && hasChildren && (
                <Collapse in={expanded}>
                  <List sx={{ pl: 3 }}>
                    {item.children.map(child => {
                      const isChildActive = pathname === child.path || pathname.startsWith(child.path + '/');
                      return (
                        <ListItem key={child.text} disablePadding>
                          <ListItemButton
                            selected={isChildActive}
                            onClick={() => handleNavigate(child.path)}
                            sx={{ borderRadius: 1, backgroundColor: isChildActive ? 'rgba(25,118,210,0.08)' : 'transparent' }}
                          >
                            <ListItemIcon sx={{ color: isChildActive ? 'primary.main' : 'inherit' }}>
                              <child.icon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={child.text} />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>

      
    </>
  ), [isCollapsed, expandedMenu, pinned, isMobile, handlePinToggle, handleNavigate, onClose, pathname]);

  return (
    <>
      <Drawer
        variant="permanent"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            top: 64,
            height: 'calc(100vh - 64px)',
            transition: 'width 0.25s',
            overflowX: 'hidden',
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
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: EXPANDED_WIDTH,
            top: 64,
            height: 'calc(100vh - 64px)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
