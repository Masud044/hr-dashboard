// src/features/selection/selection-api.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const EMPTY_ARRAY = [];

export const selectionKeys = {
  forms: (projectId) => ["selection", "forms", Number(projectId)],
  form: (formId) => ["selection", "form", Number(formId)],
  templates: () => ["selection", "templates"],
};

export const selectionFileUrl = (fileId) =>
  `${url}/api/selection/files/${fileId}`;

// ── Queries ───────────────────────────────────────────────────────────────────

export function useSelectionForms(projectId) {
  return useQuery({
    queryKey: selectionKeys.forms(projectId),
    queryFn: async () => {
      const res = await axios.get(`${url}/api/selection`, {
        params: { projectId },
      });
      return res.data?.data || EMPTY_ARRAY;
    },
    enabled: !!projectId,
  });
}

export function useSelectionTemplates({ enabled = true } = {}) {
  return useQuery({
    queryKey: selectionKeys.templates(),
    queryFn: async () => {
      const res = await axios.get(`${url}/api/selection`, {
        params: { templates: "Y" },
      });
      return res.data?.data || EMPTY_ARRAY;
    },
    enabled,
  });
}

export function useSelectionForm(formId) {
  return useQuery({
    queryKey: selectionKeys.form(formId),
    queryFn: async () => {
      const res = await axios.get(`${url}/api/selection/${formId}`);
      return res.data?.data;
    },
    enabled: !!formId,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────
// Every mutation receives { formId, projectId, ... } so it can invalidate both
// the single form and the project's form list.

function useSelectionMutation(mutationFn, { invalidateTemplates = false } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => {
      if (variables?.formId != null) {
        queryClient.invalidateQueries({
          queryKey: selectionKeys.form(variables.formId),
        });
      }
      if (variables?.projectId != null) {
        queryClient.invalidateQueries({
          queryKey: selectionKeys.forms(variables.projectId),
        });
      }
      if (invalidateTemplates) {
        queryClient.invalidateQueries({ queryKey: selectionKeys.templates() });
      }
    },
  });
}

export function useCreateSelectionForm() {
  return useSelectionMutation(
    async ({ payload }) =>
      (await axios.post(`${url}/api/selection`, payload)).data?.data,
  );
}

export function useUpdateSelectionForm() {
  return useSelectionMutation(
    async ({ formId, payload }) =>
      (await axios.put(`${url}/api/selection/${formId}`, payload)).data?.data,
  );
}

export function useDeleteSelectionForm() {
  return useSelectionMutation(
    async ({ formId, userId }) =>
      (
        await axios.delete(`${url}/api/selection/${formId}`, {
          params: { userId },
        })
      ).data,
  );
}

export function useCreateSelectionArea() {
  return useSelectionMutation(
    async ({ formId, payload }) =>
      (await axios.post(`${url}/api/selection/${formId}/areas`, payload)).data
        ?.data,
  );
}

export function useUpdateSelectionArea() {
  return useSelectionMutation(
    async ({ areaId, payload }) =>
      (await axios.put(`${url}/api/selection/areas/${areaId}`, payload)).data
        ?.data,
  );
}

export function useDeleteSelectionArea() {
  return useSelectionMutation(
    async ({ areaId, userId }) =>
      (
        await axios.delete(`${url}/api/selection/areas/${areaId}`, {
          params: { userId },
        })
      ).data,
  );
}

export function useCreateSelectionItem() {
  return useSelectionMutation(
    async ({ areaId, payload }) =>
      (await axios.post(`${url}/api/selection/areas/${areaId}/items`, payload))
        .data?.data,
  );
}

export function useUpdateSelectionItem() {
  return useSelectionMutation(
    async ({ itemId, payload }) =>
      (await axios.put(`${url}/api/selection/items/${itemId}`, payload)).data
        ?.data,
  );
}

export function useDeleteSelectionItem() {
  return useSelectionMutation(
    async ({ itemId, userId }) =>
      (
        await axios.delete(`${url}/api/selection/items/${itemId}`, {
          params: { userId },
        })
      ).data,
  );
}

export function useUploadSelectionFile() {
  return useSelectionMutation(
    async ({ itemId, file, fieldKey, userId }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("FIELD_KEY", fieldKey);
      if (userId != null) formData.append("USER_ID", userId);

      return (
        await axios.post(`${url}/api/selection/items/${itemId}/files`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data?.data;
    },
  );
}

export function useCopyForm() {
  return useSelectionMutation(
    async ({ formId, payload }) =>
      (await axios.post(`${url}/api/selection/${formId}/copy`, payload)).data
        ?.data,
    { invalidateTemplates: true },
  );
}

export function useCopyArea() {
  return useSelectionMutation(
    async ({ areaId, payload }) =>
      (await axios.post(`${url}/api/selection/areas/${areaId}/copy`, payload))
        .data?.data,
  );
}

export function usePublishForm() {
  return useSelectionMutation(
    async ({ formId, userId }) =>
      (
        await axios.post(`${url}/api/selection/${formId}/publish`, {
          UPDATED_BY: userId ?? 0,
        })
      ).data?.data,
  );
}

export function useReopenForm() {
  return useSelectionMutation(
    async ({ formId, userId }) =>
      (
        await axios.post(`${url}/api/selection/${formId}/reopen`, {
          UPDATED_BY: userId ?? 0,
        })
      ).data?.data,
  );
}

export function useConfirmItem() {
  return useSelectionMutation(
    async ({ itemId, payload }) =>
      (await axios.put(`${url}/api/selection/items/${itemId}/confirm`, payload))
        .data?.data,
  );
}

export function useConfirmAll() {
  return useSelectionMutation(
    async ({ formId, userId }) =>
      (
        await axios.post(`${url}/api/selection/${formId}/confirm-all`, {
          UPDATED_BY: userId ?? 0,
        })
      ).data?.data,
  );
}

export function useDeleteSelectionFile() {
  return useSelectionMutation(
    async ({ fileId, userId }) =>
      (
        await axios.delete(`${url}/api/selection/files/${fileId}`, {
          params: { userId },
        })
      ).data,
  );
}
