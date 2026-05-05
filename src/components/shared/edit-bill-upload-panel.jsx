import { useRef, useState } from "react";
import { FileText, ImageIcon, UploadCloud, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { toast } from "react-toastify";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_SIZE_MB = 20;

// ── Existing file thumb ───────────────────────────────────────────────────────
function ExistingThumb({ doc, onRequestDelete, disabled }) {
  const isPdf = doc.FILE_TYPE === "application/pdf";

  return (
    <div className="relative group border rounded-lg overflow-hidden bg-gray-50 flex flex-col items-center justify-center p-2 gap-1 h-28">
      {isPdf
        ? <FileText className="h-10 w-10 text-red-400" />
        : <ImageIcon className="h-10 w-10 text-blue-400" />
      }
      <p className="text-[10px] text-gray-600 truncate w-full text-center leading-tight">
        Doc #{doc.ID}
      </p>
      <p className="text-[9px] text-gray-400">
        {doc.CREATION_DATE ? new Date(doc.CREATION_DATE).toLocaleDateString() : ""}
      </p>

      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={`${url}/api/gldoc?id=${doc.ID}&file=true`}
          target="_blank" rel="noreferrer"
          className="bg-white rounded-full p-0.5 shadow" title="View"
        >
          <Eye className="h-3 w-3 text-blue-500" />
        </a>
        {!disabled && (
          <button
            type="button"
            onClick={() => onRequestDelete(doc.ID)}
            className="bg-white rounded-full p-0.5 shadow" title="Delete"
          >
            <X className="h-3 w-3 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── New file thumb ────────────────────────────────────────────────────────────
function NewThumb({ file, idx, onRemove, disabled }) {
  const isImg  = file.type.startsWith("image/");
  const isPdf  = file.type === "application/pdf";
  const objUrl = isImg ? URL.createObjectURL(file) : null;

  return (
    <div className="relative group border-2 border-dashed border-blue-300 rounded-lg overflow-hidden bg-blue-50 flex flex-col items-center justify-center p-2 gap-1 h-28">
      {isImg
        ? <img src={objUrl} alt={file.name} onLoad={() => URL.revokeObjectURL(objUrl)} className="h-14 w-full object-contain rounded" />
        : isPdf
          ? <FileText className="h-10 w-10 text-red-400" />
          : <ImageIcon className="h-10 w-10 text-blue-400" />
      }
      <p className="text-[10px] text-blue-600 truncate w-full text-center font-medium">New</p>
      <p className="text-[9px] text-gray-500 truncate w-full text-center">{file.name}</p>

      {!disabled && (
        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3 text-gray-600" />
        </button>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BillUploadPanelEdit({
  existingDocs = [],
  onDeleteDoc,
  newFiles = [],
  onNewFiles,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [dragOver,     setDragOver]     = useState(false);
  const [deleting,     setDeleting]     = useState(null); // docId — loading state
  const [confirmDocId, setConfirmDocId] = useState(null); // docId — dialog open

  // ── file handling ─────────────────────────────────────────────────────────
  const addFiles = (incoming) => {
    const valid = [];
    for (const f of incoming) {
      if (!ALLOWED_TYPES.includes(f.type)) { toast.error(`"${f.name}" — unsupported type.`); continue; }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) { toast.error(`"${f.name}" exceeds ${MAX_SIZE_MB} MB.`); continue; }
      if (newFiles.some((x) => x.name === f.name && x.size === f.size)) continue;
      valid.push(f);
    }
    if (valid.length) onNewFiles([...newFiles, ...valid]);
  };

  const removeNew = (idx) => onNewFiles(newFiles.filter((_, i) => i !== idx));

  // ── delete: step 1 — open dialog ─────────────────────────────────────────
  const handleRequestDelete = (docId) => setConfirmDocId(docId);

  // ── delete: step 2 — confirmed, call API ─────────────────────────────────
  const handleConfirmDelete = async () => {
    const docId = confirmDocId;
    setConfirmDocId(null);
    setDeleting(docId);
    try {
      await axios.delete(`${url}/api/gldoc`, { data: { ID: docId } });
      toast.success("Document deleted.");
      onDeleteDoc(docId);
    } catch {
      toast.error("Failed to delete document.");
    } finally {
      setDeleting(null);
    }
  };

  // ── drop zone ─────────────────────────────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    addFiles([...e.dataTransfer.files]);
  };

  const totalCount = existingDocs.length + newFiles.length;

  return (
    <>
      <div className="flex flex-col gap-2 h-full">
        {/* header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bills</span>
          {!disabled && (
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs"
              onClick={() => inputRef.current?.click()}>
              <UploadCloud className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          )}
          <input
            ref={inputRef} type="file" multiple
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
          onClick={() => !disabled && totalCount === 0 && inputRef.current?.click()}
          className={`
            flex-1 min-h-[160px] rounded-lg border-2 border-dashed transition-colors
            ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"}
            ${!disabled && totalCount === 0 ? "cursor-pointer hover:border-blue-400 hover:bg-blue-50" : ""}
          `}
        >
          {totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 py-6 text-gray-400">
              <UploadCloud className="h-8 w-8" />
              <p className="text-xs text-center leading-snug">
                Drop files here<br />or click <span className="text-blue-500 font-medium">Add</span>
              </p>
              <p className="text-[10px]">PDF, Image, Word, Excel · max {MAX_SIZE_MB} MB</p>
            </div>
          ) : (
            <div className="p-2 grid grid-cols-2 gap-2 overflow-y-auto max-h-64">
              {existingDocs.map((doc) => (
                <ExistingThumb
                  key={doc.ID}
                  doc={doc}
                  onRequestDelete={handleRequestDelete}
                  disabled={disabled || deleting === doc.ID}
                />
              ))}
              {newFiles.map((f, i) => (
                <NewThumb key={i} file={f} idx={i} onRemove={removeNew} disabled={disabled} />
              ))}
            </div>
          )}
        </div>

        {/* legend */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>
              {existingDocs.length > 0 && `${existingDocs.length} saved`}
              {existingDocs.length > 0 && newFiles.length > 0 && " · "}
              {newFiles.length > 0 && <span className="text-blue-500">{newFiles.length} new</span>}
            </span>
            <span>{totalCount} total</span>
          </div>
        )}
      </div>

      {/* ── Delete confirmation AlertDialog ── */}
      <AlertDialog
        open={!!confirmDocId}
        onOpenChange={(open) => { if (!open) setConfirmDocId(null); }}
      >
        <AlertDialogContent className="z-112">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
             Document #{confirmDocId} will be permanently deleted.
  This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}