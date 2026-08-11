// src/features/setting/pages/statement-upload-four/modals/ApproveModal.jsx
import React from "react";
import { CheckCircle2 } from "lucide-react";
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
import { fmtDate, fmtAmount } from "../constants";

export default function ApproveModal({ target, onCancel, onConfirm, isPending }) {
  return (
    <AlertDialog open={!!target} onOpenChange={(open) => !open && !isPending && onCancel()}>
      <AlertDialogContent className="bg-card border-border rounded-xl max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <CheckCircle2 className="text-primary" size={18} />
            Approve this transaction?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {target && (
                <div className="bg-secondary rounded-md p-3 text-xs text-muted-foreground space-y-1">
                  <div>
                    <span className="text-muted-foreground/70">Date:</span> {fmtDate(target.TXN_DATE)}
                  </div>
                  <div>
                    <span className="text-muted-foreground/70">Amount:</span> {fmtAmount(target.AMOUNT)}
                  </div>
                  <div className="break-words">
                    <span className="text-muted-foreground/70">Description:</span> {target.DESCRIPTION}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Once approved, this row will move to Approved Records.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(target.STAGING_ID)}
            disabled={isPending}
            className="bg-primary hover:bg-[#4F46E5] text-primary-foreground focus:ring-primary"
          >
            {isPending ? "Approving..." : "Approve"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}