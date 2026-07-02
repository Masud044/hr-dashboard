import { useCallback, useState } from "react";

const STORAGE_PREFIX = "dataTablePageSize";

function readStoredPageSize(tableKey, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${tableKey}`);
    const parsed = raw ? Number.parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredPageSize(tableKey, size) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}:${tableKey}`, String(size));
  } catch {
    // localStorage unavailable (private mode, quota exceeded, etc.) — fail silently
  }
}

/**
 * Persists a table's page size to localStorage, namespaced per table so
 * different tables (projects, contractors, ...) can each remember their
 * own preference instead of sharing one global value.
 *
 * @param {string} tableKey - unique key per table, e.g. "projects", "contractors"
 * @param {number} defaultPageSize - fallback when nothing is stored yet
 * @returns {[number, (size: number) => void]}
 */
export function usePersistedPageSize(tableKey, defaultPageSize) {
  const [pageSize, setPageSizeState] = useState(() =>
    readStoredPageSize(tableKey, defaultPageSize)
  );

  const setPageSize = useCallback(
    (size) => {
      setPageSizeState(size);
      writeStoredPageSize(tableKey, size);
    },
    [tableKey]
  );

  return [pageSize, setPageSize];
}