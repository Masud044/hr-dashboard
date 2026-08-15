// src/features/ticketing/components/AttachmentList.jsx
import { useState } from "react";
import axios from "axios";
import { Download, Loader2, FileText, FileImage } from "lucide-react";
import { attachmentFileUrl } from "../queries";

function fmtBytes(kb) {
  if (kb == null) return "";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function AttachmentList({ attachments = [] }) {
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (fileUrl, id, fileName) => {
    if (downloadingId) return;
    setDownloadingId(id);
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

  if (!attachments.length) {
    return <p className="text-xs text-muted-foreground">No attachments yet.</p>;
  }

  return (
    <div className="space-y-1.5">
      {attachments.map((f) => {
        const isImage = f.FILE_TYPE?.startsWith("image/");
        const Icon = isImage ? FileImage : FileText;
        const fileUrl = attachmentFileUrl(f.ATTACHMENT_ID);

        return (
          <div key={f.ATTACHMENT_ID} className="flex items-center gap-2.5 bg-secondary rounded-md px-2.5 py-1.5">
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
              <div className="text-[11px] text-muted-foreground">{fmtBytes(f.FILE_SIZE_KB)}</div>
            </div>
            <button
              onClick={() => handleDownload(fileUrl, f.ATTACHMENT_ID, f.FILE_NAME)}
              disabled={downloadingId === f.ATTACHMENT_ID}
              className="text-muted-foreground hover:text-primary shrink-0 transition-colors disabled:opacity-40"
              title="Download"
            >
              {downloadingId === f.ATTACHMENT_ID ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Download size={12} />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}