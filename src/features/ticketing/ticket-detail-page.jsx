// src/features/ticketing/ticket-detail-page.jsx
import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Info,
  ShieldCheck,
  Paperclip,
  MessagesSquare,
  History as HistoryIcon,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { SectionContainer } from "@/components/SectionContainer";
import EntityCombobox from "@/components/shared/entity-combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHasPermission } from "@/hooks/use-permission";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

function Row({ label, value, valueNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm border-b border-border last:border-b-0">
      <span className="text-[13px] text-muted-foreground shrink-0">
        {label}
      </span>
      {valueNode ? (
        valueNode
      ) : (
        <span className="font-medium text-right text-foreground break-words">
          {value ?? "—"}
        </span>
      )}
    </div>
  );
}

function RowStacked({ label, children }) {
  return (
    <div className="px-4 py-3 text-sm border-b border-border last:border-b-0">
      <span className="block text-[13px] text-muted-foreground mb-1">
        {label}
      </span>
      {children}
    </div>
  );
}

function SectionCard({ icon: Icon, title, className, children }) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
        <Icon size={13} className="text-primary" />
        <h4 className="text-overline text-muted-foreground">{title}</h4>
      </div>
      <div>{children}</div>
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
  const { user } = useAuthV2();

  const { data, isLoading } = useTicket(ticketId);
  const { data: lookups } = useLookups();
  const { data: usersData } = useUsers({ limit: 500 });
  const { data: workers = [] } = useWorkers();

  const updateStatus = useUpdateStatus();

  // const users = usersData?.data || [];
  const userMap = useMemo(
    () =>
      Object.fromEntries(
        (usersData?.data || []).map((u) => [u.ID, u.USERNAME]),
      ),
    [usersData],
  );
  const workerMap = useMemo(
    () => Object.fromEntries(workers.map((w) => [w.WORKER_ID, w.WORKER_NAME])),
    [workers],
  );
  const statusOpts = useMemo(
    () =>
      (lookups?.statuses || []).map((s) => ({
        value: s.STATUS_NAME,
        label: s.STATUS_NAME,
      })),
    [lookups],
  );

  const ticket = data?.ticket;
  const comments = data?.comments || [];
  const history = data?.history || [];
  const attachments = data?.attachments || [];

  const overdue = ticket ? isOverdue(ticket) : false;
  const showChangeAmount =
    ticket?.TICKET_TYPE === "VARIATION" && ticket?.CHANGE_AMOUNT != null;

  const handleStatusChange = (statusName) => {
    if (!statusName || statusName === ticket?.STATUS_NAME) return;
    updateStatus.mutate(
      { ticketId, statusName },
      {
        onSuccess: () => toast.success("Status updated."),
        onError: (err) =>
          toast.error(err?.message || "Failed to update status."),
      },
    );
  };

  const backTo = canViewAll
    ? "/dashboard/tickets"
    : "/dashboard/tickets/my-tickets";

  return (
    <SectionContainer variant="dashboard">
      <div className="mb-4">
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
              <BreadcrumbPage>
                {ticket?.TICKET_NUMBER || "Detail"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(backTo)}
            className="shrink-0 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            {ticket?.TICKET_NUMBER || "Ticket"}
          </h1>
          {ticket && <StatusBadge status={ticket.STATUS_NAME} />}
          {canEdit &&
            ticket &&
            !["CLOSED", "CANCELLED"].includes(ticket.STATUS_NAME) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/dashboard/tickets/${ticketId}/edit`)}
                className="ml-auto shrink-0 text-muted-foreground"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}
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
        <div className="p-4 sm:p-5 border  rounded-md">
          <Tabs defaultValue="comments">
            <ScrollArea className="w-full whitespace-nowrap">
            <TabsList
              className="max-w-full overflow-x-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <TabsTrigger value="comments" className="shrink-0 flex-none">
                <MessagesSquare />
                Comments
              </TabsTrigger>
              <TabsTrigger value="overview" className="shrink-0 flex-none">
                <Info />
                Overview
              </TabsTrigger>
              <TabsTrigger value="attachments" className="shrink-0 flex-none">
                <Paperclip />
                Attachments
              </TabsTrigger>
              <TabsTrigger value="history" className="shrink-0 flex-none">
                <HistoryIcon />
                History
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
</ScrollArea>
            <TabsContent
              value="comments"
              forceMount
              className="mt-4 data-[state=inactive]:hidden"
            >
              <CommentThread
                ticketId={ticketId}
                comments={comments}
                userMap={userMap}
                canManage={canViewAll}
                currentUserId={user?.id}
                currentUserName={user?.username}
                ticketCategoryId={ticket.CATEGORY_ID}
              />
            </TabsContent>

            <TabsContent
              value="overview"
              forceMount
              className="mt-4 data-[state=inactive]:hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
                <SectionCard
                  icon={Info}
                  title="Ticket Info"
                  className="lg:col-span-3"
                >
                  <Row label="Subject" value={ticket.SUBJECT} />
                  <RowStacked label="Description">
                    <p className="text-[13px] text-foreground whitespace-pre-wrap break-words">
                      {ticket.DESCRIPTION || "—"}
                    </p>
                  </RowStacked>
                  <Row
                    label="Type"
                    valueNode={<TicketTypeBadge type={ticket.TICKET_TYPE} />}
                  />
                  {showChangeAmount && (
                    <Row
                      label="Change Amount"
                      value={fmtCurrency(ticket.CHANGE_AMOUNT)}
                    />
                  )}
                  <Row
                    label="Project"
                    value={ticket.PROJECT_NAME || "General"}
                  />
                  <Row
                    label="Contractor"
                    value={ticket.CONTRACTOR_NAME || "—"}
                  />
                  <Row label="Owner" value={ticket.OWNER_NAME || "—"} />
                  <Row label="Category" value={ticket.CATEGORY_NAME} />
                  <Row
                    label="Priority"
                    valueNode={
                      <PriorityBadge priority={ticket.PRIORITY_NAME} />
                    }
                  />
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
                  <Row
                    label="Created By"
                    value={
                      userMap[ticket.CREATED_BY] || `ID: ${ticket.CREATED_BY}`
                    }
                  />
                  <Row
                    label="Due Date"
                    valueNode={
                      <span
                        className={`font-medium text-right ${overdue ? "text-red-600" : "text-foreground"}`}
                      >
                        {fmtDateTime(ticket.DUE_DATE)}
                      </span>
                    }
                  />
                </SectionCard>

                {canAssign && (
                  <SectionCard
                    icon={ShieldCheck}
                    title="Assignment"
                    className="lg:col-span-2"
                  >
                    <div className="px-4 py-4">
                      <AssignWorkerDropdown
                        ticketId={ticketId}
                        currentWorkerId={ticket.ASSIGNED_WORKER_ID}
                      />
                    </div>
                  </SectionCard>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="attachments"
              forceMount
              className="mt-4 data-[state=inactive]:hidden"
            >
              <SectionCard icon={Paperclip} title="Attachments">
                <div className="p-4 space-y-4">
                  <AttachmentList attachments={attachments} />
                  <AttachmentUploader ticketId={ticketId} />
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent
              value="history"
              forceMount
              className="mt-4 data-[state=inactive]:hidden"
            >
              <SectionCard icon={HistoryIcon} title="History">
                <div className="px-4 py-4">
                  <TicketHistoryTimeline
                    history={history}
                    userMap={userMap}
                    workerMap={workerMap}
                    lookups={lookups}
                  />
                </div>
              </SectionCard>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </SectionContainer>
  );
}
