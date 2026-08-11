// src/features/setting/pages/statement-upload-four/modals/DeleteInvoiceModal.jsx
import React from "react";
import { Trash2 } from "lucide-react";
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

export default function DeleteInvoiceModal({ target, onCancel, onConfirm, isPending }) {
  return (
    <AlertDialog open={!!target} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-card border-border rounded-xl max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <Trash2 className="text-destructive" size={18} />
            Delete Invoice File?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              {target && (
                <>
                  <p className="text-sm text-muted-foreground">You're about to delete:</p>
                  <p className="text-sm font-medium text-foreground truncate">{target.fileName}</p>
                </>
              )}
              <p className="text-xs text-muted-foreground">
                You can upload a new file after deleting this one.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(target.stagingId)}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:ring-destructive"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}