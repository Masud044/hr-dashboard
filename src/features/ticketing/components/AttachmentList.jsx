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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {attachments.map((f) => {
        const isImage = f.FILE_TYPE?.startsWith("image/");
        const Icon = isImage ? FileImage : FileText;
        const fileUrl = attachmentFileUrl(f.ATTACHMENT_ID);

        return (
          <div
            key={f.ATTACHMENT_ID}
            className="group rounded-lg border border-border bg-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="block h-24 bg-secondary/60 border-b border-border overflow-hidden"
              title={f.FILE_NAME}
            >
              {isImage ? (
                <img src={fileUrl} alt={f.FILE_NAME} loading="lazy" className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center">
                  <Icon size={22} className="text-muted-foreground" />
                </span>
              )}
            </a>
            <div className="p-3">
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                title={f.FILE_NAME}
                className="block text-[13px] font-medium text-foreground hover:text-primary truncate"
              >
                {f.FILE_NAME}
              </a>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-caption text-muted-foreground">{fmtBytes(f.FILE_SIZE_KB)}</span>
                <button
                  onClick={() => handleDownload(fileUrl, f.ATTACHMENT_ID, f.FILE_NAME)}
                  disabled={downloadingId === f.ATTACHMENT_ID}
                  title="Download"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors disabled:opacity-40"
                >
                  {downloadingId === f.ATTACHMENT_ID ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}