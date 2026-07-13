// src/features/setting/pages/statement-upload-three/InvoiceSheet.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2, Trash2, ExternalLink, PlusCircle, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { url } from "./constants";

export default function InvoiceSheet({ open, onClose, parentType, parentId }) {
  const queryClient = useQueryClient();
  const [invoiceNo, setInvoiceNo] = useState("");
  const [files, setFiles] = useState([]);

  const queryKey = ["invoices", parentType, parentId];

  const { data: invoices = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axios.get(`${url}/api/statement/${parentType}/${parentId}/invoices`);
      return res.data?.data || [];
    },
    enabled: open,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const addInvoiceMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("invoiceNo", invoiceNo);
      files.forEach((f) => fd.append("files", f));
      return axios.post(`${url}/api/statement/${parentType}/${parentId}/invoices`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Invoice added.");
      setInvoiceNo("");
      setFiles([]);
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add invoice."),
  });

  const addFileMutation = useMutation({
    mutationFn: async ({ invoiceId, file }) => {
      const fd = new FormData();
      fd.append("file", file);
      return axios.post(`${url}/api/statement/invoices/${invoiceId}/files`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => { toast.success("File added."); invalidate(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add file."),
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId) => axios.delete(`${url}/api/statement/invoices/files/${fileId}`),
    onSuccess: () => { toast.success("File deleted."); invalidate(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete file."),
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoiceId) => axios.delete(`${url}/api/statement/invoices/${invoiceId}`),
    onSuccess: () => { toast.success("Invoice deleted."); invalidate(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete invoice."),
  });

  const handleSubmit = () => {
    if (files.length === 0) {
      toast.error("Please select at least one file.");
      return;
    }
    addInvoiceMutation.mutate();
  };

  const handleAddFileClick = (invoiceId, fileList) => {
    const f = fileList?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      toast.error(`"${f.name}" exceeds 20 MB limit.`);
      return;
    }
    addFileMutation.mutate({ invoiceId, file: f });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        className="w-full sm:max-w-md overflow-y-auto bg-card border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <SheetHeader className="border-b border-border pb-3">
          <SheetTitle className="font-display text-foreground">Invoices</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4 px-4">
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Loader2 className="inline animate-spin mr-2" size={16} /> Loading...
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">No invoices yet.</div>
          ) : (
            invoices.map((inv) => (
              <div key={inv.INVOICE_ID} className="border border-border rounded-lg p-3 bg-secondary">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {inv.INVOICE_NO || <span className="text-muted-foreground font-normal">No invoice number</span>}
                  </span>
                  <button
                    onClick={() => deleteInvoiceMutation.mutate(inv.INVOICE_ID)}
                    className="text-destructive/70 hover:text-destructive transition-colors"
                    title="Delete invoice"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(inv.files || []).map((f) => (
                    <div key={f.FILE_ID} className="flex items-center justify-between text-xs">
                      <a
                        href={`${url}/api/statement/invoices/files/${f.FILE_ID}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-primary hover:text-[#4F46E5] truncate max-w-[220px]"
                        title={f.FILE_NAME}
                      >
                        <ExternalLink size={11} className="shrink-0" />
                        {f.FILE_NAME}
                      </a>
                      <button
                        onClick={() => deleteFileMutation.mutate(f.FILE_ID)}
                        className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <label className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary cursor-pointer mt-2 transition-colors">
                  <PlusCircle size={12} /> Add file
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleAddFileClick(inv.INVOICE_ID, e.target.files)}
                  />
                </label>
              </div>
            ))
          )}

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground mb-2 font-display">Add New Invoice</h4>
            <Input
              placeholder="Invoice No (optional)"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="h-9 text-sm mb-2 border-input-border rounded-sm"
            />
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="text-xs mb-2 w-full text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border file:border-input-border file:bg-secondary file:text-foreground file:text-xs"
            />
            {files.length > 0 && (
              <div className="text-xs text-muted-foreground mb-2">{files.length} file(s) selected</div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={addInvoiceMutation.isPending}
              className="w-full h-9 text-sm rounded-full bg-primary hover:bg-[#4F46E5] text-primary-foreground btn-lift"
            >
              {addInvoiceMutation.isPending ? (
                <><Loader2 size={14} className="mr-1 animate-spin" /> Adding...</>
              ) : (
                "Add Invoice"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}