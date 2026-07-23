// src/features/setting/pages/statement-upload-three/invoice/InvoiceSheet.jsx
import React, { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2, UploadCloud, FileStack } from "lucide-react";
import { url, fmtDate, fmtAmount } from "../constants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { useInvoiceSheetStore } from "../useInvoiceSheetStore";
import InvoiceCard from "./InvoiceCard";
import FileStatusRow from "./FileStatusRow";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `"${file.name}" — only PDF, PNG, JPG allowed.`;
  }
  if (file.size > MAX_SIZE) {
    return `"${file.name}" exceeds 2MB limit.`;
  }
  return null;
}

export default function InvoiceSheet() {
  const { open, parentType, parentId, row, readOnly, closeSheet } =
    useInvoiceSheetStore();
  const queryClient = useQueryClient();
  const { user } = useAuthV2();

  const [invoiceNo, setInvoiceNo] = useState("");
  const [stagedFiles, setStagedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [addFileState, setAddFileState] = useState(null);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [deleteInvoiceTarget, setDeleteInvoiceTarget] = useState(null);
  const [deleteFileTarget, setDeleteFileTarget] = useState(null);

  const newInvoiceIdRef = useRef(null);
  const abortControllersRef = useRef({});

  const queryKey = ["invoices", parentType, parentId];

  const { data: invoices = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axios.get(
        `${url}/api/statement/${parentType}/${parentId}/invoices`,
      );
      return res.data?.data || [];
    },
    enabled: open && !!parentType && !!parentId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const resetLocalState = () => {
    setInvoiceNo("");
    setStagedFiles([]);
    newInvoiceIdRef.current = null;
  };

  const handleClose = () => {
    resetLocalState();
    closeSheet();
  };

  const updateStagedFile = (id, patch) =>
    setStagedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    );

  const addFilesToStage = (fileList) => {
    const arr = Array.from(fileList || []);
    if (arr.length === 0) return;

    const entries = [];
    for (const file of arr) {
      const err = validateFile(file);
      if (err) {
        toast.error(err);
        continue;
      }
      entries.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        status: "pending",
        progress: 0,
        error: null,
      });
    }
    if (entries.length) setStagedFiles((prev) => [...prev, ...entries]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFilesToStage(e.dataTransfer.files);
  };

  const removeStagedFile = (id) => {
    const controller = abortControllersRef.current[id];
    if (controller) controller.abort();
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadOneStagedFile = async (fileEntry) => {
    const controller = new AbortController();
    abortControllersRef.current[fileEntry.id] = controller;
    updateStagedFile(fileEntry.id, {
      status: "uploading",
      progress: 0,
      error: null,
    });

    try {
      if (newInvoiceIdRef.current == null) {
        const fd = new FormData();
        fd.append("invoiceNo", invoiceNo);
        fd.append("files", fileEntry.file);
        if (user?.id) fd.append("userId", user.id);
        const res = await axios.post(
          `${url}/api/statement/${parentType}/${parentId}/invoices`,
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
            signal: controller.signal,
            onUploadProgress: (evt) => {
              const pct = Math.round((evt.loaded / evt.total) * 100);
              updateStagedFile(fileEntry.id, { progress: pct });
            },
          },
        );
        newInvoiceIdRef.current = res.data?.invoiceId;
      } else {
        const fd = new FormData();
        fd.append("file", fileEntry.file);
        if (user?.id) fd.append("userId", user.id);
        await axios.post(
          `${url}/api/statement/invoices/${newInvoiceIdRef.current}/files`,
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
            signal: controller.signal,
            onUploadProgress: (evt) => {
              const pct = Math.round((evt.loaded / evt.total) * 100);
              updateStagedFile(fileEntry.id, { progress: pct });
            },
          },
        );
      }
      updateStagedFile(fileEntry.id, { status: "done", progress: 100 });
    } catch (err) {
      if (axios.isCancel(err) || err.code === "ERR_CANCELED") return;
      updateStagedFile(fileEntry.id, {
        status: "error",
        error: err.response?.data?.message || "Upload failed",
      });
      throw err;
    } finally {
      delete abortControllersRef.current[fileEntry.id];
    }
  };

  const handleSubmitInvoice = async (retryId) => {
    setSubmitting(true);
    const targets = retryId
      ? stagedFiles.filter((f) => f.id === retryId)
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

    if (!retryId && !hadError) {
      toast.success("Invoice added.");
      resetLocalState();
    } else if (hadError) {
      toast.error("Some files failed to upload. Retry the failed ones.");
    } else if (retryId) {
      setStagedFiles((current) => {
        const stillPending = current.some((f) => f.status !== "done");
        if (!stillPending && current.length > 0) {
          resetLocalState();
          return [];
        }
        return current;
      });
    }
  };

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
    const err = validateFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    setAddFileState({
      invoiceId,
      file,
      status: "uploading",
      progress: 0,
      error: null,
    });
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
      setAddFileState((prev) =>
        prev ? { ...prev, status: "done", progress: 100 } : prev,
      );
      toast.success("File added.");
      invalidate();
      setTimeout(() => setAddFileState(null), 800);
    } catch (err) {
      setAddFileState((prev) =>
        prev
          ? {
              ...prev,
              status: "error",
              error: err.response?.data?.message || "Upload failed",
            }
          : prev,
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card border-border p-0">
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="font-display text-foreground">
            Invoices
          </SheetTitle>
        </SheetHeader>

        {row && (
          <div className="px-4 py-3 bg-secondary/50 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center shrink-0">
              <FileStack size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">
                {fmtDate(row.TXN_DATE)}
              </div>
              <div className="text-sm text-foreground truncate">
                {row.DESCRIPTION}
              </div>
            </div>
            <div
              className={`text-sm font-semibold shrink-0 ${Number(row.AMOUNT) < 0 ? "text-red-600" : "text-emerald-600"}`}
            >
              {fmtAmount(row.AMOUNT)}
            </div>
          </div>
        )}

        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">
                Uploaded Invoices
              </h3>
              <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                {invoices.length} Total
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Loader2 className="inline animate-spin mr-2" size={16} />{" "}
                Loading...
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                No invoices yet.
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <InvoiceCard
                    key={inv.INVOICE_ID}
                    invoice={inv}
                    readOnly={readOnly}
                    onDeleteInvoice={(id) => setDeleteInvoiceTarget(id)}
                    onDeleteFile={(id) => setDeleteFileTarget(id)}
                    onAddFile={handleAddFileToInvoice}
                    addFileState={addFileState}
                    deletingInvoiceId={deletingInvoiceId}
                    deletingFileId={deletingFileId}
                  />
                ))}
              </div>
            )}
          </div>

          {!readOnly && (
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Add Invoice
              </h4>
              <Input
                placeholder="Invoice No (optional)"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="h-9 text-sm mb-3"
              />

              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-xl py-6 cursor-pointer transition-colors ${
                  dragOver
                    ? "border-primary bg-accent/40"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <UploadCloud size={20} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Drag & drop files, or click to browse
                </span>
                <span className="text-[11px] text-muted-foreground">PDF, PNG, JPG up to 2MB</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    addFilesToStage(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>

              {stagedFiles.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  {stagedFiles.map((f) => (
                    <FileStatusRow
                      key={f.id}
                      fileName={f.file.name}
                      fileSize={f.file.size}
                      fileType={f.file.type}
                      status={f.status}
                      progress={f.progress}
                      error={f.error}
                      onRemove={() => removeStagedFile(f.id)}
                      onRetry={() => handleSubmitInvoice(f.id)}
                    />
                  ))}
                </div>
              )}

              <Button
                onClick={() => handleSubmitInvoice()}
                disabled={
                  submitting ||
                  stagedFiles.every((f) => f.status === "done") ||
                  stagedFiles.length === 0
                }
                className="w-full h-9 text-sm rounded-full bg-primary hover:bg-[#4F46E5] text-primary-foreground mt-3"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />{" "}
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          )}
        </div>

        {!readOnly && (
          <>
            <AlertDialog
              open={!!deleteInvoiceTarget}
              onOpenChange={(o) => !o && setDeleteInvoiceTarget(null)}
            >
              <AlertDialogContent className="bg-card border-border rounded-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">
                    Delete Invoice?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will permanently delete this invoice and all its
                    attached files. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setDeleteInvoiceTarget(null)}
                    className="border-border"
                  >
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

            <AlertDialog
              open={!!deleteFileTarget}
              onOpenChange={(o) => !o && setDeleteFileTarget(null)}
            >
              <AlertDialogContent className="bg-card border-border rounded-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">
                    Delete File?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will permanently delete this file. This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setDeleteFileTarget(null)}
                    className="border-border"
                  >
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
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
