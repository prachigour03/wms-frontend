import {
  Dashboard,
  Settings,
  AttachMoney,
  Public,
  AccountTree,
  LocationOn,
  PersonAdd,
  People,
  ShoppingCart,
} from "@mui/icons-material";

import { PERMISSIONS } from "../rbac/permissions";

export const SIDEBAR_CONFIG = [
  {
    text: "Dashboard",
    icon: Dashboard,
    path: "/",
    permission: PERMISSIONS.DASHBOARD,
  },

  {
    text: "Setup",
    icon: Settings,
    children: [
      {
        text: "Company Details",
        path: "/setup/companyDetail",
        icon: AccountTree,
        permission: PERMISSIONS.COMPANY_DETAILS,
      },
      {
        text: "Currencies",
        path: "/setup/Currencies",
        icon: AttachMoney,
        permission: PERMISSIONS.CURRENCIES,
      },
      {
        text: "States",
        path: "/setup/States",
        icon: Public,
        permission: PERMISSIONS.STATES,
      },
      {
        text: "Locations",
        path: "/setup/Locations",
        icon: LocationOn,
        permission: PERMISSIONS.LOCATIONS,
      },
      {
        text: "Users",
        path: "/setup/NewUsers",
        icon: PersonAdd,
        permission: PERMISSIONS.USERS,
      },
      {
        text: "Roles",
        path: "/setup/UserRoles",
        icon: People,
        permission: PERMISSIONS.ROLES,
      },
    ],
  },

  {
    text: "O2C",
    icon: ShoppingCart,
    children: [
      {
        text: "Order Booking",
        path: "/O2C/OrderBooking",
        icon: ShoppingCart,
        permission: PERMISSIONS.ORDER_BOOKINGS,
      },
    ],
  },
];
