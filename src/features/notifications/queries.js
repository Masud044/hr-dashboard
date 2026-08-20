// src/features/notifications/queries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

import { getToken } from "@/features/authentication-v2/queries";

const BASE = import.meta.env.VITE_API_BASE_URL;
const URLS = {
  root: `${BASE}/api/notifications`,
};

const queryDefaults = {
  retry: 2,
  retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
};

// ── Fetcher (mirrors ticketing/queries.js) ─────────────────────────────────
const fetcher = async (url, options = {}) => {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const res = await fetch(url, {
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Request failed: ${res.status}`);
  }
  return res.json();
};

const buildQS = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "") qs.set(k, String(v));
  });
  return qs.toString();
};

// ── Shared helper: "2h ago" style relative timestamps ───────────────────────
const RELATIVE_UNITS = [
  [" years", "y"],
  [" year", "y"],
  [" months", "mo"],
  [" month", "mo"],
  [" days", "d"],
  [" day", "d"],
  [" hours", "h"],
  [" hour", "h"],
  [" minutes", "m"],
  [" minute", "m"],
  [" seconds", "s"],
  [" second", "s"],
];

export const formatRelativeTime = (value) => {
  if (!value) return "";
  const date = typeof value === "string" ? parseISO(value) : new Date(value);
  if (!isValid(date)) return "";

  let label = formatDistanceToNowStrict(date, { addSuffix: true });
  RELATIVE_UNITS.forEach(([long, short]) => {
    label = label.replace(long, short);
  });
  return label;
};

// ── List ─────────────────────────────────────────────────────────────────────
/**
 * pagination: { pageIndex, pageSize } — same shape as useTickets.
 */
export const useNotifications = (pagination) =>
  useQuery({
    queryKey: ["notifications", "list", pagination],
    queryFn: async () => {
      const qs = buildQS({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });
      const json = await fetcher(`${URLS.root}?${qs}`);
      return json; // { success, total, page, limit, data: [...] }
    },
    placeholderData: (prev) => prev,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    ...queryDefaults,
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const json = await fetcher(`${URLS.root}/unread-count`);
      return json.count; // { success, count }
    },
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    ...queryDefaults,
  });

// ── Mutations ────────────────────────────────────────────────────────────────

const invalidateNotifications = (qc) => {
  qc.invalidateQueries({ queryKey: ["notifications"] });
};

export const useMarkAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) =>
      fetcher(`${URLS.root}/${notificationId}/read`, { method: "PATCH" }),
    onSuccess: () => invalidateNotifications(qc),
  });
};

export const useMarkAllAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => fetcher(`${URLS.root}/read-all`, { method: "PATCH" }),
    onSuccess: () => invalidateNotifications(qc),
  });
};
