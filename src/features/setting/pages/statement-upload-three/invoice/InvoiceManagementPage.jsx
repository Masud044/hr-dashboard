// src\features\setting\pages\statement-upload-three\invoice\InvoiceManagementPage.jsx
import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileStack } from "lucide-react";
import { url, fmtDate, fmtAmount } from "../constants";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import InvoiceCard from "./InvoiceCard";
import AddInvoicePanel from "./AddInvoicePanel";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_SIZE = 1 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

export default function InvoiceManagementPage() {
  const { parentType, parentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthV2();

  const [invoiceNo, setInvoiceNo] = useState("");
  const [stagedFiles, setStagedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [addFileState, setAddFileState] = useState(null);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [deleteInvoiceTarget, setDeleteInvoiceTarget] = useState(null); // invoiceId or null
  const [deleteFileTarget, setDeleteFileTarget] = useState(null); // fileId or null

  const newInvoiceIdRef = useRef(null);
  const abortControllersRef = useRef({}); // { [stagedFileId]: AbortController }

  const queryKey = ["invoices", parentType, parentId];

  const { data: invoices = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axios.get(`${url}/api/statement/${parentType}/${parentId}/invoices`);
      return res.data?.data || [];
    },
  });
  const { data: row, isLoading: isRowLoading } = useQuery({
    queryKey: ["transaction", parentType, parentId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/statement/${parentType}/${parentId}/transaction`);
      return res.data?.data || null;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const updateStagedFile = (id, patch) => {
    setStagedFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const cancelUpload = (fileId) => {
    const controller = abortControllersRef.current[fileId];
    if (controller) {
      controller.abort();
      delete abortControllersRef.current[fileId];
    }
  };

  const uploadOneStagedFile = async (fileEntry) => {
    const controller = new AbortController();
    abortControllersRef.current[fileEntry.id] = controller;
    updateStagedFile(fileEntry.id, { status: "uploading", progress: 0, error: null });

    try {
      if (newInvoiceIdRef.current == null) {
        const fd = new FormData();
        fd.append("invoiceNo", invoiceNo);
        fd.append("files", fileEntry.file);
        if (user?.id) fd.append("userId", user.id);
        const res = await axios.post(`${url}/api/statement/${parentType}/${parentId}/invoices`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: controller.signal,
          onUploadProgress: (evt) => {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            updateStagedFile(fileEntry.id, { progress: pct });
          },
        });
        newInvoiceIdRef.current = res.data?.invoiceId;
      } else {
        const fd = new FormData();
        fd.append("file", fileEntry.file);
        if (user?.id) fd.append("userId", user.id);
        await axios.post(`${url}/api/statement/invoices/${newInvoiceIdRef.current}/files`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: controller.signal,
          onUploadProgress: (evt) => {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            updateStagedFile(fileEntry.id, { progress: pct });
          },
        });
      }
      updateStagedFile(fileEntry.id, { status: "done", progress: 100 });
    } catch (err) {
      if (axios.isCancel(err) || err.code === "ERR_CANCELED") {
        // silently removed by user — no error state needed, row is already gone
        return;
      }
      updateStagedFile(fileEntry.id, { status: "error", error: err.response?.data?.message || "Upload failed" });
      throw err;
    } finally {
      delete abortControllersRef.current[fileEntry.id];
    }
  };

  const handleSubmitInvoice = async (retryFileId) => {
    setSubmitting(true);

    const targets = retryFileId
      ? stagedFiles.filter((f) => f.id === retryFileId)
      : stagedFiles.filter((f) => f.status !== "done");

    let hadError = false;
    for (const entry of targets) {
      try {
        await uploadOneStagedFile(entry);
      } catch {
        hadError = true;
      }
    }

    setSubmitting(false);
    invalidate();

    // decide outcome from what we just attempted, not from re-reading state
    const isFullBatch = !retryFileId;
    const allSucceeded = !hadError;

    if (isFullBatch && allSucceeded) {
      toast.success("Invoice added.");
      newInvoiceIdRef.current = null;
      setInvoiceNo("");
      setStagedFiles([]);
    } else if (hadError) {
      toast.error("Some files failed to upload. Retry the failed ones.");
    } else if (retryFileId && allSucceeded) {
      // single retry succeeded — check if that was the last pending one
      setStagedFiles((current) => {
        const stillPending = current.some((f) => f.status !== "done");
        if (!stillPending && current.length > 0) {
          newInvoiceIdRef.current = null;
          setInvoiceNo("");
          return [];
        }
        return current;
      });
    }
  };

const requestDeleteInvoice = (invoiceId) => setDeleteInvoiceTarget(invoiceId);
  const requestDeleteFile = (fileId) => setDeleteFileTarget(fileId);

  const handleDeleteInvoice = async (invoiceId) => {
    if (deletingInvoiceId) return;
    setDeletingInvoiceId(invoiceId);
    try {
      await axios.delete(`${url}/api/statement/invoices/${invoiceId}`);
      toast.success("Invoice deleted.");
      invalidate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete invoice.");
    } finally {
      setDeletingInvoiceId(null);
      setDeleteInvoiceTarget(null);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (deletingFileId) return;
    setDeletingFileId(fileId);
    try {
      await axios.delete(`${url}/api/statement/invoices/files/${fileId}`);
      toast.success("File deleted.");
      invalidate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete file.");
    } finally {
      setDeletingFileId(null);
      setDeleteFileTarget(null);
    }
  };

  const handleAddFileToInvoice = async (invoiceId, file, isRetry = false) => {
    if (!file) {
      setAddFileState(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`"${file.name}" — only PDF, PNG, JPG allowed.`);
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error(`"${file.name}" exceeds 1MB limit.`);
      return;
    }

    setAddFileState({ invoiceId, file, status: "uploading", progress: 0, error: null });
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (user?.id) fd.append("userId", user.id);
      await axios.post(`${url}/api/statement/invoices/${invoiceId}/files`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setAddFileState((prev) => (prev ? { ...prev, progress: pct } : prev));
        },
      });
      setAddFileState((prev) => (prev ? { ...prev, status: "done", progress: 100 } : prev));
      toast.success("File added.");
      invalidate();
      setTimeout(() => setAddFileState(null), 800);
    } catch (err) {
      setAddFileState((prev) => (prev ? { ...prev, status: "error", error: err.response?.data?.message || "Upload failed" } : prev));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft size={16} /> Back
      </Button>
      {/* {isRowLoading ? (
        <div className="border border-border rounded-xl p-4 bg-card mb-6 h-[68px] animate-pulse" />
      ) : row ? (
        <div className="border border-border rounded-xl p-4 bg-card mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <FileStack size={18} className="text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Transaction Context</div>
              <div className="text-sm font-medium text-foreground">{row.DESCRIPTION}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Transaction Date</div>
            <div className="text-sm font-medium text-foreground">{fmtDate(row.TXN_DATE)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Amount</div>
            <div className={`text-sm font-semibold ${Number(row.AMOUNT) < 0 ? "text-red-600" : "text-emerald-600"}`}>
              {fmtAmount(row.AMOUNT)}
            </div>
          </div>
        </div>
      ) : null} */}
      {isRowLoading ? (
        <div className="border border-border rounded-xl p-4 bg-card mb-6 h-[68px] animate-pulse" />
      ) : row ? (
        <div className="border border-border rounded-xl p-4 bg-card mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center shrink-0">
              <FileStack size={18} className="text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Transaction Context</div>
              <div className="text-sm font-medium text-foreground">{row.DESCRIPTION}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Transaction Date</div>
            <div className="text-sm font-medium text-foreground">{fmtDate(row.TXN_DATE)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Amount</div>
            <div className={`text-sm font-semibold ${Number(row.AMOUNT) < 0 ? "text-red-600" : "text-[#10B981]"}`}>
              {fmtAmount(row.AMOUNT)}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-foreground font-display">Invoices</h3>
            <span className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">
              {invoices.length} Total
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
              No invoices yet.
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <InvoiceCard
                  key={inv.INVOICE_ID}
                  invoice={inv}
                  onDeleteInvoice={requestDeleteInvoice}
                  onDeleteFile={requestDeleteFile}
                  onAddFile={handleAddFileToInvoice}
                  addFileState={addFileState}
                  deletingInvoiceId={deletingInvoiceId}
                  deletingFileId={deletingFileId}
                />
              ))}
            </div>
          )}
        </div>

        <AddInvoicePanel
          invoiceNo={invoiceNo}
          setInvoiceNo={setInvoiceNo}
          stagedFiles={stagedFiles}
          setStagedFiles={setStagedFiles}
          onSubmit={handleSubmitInvoice}
          onCancelUpload={cancelUpload}
          submitting={submitting}
        />
      </div>

      <AlertDialog open={!!deleteInvoiceTarget} onOpenChange={(open) => !open && setDeleteInvoiceTarget(null)}>
        <AlertDialogContent className="bg-card border-border rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete this invoice and all its attached files. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteInvoiceTarget(null)} className="border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => handleDeleteInvoice(deleteInvoiceTarget)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteFileTarget} onOpenChange={(open) => !open && setDeleteFileTarget(null)}>
        <AlertDialogContent className="bg-card border-border rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete File?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete this file. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteFileTarget(null)} className="border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => handleDeleteFile(deleteFileTarget)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}