// src/features/ticketing/components/AttachmentList.jsx
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Download, Loader2, FileText, FileImage, Trash2 } from "lucide-react";
import { attachmentFileUrl, useDeleteAttachment } from "../queries";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";

function fmtBytes(kb) {
  if (kb == null) return "";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function AttachmentList({ attachments = [], ticketId, currentUserId, canEdit = false }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();
  const deleteAttachment = useDeleteAttachment();

  const canDelete = (f) =>
    canEdit ||
    (currentUserId != null && String(f.UPLOADED_BY) === String(currentUserId));

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

  const handleDelete = async (f) => {
    const confirmed = await showConfirmation({
      title: "Delete attachment?",
      description: `This will permanently delete "${f.FILE_NAME}". This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!confirmed) return;
    setDeletingId(f.ATTACHMENT_ID);
    try {
      await deleteAttachment.mutateAsync({ attachmentId: f.ATTACHMENT_ID, ticketId });
      toast.success("Attachment deleted.");
    } catch (error) {
      toast.error(error?.message || "Failed to delete attachment.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!attachments.length) {
    return (
      <>
        <p className="text-xs text-muted-foreground">No attachments yet.</p>
        <ConfirmationDialog />
      </>
    );
  }

  return (
    <>
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
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownload(fileUrl, f.ATTACHMENT_ID, f.FILE_NAME)}
                    disabled={downloadingId === f.ATTACHMENT_ID || deletingId === f.ATTACHMENT_ID}
                    title="Download"
                    className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors disabled:opacity-40"
                  >
                    {downloadingId === f.ATTACHMENT_ID ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                  </button>
                  {canDelete(f) && (
                    <button
                      onClick={() => handleDelete(f)}
                      disabled={deletingId === f.ATTACHMENT_ID}
                      title="Delete"
                      aria-label={`Delete ${f.FILE_NAME}`}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors disabled:opacity-40"
                    >
                      {deletingId === f.ATTACHMENT_ID ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
    <ConfirmationDialog />
    </>
  );
}
