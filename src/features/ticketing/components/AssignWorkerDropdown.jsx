// src/features/ticketing/components/AssignWorkerDropdown.jsx
import { useMemo } from "react";
import { toast } from "react-toastify";
import EntityCombobox from "@/components/shared/entity-combobox";
import { useAssignWorker } from "../queries";
import { useWorkers } from "../lookup-queries";

/**
 * Assigns the ticket to a worker via PUT /:id/worker.
 * Options come from useWorkers(), keyed by WORKER_ID / labeled by WORKER_NAME.
 */
export default function AssignWorkerDropdown({ ticketId, currentWorkerId }) {
  const assignWorker = useAssignWorker();
  const { data: workers = [] } = useWorkers();

  const workerOpts = useMemo(
    () => workers.map((w) => ({ value: String(w.WORKER_ID), label: w.WORKER_NAME })),
    [workers]
  );

  const handleChange = (workerId) => {
    if (!workerId || workerId === String(currentWorkerId)) return;
    assignWorker.mutate(
      { ticketId, workerId },
      {
        onSuccess: () => toast.success("Worker assigned."),
        onError: (err) => toast.error(err?.message || "Failed to assign worker."),
      }
    );
  };

  return (
    <EntityCombobox
      items={workerOpts}
      value={currentWorkerId ? String(currentWorkerId) : ""}
      onValueChange={handleChange}
      placeholder="Unassigned"
      size="sm"
      className="w-full"
      disabled={assignWorker.isPending}
    />
  );
}
