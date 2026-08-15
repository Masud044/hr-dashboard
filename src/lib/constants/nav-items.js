



import {
  IconBuildingSkyscraper,
  IconDashboard,
  IconSettings,
  IconUserHexagon,
  IconUsers,
  IconBuilding,
  IconFileInfo,
   IconHeadset,
} from "@tabler/icons-react";
import { ClipboardList, FileText, LayoutDashboard } from "lucide-react";

export const NAV_ITEMS = [
  {
    label: "Main Entry",
    ItemIcon: IconDashboard,
    links: [
      {
        to: "/dashboard",
        label: "Overview",
        Icon: LayoutDashboard,
        requiredPermission: ["DASHBOARD_VIEW_ALL", "DASHBOARD_VIEW_SELF"],
      },
      {
        to: "/dashboard/dashboard-schedule",
        label: "Schedule Dashboard",
        Icon: LayoutDashboard,
        requiredPermission: "SCHEDULE_DASHBOARD_VIEW",
      },
    ],
  },
  {
    label: "Settings",
    ItemIcon: IconSettings,
    links: [
      {
        to: "/dashboard/projects",
        label: "Project",
        Icon: IconUserHexagon,
        requiredPermission: "PROJECT_VIEW",
      },
      {
        to: "/dashboard/statement",
        label: "Project Statement",
        Icon: IconUserHexagon,
        requiredPermission: "PROJECT_STATEMENT_VIEW",
      },
      {
        to: "/dashboard/contractor",
        label: "Contractor",
        Icon: IconUserHexagon,
        requiredPermission: "CONTRACTOR_VIEW",
      },
      {
        to: "/dashboard/calendar",
        label: "Calender",
        Icon: IconUserHexagon,
        requiredPermission: "CALENDAR_VIEW",
      },
      {
        to: "/dashboard/project-type",
        label: "Project Type",
        Icon: IconUserHexagon,
        requiredPermission: "PROJECT_TYPE_VIEW",
      },
      {
        to: "/dashboard/contractor-type",
        label: "Contractor Type",
        Icon: IconUserHexagon,
        requiredPermission: "CONTRACTOR_TYPE_VIEW",
      },
      {
        to: "/dashboard/owner-info",
        label: "Owner Info",
        Icon: IconBuilding,
        requiredPermission: "OWNER_INFO_VIEW",
      },
      {
        to: "/dashboard/worker",
        label: "Worker",
        Icon: IconUserHexagon,
        requiredPermission: "WORKER_VIEW",
      },
      {
        to: "/dashboard/worker-attendance",
        label: "Attendance",
        Icon: ClipboardList,
        requiredPermission: "ATTENDANCE_VIEW",
      },
      {
        to: "/dashboard/attendance-report",
        label: "Attendance Report",
        Icon: FileText,
        requiredPermission: "ATTENDANCE_REPORT_VIEW",
      },
      // {
      //   to: "/dashboard/invoices",
      //   label: "Invoice",
      //   Icon: IconUserHexagon,
      //   requiredPermission: "INVOICE_VIEW",
      // },
    ],
  },

 {
  label: "Support",
  ItemIcon: IconHeadset,
  links: [
    {
      to: "/dashboard/tickets",
      label: "All Tickets",
      Icon: IconHeadset,
      requiredPermission: "TICKET_VIEW_ALL",
      exact: true,
    },
    {
      to: "/dashboard/tickets/my-tickets",
      label: "My Tickets",
      Icon: IconHeadset,
      requiredPermission: "TICKET_VIEW_SELF",
    },
    {
      to: "/dashboard/tickets/agent-dashboard",
      label: "Agent Dashboard",
      Icon: IconHeadset,
      requiredPermission: "TICKET_AGENT_DASHBOARD_VIEW",
    },
    {
      to: "/dashboard/tickets/canned-responses",
      label: "Canned Responses",
      Icon: IconHeadset,
      requiredPermission: "CANNED_RESPONSE_VIEW",
    },
  ],
},
  {
    label: "User Management",
    ItemIcon: IconUsers,
    links: [
      {
        to: "/dashboard/user-management",
        label: "User Management",
        Icon: ClipboardList,
        requiredPermission: "USER_MANAGEMENT_VIEW",
      },
      {
        to: "/dashboard/module",
        label: "Module",
        Icon: ClipboardList,
        requiredPermission: "MODULE_VIEW",
      },
      {
        to: "/dashboard/role",
        label: "Role",
        Icon: FileText,
        requiredPermission: "ROLE_VIEW",
      },
      {
        to: "/dashboard/permission",
        label: "Permission",
        Icon: FileText,
        requiredPermission: "PERMISSION_VIEW",
      },
    ],
  },
];