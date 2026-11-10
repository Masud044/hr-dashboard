// src/features/selection/selection-customer-view.jsx
import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  ListChecks,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { fmtDateTime } from "@/features/ticketing/lib/ticket-utils";
import {
  selectionFileUrl,
  useConfirmAll,
  useConfirmItem,
  useSelectionForm,
  useSelectionForms,
} from "./selection-api";

const EMPTY_ARRAY = [];

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

function SelectionStatusBadge({ status }) {
  const key = status || "DRAFT";
  return (
    <Badge
      variant="secondary"
      className={`border-0 ${STATUS_STYLES[key] || STATUS_STYLES.DRAFT}`}
    >
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

// ── Field value (read-only) ───────────────────────────────────────────────────

function FieldValue({ field, values, files }) {
  if (field.type === "image") {
    const fieldFiles = files.filter((file) => file.FIELD_KEY === field.key);

    if (fieldFiles.length === 0) {
      return <span className="text-xs text-muted-foreground">—</span>;
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
              className="flex items-center gap-1 text-xs text-primary hover:underline"
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
      <span className="text-sm text-foreground">
        {isCheckedValue(value) ? "Yes" : "No"}
      </span>
    );
  }

  return (
    <p className="whitespace-pre-wrap break-words text-sm text-foreground">
      {value === null || value === undefined || value === "" ? "—" : String(value)}
    </p>
  );
}

// ── Customer item ─────────────────────────────────────────────────────────────

function CustomerItem({ item, fields, formId, projectId, readOnly }) {
  const confirmItem = useConfirmItem();

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
    <div className="rounded-md border border-border bg-muted/20 p-3">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Item {item.SORT_ORDER != null ? `#${Number(item.SORT_ORDER) + 1}` : ""}
      </span>

      {fields.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
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
              <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {field.label || field.key}
              </span>
              <FieldValue field={field} values={values} files={files} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-2 border-t border-border pt-3">
        <label className="flex items-center gap-2 text-sm text-foreground">
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
            <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Note
            </span>
            <p className="whitespace-pre-wrap break-words text-sm text-foreground">
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
            className="min-h-16 text-sm"
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
        <h4 className="text-sm font-medium text-foreground">
          {area.NAME || "Untitled area"}
        </h4>
        <Badge variant="outline" className="text-[10px]">
          {isChild ? "Sub-area" : "Area"}
        </Badge>
        <span className="text-[11px] text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">No items yet.</p>
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

// ── Customer form sheet ───────────────────────────────────────────────────────

function CustomerFormSheet({ open, formId, projectId, onClose }) {
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  const { data: form, isLoading, isError, error } = useSelectionForm(
    open ? formId : null,
  );

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
    <>
      <Sheet
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) onClose();
        }}
      >
        <SheetContent className="!h-screen !w-screen !max-w-none flex flex-col gap-0 overflow-y-auto rounded-none p-0 z-[104]">
          <SheetHeader className="border-b px-6 pb-4 pt-6">
            <SheetTitle className="sr-only">
              {form?.TITLE || "Selection"}
            </SheetTitle>

            {isLoading ? (
              <div className="space-y-2 pr-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-3 w-40" />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <h2 className="text-base font-semibold text-foreground">
                  {form?.TITLE || "Selection"}
                </h2>
                {form?.LEVEL_NO && (
                  <Badge variant="outline" className="text-[11px]">
                    {form.LEVEL_NO}
                  </Badge>
                )}
                <SelectionStatusBadge status={form?.STATUS} />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Review each item and confirm what has been selected.
            </p>
          </SheetHeader>

          <div className="flex-1 px-6 py-6">
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
                  <div className="mb-5 flex items-start gap-2 rounded-md border border-border bg-accent px-4 py-3">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-primary"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Selection confirmed
                      </p>
                      <p className="text-xs text-muted-foreground">
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
        </SheetContent>
      </Sheet>

      <ConfirmationDialog />
    </>
  );
}

// ── Customer section ──────────────────────────────────────────────────────────

export function SelectionsCustomerSection({ projectId }) {
  const {
    data: forms = EMPTY_ARRAY,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSelectionForms(projectId);

  const [openFormId, setOpenFormId] = useState(null);

  return (
    <>
      <div className="mb-5 mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListChecks size={15} className="text-primary" />
          <h2 className="text-overline font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Selections
          </h2>
          {!isLoading && forms.length > 0 && (
            <Badge variant="secondary" className="border-0">
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
            className="mt-3"
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
              className="rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Selection #{form.ID}
                  </p>
                  <h4
                    className="mt-1 line-clamp-2 min-h-10 break-words text-sm font-medium leading-snug text-foreground"
                    title={form.TITLE}
                  >
                    {form.TITLE || "Untitled selection"}
                  </h4>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {form.LEVEL_NO && (
                      <Badge variant="outline" className="text-[11px]">
                        {form.LEVEL_NO}
                      </Badge>
                    )}
                    <SelectionStatusBadge status={form.STATUS} />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenFormId(form.ID)}
                >
                  View
                </Button>
              </div>

              <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                <CalendarDays size={12} />
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

      <CustomerFormSheet
        open={!!openFormId}
        formId={openFormId}
        projectId={projectId}
        onClose={() => setOpenFormId(null)}
      />
    </>
  );
}
