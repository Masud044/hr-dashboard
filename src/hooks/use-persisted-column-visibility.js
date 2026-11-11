// src\hooks\use-persisted-column-visibility.js
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "dataTableColumnVisibility";

// Keeps every boolean-valued key — not just the ones in `defaults` — so
// columns outside the default map (e.g. P_TYPE, PROJECT_STATUS) still
// persist. Non-boolean junk in localStorage is dropped.
function normalizeVisibility(candidate, defaults) {
  const merged = { ...defaults };
  if (!candidate || typeof candidate !== "object") return merged;
  for (const key of Object.keys(candidate)) {
    if (typeof candidate[key] === "boolean") merged[key] = candidate[key];
  }
  return merged;
}

function readStoredVisibility(tableKey, defaults) {
  if (typeof window === "undefined") return normalizeVisibility(null, defaults);
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${tableKey}`);
    const parsed = raw ? JSON.parse(raw) : null;
    return normalizeVisibility(parsed, defaults);
  } catch {
    return normalizeVisibility(null, defaults);
  }
}

function writeStoredVisibility(tableKey, visibility) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}:${tableKey}`,
      JSON.stringify(visibility)
    );
  } catch {
    // localStorage unavailable (private mode, quota exceeded, etc.) — fail silently
  }
}

/**
 * Persists a table's column visibility to localStorage, namespaced per table
 * so different tables (projects, contractors, ...) can each remember their
 * own hidden/shown columns instead of sharing one global value.
 *
 * Stored values are merged over `defaultVisibility`; any boolean key is kept,
 * so toggling columns that aren't in the defaults persists too.
 *
 * @param {string} tableKey - unique key per table, e.g. "projects", "contractors"
 * @param {Record<string, boolean>} defaultVisibility - fallback visibility map
 * @returns {[Record<string, boolean>, (next: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void]}
 */
export function usePersistedColumnVisibility(tableKey, defaultVisibility) {
  const [visibility, setVisibilityState] = useState(() =>
    readStoredVisibility(tableKey, defaultVisibility)
  );

  // TanStack passes either a value or an updater function, so mirror the
  // latest state (and defaults) in refs to resolve updaters without making
  // the setter change identity every render.
  const visibilityRef = useRef(visibility);
  const defaultsRef = useRef(defaultVisibility);
  defaultsRef.current = defaultVisibility;

  useEffect(() => {
    visibilityRef.current = visibility;
  }, [visibility]);

  const setVisibility = useCallback(
    (next) => {
      const resolved =
        typeof next === "function" ? next(visibilityRef.current) : next;
      const normalized = normalizeVisibility(resolved, defaultsRef.current);
      visibilityRef.current = normalized;
      setVisibilityState(normalized);
      writeStoredVisibility(tableKey, normalized);
    },
    [tableKey]
  );

  return [visibility, setVisibility];
}
