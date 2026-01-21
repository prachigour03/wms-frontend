import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import EmployeeDetails from '../pages/Employees/EmployeeDetails';
import EmployeeList from '../pages/Employees/EmployeeList';
import LoginPage from '../pages/Auth/Login';
import RegisterPage from '../pages/Auth/Register';
import ProtectedRoute from './ProtectedRoute';
import Profile from '../pages/Auth/Profile';
import Settings from '../pages/Auth/Settings';
import OrderBooking from '../pages/O2C/OrderBooking';
import CompanyDetail from '../pages/Setup/CompanyDetail';
import Currencies from '../pages/Setup/Currencies';
import Department from '../pages/Setup/Departments';
import States from '../pages/Setup/States';
import Location from '../pages/Setup/Locations';
import Cities from '../pages/Setup/Cities';
import NewUsers from '../pages/Setup/NewUsers';
import Subsidiaries from '../pages/Setup/Subsidiaries';
import UtiltySettings from '../pages/Setup/UtilitySettings';
import PaymentTeam from '../pages/Setup/PaymentTeam';
import SystemLogs from '../pages/Setup/SystemLogs';
import InventoryCount from '../pages/Transition/InventoryCount';
import InwardChallan from '../pages/Transition/InwardChallan';
import ReturnMaterial from '../pages/Transition/ReturnMaterial';
import VendorIssueMaterial from '../pages/Transition/VendorissueMaterial';
import MaterialConsumption from '../pages/Transition/MaterialConsumption';
import VendorBill from '../pages/Transition/VendorBill';
import AccountTypes from '../pages/Master/AccountTypes';
import ChartOfAccounts from '../pages/Master/ChartOfAccounts';
import Customer from '../pages/Master/Customer';
import ItemRateMaster from '../pages/Master/ItemRateMaster';
import Items from '../pages/Master/items';
import ItemsGroups from '../pages/Master/ItemsGroups';
import MaterialStatus from '../pages/Master/MaterialStatus';
import MSItypes from '../pages/Master/MSItypes';
import SACcodes from '../pages/Master/SACcodes';
import ServiceCategories from '../pages/Master/ServiceCategories';
import ServicesRateMaster from '../pages/Master/ServicesRateMaster';
import ServicesTypes from '../pages/Master/ServicesTypes';
import Sites from '../pages/Master/Sites';
import Stores from '../pages/Master/Stores';
import TransportationModes from '../pages/Master/TransportationModes';
import Uom from '../pages/Master/Uom';
import Vendors from '../pages/Master/Vendors';
import Warehouses from '../pages/Master/Warehouses';
import WorkCategories from '../pages/Master/WorkCategories';
import ForgetPassword from '../pages/Auth/ForgetPassword';
import ProfileImageUpload from '../components/Profile/ProfileImageUpload';
import Notification from '../pages/Auth/Notification';


const AppRoutes = () => {
  return (
    <Router>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path='/ForgetPassword' element={<ForgetPassword />}/>

        {/* PROTECTED ROUTES */}
        <Route 
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />

        
          {/*O2C*/}
          <Route path="O2C/OrderBooking" element={<OrderBooking />} />
          <Route path="/notification" element={<Notification />} />




          {/*Setup*/}
          <Route path="setup/CompanyDetail" element={<CompanyDetail />} />
          <Route path="setup/Currencies" element={<Currencies />} />
          <Route path="setup/Departments" element={<Department/>} />
          <Route path="setup/States" element={<States/>} />
          <Route path="setup/Locations" element={<Location />} />
          <Route path='setup/Cities' element={<Cities/>} />
          <Route path="setup/NewUsers" element={<NewUsers/>} />
         <Route path='setup/PaymentTeam' element={<PaymentTeam/>}/>
         <Route path='setup/Subsidiaries' element={<Subsidiaries/>}/>
         <Route path='setup/SystemLogs' element={<SystemLogs/>}/>
         <Route path='setup/UtilitySettings' element={<UtiltySettings/>}/>

         {/*Transition*/}
         <Route path='transition/InventoryCount' element={<InventoryCount/>}/>
         <Route path='transition/InwardChallan' element={<InwardChallan/>}/>
         <Route path='transition/MaterialConsumption' element={<MaterialConsumption/>}/>
         <Route path='transition/ReturnMaterial' element={<ReturnMaterial/>}/>
         <Route path='transition/VendorBill' element={<VendorBill/>}/>
         <Route path='transition/VendorissueMaterial' element={<VendorIssueMaterial/>}/>

         {/*Master Routes */}
         <Route path='master/AccountTypes' element={<AccountTypes/>}/>
         <Route path='master/ChartOfAccounts' element={<ChartOfAccounts/>}/>
         <Route path='master/Customer' element={<Customer />}/>
         <Route path='master/ItemRateMaster' element={<ItemRateMaster/>}/>
         <Route path='/Employees/EmployeeDetails' element={<EmployeeDetails/>}/>
          <Route path='/Employees/EmployeeList' element={<EmployeeList/>}/>
         <Route path='master/items' element={<Items/>}/>
         <Route path='master/ItemsGroups' element={<ItemsGroups/>}/>
         <Route path='master/MaterialStatus' element={<MaterialStatus/>}/>
         <Route path='master/MSItypes' element={<MSItypes/>}/>
         <Route path='master/SACcodes' element={<SACcodes/>}/>
         <Route path='master/ServiceCategories' element={<ServiceCategories/>}/>
         <Route path='master/ServicesRateMaster' element={<ServicesRateMaster/>} />
         <Route path='master/ServicesTypes' element={<ServicesTypes/>} />
         <Route path='master/Sites' element={<Sites/>}/>
         <Route path='master/Stores' element={<Stores/>}/>
         <Route path='master/TransportationModes' element={<TransportationModes/>}/>
         <Route path='master/Uom' element={<Uom />}/>
         <Route path='master/Vendors' element={<Vendors />}/>
         <Route path='master/Warehouses' element={<Warehouses />}/>
         <Route path='master/WorkCategories' element={<WorkCategories />}/>
         <Route path="profile" element={<Profile />} />
         <Route path="profileImageUpload" element={<ProfileImageUpload/>}/>
         <Route path="settings" element={<Settings />} />
         

        </Route>
          
        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/NO" replace />} />

      </Routes>
    </Router>
  );
};

export default AppRoutes;
