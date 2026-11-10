// src/features/selection/selections-section.jsx
import React, { useEffect, useState } from "react";
import { CalendarDays, ListChecks, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { useHasPermission } from "@/hooks/use-permission";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { fmtDateTime } from "@/features/ticketing/lib/ticket-utils";
import { SelectionEditorSheet } from "./selection-editor-sheet";
import {
  useCreateSelectionForm,
  useDeleteSelectionForm,
  useSelectionForms,
} from "./selection-api";

const EMPTY_ARRAY = [];

const STATUS_STYLES = {
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  PUBLISHED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  CONFIRMED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

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

function SelectionSkeleton() {
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

function AddSelectionDialog({ open, onOpenChange, onCreate, isCreating }) {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("L1");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setLevel("L1");
    }
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) {
      toast.error("Title is required.");
      return;
    }
    onCreate({ title: nextTitle, level: level.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Selection</DialogTitle>
          <DialogDescription>
            Create a new draft selection form for this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kitchen Selection"
              className="h-9 text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Level
            </label>
            <Input
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="e.g. L1"
              className="h-9 text-sm"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SelectionCard({ form, canEdit, onOpen, onDelete, deleting }) {
  const areaCount =
    form.AREA_COUNT ??
    (Array.isArray(form.AREAS) ? form.AREAS.length : null);

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
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
            {areaCount != null && (
              <span className="text-xs text-muted-foreground">
                {areaCount} area{areaCount === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpen(form.ID)}
            >
              Open
            </Button>
            {form.STATUS === "DRAFT" && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(form)}
                disabled={deleting}
                title="Delete selection"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
        <CalendarDays size={12} />
        Updated {fmtDateTime(form.UPDATED_DATE)}
      </div>
    </div>
  );
}

export function SelectionsSection({ projectId }) {
  const { user } = useAuthV2();
  const canEdit = useHasPermission("PROJECT_EDIT");
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  const {
    data: forms = EMPTY_ARRAY,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSelectionForms(projectId);

  const createMutation = useCreateSelectionForm();
  const deleteMutation = useDeleteSelectionForm();

  const [createOpen, setCreateOpen] = useState(false);
  const [openFormId, setOpenFormId] = useState(null);

  if (user?.userType === "OWNER") return null;

  const handleCreate = async ({ title, level }) => {
    try {
      await createMutation.mutateAsync({
        projectId,
        payload: {
          P_ID: Number(projectId),
          TITLE: title,
          LEVEL_NO: level || null,
          IS_TEMPLATE: "N",
          CREATED_BY: user?.id ?? 0,
          UPDATED_BY: user?.id ?? 0,
        },
      });
      toast.success("Selection added.");
      setCreateOpen(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to create selection.",
      );
    }
  };

  const handleDelete = async (form) => {
    const confirmed = await showConfirmation({
      title: "Delete Selection?",
      description: `Delete "${form.TITLE}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({
        projectId,
        formId: form.ID,
        userId: user?.id,
      });
      toast.success("Selection deleted.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete selection.",
      );
    }
  };

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
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={14} />
            Add Selection
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SelectionSkeleton key={index} />
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
            <SelectionCard
              key={form.ID}
              form={form}
              canEdit={canEdit}
              onOpen={setOpenFormId}
              onDelete={handleDelete}
              deleting={deleteMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <ListChecks size={20} className="mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No selections for this project yet.
          </p>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setCreateOpen(true)}
            >
              <Plus size={14} />
              Add Selection
            </Button>
          )}
        </div>
      )}

      <AddSelectionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
        isCreating={createMutation.isPending}
      />

      <SelectionEditorSheet
        open={!!openFormId}
        formId={openFormId}
        projectId={projectId}
        onClose={() => setOpenFormId(null)}
      />

      <ConfirmationDialog />
    </>
  );
}
