// src\features\setting\pages\statement-upload-three\invoice\FileStatusRow.jsx
import React from "react";
import { FileText, FileImage, AlertCircle, CheckCircle2, X, RefreshCw, Loader2 } from "lucide-react";
import { fmtBytes } from "./fileUtils";

// status: 'idle' | 'uploading' | 'done' | 'error'
export default function FileStatusRow({ fileName, fileSize, fileType, status, progress, error, onRemove, onRetry }) {
  const isImage = fileType?.startsWith("image/");
  const Icon = isImage ? FileImage : FileText;

  const containerClasses = {
    idle: "bg-secondary border-border",
    uploading: "bg-secondary border-border",
    done: "bg-secondary border-border",
    error: "bg-destructive/5 border-destructive/40",
  }[status];

  return (
    <div className={`flex items-center gap-2.5 border rounded-md px-3 py-2 ${containerClasses}`}>
      <div className="shrink-0 w-8 h-8 rounded-md border border-border bg-card flex items-center justify-center overflow-hidden">
        {status === "error" ? (
          <AlertCircle size={16} className="text-destructive" />
        ) : status === "done" ? (
          <CheckCircle2 size={16} className="text-[#10B981]" />
        ) : (
          <Icon size={16} className="text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground truncate">{fileName}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span>{fmtBytes(fileSize)}</span>
          <span>·</span>
          {status === "idle" && <span>Ready to upload</span>}
          {status === "uploading" && (
            <span className="flex items-center gap-1.5 flex-1">
              <Loader2 size={11} className="animate-spin" />
              <span className="w-16 h-1 bg-border rounded-full overflow-hidden">
                <span className="block h-full bg-primary" style={{ width: `${progress || 0}%` }} />
              </span>
              {progress || 0}% Uploading
            </span>
          )}
          {status === "done" && <span className="text-[#10B981]">Uploaded</span>}
          {status === "error" && <span className="text-destructive">{error || "Upload failed"}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {status === "error" && (
          <button onClick={onRetry} className="text-muted-foreground hover:text-primary transition-colors" title="Retry">
            <RefreshCw size={13} />
          </button>
        )}
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors" title="Remove">
          <X size={13} />
        </button>
      </div>
    </div>
  );
}