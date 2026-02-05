import {
  Dashboard,
  Settings,
  AttachMoney,
  Public,
  AccountTree,
  LocationOn,
  PersonAdd,
  People,
  Inventory2,
  Payment,
  LocationCity,
  Apartment,
  History,
  ReceiptLong,
  ShoppingCart,
  KeyboardReturn,
  LocalShipping,
  AccountBalance,
  GroupWork,
  HomeWork,
} from "@mui/icons-material";

import BusinessSharp from "@mui/icons-material/BusinessSharp";
import ShoppingCartSharp from "@mui/icons-material/ShoppingCartSharp";
import SellSharp from "@mui/icons-material/SellSharp";
import ReceiptLongSharp from "@mui/icons-material/ReceiptLongSharp";

export const SIDEBAR_CONFIG = [
  {
    text: "Dashboard",
    icon: Dashboard,
    path: "/",
    permission: "dashboard:access",
  },

  {
    text: "Setup",
    icon: Settings,
    children: [
      { text: "Company Details", path: "/setup/CompanyDetail", icon: Inventory2, permission: "company_details:read" },
      { text: "Currencies", path: "/setup/Currencies", icon: AttachMoney, permission: "currencies:read" },
      { text: "States", path: "/setup/States", icon: Public, permission: "states:read" },
      { text: "Departments", path: "/setup/Departments", icon: AccountTree, permission: "departments:read" },
      { text: "Locations", path: "/setup/Locations", icon: LocationOn, permission: "locations:read" },
      { text: "New Users", path: "/setup/NewUsers", icon: PersonAdd, permission: "users:read" },
      { text: "User Roles", path: "/setup/UserRoles", icon: People, permission: "roles:read" },
      { text: "Payment Terms", path: "/setup/PaymentTeam", icon: Payment, permission: "teams:read" },
      { text: "Cities", path: "/setup/Cities", icon: LocationCity, permission: "cities:read" },
      { text: "Subsidiaries", path: "/setup/Subsidiaries", icon: Apartment, permission: "subsidiaries:read" },
      { text: "System Logs", path: "/setup/SystemLogs", icon: History, permission: "system_logs:read" },
      { text: "Utility Settings", path: "/setup/UtilitySettings", icon: Settings, permission: "settings:read" },
    ],
  },

  {
    text: "Master",
    icon: BusinessSharp,
    children: [
      { text: "Account Types", path: "/master/AccountTypes", icon: AccountBalance, permission: "account_types:read" },
      { text: "Chart of Accounts", path: "/master/ChartOfAccounts", icon: AccountTree, permission: "chart_of_accounts:read" },
      { text: "Customer", path: "/master/Customer", icon: PersonAdd, permission: "customers:read" },
      { text: "Employees", path: "/Employees/EmployeeManagement", icon: PersonAdd, permission: "employees:read" },
      { text: "Items", path: "/master/items", icon: Inventory2, permission: "items:read" },
      { text: "Item Group", path: "/master/ItemsGroups", icon: GroupWork, permission: "item_groups:read" },
      { text: "Vendors", path: "/master/Vendors", icon: People, permission: "vendors:read" },
      { text: "Warehouses", path: "/master/Warehouses", icon: HomeWork, permission: "warehouses:read" },
    ],
  },

  {
    text: "Transition",
    icon: ReceiptLongSharp,
    children: [
      { text: "Inventory Count", path: "/transition/InventoryCount", icon: Inventory2, permission: "inventory_counts:read" },
      { text: "Inward Challan", path: "/transition/InwardChallan", icon: ReceiptLong, permission: "inward_challans:read" },
      { text: "Material Consumption", path: "/transition/MaterialConsumption", icon: ShoppingCart, permission: "material_consumptions:read" },
      { text: "Return Material", path: "/transition/ReturnMaterial", icon: KeyboardReturn, permission: "return_materials:read" },
      { text: "Vendor Bill", path: "/transition/VendorBill", icon: ReceiptLong, permission: "vendor_bills:read" },
      { text: "Vendor Issue Material", path: "/transition/VendorissueMaterial", icon: LocalShipping, permission: "vendor_issue_materials:read" },
    ],
  },

  {
    text: "O2C",
    icon: SellSharp,
    children: [
      { text: "Order Booking", path: "/O2C/OrderBooking", icon: ShoppingCartSharp, permission: "order_bookings:read" },
    ],
  },
];
