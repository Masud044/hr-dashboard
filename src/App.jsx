import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Registration";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./authentication/AuthProvider";

import DashboardHome from "./pages/DashboardHome";
import JournalVoucher from "./components/MainEntry/JournalVoucher";
import PaymentVoucherForm from "./components/MainEntry/PaymentVoucherForm";
import ReceiveVoucher from "./components/MainEntry/ReceiveVoucher";
import ChartAccountForm from "./components/MainEntry/ChartAccountForm";
import TransactionVoucher from "./components/MainEntry/TransactionVoucher";

const App = () => {
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}
  return (
     <AuthProvider>
      <Router>
      <Routes>
        
        <Route path="/" element={<Home></Home>} />
        <Route path="/dashboard" element={<Dashboard />}>
          {/* Default dashboard view */}
          <Route index element={<DashboardHome />} />   
          
          {/* Payment Voucher route */}
          <Route path="payment-voucher" element={<PaymentVoucherForm />} />
          <Route path="payment-voucher/:voucherId" element={<PaymentVoucherForm />} />
           <Route path="journal-voucher" element={<JournalVoucher />} />
           <Route path="receive-voucher" element={<ReceiveVoucher/>}/>
           <Route path="account-voucher" element={<ChartAccountForm />} />
            <Route path="cash-voucher" element={<TransactionVoucher/>} />
        </Route>
        <Route path="/login" element={<Login></Login>}/>
        <Route path="/register" element={<Register></Register>} />
      </Routes>
    </Router>
   
     </AuthProvider>
      
  );
};

export default App;
