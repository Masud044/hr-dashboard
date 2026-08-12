// src\hooks\use-persisted-view-mode.js
import { useCallback, useState } from "react";

const STORAGE_PREFIX = "dataTableViewMode";

function readStoredViewMode(tableKey, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${tableKey}`);
    return raw === "table" || raw === "grid" ? raw : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredViewMode(tableKey, mode) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}:${tableKey}`, mode);
  } catch {
    // localStorage unavailable (private mode, quota exceeded, etc.) — fail silently
  }
}

/**
 * Persists a table's view mode (table | grid) to localStorage, namespaced
 * per table so different lists (contractors, projects, ...) can each
 * remember their own preference.
 *
 * @param {string} tableKey - unique key per table, e.g. "contractors"
 * @param {"table"|"grid"} defaultMode - fallback when nothing is stored yet
 * @returns {["table"|"grid", (mode: "table"|"grid") => void]}
 */
export function usePersistedViewMode(tableKey, defaultMode = "table") {
  const [viewMode, setViewModeState] = useState(() =>
    readStoredViewMode(tableKey, defaultMode)
  );

  const setViewMode = useCallback(
    (mode) => {
      setViewModeState(mode);
      writeStoredViewMode(tableKey, mode);
    },
    [tableKey]
  );

  return [viewMode, setViewMode];
}