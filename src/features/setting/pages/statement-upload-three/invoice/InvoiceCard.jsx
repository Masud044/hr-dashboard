// src\features\setting\pages\statement-upload-three\invoice\InvoiceCard.jsx
import React, { useRef, useState } from "react";
import { Trash2, ExternalLink, PlusCircle, FileText, FileImage } from "lucide-react";
import { url } from "../constants";
import { fmtBytes, timeAgo, initials } from "./fileUtils";
import FileStatusRow from "./FileStatusRow";
import { getAvatarColor } from "@/lib/avatar-utils";

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

export default function InvoiceCard({ invoice, onDeleteInvoice, onDeleteFile, onAddFile, addFileState, deletingInvoiceId, deletingFileId }) {
  const inputRef = useRef(null);
  const isAddingHere = addFileState?.invoiceId === invoice.INVOICE_ID;
const isDeletingThisInvoice = deletingInvoiceId === invoice.INVOICE_ID;
  const handlePick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) return; // let parent validate/toast if desired
    onAddFile(invoice.INVOICE_ID, f);
    e.target.value = "";
  };

  return (
    <div className="border border-border rounded-xl p-3.5 bg-card">
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="text-sm font-medium text-foreground">
            {invoice.INVOICE_NO || <span className="text-muted-foreground font-normal italic">No invoice number</span>}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Avatar name={invoice.CREATED_BY_NAME} size={16} />
            <span>Added by <span className="font-medium text-foreground">{invoice.CREATED_BY_NAME || "Unknown"}</span> · {timeAgo(invoice.CREATION_DATE)}</span>
          </div>
        </div>
       <button
          onClick={() => onDeleteInvoice(invoice.INVOICE_ID)}
          disabled={isDeletingThisInvoice}
          className="text-destructive/70 hover:text-destructive transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Delete invoice"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="space-y-1.5 mt-2.5">
        {(invoice.files || []).map((f) => {
          const isImage = f.FILE_TYPE?.startsWith("image/");
          const Icon = isImage ? FileImage : FileText;
          return (
           <div key={f.FILE_ID} className="flex items-center gap-2.5 bg-secondary rounded-md px-2.5 py-1.5">
              <div className="shrink-0 w-7 h-7 rounded-md border border-border bg-card flex items-center justify-center overflow-hidden">
                {isImage ? (
                  <img src={`${url}/api/statement/invoices/files/${f.FILE_ID}`} alt={f.FILE_NAME} className="w-full h-full object-cover" />
                ) : (
                  <Icon size={14} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={`${url}/api/statement/invoices/files/${f.FILE_ID}`}
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
                onClick={() => onDeleteFile(f.FILE_ID)}
                disabled={deletingFileId === f.FILE_ID}
                className="text-muted-foreground hover:text-destructive shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}

        {isAddingHere ? (
          <FileStatusRow
            fileName={addFileState.file.name}
            fileSize={addFileState.file.size}
            fileType={addFileState.file.type}
            status={addFileState.status}
            progress={addFileState.progress}
            error={addFileState.error}
            onRemove={() => onAddFile(invoice.INVOICE_ID, null)} // parent clears state
            onRetry={() => onAddFile(invoice.INVOICE_ID, addFileState.file, true)}
          />
        ) : (
          <label className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary cursor-pointer mt-1 transition-colors">
            <PlusCircle size={12} /> Add file
            <input ref={inputRef} type="file" className="hidden" onChange={handlePick} />
          </label>
        )}
      </div>
    </div>
  );
}