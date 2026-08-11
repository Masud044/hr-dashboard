// src/features/setting/pages/statement-upload-four/modals/DisapproveModal.jsx
import React from "react";
import { RotateCcw } from "lucide-react";
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

export default function DisapproveModal({ target, onCancel, onConfirm, isPending }) {
  return (
    <AlertDialog open={!!target} onOpenChange={(open) => !open && !isPending && onCancel()}>
      <AlertDialogContent className="bg-card border-border rounded-xl max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <RotateCcw className="text-destructive" size={18} />
            Disapprove this transaction?
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
                This will move the transaction back to Pending Uploads.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(target.TXN_ID)}
            disabled={isPending || !target?.STAGING_ID}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:ring-destructive"
          >
            {isPending ? "Disapproving..." : "Disapprove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}