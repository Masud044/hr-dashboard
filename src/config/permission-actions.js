// src/config/permission-actions.js
//
// Fixed action vocabulary used to auto-generate PERMISSION_CODE = `${MODULE_NAME}_${ACTION}`.
// Keep in sync with backend route guards (authorizePermissionsV2).

export const ACTION_OPTIONS = [
  { value: "VIEW", label: "View" },
  { value: "VIEW_ALL", label: "View All" },
{ value: "VIEW_SELF", label: "View Self" },
  { value: "CREATE", label: "Create" },
  { value: "EDIT", label: "Edit" },
  { value: "DELETE", label: "Delete" },
  { value: "DOWNLOAD", label: "Download" },
  { value: "APPROVE", label: "Approve" },
  { value: "REJECT", label: "Reject" },
  { value: "IMPORT", label: "Import" },
  { value: "PRINT", label: "Print" },
  { value: "ASSIGN", label: "Assign" },
  { value: "RESTORE", label: "Restore" },
  { value: "ARCHIVE", label: "Archive" },
];

/** "Project Statement" → "PROJECT_STATEMENT" */
export const toModulePrefix = (moduleName = "") =>
  moduleName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/** Build the full permission code from module name + action code */
export const buildPermissionCode = (moduleName, actionValue) => {
  if (!moduleName || !actionValue) return "";
  return `${toModulePrefix(moduleName)}_${actionValue}`;
};

/** Build a human-readable default name, e.g. "Project View" */
export const buildPermissionName = (moduleName, actionLabel) => {
  if (!moduleName || !actionLabel) return "";
  return `${moduleName} ${actionLabel}`;
};