// src/features/ticketing/components/AssignWorkerDropdown.jsx
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import EntityCombobox from "@/components/shared/entity-combobox";
import WrappedName from "@/components/shared/WrappedName";
import { useAssignWorker, useAddWorker, useRemoveWorker } from "../queries";
import { useWorkers } from "../lookup-queries";

/**
 * Assigns the ticket to a worker via PUT /:id/worker.
 * Options come from useWorkers(), keyed by WORKER_ID / labeled by WORKER_NAME.
 *
 * `workers` (optional): additional assignments from useTicket's `workers`
 * field — [{ ASSIGNMENT_ID, WORKER_ID, ASSIGNED_BY, ASSIGNED_AT }].
 * Rendered as removable chips below the primary assignee, with a combobox
 * to add more (POST /:id/workers, DELETE /:id/workers/:workerId).
 */
export default function AssignWorkerDropdown({ ticketId, currentWorkerId, workers = [] }) {
  const assignWorker = useAssignWorker();
  const addWorker = useAddWorker();
  const removeWorker = useRemoveWorker();
  const { data: workersList = [] } = useWorkers();
  const [addWorkerId, setAddWorkerId] = useState("");

  const workerOpts = useMemo(
    () => workersList.map((w) => ({ value: String(w.WORKER_ID), label: w.WORKER_NAME })),
    [workersList]
  );

  const workerNameById = useMemo(() => {
    const map = new Map();
    workersList.forEach((w) => map.set(String(w.WORKER_ID), w.WORKER_NAME));
    return map;
  }, [workersList]);

  const assignedIds = useMemo(
    () => new Set((workers || []).map((a) => String(a.WORKER_ID))),
    [workers]
  );

  const addableOpts = useMemo(
    () =>
      workerOpts.filter(
        (o) => !assignedIds.has(String(o.value)) && String(o.value) !== String(currentWorkerId)
      ),
    [workerOpts, assignedIds, currentWorkerId]
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

  const handleAdd = (workerId) => {
    if (!workerId) {
      setAddWorkerId("");
      return;
    }
    addWorker.mutate(
      { ticketId, workerId },
      {
        onSuccess: () => toast.success("Worker added."),
        onError: (err) => toast.error(err?.message || "Failed to add worker."),
      }
    );
    setAddWorkerId("");
  };

  const handleRemove = (workerId) => {
    removeWorker.mutate(
      { ticketId, workerId },
      {
        onSuccess: () => toast.success("Worker removed."),
        onError: (err) => toast.error(err?.message || "Failed to remove worker."),
      }
    );
  };

  return (
    <div className="space-y-2">
      <EntityCombobox
        items={workerOpts}
        value={currentWorkerId ? String(currentWorkerId) : ""}
        onValueChange={handleChange}
        placeholder="Unassigned"
        size="sm"
        className="w-full"
        disabled={assignWorker.isPending}
        showAvatar
        avatarInTrigger
      />

      <div>
        <p className="text-xs font-medium text-muted-foreground">Additional Workers</p>
        {(workers || []).length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {(workers || []).map((a) => {
              const id = String(a.WORKER_ID);
              return (
                <span
                  key={a.ASSIGNMENT_ID ?? id}
                  className="inline-flex items-center gap-1 rounded-full bg-muted py-0.5 pl-1 pr-2 text-xs"
                >
                  <WrappedName
                    name={workerNameById.get(id) ?? `#${id}`}
                    size="sm"
                    showAvatar
                    maxLines={1}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${workerNameById.get(id) ?? id}`}
                    onClick={() => handleRemove(a.WORKER_ID)}
                    disabled={removeWorker.isPending}
                    className="rounded-full p-0.5 hover:bg-background disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
        <EntityCombobox
          items={addableOpts}
          value={addWorkerId}
          onValueChange={handleAdd}
          placeholder="Add worker..."
          size="sm"
          className="mt-1.5 w-full"
          disabled={addWorker.isPending}
        />
      </div>
    </div>
  );
}
