
// src\App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";

import Home from "./pages/Home";
import WelcomePage from "./pages/welcomePage";
import DashboardLayout from "./Layout/DashboardLayout";
import Dashboard from "./features/main-entry/pages/Dashboard";
import Project from "./features/setting/pages/Project";
import Contractor from "./features/setting/pages/Contractor";
import Supplier from "./features/setting/pages/Supplier";

import DashboardTimeline from "./features/main-entry/pages/DashboardTimeline";
import EditProject from "./features/setting/pages/EditProject";

import LoginV2 from "./features/authentication-v2/index";
import RegisterV2 from "./features/authentication-v2/register-index";
import ProtectedRoute from "./pages/route/ProtectedRoute";
import UnauthorizedPage from "./pages/route/Unauthorized";
import { useAuthV2 } from "./features/authentication-v2/use-auth-v2";
import { NuqsAdapter } from "nuqs/adapters/react";
import Grades from "./features/user-management";
import UserDetailsPage from "./features/user-management/user-details";
import Roles from "./features/users/role";
import Modules from "./features/users/module";
import Permissions from "./features/users/permission";
import OwnerInfo from "./features/setting/owner-info/owner-info";
import ContractorTypeInfo from "./features/setting/contractor-type-info/contractor-type-info";
import Calendar from "./features/setting/calendar/calender";
import ProjectType from "./features/setting/project-type/project-type";
import ContractorType from "./features/setting/contractor-type/contractor-type";
import DashboardTimelineTwo from "./features/main-entry/pages/DashboardTimelineTwo";
import StatementUpload from "./features/setting/pages/statement-upload";

import ProjectPage from "./features/project-two/project-page";
import { CreateProjectPage } from "./features/project-two/create-project-page";
import { EditProjectPage } from "./features/project-two/edit-project-page";
import { CreateContractorPage } from "./features/setting/pages/CreateContractorPage";
import { EditContractorPage } from "./features/setting/pages/EditContractorPage";
import { ProjectReportPage } from "./features/project-two/project-report-page";
import StatementUploadTwo from "./features/setting/pages/state-upload-two";
import Overview from "./features/overview/pages/Overview"; 
const ADMIN = ["Admin"];

// ── Dashboard Index — Admin হলে WelcomePage, অন্যথায় login এ redirect ──────
const DashboardIndex = () => {
  const { user, isLoading } = useAuthV2();
  if (isLoading) return null;
   if (user?.roles?.includes("Admin")) return <Overview />; 
  return <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
       <NuqsAdapter>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginV2 />} />
          <Route path="/register" element={<RegisterV2 />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Layout — Admin only */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute anyRole={ADMIN}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Index */}
            <Route index element={<DashboardIndex />} />

             <Route
                path="user-management"
                element={
                  <ProtectedRoute anyRole={ADMIN}>
                    <Grades />
                  </ProtectedRoute>
                }
              />

              <Route
                path="user-management/users/:id"
                element={
                  <ProtectedRoute anyRole={ADMIN}>
                    <UserDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="role"
                element={
                  <ProtectedRoute anyRole={ADMIN}>
                    <Roles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="module"
                element={
                  <ProtectedRoute anyRole={ADMIN}>
                    <Modules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="permission"
                element={
                  <ProtectedRoute anyRole={ADMIN}>
                    <Permissions />
                  </ProtectedRoute>
                }
              />


            <Route
              path="supplier"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                  <Supplier />
                </ProtectedRoute>
              }
            />
            <Route
              path="supplier/:id"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                  <Supplier />
                </ProtectedRoute>
              }
            />

           
           
            <Route
              path="project"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                  <Project />
                </ProtectedRoute>
              }
            />
             <Route
              path="statement"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                  <StatementUploadTwo />
                </ProtectedRoute>
              }
            />
            <Route
              path="project/:id"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                  <Project />
                </ProtectedRoute>
              }
            />

            <Route
              path="contractor"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                  <Contractor />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="contractor/:id"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                  <Contractor />
                </ProtectedRoute>
              }
            /> */}
            <Route path="contractor/create" element={<CreateContractorPage />} />
            <Route path="contractor/:id/edit" element={<EditContractorPage />} />

           <Route
                path="calendar"
                element={
                  <ProtectedRoute anyRole={ADMIN}>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="project-type"
                element={
                  <ProtectedRoute anyRole={ADMIN}>
                    <ProjectType />
                  </ProtectedRoute>
                }
              />

              <Route
                path="contractor-type"
                element={
                  <ProtectedRoute anyRole={ADMIN}>
                    <ContractorType />
                  </ProtectedRoute>
                }
              />
           <Route path="owner-info" element={<OwnerInfo />} />

           <Route path="contractor-type-info" element={<ContractorTypeInfo />} />

            <Route
              path="dashboard-schedule"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard-schedule/:id"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="timeline"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                  {/* <DashboardTimeline /> */}
                  <DashboardTimelineTwo />
                </ProtectedRoute>
              }
            />
            <Route
              path="timeline/:H_ID"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                  {/* <DashboardTimeline /> */}
                  <DashboardTimelineTwo />
                </ProtectedRoute>
              }
            />

            <Route path="projects/create" element={<CreateProjectPage />} />
            <Route path="projects/:id/edit" element={<EditProjectPage />} />
            <Route path="projects/:id/report" element={<ProjectReportPage />} />

            <Route
              path="process"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                  <EditProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="process/:id"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                  <EditProject />
                </ProtectedRoute>
              }
            />
             <Route
              path="projects"
              element={
                <ProtectedRoute anyRole={ADMIN}>
                <ProjectPage />
                </ProtectedRoute>
              }
            />

            {/* <Route path="project-process/:id" element={<ProcessPage />} /> */}
           
          </Route>
        </Routes>
      </Router>
       </NuqsAdapter>

    </>
  );
};

export default App;