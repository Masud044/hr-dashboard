import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Registration";
import Home from "./pages/Home";
// import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./authentication/AuthProvider";

import DashboardHome from "./pages/DashboardHome";
// import JournalVoucher from "./components/MainEntry/PaymentVoucherList";
import PaymentVoucherForm from "./components/MainEntry/PaymentVoucher/PaymentVoucherForm";
import ReceiveVoucher from "./components/MainEntry/ReceiveVoucher/ReceiveVoucher";
import ChartAccountForm from "./components/MainEntry/ChartAccountForm";

import JournalVoucher from "./components/MainEntry/JournalVoucher/JournalVoucher";
import CashTransfer from "./components/MainEntry/CashTransfer/CashTransfer";
import SupplierPage from "./components/Setting/supplier/SupplierSetting";
import CustomerPage from "./components/Setting/customer/CustomerSetting";
import AdminUserPage from "./components/User/Admin/AdminUser";
import Project from "./components/Setting/project/Project";
import Contrator from "./components/Setting/contrator/Contrator";
import User from "./components/User/user/User";
import ContractionProcess from "./components/report/contractionProcess/ContractionProcess";


import { ToastContainer } from 'react-toastify';

import Shedule from "./components/report/shedule/shedule";
import SheduleLine from "./components/report/sheduleLine/SheduleLine";
import ReactTimelineDemo from "./pages/test-page";
import FrappeGanttDemo from "./pages/test-page-two";






const App = () => {
  function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
  }
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          <Route path="/" element={<Home></Home>} />
          <Route path="/dashboard" element={<Dashboard />}>
            {/* Default dashboard view */}
            <Route index element={<DashboardHome />} />

            {/* Payment Voucher route */}

            <Route path="payment-voucher" element={<PaymentVoucherForm />} />
            <Route
              path="payment-voucher/:voucherId"
              element={<PaymentVoucherForm />}
            />
            <Route path="journal-voucher" element={<JournalVoucher />} />
            <Route path="journal-voucher/:voucherId" element={<JournalVoucher />} />

            <Route path="receive-voucher" element={<ReceiveVoucher />} />
            <Route path="receive-voucher/:voucherId" element={<ReceiveVoucher />} />
            <Route path="cash-voucher" element={<CashTransfer />} />
            <Route path="cash-voucher/:voucherID" element={<CashTransfer />} />
            <Route path="supplier-setting-voucher" element={<SupplierPage />} />
            <Route path="supplier-setting-voucher/:id" element={<SupplierPage />} />
            <Route path="customer-setting-voucher" element={<CustomerPage />} />
            <Route path="customer-setting-voucher/:id" element={<CustomerPage />} />
            <Route path="admin-user" element={<AdminUserPage />} />
            <Route path="admin-user/:id" element={<AdminUserPage />} />
            <Route path="account-voucher" element={<ChartAccountForm />} />
            <Route path="project-setting" element={<Project />} />
            <Route path="project-setting/:id" element={<Project />} />
            <Route path="contrator-setting" element={<Contrator />} />
            <Route path="contrator-setting/:id" element={<Contrator />} />
            <Route path="user" element={<User />} />
            <Route path="user/:id" element={<User />} />
            <Route path="contraction-process" element={<ContractionProcess />} />
            <Route path="contraction-process/:id" element={<ContractionProcess />} />
            <Route path="shedule" element={<Shedule />} />
            <Route path="shedule/:id" element={<Shedule />} />
            <Route path="shedule-line" element={<SheduleLine />} />
            <Route path="shedule-line/:id" element={<SheduleLine />} />
            <Route path="test" element={<ReactTimelineDemo />} />
            <Route path="test2" element={<FrappeGanttDemo />} />

          </Route>
          <Route path="/login" element={<Login></Login>} />
          <Route path="/register" element={<Register></Register>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
