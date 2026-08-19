// src/features/project-two/edit-non-banking-transaction-page.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Loader2,
  Save,
  UploadCloud,
  FileStack,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SectionContainer } from "@/components/SectionContainer";
import DateInput from "@/components/shared/DateInput";
import EntityCombobox from "@/components/shared/entity-combobox";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { useHasPermission } from "@/hooks/use-permission";

import { url } from "@/features/setting/pages/statement-upload-four/constants";
import InvoiceCard from "@/features/setting/pages/statement-upload-four/invoice/InvoiceCard";
import FileStatusRow from "@/features/setting/pages/statement-upload-four/invoice/FileStatusRow";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return `"${file.name}" — only PDF, PNG, JPG allowed.`;
  if (file.size > MAX_SIZE) return `"${file.name}" exceeds 2MB limit.`;
  return null;
}

function toDateInputValue(val) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Invoice section — embedded directly in the page (no sheet) ──
function InvoiceSection({ txnId, readOnly }) {
  const queryClient = useQueryClient();
  const { user } = useAuthV2();
  const [invoiceNo, setInvoiceNo] = useState("");
  const [stagedFiles, setStagedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [addFileState, setAddFileState] = useState(null);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const newInvoiceIdRef = useRef(null);

  const queryKey = ["invoices", "main", txnId];

  const { data: invoices = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () =>
      (await axios.get(`${url}/api/statement/main/${txnId}/invoices`)).data?.data || [],
    enabled: !!txnId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const resetLocalState = () => {
    setInvoiceNo("");
    setStagedFiles([]);
    newInvoiceIdRef.current = null;
  };

  const updateStagedFile = (id, patch) =>
    setStagedFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const addFilesToStage = (fileList) => {
    const arr = Array.from(fileList || []);
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

  const uploadOneStagedFile = async (fileEntry) => {
    updateStagedFile(fileEntry.id, { status: "uploading", progress: 0, error: null });
    try {
      if (newInvoiceIdRef.current == null) {
        const fd = new FormData();
        fd.append("invoiceNo", invoiceNo);
        fd.append("files", fileEntry.file);
        if (user?.id) fd.append("userId", user.id);
        const res = await axios.post(`${url}/api/statement/main/${txnId}/invoices`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (evt) =>
            updateStagedFile(fileEntry.id, { progress: Math.round((evt.loaded / evt.total) * 100) }),
        });
        newInvoiceIdRef.current = res.data?.invoiceId;
      } else {
        const fd = new FormData();
        fd.append("file", fileEntry.file);
        if (user?.id) fd.append("userId", user.id);
        await axios.post(`${url}/api/statement/invoices/${newInvoiceIdRef.current}/files`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (evt) =>
            updateStagedFile(fileEntry.id, { progress: Math.round((evt.loaded / evt.total) * 100) }),
        });
      }
      updateStagedFile(fileEntry.id, { status: "done", progress: 100 });
    } catch (err) {
      updateStagedFile(fileEntry.id, {
        status: "error",
        error: err.response?.data?.message || "Upload failed",
      });
      throw err;
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
    }
  };

  const handleAddFileToInvoice = async (invoiceId, file) => {
    if (!file) {
      setAddFileState(null);
      return;
    }
    const err = validateFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    setAddFileState({ invoiceId, file, status: "uploading", progress: 0, error: null });
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (user?.id) fd.append("userId", user.id);
      await axios.post(`${url}/api/statement/invoices/${invoiceId}/files`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) =>
          setAddFileState((prev) => (prev ? { ...prev, progress: Math.round((evt.loaded / evt.total) * 100) } : prev)),
      });
      setAddFileState((prev) => (prev ? { ...prev, status: "done", progress: 100 } : prev));
      toast.success("File added.");
      invalidate();
      setTimeout(() => setAddFileState(null), 800);
    } catch (err) {
      setAddFileState((prev) =>
        prev ? { ...prev, status: "error", error: err.response?.data?.message || "Upload failed" } : prev,
      );
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <FileStack size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Invoices</h3>
        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full ml-1">
          {invoices.length} Total
        </span>
      </div>

      {isLoading ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <Loader2 className="inline animate-spin mr-2" size={16} /> Loading...
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-xl mb-3">
          No invoices yet.
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {invoices.map((inv) => (
            <InvoiceCard
              key={inv.INVOICE_ID}
              invoice={inv}
              readOnly={readOnly}
              onDeleteInvoice={(id) => handleDeleteInvoice(id)}
              onDeleteFile={(id) => handleDeleteFile(id)}
              onAddFile={handleAddFileToInvoice}
              addFileState={addFileState}
              deletingInvoiceId={deletingInvoiceId}
              deletingFileId={deletingFileId}
            />
          ))}
        </div>
      )}

      {!readOnly && (
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">Add Invoice</h4>
          <Input
            placeholder="Invoice No (optional)"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            className="h-9 text-sm mb-3"
          />
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFilesToStage(e.dataTransfer.files); }}
            className={`flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-xl py-6 cursor-pointer transition-colors ${
              dragOver ? "border-primary bg-accent/40" : "border-border hover:border-primary/50"
            }`}
          >
            <UploadCloud size={20} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Drag & drop files, or click to browse</span>
            <span className="text-[11px] text-muted-foreground">PDF, PNG, JPG up to 2MB</span>
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => { addFilesToStage(e.target.files); e.target.value = ""; }}
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
                  onRemove={() => setStagedFiles((prev) => prev.filter((x) => x.id !== f.id))}
                  onRetry={() => handleSubmitInvoice(f.id)}
                />
              ))}
            </div>
          )}

          <Button
            onClick={() => handleSubmitInvoice()}
            disabled={submitting || stagedFiles.every((f) => f.status === "done") || stagedFiles.length === 0}
            className="w-full h-9 text-sm rounded-full bg-primary hover:bg-[#4F46E5] text-primary-foreground mt-3"
          >
            {submitting ? (
              <><Loader2 size={14} className="mr-1 animate-spin" /> Uploading...</>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export function EditNonBankingTransactionPage() {
  const { id: projectId, txnId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canEdit = useHasPermission("PROJECT_STATEMENT_EDIT");

  const [form, setForm] = useState(null);

  const { data: projectOptions = [] } = useQuery({
    queryKey: ["statementProjects"],
    queryFn: async () => (await axios.get(`${url}/api/statement/projects`)).data?.data || [],
    staleTime: 5 * 60 * 1000,
  });

  const { data: contractorOptions = [] } = useQuery({
    queryKey: ["statementContractors"],
    queryFn: async () => (await axios.get(`${url}/api/statement/contractors`)).data?.data || [],
    staleTime: 5 * 60 * 1000,
  });

  const projectOpts = useMemo(
    () => projectOptions.map((p) => ({ value: String(p.P_ID), label: p.P_NAME })),
    [projectOptions],
  );
  const contractorOpts = useMemo(
    () => contractorOptions.map((c) => ({ value: String(c.CONTRATOR_ID), label: c.CONTRATOR_NAME })),
    [contractorOptions],
  );

  const { data: txn, isLoading: txnLoading } = useQuery({
    queryKey: ["mainTransaction", txnId],
    queryFn: async () => (await axios.get(`${url}/api/statement/main/${txnId}/transaction`)).data?.data,
    enabled: !!txnId,
  });

  useEffect(() => {
    if (txn) {
      setForm({
        txnDate: toDateInputValue(txn.TXN_DATE),
        entryType: txn.DEBIT != null ? "DEBIT" : "CREDIT",
        amount: Math.abs(Number(txn.AMOUNT || 0)).toString(),
        description: txn.DESCRIPTION || "",
        pId: txn.P_ID ? String(txn.P_ID) : "",
        contractorId: txn.CONTRACTOR_ID ? String(txn.CONTRACTOR_ID) : "",
        invoiceNo: txn.INVOICE_NO || "",
        remarks: txn.REMARKS || "",
        paymentBy: txn.PAYMENT_BY || "BUILDER",
        excludeMargin: txn.EXCLUDE_MARGIN || "N",
      });
    }
  }, [txn]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => axios.put(`${url}/api/statement/main/row`, payload),
    onSuccess: () => {
      toast.success("Transaction updated.");
      queryClient.invalidateQueries({ queryKey: ["projectReport", projectId] });
      queryClient.invalidateQueries({ queryKey: ["statementMain"] });
      navigate(`/dashboard/projects/${projectId}/report`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update transaction."),
  });

  const handleSave = () => {
    if (!form.txnDate || !form.amount || !form.description) {
      toast.error("Date, Amount and Description are required.");
      return;
    }
    const proj = projectOptions.find((p) => String(p.P_ID) === String(form.pId));
    const cont = contractorOptions.find((c) => String(c.CONTRATOR_ID) === String(form.contractorId));
    saveMutation.mutate({
      txnId,
      txnDate: form.txnDate,
      amount: form.amount,
      entryType: form.entryType,
      description: form.description,
      pId: form.pId || null,
      projectName: form.pId ? proj?.P_NAME || null : null,
      contractorId: form.contractorId || null,
      contractorName: form.contractorId ? cont?.CONTRATOR_NAME || null : null,
      invoiceNo: form.invoiceNo,
      remarks: form.remarks,
      paymentBy: form.paymentBy,
      excludeMargin: form.excludeMargin,
    });
  };

  if (txnLoading || !form) {
    return (
      <SectionContainer variant="dashboard">
        <div className="p-10 text-center text-muted-foreground">
          <Loader2 className="inline animate-spin mr-2" size={16} /> Loading...
        </div>
      </SectionContainer>
    );
  }

  if (txn && txn.SOURCE_TYPE !== "NON_BANKING") {
    return (
      <SectionContainer variant="dashboard">
        <div className="p-10 text-center text-muted-foreground">
          Only non-banking transactions can be edited.
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} className="mr-1" /> Back
            </Button>
          </div>
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer variant="dashboard">
      <div className="p-4 sm:p-5 bg-card border border-border shadow-xs rounded-md mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-border">
          <h2 className="font-display font-semibold text-base text-foreground">
            Edit Non-Banking Transaction
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Date *</label>
            <DateInput
              value={form.txnDate}
              onChange={(v) => setForm((p) => ({ ...p, txnDate: v }))}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Type *</label>
            <Select
              value={form.entryType}
              onValueChange={(v) => setForm((p) => ({ ...p, entryType: v }))}
              disabled={!canEdit}
            >
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEBIT">Receive</SelectItem>
                <SelectItem value="CREDIT">Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Payment By</label>
            <Select
              value={form.paymentBy}
              onValueChange={(v) => setForm((p) => ({ ...p, paymentBy: v }))}
              disabled={!canEdit}
            >
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUILDER">Builder</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end pb-1.5">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.excludeMargin === "Y"}
                disabled={!canEdit}
                onChange={(e) =>
                  setForm((p) => ({ ...p, excludeMargin: e.target.checked ? "Y" : "N" }))
                }
                className="accent-destructive w-4 h-4 rounded"
              />
              Exclude Margin
            </label>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Amount *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              disabled={!canEdit}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || Number(v) >= 0) setForm((p) => ({ ...p, amount: v }));
              }}
              className="h-8 text-xs"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
            <Input
              value={form.description}
              disabled={!canEdit}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Project</label>
            <EntityCombobox
              items={projectOpts}
              value={form.pId}
              onValueChange={(v) => setForm((p) => ({ ...p, pId: v }))}
              placeholder="Select project"
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Contractor</label>
            <EntityCombobox
              items={contractorOpts}
              value={form.contractorId}
              onValueChange={(v) => setForm((p) => ({ ...p, contractorId: v }))}
              placeholder="Select contractor"
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Invoice No</label>
            <Input
              value={form.invoiceNo}
              disabled={!canEdit}
              onChange={(e) => setForm((p) => ({ ...p, invoiceNo: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Remarks</label>
            <Input
              value={form.remarks}
              disabled={!canEdit}
              onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="mt-5">
          <Button
            onClick={handleSave}
            disabled={!canEdit || saveMutation.isPending}
            size="sm"
            className="rounded-full bg-primary hover:bg-[#4F46E5] text-primary-foreground btn-lift"
          >
            {saveMutation.isPending ? (
              <><Loader2 size={14} className="mr-1 animate-spin" /> Saving...</>
            ) : (
              <><Save size={14} className="mr-1" /> Save Changes</>
            )}
          </Button>
        </div>
      </div>

      <InvoiceSection txnId={txnId} readOnly={!canEdit} />
    </SectionContainer>
  );
}