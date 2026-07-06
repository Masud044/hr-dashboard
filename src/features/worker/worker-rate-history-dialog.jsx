// src/features/worker/worker-rate-history-dialog.jsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function WorkerRateHistoryDialog({ isOpen, onClose, workerId }) {
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}