// src/features/selection/selection-customer-view.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  ListChecks,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { fmtDateTime } from "@/features/ticketing/lib/ticket-utils";
import { useSelectionForms } from "./selection-api";
import { useSelectionHighlightStore } from "./useSelectionHighlightStore";

const EMPTY_ARRAY = [];

const FORM_SCOPE = "selection-forms";

const STATUS_STYLES = {
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  PUBLISHED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  CONFIRMED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const STATUS_ICONS = {
  DRAFT: CircleDashed,
  PUBLISHED: Send,
  CONFIRMED: CheckCircle2,
};

const CARD_IDLE =
  "cursor-pointer border-border hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent/60 hover:shadow-lg";
// Selected uses the selected / selected-border tokens, never the warning color.
const CARD_SELECTED =
  "border-selected-border bg-selected text-foreground shadow-md ring-2 ring-selected-border/40 [&_.text-muted-foreground]:text-foreground/80";

function SelectionStatusBadge({ status }) {
  const key = status || "DRAFT";
  const Icon = STATUS_ICONS[key] || STATUS_ICONS.DRAFT;
  return (
    <Badge
      variant="secondary"
      className={`gap-1 border-0 text-xs font-semibold ${STATUS_STYLES[key] || STATUS_STYLES.DRAFT}`}
    >
      <Icon size={13} aria-hidden="true" />
      {key}
    </Badge>
  );
}

function CustomerCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-3 w-32" />
    </div>
  );
}

// ── Customer section ──────────────────────────────────────────────────────────

export function SelectionsCustomerSection({ projectId }) {
  const navigate = useNavigate();

  const {
    data: forms = EMPTY_ARRAY,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSelectionForms(projectId);

  const selectedFormId = useSelectionHighlightStore(
    (state) => state.selected[FORM_SCOPE],
  );
  const select = useSelectionHighlightStore((state) => state.select);

  return (
    <>
      <div className="mb-5 mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-primary">
            <ListChecks size={16} aria-hidden="true" />
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
            Selections
          </h2>
          {!isLoading && forms.length > 0 && (
            <Badge variant="secondary" className="border-0 text-xs font-semibold">
              {forms.length}
            </Badge>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <CustomerCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            {error?.response?.data?.message || "Failed to load selections."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 h-10 px-3 text-sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Retrying..." : "Retry"}
          </Button>
        </div>
      ) : forms.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div
              key={form.ID}
              onClick={() => select(FORM_SCOPE, form.ID)}
              className={cn(
                "rounded-lg border bg-card p-4 text-[15px] transition-all duration-200 focus-within:ring-2 focus-within:ring-ring/50",
                selectedFormId === form.ID ? CARD_SELECTED : CARD_IDLE,
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Selection #{form.ID}
                  </p>
                  <h4
                    className="mt-1 line-clamp-2 min-h-10 break-words text-[15px] font-semibold leading-snug text-foreground"
                    title={form.TITLE}
                  >
                    {form.TITLE || "Untitled selection"}
                  </h4>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {form.LEVEL_NO && (
                      <Badge
                        variant="outline"
                        className="border-primary/40 bg-accent text-xs font-semibold text-accent-foreground"
                      >
                        {form.LEVEL_NO}
                      </Badge>
                    )}
                    <SelectionStatusBadge status={form.STATUS} />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 text-sm"
                  onClick={() =>
                    navigate(
                      `/dashboard/projects/${projectId}/selections/${form.ID}`,
                    )
                  }
                >
                  View
                </Button>
              </div>

              <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-[13px] text-muted-foreground">
                <CalendarDays size={13} aria-hidden="true" />
                Updated {fmtDateTime(form.UPDATED_DATE)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <ListChecks size={20} className="mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No published selections for this project yet.
          </p>
        </div>
      )}
    </>
  );
}
