// src/features/ticketing/components/AttachmentUploader.jsx
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { UploadCloud } from "lucide-react";
import FileStatusRow from "@/features/setting/pages/statement-upload-four/invoice/FileStatusRow";
import { uploadAttachment, useInvalidateTicketAfterAttachment } from "../queries";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return `"${file.name}" — only PDF, PNG, JPG allowed.`;
  if (file.size > MAX_SIZE) return `"${file.name}" exceeds 5MB limit.`;
  return null;
}

/**
 * Standalone attachment uploader for the ticket detail sheet.
 * Optionally pass commentId to attach the file to a specific comment.
 */
export default function AttachmentUploader({ ticketId, commentId, onUploaded }) {
  const [dragOver, setDragOver] = useState(false);
  const [stagedFiles, setStagedFiles] = useState([]);
  const abortControllersRef = useRef({});
  const invalidateTicket = useInvalidateTicketAfterAttachment();

  const updateStagedFile = (id, patch) =>
    setStagedFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const addFilesToStage = (fileList) => {
    const arr = Array.from(fileList || []);
    if (!arr.length) return;
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
    if (entries.length) {
      setStagedFiles((prev) => [...prev, ...entries]);
      entries.forEach((entry) => uploadOne(entry));
    }
  };

  const uploadOne = async (entry) => {
    const controller = new AbortController();
    abortControllersRef.current[entry.id] = controller;
    updateStagedFile(entry.id, { status: "uploading", progress: 0, error: null });

    try {
      await uploadAttachment({
        ticketId,
        file: entry.file,
        commentId,
        signal: controller.signal,
        onUploadProgress: (pct) => updateStagedFile(entry.id, { progress: pct }),
      });
      updateStagedFile(entry.id, { status: "done", progress: 100 });
      invalidateTicket(ticketId);
      onUploaded?.();
    } catch (err) {
      if (axiosCanceled(err)) return;
      updateStagedFile(entry.id, { status: "error", error: err?.response?.data?.message || "Upload failed" });
    } finally {
      delete abortControllersRef.current[entry.id];
    }
  };

  const axiosCanceled = (err) => err?.code === "ERR_CANCELED";

  const removeStagedFile = (id) => {
    abortControllersRef.current[id]?.abort();
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const retryStagedFile = (id) => {
    const entry = stagedFiles.find((f) => f.id === id);
    if (entry) uploadOne(entry);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFilesToStage(e.dataTransfer.files);
  };

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg py-4 cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-accent/40" : "border-border hover:border-primary/50"
        }`}
      >
        <UploadCloud size={18} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Drag & drop, or click to browse</span>
        <span className="text-[11px] text-muted-foreground">PDF, PNG, JPG up to 5MB</span>
        <input
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => { addFilesToStage(e.target.files); e.target.value = ""; }}
        />
      </label>

      {stagedFiles.length > 0 && (
        <div className="space-y-1.5 mt-2">
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
              onRetry={() => retryStagedFile(f.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}