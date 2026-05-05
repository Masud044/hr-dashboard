import { useRef, useState } from "react";
import { FileText, ImageIcon, Trash2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_SIZE_MB = 20;

/**
 * BillUploadPanel
 *
 * Props:
 *   files    — File[]          (controlled)
 *   onChange — (File[]) => void
 *   disabled — boolean
 */
export default function BillUploadPanel({ files = [], onChange, disabled = false }) {
  const inputRef  = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  // ── helpers ──────────────────────────────────────────────────────────────────
  const addFiles = (incoming) => {
    const valid = [];
    for (const f of incoming) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        alert(`"${f.name}" — unsupported file type.`);
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`"${f.name}" exceeds ${MAX_SIZE_MB} MB limit.`);
        continue;
      }
      // avoid duplicates by name+size
      if (files.some((x) => x.name === f.name && x.size === f.size)) continue;
      valid.push(f);
    }
    if (valid.length) onChange([...files, ...valid]);
  };

  const remove = (idx) => onChange(files.filter((_, i) => i !== idx));

  // ── drop zone events ──────────────────────────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    addFiles([...e.dataTransfer.files]);
  };

  // ── thumbnail ─────────────────────────────────────────────────────────────────
  const Thumb = ({ file, idx }) => {
    const isImg = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    const url   = isImg ? URL.createObjectURL(file) : null;

    return (
      <div className="relative group border rounded-lg overflow-hidden bg-gray-50 flex flex-col items-center justify-center p-2 gap-1 h-28">
        {/* preview */}
        {isImg ? (
          <img
            src={url}
            alt={file.name}
            onLoad={() => URL.revokeObjectURL(url)}
            className="h-16 w-full object-contain rounded"
          />
        ) : isPdf ? (
          <FileText className="h-10 w-10 text-red-500" />
        ) : (
          <ImageIcon className="h-10 w-10 text-blue-400" />
        )}

        {/* name */}
        <p className="text-[10px] text-gray-600 truncate w-full text-center leading-tight">
          {file.name}
        </p>

        {/* remove btn */}
        {!disabled && (
          <button
            type="button"
            onClick={() => remove(idx)}
            className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3 text-gray-600" />
          </button>
        )}
      </div>
    );
  };

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2 h-full">
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Supporting Bills
        </span>
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud className="h-3.5 w-3.5 mr-1" />
            Add File
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => { addFiles([...e.target.files]); e.target.value = ""; }}
          disabled={disabled}
        />
      </div>

      {/* drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !disabled && !files.length && inputRef.current?.click()}
        className={`
          flex-1 min-h-[160px] rounded-lg border-2 border-dashed transition-colors
          ${dragOver          ? "border-blue-400 bg-blue-50"   : "border-gray-300 bg-gray-50"}
          ${!disabled && !files.length ? "cursor-pointer hover:border-blue-400 hover:bg-blue-50" : ""}
        `}
      >
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-6 text-gray-400">
            <UploadCloud className="h-8 w-8" />
            <p className="text-xs text-center leading-snug">
              Drop files here<br />or click <span className="text-blue-500 font-medium">Add File</span>
            </p>
            <p className="text-[10px]">PDF, Image, Word, Excel · max {MAX_SIZE_MB} MB</p>
          </div>
        ) : (
          <div className="p-2 grid grid-cols-2 gap-2 overflow-y-auto max-h-64">
            {files.map((f, i) => (
              <Thumb key={i} file={f} idx={i} />
            ))}
          </div>
        )}
      </div>

      {/* count badge */}
      {files.length > 0 && (
        <p className="text-[11px] text-gray-500 text-right">
          {files.length} file{files.length > 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}