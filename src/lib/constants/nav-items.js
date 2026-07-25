// src/lib/constants/nav-items.js
import {
  IconBuildingSkyscraper, IconDashboard, IconSettings,
  IconUserHexagon, IconUsers,
} from "@tabler/icons-react";
import { ClipboardList, FileText, LayoutDashboard } from "lucide-react";
import { ALL_ROLES, ADMIN_ONLY, ADMIN_DE, ADMIN_DE_WORKER, ADMIN_OWNER } from "@/config/roles";

export const NAV_ITEMS = [
  {
    label: "Main Entry",
    ItemIcon: IconDashboard,
    roles: ADMIN_ONLY,
    links: [
      { to: "/dashboard", label: "Overview", Icon: LayoutDashboard },
      { to: "/dashboard/dashboard-schedule", label: "Schedule Dashboard", Icon: LayoutDashboard },
    ],
  },
  {
    label: "Settings",
    ItemIcon: IconSettings,
    roles: ADMIN_DE_WORKER, // union so group shows for Owner too — Owner-only link below handles gating
    links: [
      { to: "/dashboard/projects", label: "Project", Icon: IconUserHexagon, roles: ADMIN_OWNER },
      { to: "/dashboard/statement", label: "Project Statement", Icon: IconUserHexagon, roles: ADMIN_ONLY },
      { to: "/dashboard/contractor", label: "Contractor", Icon: IconUserHexagon, roles: ADMIN_ONLY },
      { to: "/dashboard/calendar", label: "Calender", Icon: IconUserHexagon, roles: ADMIN_ONLY },
      { to: "/dashboard/project-type", label: "Project Type", Icon: IconUserHexagon, roles: ADMIN_ONLY },
      { to: "/dashboard/contractor-type", label: "Contractor Type", Icon: IconUserHexagon, roles: ADMIN_ONLY },
      { to: "/dashboard/worker", label: "Worker", Icon: IconUserHexagon, roles: ADMIN_DE },
      { to: "/dashboard/worker-attendance", label: "Attendance", Icon: ClipboardList, roles: ADMIN_DE_WORKER },
      { to: "/dashboard/attendance-report", label: "Attendance Report", Icon: FileText, roles: ADMIN_DE },
      { to: "/dashboard/invoices", label: "Invoice", Icon: IconUserHexagon, roles: ADMIN_DE },
    ],
  },
  {
    label: "User Management",
    ItemIcon: IconUsers,
    roles: ADMIN_ONLY,
    links: [
      { to: "/dashboard/user-management", label: "User Management", Icon: ClipboardList },
      { to: "/dashboard/module", label: "Module", Icon: ClipboardList },
      { to: "/dashboard/role", label: "Role", Icon: FileText },
      { to: "/dashboard/permission", label: "Permission", Icon: FileText },
    ],
  },
];