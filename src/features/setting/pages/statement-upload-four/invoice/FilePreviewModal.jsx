// src\features\setting\pages\statement-upload-four\invoice\FilePreviewModal.jsx
import React from "react";
import { ExternalLink, Download, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { url } from "../constants";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];
const PDF_EXTENSIONS = [".pdf"];

function hasExtension(name, extensions) {
  if (!name) return false;
  const lower = name.toLowerCase();
  return extensions.some((ext) => lower.endsWith(ext));
}

export default function FilePreviewModal({ file, isOpen, onClose }) {
  if (!file) return null;

  const fileUrl = `${url}/api/statement/invoices/files/${file.FILE_ID}`;
  const isImage =
    file.FILE_TYPE?.startsWith("image/") ||
    hasExtension(file.FILE_NAME, IMAGE_EXTENSIONS);
  const isPdf =
    file.FILE_TYPE === "application/pdf" ||
    hasExtension(file.FILE_NAME, PDF_EXTENSIONS);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent
        className="sm:max-w-4xl max-h-[90vh] flex flex-col p-4 z-[60]"
        showCloseButton={false}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="flex-row items-center justify-between gap-2 pr-1 shrink-0">
          <DialogTitle className="text-sm font-medium text-foreground truncate min-w-0">
            {file.FILE_NAME}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview of {file.FILE_NAME}
          </DialogDescription>
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary p-1 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={14} />
              <span className="sr-only">Open in new tab</span>
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              className="text-muted-foreground hover:text-foreground p-1 rounded-sm transition-colors"
              title="Close preview"
            >
              <X size={16} />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex items-center justify-center overflow-auto">
          {isImage ? (
            <img
              src={fileUrl}
              alt={file.FILE_NAME}
              className="max-h-[75vh] w-auto max-w-full object-contain mx-auto rounded"
            />
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title={file.FILE_NAME}
              className="w-full h-[75vh] rounded border-0"
            />
          ) : (
            <div className="text-center py-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                Preview is not available for this file type.
              </p>
              <a
                href={fileUrl}
                download={file.FILE_NAME}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-[#4F46E5] transition-colors"
              >
                <Download size={14} />
                Download file
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
