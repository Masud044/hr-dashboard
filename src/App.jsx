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
import RoleAwareLayout from "./Layout/RoleAwareLayout";
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
import { CreateOwnerInfoPage } from "./features/setting/owner-info/create-owner-info-page";
import { EditOwnerInfoPage } from "./features/setting/owner-info/edit-owner-info-page";
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
import { AttendanceDetails } from "./features/worker-attendance/attendance-details";
import InvoiceManagementPage from "./features/setting/pages/statement-upload-three/invoice/InvoiceManagementPage";
import AddUserPage from "./features/user-management/add-user-page";
import EditUserPage from "./features/user-management/edit-user-page";
import AddModulePage from "./features/users/module/add-module-page";
import UpdateModulePage from "./features/users/module/update-module-page";
import AddPermissionPage from "./features/users/permission/add-permission-page";
import UpdatePermissionPage from "./features/users/permission/update-permission-page";
import { NAV_ITEMS } from "@/lib/constants/nav-items";

import {
  ALL_ROLES,
  ADMIN_ONLY,
  ADMIN_DE,
  ADMIN_DE_WORKER,
  ADMIN_OWNER,
} from "@/config/roles";
import UnauthorizedPage from "./pages/route/Unauthorized";
import { ProjectReportPageTwo } from "./features/project-two/project-report-page-two";
import StatementUploadFour from "./features/setting/pages/statement-upload-four";

import TicketListPage from "./features/ticketing/ticket-list-page";
import MyTicketsPage from "./features/ticketing/my-tickets-page";
import CreateTicketPage from "./features/ticketing/create-ticket-page";
import CannedResponsesPage from "./features/ticketing/canned-responses-page";
import CannedResponseFormPage from "./features/ticketing/canned-response-form-page";
import TicketDetailPage from "./features/ticketing/ticket-detail-page";
import { EditNonBankingTransactionPage } from "./features/project-two/edit-non-banking-transaction-page";

import NotificationsPage from "./features/notifications/notifications-page";

// test todo
import { TodoBoard } from "./features/todo/todo-board";
import { TodoFormPage } from "./features/todo/todo-form-page";

// ── Dashboard Index — role-based landing redirect ──────────────────────────

const DashboardIndex = () => {
  const { user, isLoading } = useAuthV2();
  if (isLoading) return null;

  const roles = user?.roles ?? [];
  const permissions = user?.permissions ?? [];
  const has = (code) => permissions.includes(code);
  const hasAny = (required) => {
    const codes = Array.isArray(required) ? required : [required];
    return codes.some((c) => has(c));
  };

  // Admin (or anyone with dashboard scope) still lands on Overview.
  if (
    roles.includes("Admin") ||
    has("DASHBOARD_VIEW_ALL") ||
    has("DASHBOARD_VIEW_SELF")
  ) {
    return <Overview />;
  }

  // Otherwise, land on the first sidebar link the user actually has access to.
  for (const group of NAV_ITEMS) {
    for (const link of group.links) {
      if (link.to !== "/dashboard" && hasAny(link.requiredPermission)) {
        return <Navigate to={link.to} replace />;
      }
    }
  }

  // No accessible link at all — still authenticated, so not /login.
  return <Navigate to="/unauthorized" replace />;
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

            {/* Report route — sidebar for Admin, no sidebar for Owner */}
            <Route
              element={
                <ProtectedRoute anyPermission="PROJECT_REPORT_VIEW">
                  <RoleAwareLayout sidebarRoles={["Admin"]} />
                </ProtectedRoute>
              }
            >
              <Route
                path="/dashboard/projects/:id/report"
                element={<ProjectReportPageTwo />}
              />
              <Route
                path="/dashboard/projects/:id/report-old"
                element={<ProjectReportPage />}
              />
              <Route
                path="/dashboard/projects/:id/report/non-banking/:txnId/edit"
                element={ <ProtectedRoute anyPermission="PROJECT_STATEMENT_EDIT">
      <EditNonBankingTransactionPage />
    </ProtectedRoute>}
              />
            </Route>

            {/* Protected Layout — all roles can enter, sidebar filters per-role */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Index */}
              <Route index element={<DashboardIndex />} />

              <Route
                path="user-management"
                element={
                  <ProtectedRoute anyPermission="USER_MANAGEMENT_VIEW">
                    <Grades />
                  </ProtectedRoute>
                }
              />
              <Route
                path="user-management/users/create"
                element={
                  <ProtectedRoute anyPermission="USER_MANAGEMENT_VIEW">
                    <AddUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="user-management/users/:id/edit"
                element={
                  <ProtectedRoute anyPermission="USER_MANAGEMENT_VIEW">
                    <EditUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="user-management/users/:id"
                element={
                  <ProtectedRoute anyPermission="USER_MANAGEMENT_VIEW">
                    <UserDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="role"
                element={
                  <ProtectedRoute anyPermission="ROLE_VIEW">
                    <Roles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="role/matrix"
                element={
                  <ProtectedRoute anyPermission="ROLE_VIEW">
                    <RolePermissionMatrix />
                  </ProtectedRoute>
                }
              />
              <Route
                path="role/:id"
                element={
                  <ProtectedRoute anyPermission="ROLE_VIEW">
                    <RoleDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="module"
                element={
                  <ProtectedRoute anyPermission="MODULE_VIEW">
                    <Modules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="module/create"
                element={
                  <ProtectedRoute anyPermission="MODULE_VIEW">
                    <AddModulePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="module/:id/edit"
                element={
                  <ProtectedRoute anyPermission="MODULE_VIEW">
                    <UpdateModulePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="permission"
                element={
                  <ProtectedRoute anyPermission="PERMISSION_VIEW">
                    <Permissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="permission/create"
                element={
                  <ProtectedRoute anyPermission="PERMISSION_CREATE">
                    <AddPermissionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="permission/:id/edit"
                element={
                  <ProtectedRoute anyPermission="PERMISSION_EDIT">
                    <UpdatePermissionPage />
                  </ProtectedRoute>
                }
              />

              {/* Not in nav-items yet — no permission code, kept role-based */}
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

              {/* Legacy single Project page — not in nav-items, kept role-based */}
              <Route
                path="project"
                element={
                  <ProtectedRoute anyRole={ADMIN_ONLY}>
                    <Project />
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
                path="statement"
                element={
                  <ProtectedRoute anyPermission="PROJECT_STATEMENT_VIEW">
                    {/* <StatementUploadTwo /> */}

                    <StatementUploadFour />
                  </ProtectedRoute>
                }
              />
              <Route
                path="statement-old"
                element={
                  <ProtectedRoute anyPermission="PROJECT_STATEMENT_VIEW">
                    {/* <StatementUploadTwo /> */}

                    <StatementUploadThree />
                  </ProtectedRoute>
                }
              />

              <Route
                path="statement/:parentType/:parentId/invoices"
                element={
                  <ProtectedRoute anyPermission="PROJECT_STATEMENT_VIEW">
                    <InvoiceManagementPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="contractor"
                element={
                  <ProtectedRoute anyPermission="CONTRACTOR_VIEW">
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
                element={
                  <ProtectedRoute anyPermission="CONTRACTOR_VIEW">
                    <CreateContractorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="contractor/:id/edit"
                element={
                  <ProtectedRoute anyPermission="CONTRACTOR_VIEW">
                    <EditContractorPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="worker"
                element={
                  <ProtectedRoute anyPermission="WORKER_VIEW">
                    <WorkerList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="worker/create"
                element={
                  <ProtectedRoute anyPermission="WORKER_VIEW">
                    <WorkerFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="worker/:workerId/edit"
                element={
                  <ProtectedRoute anyPermission="WORKER_VIEW">
                    <WorkerFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="worker-attendance"
                element={
                  <ProtectedRoute anyPermission="ATTENDANCE_VIEW">
                    <AttendanceList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="worker-attendance/:attendanceId"
                element={
                  <ProtectedRoute anyPermission="ATTENDANCE_VIEW">
                    <AttendanceDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="worker-attendance/create"
                element={
                  <ProtectedRoute anyPermission="ATTENDANCE_VIEW">
                    <AttendanceFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="worker-attendance/:attendanceId/edit"
                element={
                  <ProtectedRoute anyPermission="ATTENDANCE_VIEW">
                    <AttendanceFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="attendance-report"
                element={
                  <ProtectedRoute anyPermission="ATTENDANCE_REPORT_VIEW">
                    <AttendanceReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="calendar"
                element={
                  <ProtectedRoute anyPermission="CALENDAR_VIEW">
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="project-type"
                element={
                  <ProtectedRoute anyPermission="PROJECT_TYPE_VIEW">
                    <ProjectType />
                  </ProtectedRoute>
                }
              />
              <Route
                path="contractor-type"
                element={
                  <ProtectedRoute anyPermission="CONTRACTOR_TYPE_VIEW">
                    <ContractorType />
                  </ProtectedRoute>
                }
              />
              <Route
                path="owner-info"
                element={
                  <ProtectedRoute anyPermission="OWNER_INFO_VIEW">
                    <OwnerInfo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="owner-info/create"
                element={
                  <ProtectedRoute anyPermission="OWNER_INFO_VIEW">
                    <CreateOwnerInfoPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="owner-info/:id/edit"
                element={
                  <ProtectedRoute anyPermission="OWNER_INFO_VIEW">
                    <EditOwnerInfoPage />
                  </ProtectedRoute>
                }
              />

              {/* Not in nav-items, no protection previously — left as-is */}
              <Route
                path="contractor-type-info"
                element={<ContractorTypeInfo />}
              />

              <Route
                path="dashboard-schedule"
                element={
                  <ProtectedRoute anyPermission="SCHEDULE_DASHBOARD_VIEW">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard-schedule/:id"
                element={
                  <ProtectedRoute anyPermission="SCHEDULE_DASHBOARD_VIEW">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Not in nav-items — kept role-based */}
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

              <Route
                path="projects/create"
                element={
                  <ProtectedRoute anyPermission="PROJECT_VIEW">
                    <CreateProjectPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects/:id/edit"
                element={
                  <ProtectedRoute anyPermission="PROJECT_VIEW">
                    <EditProjectPage />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                path="projects/:id/report"
                element={<ProjectReportPage />}
              /> */}

              {/* Not in nav-items — kept role-based */}
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
                  <ProtectedRoute anyPermission="PROJECT_VIEW">
                    <ProjectPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="invoices"
                element={
                  <ProtectedRoute anyPermission="INVOICE_VIEW">
                    <InvoiceListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="invoices/create"
                element={
                  <ProtectedRoute anyPermission="INVOICE_VIEW">
                    <InvoiceCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="invoices/:id/edit"
                element={
                  <ProtectedRoute anyPermission="INVOICE_VIEW">
                    <InvoiceEditPage />
                  </ProtectedRoute>
                }
              />

              {/* ticketing */}
              <Route
                path="tickets"
                element={
                  <ProtectedRoute anyPermission="TICKET_VIEW_ALL">
                    <TicketListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tickets/my-tickets"
                element={
                  <ProtectedRoute anyPermission="TICKET_VIEW_SELF">
                    <MyTicketsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tickets/:id"
                element={
                  <ProtectedRoute
                    anyPermission={["TICKET_VIEW_ALL", "TICKET_VIEW_SELF"]}
                  >
                    <TicketDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tickets/create"
                element={
                  <ProtectedRoute anyPermission="TICKET_CREATE">
                    <CreateTicketPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tickets/canned-responses"
                element={
                  <ProtectedRoute anyPermission="CANNED_RESPONSE_VIEW">
                    <CannedResponsesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tickets/canned-responses/create"
                element={
                  <ProtectedRoute anyPermission="CANNED_RESPONSE_CREATE">
                    <CannedResponseFormPage />
                  </ProtectedRoute>
                }
              />

              {/* notifications — no permission gate, every authenticated user */}
              <Route
                path="notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* test todo */}
              <Route
                path="todo"
                element={
                  <ProtectedRoute anyPermission="TODO_VIEW">
                    <TodoBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="todo/create"
                element={
                  <ProtectedRoute anyPermission="TODO_VIEW">
                    <TodoFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="todo/:todoId/edit"
                element={
                  <ProtectedRoute anyPermission="TODO_VIEW">
                    <TodoFormPage />
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
