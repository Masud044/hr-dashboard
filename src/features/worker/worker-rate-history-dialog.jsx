// src/features/worker/worker-rate-history-dialog.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function WorkerRateHistoryDialog({ isOpen, onClose, workerId }) {
  const queryClient = useQueryClient();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["worker-rate-history", workerId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/worker-rate`, { 
        params: { worker_id: workerId } 
      });
      return res.data?.data || [];
    },
    enabled: !!workerId && isOpen,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return axios.delete(`${url}/api/worker-rate/current`, {
        params: { worker_id: workerId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["worker-rate-history", workerId]);
      queryClient.invalidateQueries(["worker-rate-current", workerId]);
      toast.success("Current rate deleted.");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete current rate.");
    },
  });

  const handleDeleteConfirm = () => {
    deleteMutation.mutate();
    setConfirmDeleteOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Rate History</DialogTitle>
          <DialogDescription>
            View the complete rate history for this worker.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto mt-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground text-sm">Loading...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground text-sm">No rate history found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Effective To</TableHead>
                  <TableHead className="text-right">Rate / Hour</TableHead>
                  <TableHead className="text-right">Rate / Day</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="w-[40px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.RATE_ID}>
                    <TableCell>{row.EFFECTIVE_FROM}</TableCell>
                    <TableCell>
                      {row.EFFECTIVE_TO ? (
                        row.EFFECTIVE_TO
                      ) : (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          Current
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.RATE_PER_HOUR != null
                        ? `$${Number(row.RATE_PER_HOUR).toFixed(2)}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.RATE_PER_DAY != null
                        ? `$${Number(row.RATE_PER_DAY).toFixed(2)}`
                        : "—"}
                    </TableCell>
                    <TableCell
                      className="max-w-[150px] truncate"
                      title={row.REMARKS}
                    >
                      {row.REMARKS || "—"}
                    </TableCell>
                    <TableCell>
                      {!row.EFFECTIVE_TO && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          disabled={deleteMutation.isPending}
                          onClick={() => setConfirmDeleteOpen(true)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent className="bg-card border-border rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Current Rate?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              The previous rate (if any) will become active again. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}