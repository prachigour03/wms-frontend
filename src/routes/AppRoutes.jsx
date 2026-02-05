import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import LoginPage from "../pages/Auth/Login";
import RegisterPage from "../pages/Auth/Register";
import ProtectedRoute from "./ProtectedRoute";
import Profile from "../pages/Auth/Profile";
import Settings from "../pages/Auth/Settings";
import OrderBooking from "../pages/O2C/OrderBooking";
import CompanyDetail from "../pages/Setup/CompanyDetail";
import Currencies from "../pages/Setup/Currencies";
import Department from "../pages/Setup/Departments";
import States from "../pages/Setup/States";
import Location from "../pages/Setup/Locations";
import Cities from "../pages/Setup/Cities";
import NewUsers from "../pages/Setup/NewUsers";
import Subsidiaries from "../pages/Setup/Subsidiaries";
import UtiltySettings from "../pages/Setup/UtilitySettings";
import PaymentTeam from "../pages/Setup/PaymentTeam";
import SystemLogs from "../pages/Setup/SystemLogs";
import UserRoles from "../pages/Setup/UserRoles";
import InventoryCount from "../pages/Transition/InventoryCount";
import InwardChallan from "../pages/Transition/InwardChallan";
import ReturnMaterial from "../pages/Transition/ReturnMaterial";
import VendorIssueMaterial from "../pages/Transition/VendorissueMaterial";
import MaterialConsumption from "../pages/Transition/MaterialConsumption";
import VendorBill from "../pages/Transition/VendorBill";
import AccountTypes from "../pages/Master/AccountTypes";
import ChartOfAccounts from "../pages/Master/ChartOfAccounts";
import Customer from "../pages/Master/Customer";
import ItemRateMaster from "../pages/Master/ItemRateMaster";
import Items from "../pages/Master/items";
import ItemsGroups from "../pages/Master/ItemsGroups";
import MaterialStatus from "../pages/Master/MaterialStatus";
import MSItypes from "../pages/Master/MSItypes";
import SACcodes from "../pages/Master/SACcodes";
import ServiceCategories from "../pages/Master/ServiceCategories";
import ServicesRateMaster from "../pages/Master/ServicesRateMaster";
import ServicesTypes from "../pages/Master/ServicesTypes";
import Sites from "../pages/Master/Sites";
import Stores from "../pages/Master/Stores";
import TransportationModes from "../pages/Master/TransportationModes";
import Uom from "../pages/Master/Uom";
import Vendors from "../pages/Master/Vendors";
import Warehouses from "../pages/Master/Warehouses";
import WorkCategories from "../pages/Master/WorkCategories";
import ForgetPassword from "../pages/Auth/ForgetPassword";
import ProfileImageUpload from "../components/Profile/ProfileImageUpload";
import Notification from "../pages/Auth/Notification";
import ResetPassword from "../pages/Auth/ResetPassword";
import VerifyOtp from "../pages/Auth/VerifyOtp";
import EmployeeManagement from "../pages/Employees/EmployeeManagement";
import Unauthorized from "../pages/Auth/Unauthorized";

const withPermission = (permission, element) => (
  <ProtectedRoute requiredPermission={permission}>{element}</ProtectedRoute>
);

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/ForgetPassword" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={withPermission("dashboard:access", <DashboardPage />)} />

          {/* O2C */}
          <Route
            path="O2C/OrderBooking"
            element={withPermission("order_bookings:read", <OrderBooking />)}
          />
          <Route
            path="/notification"
            element={withPermission("notifications:read", <Notification />)}
          />

          {/* Setup */}
          <Route
            path="setup/CompanyDetail"
            element={withPermission("company_details:read", <CompanyDetail />)}
          />
          <Route
            path="setup/Currencies"
            element={withPermission("currencies:read", <Currencies />)}
          />
          <Route
            path="setup/Departments"
            element={withPermission("departments:read", <Department />)}
          />
          <Route
            path="setup/States"
            element={withPermission("states:read", <States />)}
          />
          <Route
            path="setup/Locations"
            element={withPermission("locations:read", <Location />)}
          />
          <Route
            path="setup/Cities"
            element={withPermission("cities:read", <Cities />)}
          />
          <Route
            path="setup/NewUsers"
            element={withPermission("users:read", <NewUsers />)}
          />
          <Route
            path="setup/UserRoles"
            element={withPermission("roles:read", <UserRoles />)}
          />
          <Route
            path="setup/PaymentTeam"
            element={withPermission("teams:read", <PaymentTeam />)}
          />
          <Route
            path="setup/Subsidiaries"
            element={withPermission("subsidiaries:read", <Subsidiaries />)}
          />
          <Route
            path="setup/SystemLogs"
            element={withPermission("system_logs:read", <SystemLogs />)}
          />
          <Route
            path="setup/UtilitySettings"
            element={withPermission("settings:read", <UtiltySettings />)}
          />

          {/* Transition */}
          <Route
            path="transition/InventoryCount"
            element={withPermission("inventory_counts:read", <InventoryCount />)}
          />
          <Route
            path="transition/InwardChallan"
            element={withPermission("inward_challans:read", <InwardChallan />)}
          />
          <Route
            path="transition/MaterialConsumption"
            element={withPermission("material_consumptions:read", <MaterialConsumption />)}
          />
          <Route
            path="transition/ReturnMaterial"
            element={withPermission("return_materials:read", <ReturnMaterial />)}
          />
          <Route
            path="transition/VendorBill"
            element={withPermission("vendor_bills:read", <VendorBill />)}
          />
          <Route
            path="transition/VendorissueMaterial"
            element={withPermission("vendor_issue_materials:read", <VendorIssueMaterial />)}
          />

          {/* Master Routes */}
          <Route
            path="master/AccountTypes"
            element={withPermission("account_types:read", <AccountTypes />)}
          />
          <Route
            path="master/ChartOfAccounts"
            element={withPermission("chart_of_accounts:read", <ChartOfAccounts />)}
          />
          <Route
            path="master/Customer"
            element={withPermission("customers:read", <Customer />)}
          />
          <Route
            path="master/ItemRateMaster"
            element={withPermission("items:read", <ItemRateMaster />)}
          />
          <Route
            path="/Employees/EmployeeManagement"
            element={withPermission("employees:read", <EmployeeManagement />)}
          />
          <Route
            path="master/items"
            element={withPermission("items:read", <Items />)}
          />
          <Route
            path="master/ItemsGroups"
            element={withPermission("item_groups:read", <ItemsGroups />)}
          />
          <Route
            path="master/MaterialStatus"
            element={withPermission("items:read", <MaterialStatus />)}
          />
          <Route
            path="master/MSItypes"
            element={withPermission("items:read", <MSItypes />)}
          />
          <Route
            path="master/SACcodes"
            element={withPermission("items:read", <SACcodes />)}
          />
          <Route
            path="master/ServiceCategories"
            element={withPermission("items:read", <ServiceCategories />)}
          />
          <Route
            path="master/ServicesRateMaster"
            element={withPermission("items:read", <ServicesRateMaster />)}
          />
          <Route
            path="master/ServicesTypes"
            element={withPermission("items:read", <ServicesTypes />)}
          />
          <Route
            path="master/Sites"
            element={withPermission("items:read", <Sites />)}
          />
          <Route
            path="master/Stores"
            element={withPermission("items:read", <Stores />)}
          />
          <Route
            path="master/TransportationModes"
            element={withPermission("items:read", <TransportationModes />)}
          />
          <Route
            path="master/Uom"
            element={withPermission("items:read", <Uom />)}
          />
          <Route
            path="master/Vendors"
            element={withPermission("vendors:read", <Vendors />)}
          />
          <Route
            path="master/Warehouses"
            element={withPermission("warehouses:read", <Warehouses />)}
          />
          <Route
            path="master/WorkCategories"
            element={withPermission("items:read", <WorkCategories />)}
          />

          <Route
            path="profile"
            element={withPermission("profile:read", <Profile />)}
          />
          <Route
            path="profileImageUpload"
            element={withPermission("profile:update", <ProfileImageUpload />)}
          />
          <Route
            path="settings"
            element={withPermission("settings:read", <Settings />)}
          />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
