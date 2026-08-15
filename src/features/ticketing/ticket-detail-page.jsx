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
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { useHasPermission } from "@/hooks/use-permission";
import { useUsers } from "@/features/user-management/queries";

import { useTicket, useLookups, useUpdateStatus } from "./queries";
import StatusBadge from "./components/StatusBadge";
import PriorityBadge from "./components/PriorityBadge";
import AssignAgentDropdown from "./components/AssignAgentDropdown";
import AttachmentList from "./components/AttachmentList";
import AttachmentUploader from "./components/AttachmentUploader";
import CommentThread from "./components/CommentThread";
import TicketHistoryTimeline from "./components/TicketHistoryTimeline";
import CSATRating from "./components/CSATRating";
import { fmtDateTime, isOverdue } from "./lib/ticket-utils";

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
  const { user } = useAuthV2();
  const canEdit = useHasPermission("TICKET_EDIT");
  const canAssign = useHasPermission("TICKET_ASSIGN");
  const isAgent = useHasPermission("TICKET_VIEW_ALL");

  const { data, isLoading } = useTicket(ticketId);
  const { data: lookups } = useLookups();
  const { data: usersData } = useUsers({ limit: 500 });
  const updateStatus = useUpdateStatus();

  const users = usersData?.data || [];
  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.ID, u.USERNAME])), [users]);
  const agentOpts = useMemo(() => users.map((u) => ({ value: String(u.ID), label: u.USERNAME })), [users]);
  const statusOpts = useMemo(
    () => (lookups?.statuses || []).map((s) => ({ value: s.STATUS_NAME, label: s.STATUS_NAME })),
    [lookups]
  );

  const ticket = data?.ticket;
  const comments = data?.comments || [];
  const history = data?.history || [];
  const attachments = data?.attachments || [];

  const isRequester = ticket && user?.id === ticket.REQUESTED_FOR;
  const showCSAT = isRequester && ticket?.STATUS_NAME === "RESOLVED" && !ticket?.SATISFACTION_RATING;
  const overdue = ticket ? isOverdue(ticket) : false;

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

  const backTo = isAgent ? "/dashboard/tickets" : "/dashboard/tickets/my-tickets";

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
            <Row label="Requested By" value={userMap[ticket.REQUESTED_FOR] || `ID: ${ticket.REQUESTED_FOR}`} />
            <Row
              label="Due Date"
              valueNode={
                <span className={`font-medium text-right ml-4 ${overdue ? "text-red-600" : "text-foreground"}`}>
                  {fmtDateTime(ticket.DUE_DATE)}
                </span>
              }
            />
            <Row label="Channel" value={ticket.CHANNEL} />
          </SectionCard>

          {canAssign && (
            <SectionCard icon={ShieldCheck} title="Assignment">
              <div className="py-2">
                <AssignAgentDropdown ticketId={ticketId} currentAgentId={ticket.AGENT_ID} agentOpts={agentOpts} />
              </div>
            </SectionCard>
          )}

          {showCSAT && <CSATRating ticketId={ticketId} />}

          <SectionCard icon={Paperclip} title="Attachments">
            <div className="py-2 space-y-2">
              <AttachmentList attachments={attachments} />
              <AttachmentUploader ticketId={ticketId} />
            </div>
          </SectionCard>

          <SectionCard icon={MessagesSquare} title="Comments">
            <div className="py-2">
              <CommentThread ticketId={ticketId} comments={comments} userMap={userMap} canManage={isAgent} />
            </div>
          </SectionCard>

          <SectionCard icon={HistoryIcon} title="History">
            <div className="py-2">
              <TicketHistoryTimeline history={history} userMap={userMap} lookups={lookups} />
            </div>
          </SectionCard>
        </div>
      )}
    </SectionContainer>
  );
}