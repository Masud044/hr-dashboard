// src/features/setting/pages/statement-upload-three/modals/DisapproveModal.jsx
import React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtDate, fmtAmount } from "../constants";

export default function DisapproveModal({ target, onCancel, onConfirm, isPending }) {
  if (!target) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => !isPending && onCancel()}>
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3">
          <RotateCcw className="text-red-600" size={18} />
          <h3 className="text-sm font-semibold text-gray-800">Disapprove this transaction?</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-600 space-y-1">
          <div><span className="text-gray-400">Date:</span> {fmtDate(target.TXN_DATE)}</div>
          <div><span className="text-gray-400">Amount:</span> {fmtAmount(target.AMOUNT)}</div>
          <div className="break-words"><span className="text-gray-400">Description:</span> {target.DESCRIPTION}</div>
        </div>
        <p className="text-xs text-gray-500 mb-5">This will move the transaction back to Pending Uploads.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isPending} className="rounded-full text-sm">Cancel</Button>
          <Button
            onClick={() => onConfirm(target.TXN_ID)}
            disabled={isPending || !target.STAGING_ID}
            className="rounded-full bg-red-600 hover:bg-red-700 text-sm"
          >
            {isPending ? "Disapproving..." : "Disapprove"}
          </Button>
        </div>
      </div>
    </div>
  );
}