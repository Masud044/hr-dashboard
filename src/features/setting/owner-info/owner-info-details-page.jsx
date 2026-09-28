// src\features\setting\owner-info\owner-info-details-page.jsx
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Mail,
  MapPin,
  Building2,
  History,
} from "lucide-react";
import { format, parseISO } from "date-fns";

import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import WrappedName from "@/components/shared/WrappedName";
import { useHasPermission } from "@/hooks/use-permission";
import { useOwnerInfoById } from "./queries";
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

function PageHeader({ onBack, subtitle, badge, action }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          className="shrink-0 -ml-2 text-muted-foreground"
          aria-label="Back to owner list"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-[-0.03em]">
          Owner Details
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

export function OwnerInfoDetailsPage() {
  const { id: ownerId } = useParams();
  const navigate = useNavigate();
  const canEdit = useHasPermission("OWNER_INFO_EDIT");
  const { data: owner, isLoading, isError } = useOwnerInfoById(ownerId);

  if (isLoading) {
    return (
      <SectionContainer variant="dashboard">
        <PageHeader
          onBack={() => navigate("/dashboard/owner-info")}
          subtitle="Loading owner record"
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

  if (isError || !owner) {
    return (
      <SectionContainer variant="dashboard">
        <PageHeader
          onBack={() => navigate("/dashboard/owner-info")}
          subtitle="Owner record"
        />
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Owner record not found.</p>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/owner-info")}
            className="mt-4 gap-2 btn-lift"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
        </div>
      </SectionContainer>
    );
  }

  const createdBy =
    owner.CREATED_BY_NAME || (owner.CREATED_BY ? `#${owner.CREATED_BY}` : "—");
  const updatedBy =
    owner.UPDATED_BY_NAME || (owner.UPDATED_BY ? `#${owner.UPDATED_BY}` : "—");

  return (
    <SectionContainer variant="dashboard">
      <PageHeader
        onBack={() => navigate("/dashboard/owner-info")}
        badge={
          <Badge variant="secondary" className="font-mono shrink-0">
            ID: {owner.ID}
          </Badge>
        }
        action={
          canEdit ? (
            <Button
              onClick={() => navigate(`/dashboard/owner-info/${ownerId}/edit`)}
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
            name={owner.O_NAME}
            size="lg"
            showAvatar
            maxLines={1}
            maxChars={80}
          />
          <Badge variant="secondary" className="gap-1.5">
            <Building2 />
            {owner.PROJECT_NAME || "No project linked"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start mt-5">
        <div className="lg:col-span-3 space-y-5">
          <InfoCard icon={Mail} title="Contact">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ReadField label="Email" value={owner.EMAIL} />
              <ReadField label="Phone" value={owner.PHONE} />
            </div>
          </InfoCard>
          <InfoCard icon={MapPin} title="Address">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ReadField
                className="sm:col-span-3"
                label="Street Address"
                value={owner.ADDRESS}
              />
              <ReadField label="Suburb" value={owner.SUBURB} />
              <ReadField label="Postcode" value={owner.POSTCODE} />
              <ReadField label="State" value={owner.STATE} />
            </div>
          </InfoCard>
        </div>
        <div className="lg:col-span-2 space-y-5">
          <InfoCard icon={History} title="Record Audit">
            <div className="grid grid-cols-1 gap-3">
              <ReadField label="Created By" value={createdBy} />
              <ReadField
                label="Created Date"
                value={owner.ENTRY_DATE ? formatDateTime(owner.ENTRY_DATE) : "—"}
              />
              <ReadField label="Updated By" value={updatedBy} />
              <ReadField
                label="Updated Date"
                value={owner.UPDATED_DATE ? formatDateTime(owner.UPDATED_DATE) : "—"}
              />
            </div>
          </InfoCard>
        </div>
      </div>
    </SectionContainer>
  );
}
