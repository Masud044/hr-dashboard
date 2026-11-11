// src/features/selection/selections-section.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Copy,
  LayoutTemplate,
  ListChecks,
  Loader2,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { useHasPermission } from "@/hooks/use-permission";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { fmtDateTime } from "@/features/ticketing/lib/ticket-utils";
import { SelectionsCustomerSection } from "./selection-customer-view";
import {
  useCopyForm,
  useCreateSelectionForm,
  useDeleteSelectionForm,
  usePublishForm,
  useSelectionForms,
  useSelectionTemplates,
} from "./selection-api";
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

// Shared card looks for the highlighted / idle list card.
const CARD_IDLE =
  "cursor-pointer border-border hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent/60 hover:shadow-lg";
// Selected uses the selected / selected-border tokens, never the warning color.
const CARD_SELECTED =
  "border-selected-border bg-selected text-foreground shadow-md ring-2 ring-selected-border/40 [&_.text-muted-foreground]:text-foreground/80";

// Mirrors the server's copy suggestion so the Level field arrives pre-filled.
const nextLevelSuggestion = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(
    /(\d+)(\s*)$/,
    (match, number, spaces) => `${Number(number) + 1}${spaces}`,
  );
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

function AddSelectionDialog({
  open,
  onOpenChange,
  onCreate,
  onCreateFromTemplate,
  isCreating,
  templates,
  templatesLoading,
}) {
  const [source, setSource] = useState("blank");
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("L1");
  const [templateId, setTemplateId] = useState("");

  useEffect(() => {
    if (!open) {
      setSource("blank");
      setTitle("");
      setLevel("L1");
      setTemplateId("");
    }
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (source === "template") {
      if (!templateId) {
        toast.error("Select a template.");
        return;
      }
      onCreateFromTemplate(Number(templateId));
      return;
    }

    const nextTitle = title.trim();
    if (!nextTitle) {
      toast.error("Title is required.");
      return;
    }
    onCreate({ title: nextTitle, level: level.trim() });
  };

  const isTemplateSource = source === "template";

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
              Start from
            </label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="h-10 w-full text-[15px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blank">Blank form</SelectItem>
                <SelectItem value="template">From template</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isTemplateSource ? (
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Template *
              </label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger
                  className="h-10 w-full text-[15px]"
                  disabled={templatesLoading || templates.length === 0}
                >
                  <SelectValue
                    placeholder={
                      templatesLoading
                        ? "Loading templates..."
                        : templates.length === 0
                          ? "No templates available"
                          : "Select a template"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.ID} value={String(template.ID)}>
                      {template.TITLE || `Template #${template.ID}`}
                      {template.LEVEL_NO ? ` · ${template.LEVEL_NO}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Areas, fields and items are copied from the template.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kitchen Selection"
                  className="h-10 text-[15px]"
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
                  className="h-10 text-[15px]"
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
              className="h-10 px-3 text-sm"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating} className="h-10 px-3 text-sm">
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

function CopySelectionDialog({
  open,
  onOpenChange,
  mode,
  form,
  onCopy,
  onSaveAsTemplate,
  isPending,
}) {
  const isTemplate = mode === "template";
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [copyImages, setCopyImages] = useState(false);

  useEffect(() => {
    if (open && form) {
      setTitle(form.TITLE ?? "");
      setLevel(isTemplate ? "" : nextLevelSuggestion(form.LEVEL_NO));
      setCopyImages(false);
    }
  }, [open, form, isTemplate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) {
      toast.error("Title is required.");
      return;
    }

    if (isTemplate) {
      onSaveAsTemplate({ title: nextTitle });
      return;
    }
    onCopy({ title: nextTitle, level: level.trim(), copyImages });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isTemplate ? "Save as Template" : "Copy Selection"}
          </DialogTitle>
          <DialogDescription>
            {isTemplate
              ? "Store this selection as a reusable template. It will not belong to a project."
              : "Create a new draft selection from this one."}
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
              placeholder="Title"
              className="h-10 text-[15px]"
              autoFocus
            />
          </div>

          {!isTemplate && (
            <>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Level
                </label>
                <Input
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="e.g. L2"
                  className="h-10 text-[15px]"
                />
              </div>
              <label className="flex items-center gap-2 text-[15px] text-foreground">
                <Checkbox
                  checked={copyImages}
                  onCheckedChange={(checked) => setCopyImages(!!checked)}
                />
                Copy images
              </label>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-10 px-3 text-sm"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="h-10 px-3 text-sm">
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : isTemplate ? (
                "Save template"
              ) : (
                "Copy"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SelectionCard({
  form,
  canEdit,
  onOpen,
  onCopy,
  onSaveAsTemplate,
  onPublish,
  onDelete,
  deleting,
  publishing,
}) {
  const selected =
    useSelectionHighlightStore((state) => state.selected[FORM_SCOPE]) ===
    form.ID;
  const select = useSelectionHighlightStore((state) => state.select);

  const areaCount =
    form.AREA_COUNT ??
    (Array.isArray(form.AREAS) ? form.AREAS.length : null);
  const hasNoAreas = areaCount === 0;

  return (
    <div
      onClick={() => select(FORM_SCOPE, form.ID)}
      className={cn(
        "rounded-lg border bg-card p-4 text-[15px] transition-all duration-200 focus-within:ring-2 focus-within:ring-ring/50",
        selected ? CARD_SELECTED : CARD_IDLE,
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
            {areaCount != null && (
              <span className="text-[13px] text-muted-foreground">
                {areaCount} area{areaCount === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="flex min-w-0 shrink-0 flex-col items-end gap-1">
            <div className="flex flex-wrap items-center justify-end gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 text-sm"
                onClick={() => onOpen(form.ID)}
              >
                Open
              </Button>
              {form.STATUS === "DRAFT" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 text-sm"
                  onClick={() => onPublish(form)}
                  disabled={hasNoAreas || publishing}
                  title={
                    hasNoAreas
                      ? "Add at least one area before publishing."
                      : "Publish this selection to the customer"
                  }
                >
                  {publishing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Publish
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-2 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => onCopy(form)}
              >
                <Copy size={13} />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-2 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => onSaveAsTemplate(form)}
                title="Save as template"
              >
                <LayoutTemplate size={13} />
                Template
              </Button>
              {form.STATUS === "DRAFT" && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-10 w-10 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(form)}
                  disabled={deleting}
                  title="Delete selection"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-[13px] text-muted-foreground">
        <CalendarDays size={13} aria-hidden="true" />
        Updated {fmtDateTime(form.UPDATED_DATE)}
      </div>
    </div>
  );
}

export function SelectionsSection({ projectId }) {
  const navigate = useNavigate();
  const { user } = useAuthV2();
  const canEdit = useHasPermission("PROJECT_EDIT");
  const isOwner = user?.userType === "OWNER";
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  const {
    data: forms = EMPTY_ARRAY,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSelectionForms(projectId);

  const {
    data: templates = EMPTY_ARRAY,
    isLoading: templatesLoading,
  } = useSelectionTemplates({ enabled: canEdit && !isOwner });

  const createMutation = useCreateSelectionForm();
  const deleteMutation = useDeleteSelectionForm();
  const copyMutation = useCopyForm();
  const publishMutation = usePublishForm();

  const [createOpen, setCreateOpen] = useState(false);
  const [copyDialog, setCopyDialog] = useState(null); // { mode, form }
  const [publishingId, setPublishingId] = useState(null);

  if (isOwner) {
    return <SelectionsCustomerSection projectId={projectId} />;
  }

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

  const handleCreateFromTemplate = async (templateId) => {
    try {
      const created = await copyMutation.mutateAsync({
        formId: templateId,
        projectId,
        payload: {
          P_ID: Number(projectId),
          IS_TEMPLATE: "N",
          COPY_FILES: "Y",
          CREATED_BY: user?.id ?? 0,
          UPDATED_BY: user?.id ?? 0,
        },
      });
      toast.success("Selection added from template.");
      setCreateOpen(false);
      if (created?.id) {
        navigate(`/dashboard/projects/${projectId}/selections/${created.id}`);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to create selection.",
      );
    }
  };

  const handleCopy = async ({ title, level, copyImages }) => {
    const source = copyDialog?.form;
    if (!source) return;

    try {
      const created = await copyMutation.mutateAsync({
        formId: source.ID,
        projectId,
        payload: {
          P_ID: Number(projectId),
          TITLE: title,
          LEVEL_NO: level || null,
          IS_TEMPLATE: "N",
          COPY_FILES: copyImages ? "Y" : "N",
          UPDATED_BY: user?.id ?? 0,
        },
      });
      toast.success("Selection copied.");
      setCopyDialog(null);
      if (created?.id) {
        navigate(`/dashboard/projects/${projectId}/selections/${created.id}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to copy selection.");
    }
  };

  const handleSaveAsTemplate = async ({ title }) => {
    const source = copyDialog?.form;
    if (!source) return;

    try {
      await copyMutation.mutateAsync({
        formId: source.ID,
        projectId,
        payload: {
          TITLE: title,
          IS_TEMPLATE: "Y",
          UPDATED_BY: user?.id ?? 0,
        },
      });
      toast.success("Saved as template.");
      setCopyDialog(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save template.",
      );
    }
  };

  const handlePublish = async (form) => {
    const confirmed = await showConfirmation({
      title: "Publish Selection?",
      description: `Publish "${form.TITLE}"? The form becomes read-only and is shared with the customer for confirmation.`,
      confirmText: "Publish",
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    setPublishingId(form.ID);
    try {
      await publishMutation.mutateAsync({
        formId: form.ID,
        projectId,
        userId: user?.id,
      });
      toast.success("Selection published.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to publish selection.",
      );
    } finally {
      setPublishingId(null);
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
        {canEdit && (
          <Button
            size="sm"
            className="h-10 px-3 text-sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={15} />
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
            <SelectionCard
              key={form.ID}
              form={form}
              canEdit={canEdit}
              onOpen={(formId) =>
                navigate(`/dashboard/projects/${projectId}/selections/${formId}`)
              }
              onCopy={(target) => setCopyDialog({ mode: "copy", form: target })}
              onSaveAsTemplate={(target) =>
                setCopyDialog({ mode: "template", form: target })
              }
              onPublish={handlePublish}
              onDelete={handleDelete}
              deleting={deleteMutation.isPending}
              publishing={publishingId === form.ID}
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
              className="mt-3 h-10 px-3 text-sm"
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
        onCreateFromTemplate={handleCreateFromTemplate}
        isCreating={createMutation.isPending || copyMutation.isPending}
        templates={templates}
        templatesLoading={templatesLoading}
      />

      <CopySelectionDialog
        open={!!copyDialog}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setCopyDialog(null);
        }}
        mode={copyDialog?.mode}
        form={copyDialog?.form}
        onCopy={handleCopy}
        onSaveAsTemplate={handleSaveAsTemplate}
        isPending={copyMutation.isPending}
      />

      <ConfirmationDialog />
    </>
  );
}
