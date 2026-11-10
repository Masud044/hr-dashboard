// src\features\project-two\project-detail-page.jsx
import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Info,
  MapPin,
  FileText,
  Layers,
  Paperclip,
  Ticket as TicketIcon,
  CalendarDays,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionContainer } from "@/components/SectionContainer";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/hooks/use-permission";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { useTickets } from "@/features/ticketing/queries";
import StatusBadge from "@/features/ticketing/components/StatusBadge";
import PriorityBadge from "@/features/ticketing/components/PriorityBadge";
import TicketTypeBadge from "@/features/ticketing/components/TicketTypeBadge";
import { fmtDateTime, isOverdue } from "@/features/ticketing/lib/ticket-utils";
import { SelectionsSection } from "@/features/selection/selections-section";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const EMPTY_ARRAY = [];

// Matches owner-projects.jsx StatusChip color mapping (inlined — do not import)
const STATUS_STYLES = {
  RUNNING:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  ON_HOLD:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

function StatusChip({ status }) {
  const key = status || "RUNNING";
  const className = STATUS_STYLES[key] || STATUS_STYLES.DRAFT;
  return (
    <Badge variant="secondary" className={`capitalize border-0 ${className}`}>
      {key.toLowerCase().replace(/_/g, " ")}
    </Badge>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-4 mb-6 mt-8">
      <div className="flex-1 h-px bg-border" />
      <span className="text-overline text-muted-foreground tracking-[0.08em] uppercase font-semibold">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function InfoCard({ icon: Icon, title, className, children }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-border">
        <Icon size={13} className="text-primary" />
        <h4 className="text-overline text-muted-foreground">{title}</h4>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ReadField({ label, value, className }) {
  return (
    <div className={cn("rounded-md bg-muted/40 px-3 py-2.5", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground break-words">
        {value ?? "—"}
      </p>
    </div>
  );
}

function TicketCard({ ticket, onOpen }) {
  const overdue = isOverdue(ticket);
  return (
    <div
      onClick={() => onOpen(ticket.TICKET_ID)}
      className="rounded-lg border border-border bg-card p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <p className="font-mono text-xs text-muted-foreground">
        {ticket.TICKET_NUMBER}
      </p>
      <h4
        className="mt-1.5 text-sm font-medium text-foreground leading-snug line-clamp-2 min-h-10 break-words"
        title={ticket.SUBJECT}
      >
        {ticket.SUBJECT}
      </h4>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <StatusBadge status={ticket.STATUS_NAME} />
        <PriorityBadge priority={ticket.PRIORITY_NAME} />
        <TicketTypeBadge type={ticket.TICKET_TYPE} />
      </div>
      <div
        className={cn(
          "mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-xs",
          overdue ? "text-red-600 font-medium" : "text-muted-foreground",
        )}
      >
        {overdue ? <AlertTriangle size={12} /> : <CalendarDays size={12} />}
        {fmtDateTime(ticket.DUE_DATE)}
      </div>
    </div>
  );
}

function TicketSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-1.5 h-4 w-2/3" />
      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-3 w-32" />
    </div>
  );
}

const fmtBytes = (b) =>
  !b
    ? ""
    : b < 1048576
      ? `${(b / 1024).toFixed(1)} KB`
      : `${(b / 1048576).toFixed(1)} MB`;

export function ProjectDetailPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthV2();
  const isOwner = user?.userType === "OWNER";

  const availableTabs = isOwner
    ? ["selections", "overview"]
    : ["selections", "tickets", "documents", "overview"];
  const requestedTab = searchParams.get("tab");
  const activeTab = availableTabs.includes(requestedTab)
    ? requestedTab
    : "selections";
  const handleTabChange = (tab) =>
    setSearchParams({ tab }, { replace: true });

  const canEdit = useHasPermission("PROJECT_EDIT");
  const canDelete = useHasPermission("PROJECT_DELETE");
  const canViewReport = useHasPermission("PROJECT_REPORT_VIEW");

  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // ── queries (same pattern as edit-project-page.jsx) ──────────────────────
  const { data: projectTypes = EMPTY_ARRAY } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => (await axios.get(`${url}/api/project-type`)).data?.data || [],
  });

  const { data: contractorTypes = EMPTY_ARRAY } = useQuery({
    queryKey: ["contractorTypes"],
    queryFn: async () =>
      (await axios.get(`${url}/api/contractor-type`)).data?.data || [],
  });

  const { data: existingProject, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project?p_id=${projectId}`);
      const d = res.data?.data;
      return Array.isArray(d)
        ? d.find((p) => Number(p.P_ID) === Number(projectId))
        : d;
    },
    enabled: !!projectId,
  });

  const { data: ticketsData, isLoading: ticketsLoading } = useTickets(
    { PROJECT_ID: projectId },
    pagination,
  );

  const deleteMutation = useMutation({
    mutationFn: async () => axios.delete(`${url}/api/project/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      toast.success("Project deleted successfully!");
      navigate("/dashboard/projects");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to delete project."),
  });

  const handleDelete = async () => {
    const confirmed = await showConfirmation({
      title: "Delete Project?",
      description:
        "This will permanently delete the project and all associated data. This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!confirmed) return;
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <SectionContainer variant="dashboard" className="py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </SectionContainer>
    );
  }

  if (!existingProject) {
    return (
      <SectionContainer variant="dashboard">
        <div className="bg-card rounded-md shadow-sm p-8 text-center text-sm text-muted-foreground">
          Project not found.
        </div>
      </SectionContainer>
    );
  }

  const projectTypeName =
    projectTypes.find((pt) => String(pt.ID) === String(existingProject.P_TYPE))
      ?.NAME || existingProject.P_TYPE || "—";

  const contractorTypeNames = (existingProject.CONTRACTOR_TYPES || []).map(
    (c) =>
      contractorTypes.find((ct) => ct.ID === c.CONTRACTOR_TYPE_ID)?.NAME ||
      `Type ${c.CONTRACTOR_TYPE_ID}`,
  );

  const uploadedDocs = (existingProject.DOCS || []).filter(
    (d) => d.UPLOAD_STATUS === "UPLOADED",
  );

  const headerMeta = [existingProject.P_CODE, projectTypeName].filter(
    (v) => v && v !== "—",
  );

  const tickets = ticketsData?.data || [];
  const ticketsTotal = ticketsData?.total || 0;
  const pageCount = Math.max(
    1,
    Math.ceil(ticketsTotal / (pagination.pageSize || 10)),
  );
  const currentPage = pagination.pageIndex + 1;

  const goToPage = (pageIndex) =>
    setPagination((p) => ({
      ...p,
      pageIndex: Math.min(Math.max(0, pageIndex), pageCount - 1),
    }));

  const tabs = [
    { id: "selections", label: "Selections" },
    ...(isOwner
      ? []
      : [
          { id: "tickets", label: "Tickets", badge: ticketsTotal },
          { id: "documents", label: "Documents", badge: uploadedDocs.length },
        ]),
    { id: "overview", label: "Overview" },
  ];

  return (
    <SectionContainer variant="dashboard">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(-1)}
            className="shrink-0 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-[-0.03em]">
            {existingProject.P_NAME}
          </h1>
          <StatusChip status={existingProject.PROJECT_STATUS} />
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dashboard/projects/${projectId}/edit`)}
              className="ml-auto shrink-0"
            >
              <Pencil size={14} />
              Edit
            </Button>
          )}
          {canViewReport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dashboard/projects/${projectId}/report`)}
              className="shrink-0"
            >
              <FileText size={14} />
              View Report
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="shrink-0 hover:text-destructive"
            >
              <Trash2 size={14} />
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {headerMeta.length > 0
            ? headerMeta.join("  •  ")
            : "View project details below"}
        </p>
        <div className="w-full h-px bg-border mt-6" />
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <div className="inline-flex items-center gap-1 bg-secondary rounded-md p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.badge != null && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "selections" && (
          <SelectionsSection projectId={projectId} />
        )}

        {activeTab === "tickets" && (
          <>
            {ticketsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TicketSkeleton key={i} />
                ))}
              </div>
            ) : tickets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.TICKET_ID}
                    ticket={ticket}
                    onOpen={(ticketId) =>
                      navigate(`/dashboard/tickets/${ticketId}`)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
                <TicketIcon size={20} className="mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No tickets linked to this project.
                </p>
              </div>
            )}

            {!ticketsLoading && ticketsTotal > 0 && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Showing {tickets.length} of {ticketsTotal} ticket
                  {ticketsTotal === 1 ? "" : "s"}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.pageIndex === 0}
                    onClick={() => goToPage(pagination.pageIndex - 1)}
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Page {currentPage} of {pageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= pageCount}
                    onClick={() => goToPage(pagination.pageIndex + 1)}
                  >
                    Next
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "documents" && (
          <InfoCard icon={Paperclip} title="Documents">
            {uploadedDocs.length > 0 ? (
              <ul className="space-y-2">
                {uploadedDocs.map((doc) => (
                  <li
                    key={doc.ID}
                    className="flex items-center justify-between p-3 rounded-md border
                      bg-success/5 border-success/20"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 size={14} className="text-success shrink-0" />
                      <span className="truncate text-sm font-medium text-foreground">
                        {doc.FILE_NAME}
                      </span>
                      {doc.FILE_SIZE && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {fmtBytes(doc.FILE_SIZE)}
                        </span>
                      )}
                    </div>
                    <a
                      href={`${url}/api/project/doc/${doc.ID}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-3 text-primary hover:text-primary/80 shrink-0 p-1 rounded hover:bg-primary/5 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No documents uploaded.
              </p>
            )}
          </InfoCard>
        )}

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
              <InfoCard
                icon={Info}
                title="Basic Information"
                className="lg:col-span-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ReadField
                    label="Project Code"
                    value={existingProject.P_CODE || "—"}
                  />
                  <ReadField label="Project Type" value={projectTypeName} />
                  <ReadField
                    label="Insurance No"
                    value={existingProject.INSURANCE_NO || "—"}
                  />
                  <ReadField
                    label="Margin %"
                    value={
                      existingProject.MARGIN_PERCENT == null
                        ? "—"
                        : `${existingProject.MARGIN_PERCENT}%`
                    }
                  />
                  <ReadField
                    label="Start Date"
                    value={existingProject.P_ENTATIVE_START_DATE || "—"}
                  />
                  <ReadField
                    label="End Date"
                    value={existingProject.P_ENTATIVE_END_DATE || "—"}
                  />
                </div>
              </InfoCard>

              <InfoCard
                icon={MapPin}
                title="Location"
                className="lg:col-span-2"
              >
                <div className="grid grid-cols-1 gap-3">
                  <ReadField
                    label="Project Address"
                    value={existingProject.P_ADDRESS || "—"}
                  />
                  <ReadField label="Suburb" value={existingProject.SUBWRB || "—"} />
                  <ReadField label="State" value={existingProject.STATE || "—"} />
                  <ReadField
                    label="Postcode"
                    value={existingProject.POSTCODE || "—"}
                  />
                </div>
              </InfoCard>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              <InfoCard icon={FileText} title="Description">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {existingProject.DESCRIPTION || "—"}
                </p>
              </InfoCard>

              <InfoCard icon={Layers} title="Contractor Types">
                {contractorTypeNames.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {contractorTypeNames.map((name, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="border-0 rounded-full"
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </InfoCard>
            </div>
          </>
        )}
      </div>

      <ConfirmationDialog />
    </SectionContainer>
  );
}
