// src/features/ticketing/ticket-detail-sheet.jsx
import { useMemo } from "react";
import { toast } from "react-toastify";
import { Info, ShieldCheck, Paperclip, MessagesSquare, History as HistoryIcon } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import EntityCombobox from "@/components/shared/entity-combobox";
import { useHasPermission } from "@/hooks/use-permission";
import { useUsers } from "@/features/user-management/queries";

import { useTicketSheetStore } from "./useTicketSheetStore";
import { useTicket, useLookups, useUpdateStatus } from "./queries";
import StatusBadge from "./components/StatusBadge";
import PriorityBadge from "./components/PriorityBadge";
import TicketTypeBadge from "./components/TicketTypeBadge";
import AssignWorkerDropdown from "./components/AssignWorkerDropdown";
import AttachmentList from "./components/AttachmentList";
import AttachmentUploader from "./components/AttachmentUploader";
import CommentThread from "./components/CommentThread";
import TicketHistoryTimeline from "./components/TicketHistoryTimeline";
import { fmtDateTime, fmtCurrency, isOverdue } from "./lib/ticket-utils";
import { useWorkers } from "./lookup-queries";

function Row({ label, value, valueNode }) {
  return (
    <div className="flex justify-between items-center py-2.5 text-sm border-b border-border last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      {valueNode ? valueNode : <span className="font-medium text-right ml-4 text-foreground">{value ?? "—"}</span>}
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border">
        <Icon size={13} className="text-primary" />
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{title}</h4>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

export default function TicketDetailSheet() {
  const { open, ticketId, readOnly, closeSheet } = useTicketSheetStore();
  const canEdit = useHasPermission("TICKET_EDIT");
  const canAssign = useHasPermission("TICKET_ASSIGN");
  const canViewAll = useHasPermission("TICKET_VIEW_ALL");

  const { data, isLoading } = useTicket(ticketId);
  const { data: lookups } = useLookups();
  const { data: usersData } = useUsers({ limit: 500 });
  const { data: workers = [] } = useWorkers();
  const updateStatus = useUpdateStatus();

  const users = usersData?.data || [];
  const userMap = useMemo(
  () => Object.fromEntries((usersData?.data || []).map((u) => [u.ID, u.USERNAME])),
  [usersData]
);
    const workerMap = useMemo(() => Object.fromEntries(workers.map((w) => [w.WORKER_ID, w.WORKER_NAME])), [workers]);
  const statusOpts = useMemo(
    () => (lookups?.statuses || []).map((s) => ({ value: s.STATUS_NAME, label: s.STATUS_NAME })),
    [lookups]
  );

  const ticket = data?.ticket;
  const comments = data?.comments || [];
  const history = data?.history || [];
  const attachments = data?.attachments || [];

  const overdue = ticket ? isOverdue(ticket) : false;
  const showChangeAmount = ticket?.TICKET_TYPE === "VARIATION" && ticket?.CHANGE_AMOUNT != null;

  const handleStatusChange = (statusName) => {
    if (!statusName || statusName === ticket?.STATUS_NAME) return;
    updateStatus.mutate(
      { ticketId, statusName },
      {
        onSuccess: () => toast.success("Status updated."),
        onError: (err) => toast.error(err?.message || "Failed to update status."),
      }
    );
  };

  const handleClose = () => closeSheet();

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card border-border p-0">
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="font-display font-bold tracking-tight text-foreground">
            {ticket?.TICKET_NUMBER || "Ticket"}
          </SheetTitle>
        </SheetHeader>

        {isLoading && (
          <div className="p-4 text-sm text-muted-foreground">Loading ticket...</div>
        )}

        {!isLoading && ticket && (
          <div className="p-4 space-y-4">
            <SectionCard icon={Info} title="Ticket Info">
              <Row label="Subject" value={ticket.SUBJECT} />
              <Row label="Description" value={ticket.DESCRIPTION || "—"} />
              <Row label="Type" valueNode={<TicketTypeBadge type={ticket.TICKET_TYPE} />} />
              {showChangeAmount && <Row label="Change Amount" value={fmtCurrency(ticket.CHANGE_AMOUNT)} />}
              <Row label="Project" value={ticket.PROJECT_NAME || "General"} />
              <Row label="Contractor" value={ticket.CONTRACTOR_NAME || "—"} />
              <Row label="Owner" value={ticket.OWNER_NAME || "—"} />
              <Row label="Category" value={ticket.CATEGORY_NAME} />
              <Row label="Priority" valueNode={<PriorityBadge priority={ticket.PRIORITY_NAME} />} />
              <Row
                label="Status"
                valueNode={
                  canEdit && !readOnly ? (
                    <EntityCombobox
                      items={statusOpts}
                      value={ticket.STATUS_NAME}
                      onValueChange={handleStatusChange}
                      placeholder="Status"
                      size="sm"
                      className="w-[160px]"
                      disabled={updateStatus.isPending}
                    />
                  ) : (
                    <StatusBadge status={ticket.STATUS_NAME} />
                  )
                }
              />
              <Row label="Created By" value={userMap[ticket.CREATED_BY] || `ID: ${ticket.CREATED_BY}`} />
              <Row
                label="Due Date"
                valueNode={
                  <span className={`font-medium text-right ml-4 ${overdue ? "text-red-600" : "text-foreground"}`}>
                    {fmtDateTime(ticket.DUE_DATE)}
                  </span>
                }
              />
            </SectionCard>

            {canAssign && (
              <SectionCard icon={ShieldCheck} title="Assignment">
                <div className="py-2">
                  <AssignWorkerDropdown
                    ticketId={ticketId}
                    currentWorkerId={ticket.ASSIGNED_WORKER_ID}
                  />
                </div>
              </SectionCard>
            )}

            <SectionCard icon={Paperclip} title="Attachments">
              <div className="py-2 space-y-2">
                <AttachmentList attachments={attachments} />
                {!readOnly && <AttachmentUploader ticketId={ticketId} />}
              </div>
            </SectionCard>

            <SectionCard icon={MessagesSquare} title="Comments">
              <div className="py-2">
                <CommentThread
                  ticketId={ticketId}
                  comments={comments}
                  userMap={userMap}
                  canManage={canViewAll}
                />
              </div>
            </SectionCard>

            <SectionCard icon={HistoryIcon} title="History">
              <div className="py-2">
                <TicketHistoryTimeline history={history} userMap={userMap} workerMap={workerMap} lookups={lookups} />
              </div>
            </SectionCard>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}