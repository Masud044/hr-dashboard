// src\features\setting\pages\statement-upload-four\modals\ApproveModal.jsx
import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtDate, fmtAmount } from "../constants";

export default function ApproveModal({ target, onCancel, onConfirm, isPending }) {
  if (!target) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => !isPending && onCancel()}>
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="text-violet-600" size={18} />
          <h3 className="text-sm font-semibold text-gray-800">Approve this transaction?</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-600 space-y-1">
          <div><span className="text-gray-400">Date:</span> {fmtDate(target.TXN_DATE)}</div>
          <div><span className="text-gray-400">Amount:</span> {fmtAmount(target.AMOUNT)}</div>
          <div className="break-words"><span className="text-gray-400">Description:</span> {target.DESCRIPTION}</div>
        </div>
        <p className="text-xs text-gray-500 mb-5">Once approved, this row will move to Approved Records.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isPending} className="rounded-full text-sm">Cancel</Button>
          <Button onClick={() => onConfirm(target.STAGING_ID)} disabled={isPending} className="rounded-full bg-violet-600 hover:bg-violet-700 text-sm">
            {isPending ? "Approving..." : "Approve"}
          </Button>
        </div>
      </div>
    </div>
  );
}