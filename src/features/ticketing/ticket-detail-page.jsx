// src/features/ticketing/ticket-detail-page.jsx
import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Info, ShieldCheck, Paperclip, MessagesSquare, History as HistoryIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SectionContainer } from "@/components/SectionContainer";
import EntityCombobox from "@/components/shared/entity-combobox";
import { useHasPermission } from "@/hooks/use-permission";
import { useUsers } from "@/features/user-management/queries";

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

export default function TicketDetailPage() {
  const { id } = useParams();
  const ticketId = id;
  const navigate = useNavigate();
  const canEdit = useHasPermission("TICKET_EDIT");
  const canAssign = useHasPermission("TICKET_ASSIGN");
  const canViewAll = useHasPermission("TICKET_VIEW_ALL");

  const { data, isLoading } = useTicket(ticketId);
  const { data: lookups } = useLookups();
  const { data: usersData } = useUsers({ limit: 500 });
  const { data: workers = [] } = useWorkers();

  const updateStatus = useUpdateStatus();

  // const users = usersData?.data || [];
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

  const backTo = canViewAll ? "/dashboard/tickets" : "/dashboard/tickets/my-tickets";

  return (
    <SectionContainer variant="dashboard">
      <div className="bg-card rounded-md shadow-sm p-4 mb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate(backTo)} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-0.5">
            <h1 className="text-lg md:text-2xl font-semibold tracking-tight">
              {ticket?.TICKET_NUMBER || "Ticket"}
            </h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={backTo}>Tickets</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{ticket?.TICKET_NUMBER || "Detail"}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="bg-card rounded-md shadow-sm p-8 text-center text-sm text-muted-foreground">
          Loading ticket...
        </div>
      )}

      {!isLoading && !ticket && (
        <div className="bg-card rounded-md shadow-sm p-8 text-center text-sm text-muted-foreground">
          Ticket not found.
        </div>
      )}

      {!isLoading && ticket && (
        <div className="max-w-2xl mx-auto space-y-4">
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
                canEdit ? (
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
                <AssignWorkerDropdown ticketId={ticketId} currentWorkerId={ticket.ASSIGNED_WORKER_ID} />
              </div>
            </SectionCard>
          )}

          <SectionCard icon={Paperclip} title="Attachments">
            <div className="py-2 space-y-2">
              <AttachmentList attachments={attachments} />
              <AttachmentUploader ticketId={ticketId} />
            </div>
          </SectionCard>

          <SectionCard icon={MessagesSquare} title="Comments">
            <div className="py-2">
              <CommentThread ticketId={ticketId} comments={comments} userMap={userMap} canManage={canViewAll} />
            </div>
          </SectionCard>

          <SectionCard icon={HistoryIcon} title="History">
            <div className="py-2">
              <TicketHistoryTimeline history={history} userMap={userMap} workerMap={workerMap} lookups={lookups} />
            </div>
          </SectionCard>
        </div>
      )}
    </SectionContainer>
  );
}