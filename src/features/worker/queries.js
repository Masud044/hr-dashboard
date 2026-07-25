// src/features/worker/queries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const URLS = {
  worker: `${url}/api/worker`,
};

const queryDefaults = {
  retry: 2,
  retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
};

// ── List ──────────────────────────────────────────────────────────────────────

export const useWorkers = () =>
  useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await axios.get(URLS.worker);
      return res.data?.data || [];
    },
    ...queryDefaults,
  });

// ── Single (by worker_id query param) ──────────────────────────────────────────

export const useWorkerById = (workerId) =>
  useQuery({
    queryKey: ["worker-detail", workerId],
    queryFn: async () => {
      const res = await axios.get(URLS.worker, { params: { worker_id: workerId } });
      return res.data?.data?.[0] || null;
    },
    enabled: !!workerId,
    ...queryDefaults,
  });

// ── Create ──────────────────────────────────────────────────────────────────────

export const useCreateWorker = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => axios.post(URLS.worker, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workers"] }),
  });
};

// ── Update ──────────────────────────────────────────────────────────────────────

export const useUpdateWorker = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workerId, data }) =>
      axios.put(URLS.worker, { ...data, WORKER_ID: workerId }),
    onSuccess: (_, { workerId }) => {
      qc.invalidateQueries({ queryKey: ["workers"] });
      qc.invalidateQueries({ queryKey: ["worker-detail", workerId] });
    },
  });
};

// ── Delete ──────────────────────────────────────────────────────────────────────

export const useDeleteWorker = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axios.delete(`${URLS.worker}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workers"] }),
  });
};