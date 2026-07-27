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
import PlainLayout from "./Layout/PlainLayout";
import Dashboard from "./features/main-entry/pages/Dashboard";
import Project from "./features/setting/pages/Project";
import Contractor from "./features/setting/pages/Contractor";
import Supplier from "./features/setting/pages/Supplier";

import DashboardTimeline from "./features/main-entry/pages/DashboardTimeline";
import EditProject from "./features/setting/pages/EditProject";

import LoginV2 from "./features/authentication-v2/index";
import RegisterV2 from "./features/authentication-v2/register-index";
import ProtectedRoute from "./pages/route/ProtectedRoute";

import { useAuthV2 } from "./features/authentication-v2/use-auth-v2";
import { NuqsAdapter } from "nuqs/adapters/react";
import Grades from "./features/user-management";
import UserDetailsPage from "./features/user-management/user-details";
import Roles from "./features/users/role";
import RolePermissionMatrix from "./features/users/role/role-permission-matrix";
import RoleDetailsPage from "./features/users/role/role-details";
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
import StatementUploadThree from "./features/setting/pages/statement-upload-three";
import { InvoiceListPage } from "./features/invoice/invoice-list";
import { InvoiceCreatePage } from "./features/invoice/invoice-create-page";
import { InvoiceEditPage } from "./features/invoice/invoice-edit-page";

import { WorkerList } from "./features/worker/worker-list";
import { WorkerFormPage } from "./features/worker/worker-form-page";
import { AttendanceList } from "./features/worker-attendance/attendance-list";
import { AttendanceFormPage } from "./features/worker-attendance/attendance-form-page";
import { AttendanceReport } from "./features/worker-attendance/attendance-report";
import InvoiceManagementPage from "./features/setting/pages/statement-upload-three/invoice/InvoiceManagementPage";
import AddUserPage from "./features/user-management/add-user-page";
import EditUserPage from "./features/user-management/edit-user-page";

import {
  ALL_ROLES,
  ADMIN_ONLY,
  ADMIN_DE,
  ADMIN_DE_WORKER,
  ADMIN_OWNER,
} from "@/config/roles";
import UnauthorizedPage from "./pages/route/Unauthorized";

// ── Dashboard Index — role-based landing redirect ──────────────────────────
const DashboardIndex = () => {
  const { user, isLoading } = useAuthV2();
  if (isLoading) return null;
  const roles = user?.roles ?? [];
  if (roles.includes("Admin")) return <Overview />;
  if (roles.includes("DataEntry"))
    return <Navigate to="/dashboard/worker-attendance" replace />;
  if (roles.includes("Worker"))
    return <Navigate to="/dashboard/worker-attendance" replace />;
  if (roles.includes("Owner"))
    return <Navigate to="/dashboard/projects" replace />;
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
            {/* PlainLayout — Admin only, no sidebar */}
<Route
  element={
    <ProtectedRoute anyRole={ADMIN_OWNER}>
      <PlainLayout />
    </ProtectedRoute>
  }
>
  <Route
    path="/dashboard/projects/:id/report"
    element={<ProjectReportPage />}
  />
</Route>

            {/* Protected Layout — all roles can enter, sidebar filters per-role */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute anyRole={ALL_ROLES}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Index */}
              <Route index element={<DashboardIndex />} />

              <Route
                path="user-management"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <Grades />
                  </ProtectedRoute>
                }
              />
              <Route
                path="user-management/users/create"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <AddUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="user-management/users/:id/edit"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <EditUserPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="user-management/users/:id"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <UserDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="role"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <Roles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="role/matrix"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <RolePermissionMatrix />
                  </ProtectedRoute>
                }
              />
              <Route
                path="role/:id"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <RoleDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="module"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <Modules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="permission"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <Permissions />
                  </ProtectedRoute>
                }
              />

              <Route
                path="supplier"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <Supplier />
                  </ProtectedRoute>
                }
              />
              <Route
                path="supplier/:id"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <Supplier />
                  </ProtectedRoute>
                }
              />

              <Route
                path="project"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <Project />
                  </ProtectedRoute>
                }
              />
              <Route
                path="statement"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    {/* <StatementUploadTwo /> */}
                    <StatementUploadThree />
                  </ProtectedRoute>
                }
              />
              <Route
                path="statement/:parentType/:parentId/invoices"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <InvoiceManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="project/:id"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <Project />
                  </ProtectedRoute>
                }
              />

              <Route
                path="contractor"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <Contractor />
                  </ProtectedRoute>
                }
              />
              {/* <Route
              path="contractor/:id"
              element={
                <ProtectedRoute anyRole={ADMIN_ONLY}>
                  <Contractor />
                </ProtectedRoute>
              }
            /> */}
              <Route
                path="contractor/create"
                element={<CreateContractorPage />}
              />
              <Route
                path="contractor/:id/edit"
                element={<EditContractorPage />}
              />

              <Route
                path="worker"
                element={
                  <ProtectedRoute anyRole={ADMIN_DE}>
                    <WorkerList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="worker/create"
                element={
                  <ProtectedRoute anyRole={ADMIN_DE}>
                    <WorkerFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="worker/:workerId/edit"
                element={
                  <ProtectedRoute anyRole={ADMIN_DE}>
                    <WorkerFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="worker-attendance"
                element={
                  <ProtectedRoute anyRole={ADMIN_DE_WORKER}>
                    <AttendanceList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="worker-attendance/create"
                element={
                  <ProtectedRoute anyRole={ADMIN_DE_WORKER}>
                    <AttendanceFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="worker-attendance/:attendanceId/edit"
                element={
                  <ProtectedRoute anyRole={ADMIN_DE_WORKER}>
                    <AttendanceFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="attendance-report"
                element={
                  <ProtectedRoute anyRole={ADMIN_DE}>
                    <AttendanceReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="calendar"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="project-type"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <ProjectType />
                  </ProtectedRoute>
                }
              />

              <Route
                path="contractor-type"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <ContractorType />
                  </ProtectedRoute>
                }
              />
              <Route path="owner-info" element={<OwnerInfo />} />

              <Route
                path="contractor-type-info"
                element={<ContractorTypeInfo />}
              />

              <Route
                path="dashboard-schedule"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard-schedule/:id"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="timeline"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    {/* <DashboardTimeline /> */}
                    <DashboardTimelineTwo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="timeline/:H_ID"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    {/* <DashboardTimeline /> */}
                    <DashboardTimelineTwo />
                  </ProtectedRoute>
                }
              />

              <Route path="projects/create" element={<CreateProjectPage />} />
              <Route path="projects/:id/edit" element={<EditProjectPage />} />
              {/* <Route
                path="projects/:id/report"
                element={<ProjectReportPage />}
              /> */}

              <Route
                path="process"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <EditProject />
                  </ProtectedRoute>
                }
              />
              <Route
                path="process/:id"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <EditProject />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects"
                element={
                  <ProtectedRoute anyRole={ADMIN_OWNER}>
                    <ProjectPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="invoices"
                element={
                  <ProtectedRoute anyRole={ADMIN_DE}>
                    <InvoiceListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="invoices/create"
                element={
                  <ProtectedRoute anyRole={ADMIN_DE}>
                    <InvoiceCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="invoices/:id/edit"
                element={
                  <ProtectedRoute anyRole={ADMIN_DE}>
                    <InvoiceEditPage />
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