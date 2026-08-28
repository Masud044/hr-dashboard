// src/features/ticketing/queries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/features/authentication-v2/queries";

const BASE = import.meta.env.VITE_API_BASE_URL;
const URLS = {
  root: `${BASE}/api/ticketing`,
};

export const attachmentFileUrl = (attachmentId) =>
  `${URLS.root}/attachments/${attachmentId}/file`;

const queryDefaults = {
  retry: 2,
  retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
};

// ── Fetcher (mirrors user-management/queries.js) ────────────────────────────
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

// ── Lookups ──────────────────────────────────────────────────────────────────

export const useLookups = () =>
  useQuery({
    queryKey: ["ticketing", "lookups"],
    queryFn: async () => {
      const json = await fetcher(`${URLS.root}/lookups`);
      return json.data; // { statuses, priorities, categories }
    },
    ...queryDefaults,
  });

export const useTicketSummary = () =>
  useQuery({
    queryKey: ["ticketing", "summary"],
    queryFn: async () => {
      const json = await fetcher(`${URLS.root}/summary`);
      return json.data; // { open, active, overdue, urgent }
    },
    ...queryDefaults,
  });

export const useCannedResponses = () =>
  useQuery({
    queryKey: ["ticketing", "canned-responses"],
    queryFn: async () => {
      const json = await fetcher(`${URLS.root}/canned-responses`);
      return json.data;
    },
    ...queryDefaults,
  });

export const useCreateCannedResponse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      fetcher(`${URLS.root}/canned-responses`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ticketing", "canned-responses"] }),
  });
};

export const useUpdateCannedResponse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ responseId, data }) =>
      fetcher(`${URLS.root}/canned-responses/${responseId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ticketing", "canned-responses"] }),
  });
};

export const useDeleteCannedResponse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (responseId) =>
      fetcher(`${URLS.root}/canned-responses/${responseId}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ticketing", "canned-responses"] }),
  });
};

// ── Tickets: list / detail ───────────────────────────────────────────────────

/**
 * filters: { STATUS_ID, PRIORITY_ID, CATEGORY_ID, TICKET_TYPE, WORKER_ID, OPEN_ONLY }
 * pagination: { pageIndex, pageSize } — TanStack Table state
 * Matches the ["worker-attendance", filters, pagination] queryKey pattern.
 */
export const useTickets = (filters, pagination) =>
  useQuery({
    queryKey: ["ticketing", "tickets", filters, pagination],
    queryFn: async () => {
      const qs = buildQS({
        ...filters,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });
      const json = await fetcher(`${URLS.root}?${qs}`);
      return json; // { success, total, page, limit, data: [...] }
    },
    placeholderData: (prev) => prev,
    ...queryDefaults,
  });

export const useTicket = (ticketId) =>
  useQuery({
    queryKey: ["ticketing", "ticket", ticketId],
    queryFn: async () => {
      const json = await fetcher(`${URLS.root}/${ticketId}`);
      return json.data; // { ticket, comments, history, attachments }
    },
    enabled: !!ticketId,
    refetchInterval: 15000,               // poll every 8s while open
    refetchIntervalInBackground: false,  // pause when tab not focused
    ...queryDefaults,
  });

export const useCreateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      fetcher(URLS.root, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ticketing", "tickets"] }),
  });
};

export const useUpdateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, ...data }) =>
      fetcher(`${URLS.root}/${ticketId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ["ticketing", "ticket", ticketId] });
      qc.invalidateQueries({ queryKey: ["ticketing", "tickets"] });
    },
  });
};

export const useAssignWorker = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, workerId }) =>
      fetcher(`${URLS.root}/${ticketId}/worker`, {
        method: "PUT",
        body: JSON.stringify({ WORKER_ID: workerId }),
      }),
    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ["ticketing", "ticket", ticketId] });
      qc.invalidateQueries({ queryKey: ["ticketing", "tickets"] });
    },
  });
};

export const useUpdateStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, statusName }) =>
      fetcher(`${URLS.root}/${ticketId}/status`, {
        method: "PUT",
        body: JSON.stringify({ STATUS_NAME: statusName }),
      }),
    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ["ticketing", "ticket", ticketId] });
      qc.invalidateQueries({ queryKey: ["ticketing", "tickets"] });
    },
  });
};

// ── Comments ─────────────────────────────────────────────────────────────────

export const useAddComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, data }) => {
      // AUTHOR_ID is provided for optimistic attribution only — the server
      // derives the real author from the auth token, so strip it from the
      // request body to avoid any risk of overriding server behavior.
      const { AUTHOR_ID, ...body } = data;
      return fetcher(`${URLS.root}/${ticketId}/comments`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onMutate: async ({ ticketId, data }) => {
      const key = ["ticketing", "ticket", ticketId];
      await qc.cancelQueries({ queryKey: key });
      const previousData = qc.getQueryData(key);
      qc.setQueryData(key, (old) => ({
        ...(old || {}),
        comments: [
          ...(old?.comments || []),
          {
            COMMENT_ID: `temp-${Date.now()}`,
            COMMENT_TEXT: data.COMMENT_TEXT,
            AUTHOR_TYPE: data.AUTHOR_TYPE,
            IS_INTERNAL: data.IS_INTERNAL,
            CANNED_RESPONSE_ID: data.CANNED_RESPONSE_ID,
            AUTHOR_ID: data.AUTHOR_ID,
            CREATED_AT: new Date().toISOString(),
            UPDATED_AT: null,
            _optimistic: true,
          },
        ],
      }));
      return { previousData };
    },
    onError: (_err, { ticketId }, context) => {
      if (context?.previousData) {
        qc.setQueryData(
          ["ticketing", "ticket", ticketId],
          context.previousData,
        );
      }
    },
    onSettled: (_data, _err, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ["ticketing", "ticket", ticketId] });
      qc.invalidateQueries({ queryKey: ["ticketing", "tickets"] });
    },
  });
};

export const useUpdateComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, COMMENT_TEXT }) =>
      fetcher(`${URLS.root}/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({ COMMENT_TEXT }),
      }),
    onMutate: async ({ commentId, ticketId, COMMENT_TEXT }) => {
      const key = ["ticketing", "ticket", ticketId];
      await qc.cancelQueries({ queryKey: key });
      const previousData = qc.getQueryData(key);
      qc.setQueryData(key, (old) => ({
        ...(old || {}),
        comments: (old?.comments || []).map((c) =>
          String(c.COMMENT_ID) === String(commentId)
            ? {
                ...c,
                COMMENT_TEXT,
                UPDATED_AT: new Date().toISOString(),
              }
            : c,
        ),
      }));
      return { previousData };
    },
    onError: (_err, { ticketId }, context) => {
      if (context?.previousData) {
        qc.setQueryData(
          ["ticketing", "ticket", ticketId],
          context.previousData,
        );
      }
    },
    onSettled: (_data, _err, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ["ticketing", "ticket", ticketId] });
      qc.invalidateQueries({ queryKey: ["ticketing", "tickets"] });
    },
  });
};

export const useDeleteComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId }) =>
      fetcher(`${URLS.root}/comments/${commentId}`, {
        method: "DELETE",
      }),
    onMutate: async ({ commentId, ticketId }) => {
      const key = ["ticketing", "ticket", ticketId];
      await qc.cancelQueries({ queryKey: key });
      const previousData = qc.getQueryData(key);
      qc.setQueryData(key, (old) => ({
        ...(old || {}),
        comments: (old?.comments || []).filter(
          (c) => String(c.COMMENT_ID) !== String(commentId),
        ),
      }));
      return { previousData };
    },
    onError: (_err, { ticketId }, context) => {
      if (context?.previousData) {
        qc.setQueryData(
          ["ticketing", "ticket", ticketId],
          context.previousData,
        );
      }
    },
    onSettled: (_data, _err, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ["ticketing", "ticket", ticketId] });
      qc.invalidateQueries({ queryKey: ["ticketing", "tickets"] });
    },
  });
};

// ── Attachments ──────────────────────────────────────────────────────────────

/**
 * Raw axios call (not the JSON fetcher) since this is multipart with upload
 * progress — mirrors InvoiceSheet.jsx. Exposed as a plain async fn (not a
 * mutation) so components drive their own per-file progress state, same as
 * FileStatusRow/addFileState.
 */
export const uploadAttachment = async ({ ticketId, file, commentId, onUploadProgress, signal }) => {
  const axios = (await import("axios")).default;
  const token = getToken();
  const fd = new FormData();
  fd.append("file", file);
  if (commentId) fd.append("COMMENT_ID", commentId);

  const res = await axios.post(`${URLS.root}/${ticketId}/attachments`, fd, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    onUploadProgress: (evt) => {
      if (!evt.total) return;
      onUploadProgress?.(Math.round((evt.loaded / evt.total) * 100));
    },
    signal,
  });
  return res.data;
};

export const useInvalidateTicketAfterAttachment = () => {
  const qc = useQueryClient();
  return (ticketId) => qc.invalidateQueries({ queryKey: ["ticketing", "ticket", ticketId] });
};