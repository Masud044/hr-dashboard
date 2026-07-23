import React, { useRef, useState } from "react";
import axios from "axios";
import { Trash2, ExternalLink, Download, Loader2, PlusCircle, FileText, FileImage } from "lucide-react";
import { url } from "../constants";
import { fmtBytes, timeAgo, initials } from "./fileUtils";
import FileStatusRow from "./FileStatusRow";
import { getAvatarColor } from "@/lib/avatar-utils";
import { toast } from "react-toastify";
function Avatar({ name, size = 18 }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.42, backgroundColor: getAvatarColor(name) }}
      title={name || "Unknown"}
    >
      {initials(name)}
    </span>
  );
}

export default function InvoiceCard({
  invoice,
  onDeleteInvoice,
  onDeleteFile,
  onAddFile,
  addFileState,
  deletingInvoiceId,
  deletingFileId,
  readOnly = false,
}) {
  const inputRef = useRef(null);
  const isAddingHere = addFileState?.invoiceId === invoice.INVOICE_ID;
  const isDeletingThisInvoice = deletingInvoiceId === invoice.INVOICE_ID;
  const [downloadingId, setDownloadingId] = useState(null);

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

const handlePick = (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  if (!ALLOWED_TYPES.includes(f.type)) {
    toast.error(`"${f.name}" — only PDF, PNG, JPG allowed.`);
    e.target.value = "";
    return;
  }
  if (f.size > MAX_SIZE) {
    toast.error(`"${f.name}" exceeds 2MB limit.`);
    e.target.value = "";
    return;
  }
  onAddFile(invoice.INVOICE_ID, f);
  e.target.value = "";
};

  const handleDownload = async (fileUrl, fileId, fileName) => {
    if (downloadingId) return;
    setDownloadingId(fileId);
    try {
      const res = await axios.get(fileUrl, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(fileUrl, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="border border-border rounded-xl p-3.5 bg-card">
      <div className="flex items-start justify-between mb-1">
        {invoice.INVOICE_NO ? (
          <div>
            <div className="text-sm font-medium text-foreground">{invoice.INVOICE_NO}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Avatar name={invoice.CREATED_BY_NAME} size={16} />
              <span>Added by <span className="font-medium text-foreground">{invoice.CREATED_BY_NAME || "Unknown"}</span> · {timeAgo(invoice.CREATION_DATE)}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Avatar name={invoice.CREATED_BY_NAME} size={16} />
            <span>Added by <span className="font-medium text-foreground">{invoice.CREATED_BY_NAME || "Unknown"}</span> · {timeAgo(invoice.CREATION_DATE)}</span>
          </div>
        )}
        {!readOnly && (
          <button
            onClick={() => onDeleteInvoice(invoice.INVOICE_ID)}
            disabled={isDeletingThisInvoice}
            className="text-destructive/70 hover:text-destructive transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Delete invoice"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="space-y-1.5 mt-2.5">
        {(invoice.files || []).map((f) => {
          const isImage = f.FILE_TYPE?.startsWith("image/");
          const Icon = isImage ? FileImage : FileText;
          const fileUrl = `${url}/api/statement/invoices/files/${f.FILE_ID}`;
          return (
            <div key={f.FILE_ID} className="flex items-center gap-2.5 bg-secondary rounded-md px-2.5 py-1.5">
              <div className="shrink-0 w-7 h-7 rounded-md border border-border bg-card flex items-center justify-center overflow-hidden">
                {isImage ? (
                  <img src={fileUrl} alt={f.FILE_NAME} className="w-full h-full object-cover" />
                ) : (
                  <Icon size={14} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:text-[#4F46E5] truncate block"
                  title={f.FILE_NAME}
                >
                  {f.FILE_NAME}
                </a>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <span>{fmtBytes(f.FILE_SIZE)}</span>
                  <span>·</span>
                  <Avatar name={f.UPLOADED_BY_NAME} size={13} />
                  <span>{f.UPLOADED_BY_NAME || "Unknown"} — uploaded {timeAgo(f.CREATION_DATE)}</span>
                </div>
              </div>
              <button
                onClick={() => handleDownload(fileUrl, f.FILE_ID, f.FILE_NAME)}
                disabled={downloadingId === f.FILE_ID}
                className="text-muted-foreground hover:text-primary shrink-0 transition-colors disabled:opacity-40"
                title="Download"
              >
                {downloadingId === f.FILE_ID ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Download size={12} />
                )}
              </button>
              {!readOnly && (
                <button
                  onClick={() => onDeleteFile(f.FILE_ID)}
                  disabled={deletingFileId === f.FILE_ID}
                  className="text-muted-foreground hover:text-destructive shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          );
        })}

        {!readOnly && (
          isAddingHere ? (
            <FileStatusRow
              fileName={addFileState.file.name}
              fileSize={addFileState.file.size}
              fileType={addFileState.file.type}
              status={addFileState.status}
              progress={addFileState.progress}
              error={addFileState.error}
              onRemove={() => onAddFile(invoice.INVOICE_ID, null)}
              onRetry={() => onAddFile(invoice.INVOICE_ID, addFileState.file, true)}
            />
          ) : (
            <label className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary cursor-pointer mt-1 transition-colors">
              <PlusCircle size={12} /> Add file
              <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handlePick} />
            </label>
          )
        )}
      </div>
    </div>
  );
}