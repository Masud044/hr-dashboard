// src\features\setting\pages\statement-upload-four\invoice\AddInvoicePanel.jsx
import React, { useCallback, useState } from "react";
import { UploadCloud, Info, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import FileStatusRow from "./FileStatusRow";

let idCounter = 0;
const nextId = () => `f${++idCounter}`;

const MAX_SIZE = 2 * 1024 * 1024; // 1MB
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `"${file.name}" — only PDF, PNG, JPG allowed.`;
  }
  if (file.size > MAX_SIZE) {
    return `"${file.name}" exceeds 2MB limit.`;
  }
  return null;
}

export default function AddInvoicePanel({ invoiceNo, setInvoiceNo, stagedFiles, setStagedFiles, onSubmit, onCancelUpload, submitting }) {
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback((fileList) => {
    const valid = [];
    for (const file of Array.from(fileList)) {
      const err = validateFile(file);
      if (err) {
        toast.error(err);
        continue;
      }
      valid.push({ id: nextId(), file, status: "idle", progress: 0, error: null });
    }
    if (valid.length) setStagedFiles((prev) => [...prev, ...valid]);
  }, [setStagedFiles]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => {
    const entry = stagedFiles.find((f) => f.id === id);
    if (entry?.status === "uploading") onCancelUpload(id);
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const canSubmit = stagedFiles.length > 0 && !submitting;

  return (
    <div className="border border-border rounded-xl p-4 bg-card lg:sticky lg:top-4">
      <h4 className="text-sm font-semibold text-foreground mb-3 font-display">Add New Invoice</h4>

      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Invoice No (optional)</label>
      <Input
        placeholder="e.g. INV-1234"
        value={invoiceNo}
        onChange={(e) => setInvoiceNo(e.target.value)}
        disabled={submitting}
        className="h-9 text-sm mt-1.5 mb-4 border-input-border rounded-sm"
      />

      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Attachments</label>
      <div
        onDragOver={(e) => { e.preventDefault(); if (!submitting) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={submitting ? undefined : handleDrop}
        onClick={() => !submitting && document.getElementById("add-invoice-file-input")?.click()}
        className={`mt-1.5 mb-3 border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 transition-colors ${
          submitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${dragOver ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}
      >
        <UploadCloud size={22} className="text-muted-foreground mb-2" />
        <div className="text-sm text-foreground">Drop files or click to browse</div>
        <div className="text-xs text-muted-foreground mt-0.5">PDF, PNG, JPG up to 2MB</div>
        <input
          id="add-invoice-file-input"
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          disabled={submitting}
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {stagedFiles.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {stagedFiles.map((f) => (
            <FileStatusRow
              key={f.id}
              fileName={f.file.name}
              fileSize={f.file.size}
              fileType={f.file.type}
              status={f.status}
              progress={f.progress}
              error={f.error}
              onRemove={() => removeFile(f.id)}
              onRetry={() => onSubmit(f.id)}
            />
          ))}
        </div>
      )}

      <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-3">
        <Info size={13} className="shrink-0 mt-0.5" />
        <span>You'll be listed as the creator of this invoice record for audit purposes.</span>
      </div>

      <Button
        onClick={() => onSubmit()}
        disabled={!canSubmit}
        className="w-full h-9 text-sm rounded-full bg-primary hover:bg-[#4F46E5] text-primary-foreground btn-lift"
      >
        {submitting ? (
          <><Loader2 size={14} className="mr-1 animate-spin" /> Adding...</>
        ) : (
          "Add Invoice"
        )}
      </Button>
    </div>
  );
}