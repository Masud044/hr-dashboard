// src/features/selection/selection-customer-page.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  FileText,
  ListChecks,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { SectionContainer } from "@/components/SectionContainer";
import { cn } from "@/lib/utils";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { fmtDateTime } from "@/features/ticketing/lib/ticket-utils";
import {
  selectionFileUrl,
  useConfirmAll,
  useConfirmItem,
  useSelectionForm,
} from "./selection-api";
import { useSelectionHighlightStore } from "./useSelectionHighlightStore";

const EMPTY_ARRAY = [];

const ITEM_SCOPE = "selection-customer-items";

const STATUS_STYLES = {
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  PUBLISHED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  CONFIRMED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const toObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const toArray = (value) => (Array.isArray(value) ? value : EMPTY_ARRAY);

const isCheckedValue = (value) =>
  value === true ||
  value === 1 ||
  value === "Y" ||
  value === "y" ||
  value === "true";

const isCustomerConfirmed = (item) =>
  String(item?.CUSTOMER_CONFIRMED ?? "").toUpperCase() === "Y";

const STATUS_ICONS = {
  DRAFT: CircleDashed,
  PUBLISHED: Send,
  CONFIRMED: CheckCircle2,
};

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

// ── Field value (read-only) ───────────────────────────────────────────────────

function FieldValue({ field, values, files }) {
  if (field.type === "image") {
    const fieldFiles = files.filter((file) => file.FIELD_KEY === field.key);

    if (fieldFiles.length === 0) {
      return <span className="text-[15px] text-muted-foreground">—</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {fieldFiles.map((file) => {
          const href = selectionFileUrl(file.ID);
          const isPdf = String(file.MIME_TYPE || "")
            .toLowerCase()
            .includes("pdf");

          return isPdf ? (
            <a
              key={file.ID}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <FileText size={13} />
              {file.FILE_NAME || "PDF"}
            </a>
          ) : (
            <a
              key={file.ID}
              href={href}
              target="_blank"
              rel="noreferrer"
              title={file.FILE_NAME}
            >
              <img
                src={href}
                alt={file.FILE_NAME || "Selection image"}
                className="h-16 w-16 rounded border border-border object-cover"
              />
            </a>
          );
        })}
      </div>
    );
  }

  const value = values[field.key];

  if (field.type === "checkbox") {
    return (
      <span className="text-[15px] text-foreground">
        {isCheckedValue(value) ? "Yes" : "No"}
      </span>
    );
  }

  return (
    <p className="whitespace-pre-wrap break-words text-[15px] text-foreground">
      {value === null || value === undefined || value === ""
        ? "—"
        : String(value)}
    </p>
  );
}

// ── Customer item ─────────────────────────────────────────────────────────────

function CustomerItem({ item, fields, formId, projectId, readOnly }) {
  const confirmItem = useConfirmItem();
  const selected =
    useSelectionHighlightStore((state) => state.selected[ITEM_SCOPE]) ===
    item.ID;
  const select = useSelectionHighlightStore((state) => state.select);

  const [confirmed, setConfirmed] = useState(isCustomerConfirmed(item));
  const [note, setNote] = useState(item.CUSTOMER_NOTE ?? "");

  const values = toObject(item.VALUES_JSON);
  const files = toArray(item.FILES);
  const { CUSTOMER_CONFIRMED, CUSTOMER_NOTE } = item;

  useEffect(() => {
    setConfirmed(String(CUSTOMER_CONFIRMED ?? "").toUpperCase() === "Y");
    setNote(CUSTOMER_NOTE ?? "");
  }, [CUSTOMER_CONFIRMED, CUSTOMER_NOTE]);

  const save = async (nextConfirmed, nextNote) => {
    try {
      await confirmItem.mutateAsync({
        formId,
        projectId,
        itemId: item.ID,
        payload: {
          CUSTOMER_CONFIRMED: nextConfirmed ? "Y" : "N",
          CUSTOMER_NOTE: nextNote ?? "",
        },
      });
      toast.success("Confirmation saved.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save confirmation.",
      );
    }
  };

  const handleConfirmChange = (checked) => {
    const next = !!checked;
    setConfirmed(next);
    save(next, note);
  };

  const handleNoteBlur = () => {
    if ((note ?? "") === (CUSTOMER_NOTE ?? "")) return;
    save(confirmed, note);
  };

  return (
    <div
      onClick={() => select(ITEM_SCOPE, item.ID)}
      className={cn(
        "rounded-md border p-3 text-[15px] transition-all duration-200 focus-within:ring-2 focus-within:ring-ring/50",
        selected
          ? "border-selected-border bg-selected text-foreground shadow-md ring-2 ring-selected-border/40 [&_.text-muted-foreground]:text-foreground/80"
          : "border-border bg-muted/20 hover:border-primary/50 hover:bg-accent/60 hover:shadow-md",
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Item {item.SORT_ORDER != null ? `#${Number(item.SORT_ORDER) + 1}` : ""}
      </span>

      {fields.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          This item has no fields.
        </p>
      ) : (
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.key}
              className={
                field.type === "image"
                  ? "space-y-1 sm:col-span-2"
                  : "space-y-1"
              }
            >
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {field.label || field.key}
              </span>
              <FieldValue field={field} values={values} files={files} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-2 border-t border-border pt-3">
        <label className="flex min-h-10 items-center gap-2 text-[15px] font-medium text-foreground">
          <Checkbox
            checked={confirmed}
            disabled={readOnly || confirmItem.isPending}
            onCheckedChange={handleConfirmChange}
          />
          Confirmed
          {confirmItem.isPending && (
            <Loader2 size={12} className="animate-spin text-muted-foreground" />
          )}
        </label>

        {readOnly ? (
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Note
            </span>
            <p className="whitespace-pre-wrap break-words text-[15px] text-foreground">
              {note || "—"}
            </p>
          </div>
        ) : (
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteBlur}
            maxLength={1000}
            placeholder="Add a note for this item (optional)"
            className="min-h-20 text-[15px]"
            disabled={confirmItem.isPending}
          />
        )}
      </div>
    </div>
  );
}

// ── Areas (recursive) ─────────────────────────────────────────────────────────

function CustomerArea({ area, formId, projectId, readOnly, isChild }) {
  const fields = toArray(area.FIELDS_JSON);
  const items = toArray(area.ITEMS);

  return (
    <div
      className={
        isChild
          ? "ml-4 rounded-lg border border-dashed border-border bg-muted/10 p-3"
          : "rounded-lg border border-border bg-card p-4"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="h-4 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
        <h4 className="text-[15px] font-semibold text-foreground">
          {area.NAME || "Untitled area"}
        </h4>
        <Badge variant="outline" className="text-xs font-semibold">
          {isChild ? "Sub-area" : "Area"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items yet.</p>
        ) : (
          items.map((item) => (
            <CustomerItem
              key={item.ID}
              item={item}
              fields={fields}
              formId={formId}
              projectId={projectId}
              readOnly={readOnly}
            />
          ))
        )}
      </div>

      {toArray(area.CHILDREN).length > 0 && (
        <div className="mt-3 space-y-3">
          {toArray(area.CHILDREN).map((child) => (
            <CustomerArea
              key={child.ID}
              area={child}
              formId={formId}
              projectId={projectId}
              readOnly={readOnly}
              isChild
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Customer page ─────────────────────────────────────────────────────────────

export function SelectionCustomerPage() {
  const { id: projectId, formId } = useParams();
  const navigate = useNavigate();
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  const { data: form, isLoading, isError, error } = useSelectionForm(formId);

  const confirmAll = useConfirmAll();

  const areas = toArray(form?.AREAS);
  const readOnly = form?.STATUS !== "PUBLISHED";

  const handleConfirmAll = async () => {
    if (!form) return;

    const confirmed = await showConfirmation({
      title: "Confirm all items?",
      description:
        "This confirms every item in this selection and locks the form. This cannot be undone from here.",
      confirmText: "Confirm all",
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    try {
      await confirmAll.mutateAsync({ formId: form.ID, projectId });
      toast.success("Selection confirmed.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to confirm selection.",
      );
    }
  };

  return (
    <SectionContainer variant="dashboard">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-lg border border-border bg-card p-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-3 w-40" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  navigate(`/dashboard/projects/${projectId}?tab=selections`)
                }
                className="h-10 w-10 shrink-0 -ml-2 text-muted-foreground"
                title="Back to project"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="min-w-0 flex-1 truncate text-lg font-semibold text-foreground">
                {form?.TITLE || "Selection"}
              </h2>
              {form?.LEVEL_NO && (
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-accent text-xs font-semibold text-accent-foreground"
                >
                  {form.LEVEL_NO}
                </Badge>
              )}
              <SelectionStatusBadge status={form?.STATUS} />
            </div>
          )}

          <p className="mt-2 text-[13px] text-muted-foreground">
            Review each item and confirm what has been selected.
          </p>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              {error?.response?.data?.message ||
                "Failed to load this selection."}
            </div>
          ) : !form ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
              <ListChecks
                size={20}
                className="mx-auto text-muted-foreground"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                This selection is not available.
              </p>
            </div>
          ) : (
            <>
              {form.STATUS === "CONFIRMED" && (
                <div className="mb-5 flex items-start gap-2 rounded-md border border-success/40 bg-success/10 px-4 py-3">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">
                      Selection confirmed
                    </p>
                    <p className="text-[13px] text-muted-foreground">
                      Confirmed on {fmtDateTime(form.CONFIRMED_DATE)}. This
                      selection is now read-only.
                    </p>
                  </div>
                </div>
              )}

              {areas.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
                  <ListChecks
                    size={20}
                    className="mx-auto text-muted-foreground"
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No areas in this selection yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {areas.map((area) => (
                    <CustomerArea
                      key={area.ID}
                      area={area}
                      formId={form.ID}
                      projectId={projectId}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              )}

              {form.STATUS === "PUBLISHED" && (
                <div className="mt-6 flex justify-end border-t border-border pt-4">
                  <Button
                    className="h-11 px-4 text-[15px]"
                    onClick={handleConfirmAll}
                    disabled={confirmAll.isPending || areas.length === 0}
                    title={
                      areas.length === 0
                        ? "This selection has no areas to confirm."
                        : "Confirm every item in this selection"
                    }
                  >
                    {confirmAll.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    Confirm all
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmationDialog />
    </SectionContainer>
  );
}
