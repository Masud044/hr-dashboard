// src/config/roles.js
export const ROLES = {
  ADMIN: "Admin",
  DATA_ENTRY: "DataEntry",
  WORKER: "Worker",
  OWNER: "Owner",
};
const { ADMIN, DATA_ENTRY, WORKER, OWNER } = ROLES;

export const ALL_ROLES       = [ADMIN, DATA_ENTRY, WORKER, OWNER];
export const ADMIN_ONLY      = [ADMIN];
export const ADMIN_DE        = [ADMIN, DATA_ENTRY];
export const ADMIN_DE_WORKER = [ADMIN, DATA_ENTRY, WORKER];
export const ADMIN_OWNER     = [ADMIN, OWNER];