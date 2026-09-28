// src/features/worker/worker-details-page.jsx
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Mail,
  MapPin,
  FileText,
  History,
} from "lucide-react";
import { format, parseISO } from "date-fns";

import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import WrappedName from "@/components/shared/WrappedName";
import { useHasPermission } from "@/hooks/use-permission";
import { useWorkerById } from "./queries";
import { cn } from "@/lib/utils";

function formatDateTime(value) {
  if (!value) return "—";
  try {
    const iso = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
    const d = parseISO(iso);
    if (isNaN(d.getTime())) return "—";
    return format(d, "dd-MM-yyyy, h:mm a");
  } catch {
    return "—";
  }
}

function PageHeader({ onBack, subtitle, badge, action }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          className="shrink-0 -ml-2 text-muted-foreground"
          aria-label="Back to worker list"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-[-0.03em]">
          Worker Details
        </h1>
        {badge}
        {action}
      </div>
      {subtitle ? (
        <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
      ) : null}
      <div className="w-full h-px bg-border mt-6" />
    </div>
  );
}

function InfoCard({ icon: Icon, title, className, children }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
      <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-border">
        <Icon size={13} className="text-muted-foreground" />
        <h4 className="text-overline text-muted-foreground">{title}</h4>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ReadField({ label, value, className }) {
  return (
    <div className={cn("rounded-md bg-muted/40 px-3 py-2.5", className)}>
      <p className="text-overline text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground break-words">
        {value ?? "—"}
      </p>
    </div>
  );
}

export function WorkerDetailsPage() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const canEdit = useHasPermission("WORKER_EDIT");
  const { data: worker, isLoading, isError } = useWorkerById(workerId);

  if (isLoading) {
    return (
      <SectionContainer variant="dashboard">
        <PageHeader
          onBack={() => navigate("/dashboard/worker")}
          subtitle="Loading worker record"
        />
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </div>
      </SectionContainer>
    );
  }

  if (isError || !worker) {
    return (
      <SectionContainer variant="dashboard">
        <PageHeader
          onBack={() => navigate("/dashboard/worker")}
          subtitle="Worker record"
        />
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Worker record not found.</p>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/worker")}
            className="mt-4 gap-2 btn-lift"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
        </div>
      </SectionContainer>
    );
  }

  const isActive = Number(worker.STATUS) === 1;
  const createdBy =
    worker.CREATED_BY_NAME ||
    (worker.CREATED_BY ? `#${worker.CREATED_BY}` : "—");
  const updatedBy =
    worker.UPDATED_BY_NAME ||
    (worker.UPDATED_BY ? `#${worker.UPDATED_BY}` : "—");
  const statusBadge = (
    <Badge
      variant="secondary"
      className={
        isActive
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-0"
          : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-0"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );

  return (
    <SectionContainer variant="dashboard">
      <PageHeader
        onBack={() => navigate("/dashboard/worker")}
        badge={
          <Badge variant="secondary" className="font-mono shrink-0">
            ID: {worker.WORKER_ID}
          </Badge>
        }
        action={
          canEdit ? (
            <Button
              onClick={() => navigate(`/dashboard/worker/${workerId}/edit`)}
              size="sm"
              className="ml-auto shrink-0 gap-2 btn-lift"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : null
        }
      />

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <WrappedName
            name={worker.WORKER_NAME}
            size="lg"
            showAvatar
            maxLines={1}
            maxChars={80}
          />
          {statusBadge}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start mt-5">
        <div className="lg:col-span-3 space-y-5">
          <InfoCard icon={Mail} title="Contact">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ReadField label="Email" value={worker.EMAIL} />
              <ReadField label="Phone" value={worker.PHONE} />
            </div>
          </InfoCard>
          <InfoCard icon={MapPin} title="Address">
            <ReadField label="Street Address" value={worker.ADDRESS} />
          </InfoCard>
          <InfoCard icon={FileText} title="Notes">
            <ReadField label="Remarks" value={worker.REMARKS} />
          </InfoCard>
        </div>
        <div className="lg:col-span-2 space-y-5">
          <InfoCard icon={History} title="Record Audit">
            <div className="grid grid-cols-1 gap-3">
              <ReadField label="Created By" value={createdBy} />
              <ReadField
                label="Created Date"
                value={worker.CREATED_DATE ? formatDateTime(worker.CREATED_DATE) : "—"}
              />
              <ReadField label="Updated By" value={updatedBy} />
              <ReadField
                label="Updated Date"
                value={worker.UPDATED_DATE ? formatDateTime(worker.UPDATED_DATE) : "—"}
              />
            </div>
          </InfoCard>
        </div>
      </div>
    </SectionContainer>
  );
}
