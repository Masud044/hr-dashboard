// src/features/setting/owner-info/queries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const URLS = {
  ownerInfo: `${url}/api/owner-info`,
  projects:  `${url}/api/owner-info/projects`,
};

const queryDefaults = {
  retry: 2,
  retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
};

// ── List ──────────────────────────────────────────────────────────────────────

export const useOwnerInfoList = () =>
  useQuery({
    queryKey: ["ownerInfoList"],
    queryFn: async () => {
      const res = await axios.get(URLS.ownerInfo);
      return res.data?.data || [];
    },
    ...queryDefaults,
  });

// ── Single ────────────────────────────────────────────────────────────────────

export const useOwnerInfoById = (ownerId) =>
  useQuery({
    queryKey: ["ownerInfo", ownerId],
    queryFn: async () => {
      const res = await axios.get(`${URLS.ownerInfo}/${ownerId}`);
      return res.data?.data || res.data;
    },
    enabled: !!ownerId,
    ...queryDefaults,
  });

// ── By Project ────────────────────────────────────────────────────────────────

export const useOwnerInfoByProjectId = (projectId) =>
  useQuery({
    queryKey: ["ownerInfoByProject", projectId],
    queryFn: async () => {
      const res = await axios.get(`${URLS.ownerInfo}/by-project/${projectId}`);
      return res.data?.data || [];
    },
    enabled: !!projectId,
    ...queryDefaults,
  });

// ── Projects dropdown ─────────────────────────────────────────────────────────

export const useProjectsDropdown = () =>
  useQuery({
    queryKey: ["projectsDropdown"],
    queryFn: async () => {
      const res = await axios.get(URLS.projects);
      return res.data?.data || [];
    },
    ...queryDefaults,
  });

// ── Create ────────────────────────────────────────────────────────────────────

export const useCreateOwnerInfo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => axios.post(URLS.ownerInfo, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ownerInfoList"] }),
  });
};

// ── Update ────────────────────────────────────────────────────────────────────

export const useUpdateOwnerInfo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => axios.put(`${URLS.ownerInfo}/${id}`, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["ownerInfoList"] });
      qc.invalidateQueries({ queryKey: ["ownerInfo", id] });
    },
  });
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const useDeleteOwnerInfo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axios.delete(`${URLS.ownerInfo}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ownerInfoList"] }),
  });
};