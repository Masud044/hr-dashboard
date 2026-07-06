// src\features\invoice\queries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const invoiceQueryKeys = {
  all: ["invoices"],
  lists: (filters = {}) => [...invoiceQueryKeys.all, "lists", filters],
  detail: (id) => [...invoiceQueryKeys.all, "detail", id],
};

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/invoice`;
const API_BASE_URL_PROJECT = `${import.meta.env.VITE_API_BASE_URL}/api/project`;
const API_BASE_URL_CONTRACTOR = `${import.meta.env.VITE_API_BASE_URL}/api/contractor`;

export const projectQueryKeys = {
  all: ["projects"],
  lists: () => [...projectQueryKeys.all, "lists"],
};

export const contractorQueryKeys = {
  all: ["contractors"],
  lists: () => [...contractorQueryKeys.all, "lists"],
};

const getInvoices = async ({ projectId, page, limit }) => {
  try {
    const params = new URLSearchParams();

    if (projectId) {
      params.append("projectId", projectId);
    }

    if (page != null) {
      params.append("page", String(page));
    }

    if (limit != null) {
      params.append("limit", String(limit));
    }

    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch invoices: ${res.status} ${res.statusText}`);
    }

    const jsonData = await res.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

const getInvoiceById = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch invoice: ${res.status} ${res.statusText}`);
    }

    const jsonData = await res.json();
    return jsonData.data || jsonData;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw error;
  }
};

const getReceiptUrl = (id) => `${API_BASE_URL}/${id}/receipt`;

const getProjects = async () => {
  try {
    const res = await fetch(API_BASE_URL_PROJECT);

    if (!res.ok) {
      throw new Error(`Failed to fetch projects: ${res.status} ${res.statusText}`);
    }

    const jsonData = await res.json();
    return jsonData.data || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

const getContractors = async () => {
  try {
    const res = await fetch(API_BASE_URL_CONTRACTOR);

    if (!res.ok) {
      throw new Error(`Failed to fetch contractors: ${res.status} ${res.statusText}`);
    }

    const jsonData = await res.json();
    return jsonData.data || [];
  } catch (error) {
    console.error("Error fetching contractors:", error);
    throw error;
  }
};

const createInvoice = async (formData) => {
  try {
    const res = await fetch(API_BASE_URL, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create invoice: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

const updateInvoice = async ({ id, formData }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update invoice: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

const deleteInvoice = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete invoice: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};

export const useInvoices = ({ projectId, page, limit } = {}) =>
  useQuery({
    queryKey: invoiceQueryKeys.lists({ projectId, page, limit }),
    queryFn: () => getInvoices({ projectId, page, limit }),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    throwOnError: false,
  });

export const useInvoiceById = (id) =>
  useQuery({
    queryKey: invoiceQueryKeys.detail(id),
    queryFn: () => getInvoiceById(id),
    enabled: !!id,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.lists() });
    },
    onError: (error) => {
      console.error("Create invoice mutation failed:", error);
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.detail(variables.id) });
    },
    onError: (error) => {
      console.error("Update invoice mutation failed:", error);
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.lists() });
    },
    onError: (error) => {
      console.error("Delete invoice mutation failed:", error);
    },
  });
};

export const useProjects = () =>
  useQuery({
    queryKey: projectQueryKeys.lists(),
    queryFn: getProjects,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    throwOnError: false,
  });

export const useContractors = () =>
  useQuery({
    queryKey: contractorQueryKeys.lists(),
    queryFn: getContractors,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    throwOnError: false,
  });

export { getInvoices, getInvoiceById, getReceiptUrl, createInvoice, updateInvoice, deleteInvoice, getProjects, getContractors };
