// src/features/ticketing/lookup-queries.js
// Self-contained lookup hooks for ticketing. Kept local (rather than importing
// cross-feature) so the ticketing module owns its own data dependencies.
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const queryDefaults = {
  retry: 2,
  retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
};

// ── Projects ─────────────────────────────────────────────────────────────────

export const useProjects = () =>
  useQuery({
    queryKey: ["ticketing", "projects"],
    queryFn: async () => (await axios.get(`${BASE}/api/project`)).data?.data || [],
    ...queryDefaults,
  });

// ── Contractors ──────────────────────────────────────────────────────────────

export const useContractors = () =>
  useQuery({
    queryKey: ["ticketing", "contractors"],
    queryFn: async () => (await axios.get(`${BASE}/api/contractor`)).data?.data || [],
    ...queryDefaults,
  });

// ── Workers ──────────────────────────────────────────────────────────────────

export const useWorkers = () =>
  useQuery({
    queryKey: ["ticketing", "workers"],
    queryFn: async () => (await axios.get(`${BASE}/api/worker`)).data?.data || [],
    ...queryDefaults,
  });

// ── Owner info ───────────────────────────────────────────────────────────────

export const useOwnerInfoList = () =>
  useQuery({
    queryKey: ["ticketing", "owner-info"],
    queryFn: async () => (await axios.get(`${BASE}/api/owner-info`)).data?.data || [],
    ...queryDefaults,
  });

export const useOwnerInfoByProjectId = (projectId) =>
  useQuery({
    queryKey: ["ticketing", "owner-info", "by-project", projectId],
    queryFn: async () =>
      (await axios.get(`${BASE}/api/owner-info/by-project/${projectId}`)).data?.data || [],
    enabled: !!projectId,
    ...queryDefaults,
  });
