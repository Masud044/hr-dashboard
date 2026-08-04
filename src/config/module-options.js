// src/config/module-options.js
//
// Source of truth for MODULE_NAME values used when creating a Module.
// Keep in sync manually with sidebar items (nav-items.js) — one entry per
// sidebar link that needs its own View/Create/Edit/Delete/Download permissions.
//
// IMPORTANT: Do not derive this from nav-items.js. Nav items are UI structure
// (labels, icons, grouping) and change often; module names are the permission
// vocabulary and must stay stable once permissions exist in the DB.

export const MODULE_OPTIONS = [
  { value: "Project", label: "Project" },
  { value: "Project Statement", label: "Project Statement" },
  { value: "Contractor", label: "Contractor" },
  { value: "Calendar", label: "Calendar" },
  { value: "Project Type", label: "Project Type" },
  { value: "Contractor Type", label: "Contractor Type" },
  { value: "Owner Info", label: "Owner Info" },
  { value: "Worker", label: "Worker" },
  { value: "Attendance", label: "Attendance" },
  { value: "Attendance Report", label: "Attendance Report" },
  { value: "Invoice", label: "Invoice" },
  { value: "User Management", label: "User Management" },
  { value: "Module", label: "Module" },
  { value: "Role", label: "Role" },
  { value: "Permission", label: "Permission" },
  { value: "Dashboard", label: "Dashboard" },
  { value: "Schedule Dashboard", label: "Schedule Dashboard" },
];
