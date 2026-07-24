// src\features\setting\pages\statement-upload-four\modals\DeleteInvoiceModal.jsx
import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeleteInvoiceModal({ target, onCancel, onConfirm, isPending }) {
  if (!target) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3">
          <Trash2 className="text-red-500" size={18} />
          <h3 className="text-sm font-semibold text-gray-800">Delete Invoice File?</h3>
        </div>
        <p className="text-sm text-gray-600 mb-1">You're about to delete:</p>
        <p className="text-sm font-medium text-gray-900 mb-4 truncate">{target.fileName}</p>
        <p className="text-xs text-gray-500 mb-5">You can upload a new file after deleting this one.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} className="rounded-full text-sm">Cancel</Button>
          <Button onClick={() => onConfirm(target.stagingId)} disabled={isPending} className="rounded-full bg-red-600 hover:bg-red-700 text-sm">
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}