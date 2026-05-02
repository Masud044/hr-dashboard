import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


import Home from "./pages/Home";

import { ToastContainer } from 'react-toastify';



import WelcomePage from "./pages/welcomePage";
import DashboardLayout from "./Layout/DashboardLayout";
import Dashboard from "./features/main-entry/pages/Dashboard"
import Project from "./features/setting/pages/Project";
import Contractor from "./features/setting/pages/Contractor";

import Supplier from "./features/setting/pages/Supplier";
import Admin from "./features/user/pages/Admin";
import DashboardTimeline from "./features/main-entry/pages/DashboardTimeline";
// import User from "./features/user/pages/User";
// import CreateProcess from "./features/setting/pages/CreateProcess";
import EditProject from "./features/setting/pages/EditProject";
import User from "./features/user/pages/User";
import LoginV2 from "./features/authentication-v2/index";
import RegisterV2 from "./features/authentication-v2/register-index";








const App = () => {
  // function PrivateRoute({ children }) {
  //   const { isAuthenticated } = useAuth();
  //   return isAuthenticated ? children : <Navigate to="/login" />;
  // }
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          <Route path="/" element={<Home></Home>} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Default dashboard view */}
            <Route index element={<WelcomePage />} />

            
            <Route path="supplier" element={<Supplier />} />
            <Route path="supplier/:id" element={<Supplier />} />
       
            <Route path="admin" element={<Admin/>} />
            <Route path="admin/:id" element={<Admin/>} />
           
            <Route path="project" element={<Project/>} />
            <Route path="project/:id" element={<Project/>} />

            <Route path="contractor" element={<Contractor/>} />
            <Route path="contractor/:id" element={<Contractor/>} />

            <Route path="user" element={<User/>} />
            <Route path="user/:id" element={<User/>} />
            
             <Route path="dashboard-schedule" element={<Dashboard/>} />
             <Route path="dashboard-schedule/:id" element={<Dashboard/>} />
             
            <Route path="timeline" element={<DashboardTimeline />} />
             <Route path="timeline/:H_ID" element={<DashboardTimeline />} />
              <Route path="process" element={<EditProject />} />

              <Route path="process/:id" element={<EditProject />} />
             

            
           
          

          </Route>
          
          <Route path="/login" element={<LoginV2></LoginV2>} />
          <Route path="/register" element={<RegisterV2></RegisterV2>} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
