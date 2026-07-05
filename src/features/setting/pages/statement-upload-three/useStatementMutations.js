// src/features/setting/pages/statement-upload-three/useStatementMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import { url } from "./constants";

export function useStatementMutations() {
  const queryClient = useQueryClient();

  const invalidateStaging = () => {
    queryClient.invalidateQueries({ queryKey: ["statementStagingAll"], refetchType: "active" });
    queryClient.invalidateQueries({ queryKey: ["statementStagingStats"], refetchType: "active" });
  };
  const invalidateMain = () => {
    queryClient.invalidateQueries({ queryKey: ["statementMain"], refetchType: "active" });
  };

  const updateRowMutation = useMutation({
    mutationFn: async (payload) => axios.put(`${url}/api/statement/staging/row`, payload),
    onSuccess: invalidateStaging,
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update row."),
  });

  const uploadInvoiceMutation = useMutation({
    mutationFn: async ({ stagingId, file }) => {
      const fd = new FormData();
      fd.append("invoiceFile", file);
      return axios.post(`${url}/api/statement/staging/${stagingId}/invoice`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => { toast.success("Invoice uploaded."); invalidateStaging(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to upload invoice."),
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (stagingId) => axios.delete(`${url}/api/statement/staging/${stagingId}/invoice`),
    onSuccess: () => { toast.success("Invoice file deleted."); invalidateStaging(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete invoice."),
  });

  const approveMutation = useMutation({
    mutationFn: async (stagingId) => axios.post(`${url}/api/statement/approve`, { stagingIds: [stagingId] }),
    onSuccess: (res) => {
      toast.success(res.data?.message || "Row approved!");
      invalidateStaging();
      invalidateMain();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to approve row."),
  });

  const disapproveMutation = useMutation({
    mutationFn: async (txnId) => axios.post(`${url}/api/statement/disapprove`, { txnId }),
    onSuccess: (res) => {
      toast.success(res.data?.message || "Transaction disapproved and moved back to staging.");
      invalidateMain();
      invalidateStaging();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to disapprove transaction."),
  });

  const addNonBankingMutation = useMutation({
    mutationFn: async (data) => axios.post(`${url}/api/statement/non-banking`, data),
    onSuccess: () => { toast.success("Entry added to staging."); invalidateStaging(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add entry."),
  });

  return {
    updateRowMutation, uploadInvoiceMutation, deleteInvoiceMutation,
    approveMutation, disapproveMutation, addNonBankingMutation,
  };
}