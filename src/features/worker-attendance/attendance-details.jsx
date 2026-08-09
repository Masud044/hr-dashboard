// src\features\worker-attendance\attendance-details.jsx
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeft,
  Clock,
  FileText,
  Loader2,
  Pencil,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateWithDay, formatHoursMinutes } from "@/lib/utils";
import { useHasPermission } from "@/hooks/use-permission";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function getWorkedDisplay(record) {
  if (!record) return { value: "—", unit: "" };
  return { value: formatHoursMinutes(record.HOURS_WORKED), unit: "" };
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export function AttendanceDetails() {
  const { attendanceId } = useParams();
  const navigate = useNavigate();

  const canEdit = useHasPermission("ATTENDANCE_EDIT");

  const {
    data: attendance,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["worker-attendance", attendanceId],
    queryFn: async () => {
      const res = await axios.get(
        `${url}/api/worker-attendance/${attendanceId}`,
      );
      return res.data?.data || null;
    },
    enabled: !!attendanceId,
  });

  const { data: workers = [] } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/worker`);
      return res.data?.data || [];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project`);
      return res.data?.data || [];
    },
  });

  const workerMap = useMemo(
    () => Object.fromEntries(workers.map((w) => [w.WORKER_ID, w.WORKER_NAME])),
    [workers],
  );

  const projectMap = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.P_ID, p.P_NAME])),
    [projects],
  );

  // ── Loading state ───────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            Fetching Records
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Loading attendance details...
          </p>
        </div>
      </div>
    );
  }

  // ── Not found state ─────────────────────────
  if (isError || !attendance) {
    return (
      <div className="flex min-h-[420px] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-foreground">
              Attendance Not Found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn't find a record matching this ID. It may have been
              deleted, or the link is incorrect.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/worker-attendance")}
              className="mt-6 gap-2 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to List
            </Button>
            <code className="mt-4 rounded bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
              ID: {attendanceId}
            </code>
          </CardContent>
        </Card>
      </div>
    );
  }

  const workerName =
    workerMap[attendance.WORKER_ID] || `Worker #${attendance.WORKER_ID}`;
  const projectName =
    projectMap[attendance.PROJECT_ID] || `Project #${attendance.PROJECT_ID}`;
  const worked = getWorkedDisplay(attendance);

  return (
    <div className="mt-6 px-4 pb-8">
      <div className="mx-auto max-w-3xl">
        {/* ── Page header ─────────────────────── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Attendance Details
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Record from {formatDateWithDay(attendance.ATTENDANCE_DATE)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {
              canEdit && <Button
              size="sm"
              onClick={() =>
                navigate(`/dashboard/worker-attendance/${attendanceId}/edit`)
              }
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            }
            
          </div>
        </div>

        <Card className="overflow-hidden">
          {/* ── Primary info ──────────────────── */}
          <CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
            <Field label="Worker">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <User className="h-4 w-4 text-muted-foreground" />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {workerName}
                </span>
              </div>
            </Field>
            <Field label="Date">
              <span className="text-sm font-medium text-foreground">
                {formatDateWithDay(attendance.ATTENDANCE_DATE)}
              </span>
            </Field>
            <Field label="Project">
              <span className="text-sm font-medium text-foreground">
                {projectName}
              </span>
            </Field>
           
          </CardContent>

          {/* ── Worked hero stat ──────────────── */}
          <div className="border-y border-border bg-muted/50 px-6 py-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hours / Days Worked
            </p>
            <div className="mt-2 flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold text-primary">
                {worked.value}
              </span>
              {worked.unit && (
                <span className="text-lg font-semibold text-primary/70">
                  {worked.unit}
                </span>
              )}
            </div>
          </div>

          {/* ── Entry mode + remarks ──────────── */}
          <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          
           <CardContent className="p-6">
  <Field label="Remarks">
    <p className="text-sm leading-relaxed text-foreground">
      {attendance.REMARKS || "—"}
    </p>
  </Field>
</CardContent>
          </CardContent>

          {/* ── Audit trail strip ─────────────── */}
          <div className="grid grid-cols-2 gap-4 border-t border-border bg-primary/5 px-6 py-4 md:grid-cols-4">
            <Field label="Created By">
              <span className="text-xs font-medium text-foreground">
                {attendance.CREATED_BY || "—"}
              </span>
            </Field>
            <Field label="Created Date">
              <span className="text-xs font-medium text-foreground">
                {formatDateTime(attendance.CREATED_DATE)}
              </span>
            </Field>
            <Field label="Updated By">
              <span className="text-xs font-medium text-foreground">
                {attendance.UPDATED_BY || "—"}
              </span>
            </Field>
            <Field label="Updated Date">
              <span className="text-xs font-medium text-foreground">
                {formatDateTime(attendance.UPDATED_DATE)}
              </span>
            </Field>
          </div>
        </Card>
      </div>
    </div>
  );
}
