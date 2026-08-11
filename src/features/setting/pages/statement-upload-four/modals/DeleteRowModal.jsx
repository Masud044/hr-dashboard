// src/features/setting/pages/statement-upload-four/modals/DeleteRowModal.jsx
import React from "react";
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

export default function DeleteRowModal({ target, onCancel, onConfirm, isPending }) {
  return (
    <AlertDialog open={!!target} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-card border-border rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Delete this entry?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This will permanently delete this staging row
            {target?.description ? ` ("${target.description}")` : ""}, along with any
            attached invoice files. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="border-border">Cancel</AlertDialogCancel>
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