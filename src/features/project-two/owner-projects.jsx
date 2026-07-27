// src/features/project-two/owner-projects.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapPin, Building2 } from "lucide-react";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { SectionContainer } from "@/components/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Matches NewProjectTable's status color mapping
const STATUS_STYLES = {
  RUNNING: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  ON_HOLD: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
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

function formatDateRange(start, end) {
  const fmt = (d) => {
    if (!d) return null;
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };
  const s = fmt(start);
  const e = fmt(end);
  if (!s && !e) return null;
  return `${s || "—"} - ${e || "TBD"}`;
}

function ProjectCard({ project, onViewReport }) {
  const dateRange = formatDateRange(project.P_ENTATIVE_START_DATE, project.P_TENTATIVE_END_DATE);
  const addressLine = [project.P_ADDRESS, project.SUBWRB, project.STATE, project.POSTCODE]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="group rounded-md border border-border bg-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-bold text-[18px] leading-snug text-foreground">
            {project.P_NAME || "Untitled Project"}
          </h3>
          <StatusChip status={project.PROJECT_STATUS} />
        </div>

        {addressLine && (
          <div className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{addressLine}</span>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
          <span className="font-mono bg-muted px-2 py-0.5 rounded-md text-xs text-muted-foreground truncate">
            #{project.P_ID}
            {project.P_CODE ? ` · ${project.P_CODE}` : ""}
          </span>
          {dateRange && (
            <span className="text-xs text-muted-foreground shrink-0">{dateRange}</span>
          )}
        </div>
      </div>

      <div className="px-5 pb-5">
       <Button
  variant="outline"
  onClick={() => onViewReport(project.P_ID)}
  className="w-full text-primary border-primary/30 hover:bg-accent hover:text-primary hover:border-primary/50"
>
  View Report
</Button>
      </div>
    </div>
  );
}

function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="mt-4 h-9 w-full" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full rounded-xl border border-dashed border-border bg-card/50 py-16 px-6 flex flex-col items-center text-center">
      <div className="flex items-center justify-center h-14 w-14 rounded-full bg-muted mb-4">
        <Building2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-display font-bold text-lg text-foreground">
        No projects assigned yet
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
        When you are assigned as an owner to new projects, they will appear here for you to track and manage.
      </p>
    </div>
  );
}

export default function OwnerProjects() {
  const navigate = useNavigate();
  const { user } = useAuthV2();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects", "owner", user?.refId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project`, {
        params: { userType: "OWNER", ownerId: user?.refId },
      });
      return res.data?.data || [];
    },
    enabled: !!user?.refId,
  });

  const projects = data || [];

  const handleViewReport = (projectId) => {
    navigate(`/dashboard/projects/${projectId}/report`);
  };

  return (
    <SectionContainer>
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-6 pt-4">
          {/* <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Overview
          </p> */}
          <h1 className="font-display font-bold text-[32px] tracking-tight text-foreground mt-1">
            My Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading your projects…"
              : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {isError && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Failed to load your projects. Please try again later.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)}

          {!isLoading && !isError && projects.length === 0 && <EmptyState />}

          {!isLoading &&
            !isError &&
            projects.map((project) => (
              <ProjectCard
                key={project.P_ID}
                project={project}
                onViewReport={handleViewReport}
              />
            ))}
        </div>
      </div>
    </SectionContainer>
  );
}