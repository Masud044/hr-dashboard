// src/features/selection/selection-editor-page.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDashed,
  Copy,
  FileText,
  Layers,
  Loader2,
  Lock,
  Plus,
  RotateCcw,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionContainer } from "@/components/SectionContainer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { useHasPermission } from "@/hooks/use-permission";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import {
  selectionFileUrl,
  useCopyArea,
  useCreateSelectionArea,
  useCreateSelectionItem,
  useDeleteSelectionArea,
  useDeleteSelectionFile,
  useDeleteSelectionItem,
  usePublishForm,
  useReopenForm,
  useSelectionForm,
  useUpdateSelectionArea,
  useUpdateSelectionForm,
  useUpdateSelectionItem,
  useUploadSelectionFile,
} from "./selection-api";
import { useSelectionHighlightStore } from "./useSelectionHighlightStore";

const EMPTY_ARRAY = [];

const AREA_SCOPE = "selection-areas";
const ITEM_SCOPE = "selection-items";

// Shared card looks for highlighted / idle nested cards.
const CARD_IDLE =
  "border-border hover:border-primary/50 hover:bg-accent/60 hover:shadow-md";
// Selected uses the selected / selected-border tokens, never the warning color.
const CARD_SELECTED =
  "border-selected-border bg-selected text-foreground shadow-md ring-2 ring-selected-border/40 [&_.text-muted-foreground]:text-foreground/80";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "image", label: "Image" },
  { value: "checkbox", label: "Checkbox" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
];

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const STATUS_STYLES = {
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  PUBLISHED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  CONFIRMED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const toObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const toArray = (value) => (Array.isArray(value) ? value : EMPTY_ARRAY);

const serialize = (value) => JSON.stringify(value ?? {});

const CUSTOMER_OPEN_STATUSES = ["PUBLISHED", "CONFIRMED"];

const isCheckedValue = (value) =>
  value === true ||
  value === 1 ||
  value === "Y" ||
  value === "y" ||
  value === "true";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "field";

const randomSuffix = () => Math.random().toString(36).slice(2, 6);

function validateFile(file) {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return `"${file.name}" — only PDF, JPG and PNG files are allowed.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `"${file.name}" exceeds the 5MB limit.`;
  }
  return null;
}

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

// ── Field row ─────────────────────────────────────────────────────────────────

function FieldRow({ field, disabled, onChange, onRemove }) {
  const [label, setLabel] = useState(field.label ?? "");

  useEffect(() => {
    setLabel(field.label ?? "");
  }, [field.label]);

  const commitLabel = () => {
    const next = label.trim();
    if (!next) {
      setLabel(field.label ?? "");
      return;
    }
    if (next !== field.label) onChange({ label: next });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={commitLabel}
        placeholder="Field label"
        disabled={disabled}
        className="h-10 min-w-40 flex-1 text-[15px]"
      />
      <Select
        value={field.type || "text"}
        onValueChange={(value) => onChange({ type: value })}
        disabled={disabled}
      >
        <SelectTrigger className="h-10 w-32 text-[15px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FIELD_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        disabled={disabled}
        className="h-10 w-10 text-muted-foreground hover:text-destructive"
        title="Remove field"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}

// ── Item card ─────────────────────────────────────────────────────────────────

function ItemCard({
  item,
  fields,
  formId,
  projectId,
  locked,
  userId,
  formStatus,
}) {
  const updateItem = useUpdateSelectionItem();
  const deleteItem = useDeleteSelectionItem();
  const uploadFile = useUploadSelectionFile();
  const deleteFile = useDeleteSelectionFile();
  const selected =
    useSelectionHighlightStore((state) => state.selected[ITEM_SCOPE]) ===
    item.ID;
  const select = useSelectionHighlightStore((state) => state.select);

  const [values, setValues] = useState(() => toObject(item.VALUES_JSON));
  const savedRef = useRef(serialize(toObject(item.VALUES_JSON)));
  const disabled = locked || updateItem.isPending;

  const files = toArray(item.FILES);
  const showCustomerState = CUSTOMER_OPEN_STATUSES.includes(formStatus);
  const isConfirmed = String(item.CUSTOMER_CONFIRMED ?? "").toUpperCase() === "Y";

  useEffect(() => {
    const next = toObject(item.VALUES_JSON);
    const serialized = serialize(next);
    if (serialized !== savedRef.current) {
      savedRef.current = serialized;
      setValues(next);
    }
  }, [item.VALUES_JSON]);

  const persist = async (nextValues) => {
    const serialized = serialize(nextValues);
    if (serialized === savedRef.current) return;

    try {
      await updateItem.mutateAsync({
        formId,
        projectId,
        itemId: item.ID,
        payload: { VALUES_JSON: nextValues, UPDATED_BY: userId ?? 0 },
      });
      savedRef.current = serialized;
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save item values.",
      );
    }
  };

  const handleDeleteItem = async () => {
    try {
      await deleteItem.mutateAsync({
        formId,
        projectId,
        itemId: item.ID,
        userId,
      });
      toast.success("Item deleted.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete item.");
    }
  };

  const handleUpload = async (field, file) => {
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      await uploadFile.mutateAsync({
        formId,
        projectId,
        itemId: item.ID,
        file,
        fieldKey: field.key,
        userId,
      });
      toast.success("File uploaded.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload file.");
    }
  };

  const handleDeleteFile = async (file) => {
    try {
      await deleteFile.mutateAsync({
        formId,
        projectId,
        fileId: file.ID,
        userId,
      });
      toast.success("File removed.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete file.");
    }
  };

  const renderField = (field) => {
    const value = values[field.key];

    if (field.type === "textarea") {
      return (
        <Textarea
          value={value ?? ""}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
          }
          onBlur={() => persist(values)}
          disabled={disabled}
          className="min-h-20 text-[15px]"
        />
      );
    }

    if (field.type === "checkbox") {
      return (
        <div className="flex h-10 items-center">
          <Checkbox
            checked={isCheckedValue(value)}
            disabled={disabled}
            onCheckedChange={(checked) => {
              const next = { ...values, [field.key]: !!checked };
              setValues(next);
              persist(next);
            }}
          />
        </div>
      );
    }

    if (field.type === "image") {
      const fieldFiles = files.filter((file) => file.FIELD_KEY === field.key);

      return (
        <div className="space-y-2">
          {fieldFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {fieldFiles.map((file) => {
                const href = selectionFileUrl(file.ID);
                const isPdf = String(file.MIME_TYPE || "")
                  .toLowerCase()
                  .includes("pdf");

                return (
                  <div
                    key={file.ID}
                    className="flex items-center gap-1 rounded-md border border-border bg-background p-1 pr-2"
                  >
                    {isPdf ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                        title={file.FILE_NAME}
                      >
                        <FileText size={13} />
                        {file.FILE_NAME || "PDF"}
                      </a>
                    ) : (
                      <a href={href} target="_blank" rel="noreferrer">
                        <img
                          src={href}
                          alt={file.FILE_NAME || "Uploaded file"}
                          className="h-12 w-12 rounded object-cover"
                        />
                      </a>
                    )}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file)}
                        className="rounded p-2 text-muted-foreground hover:text-destructive"
                        aria-label="Remove file"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!disabled && (
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-primary hover:border-primary/50 hover:bg-accent/60">
              {uploadFile.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Upload size={12} />
              )}
              Add file
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                disabled={uploadFile.isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  handleUpload(field, file);
                }}
              />
            </label>
          )}

          <p className="text-xs text-muted-foreground">
            PDF, JPG or PNG, max 5MB.
          </p>
        </div>
      );
    }

    return (
      <Input
        type={
          field.type === "number"
            ? "number"
            : field.type === "date"
              ? "date"
              : "text"
        }
        value={value ?? ""}
        onChange={(e) =>
          setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
        }
        onBlur={() => persist(values)}
        disabled={disabled}
        className="h-10 text-[15px]"
      />
    );
  };

  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        select(ITEM_SCOPE, item.ID);
      }}
      className={cn(
        "rounded-md border p-3 text-[15px] transition-all duration-200 focus-within:ring-2 focus-within:ring-ring/50",
        selected ? CARD_SELECTED : cn("bg-muted/20", CARD_IDLE),
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Item {item.SORT_ORDER != null ? `#${Number(item.SORT_ORDER) + 1}` : ""}
        </span>
        {!locked && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-10 w-10 text-muted-foreground hover:text-destructive"
            onClick={handleDeleteItem}
            disabled={deleteItem.isPending}
            title="Delete item"
          >
            <Trash2 size={13} />
          </Button>
        )}
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add a field to start filling this item.
        </p>
      ) : null}

      {fields.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.key}
              className={cn(
                "space-y-1",
                field.type === "image" && "sm:col-span-2",
              )}
            >
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {field.label || field.key}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      )}

      {showCustomerState && (
        <div className="mt-3 border-t border-border pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Customer
            </span>
            <Badge
              variant="secondary"
              className={`gap-1 border-0 text-xs font-semibold ${isConfirmed ? STATUS_STYLES.CONFIRMED : STATUS_STYLES.DRAFT}`}
            >
              {isConfirmed ? (
                <CheckCircle2 size={13} aria-hidden="true" />
              ) : (
                <CircleDashed size={13} aria-hidden="true" />
              )}
              {isConfirmed ? "Confirmed" : "Not confirmed"}
            </Badge>
          </div>
          <div className="mt-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Customer note
            </span>
            <p className="whitespace-pre-wrap break-words text-[15px] text-foreground">
              {item.CUSTOMER_NOTE || "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Area card ─────────────────────────────────────────────────────────────────

function AreaCard({
  area,
  siblings,
  index,
  isChild,
  formId,
  projectId,
  locked,
  userId,
  formStatus,
  onMove,
  onDelete,
  onDuplicate,
  onCreateArea,
  children,
}) {
  const updateArea = useUpdateSelectionArea();
  const createItem = useCreateSelectionItem();
  const selected =
    useSelectionHighlightStore((state) => state.selected[AREA_SCOPE]) ===
    area.ID;
  const select = useSelectionHighlightStore((state) => state.select);

  const [name, setName] = useState(area.NAME ?? "");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [addingChild, setAddingChild] = useState(false);
  const [childName, setChildName] = useState("");
  const [showFields, setShowFields] = useState(false);

  const fields = toArray(area.FIELDS_JSON);
  const items = toArray(area.ITEMS);
  const disabled = locked || updateArea.isPending;

  const canMoveUp = index > 0;
  const canMoveDown = index < siblings.length - 1;

  useEffect(() => {
    setName(area.NAME ?? "");
  }, [area.NAME]);

  const saveName = async () => {
    const next = name.trim();
    if (!next || next === area.NAME) {
      setName(area.NAME ?? "");
      return;
    }

    try {
      await updateArea.mutateAsync({
        formId,
        projectId,
        areaId: area.ID,
        payload: { NAME: next, UPDATED_BY: userId ?? 0 },
      });
    } catch (err) {
      setName(area.NAME ?? "");
      toast.error(err?.response?.data?.message || "Failed to rename area.");
    }
  };

  const saveFields = async (nextFields) => {
    try {
      await updateArea.mutateAsync({
        formId,
        projectId,
        areaId: area.ID,
        payload: { FIELDS_JSON: nextFields, UPDATED_BY: userId ?? 0 },
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save fields.");
    }
  };

  const addField = () => {
    const label = newFieldLabel.trim() || "New Field";
    const existing = new Set(fields.map((field) => field.key));
    let key = `${slugify(label)}-${randomSuffix()}`;
    while (existing.has(key)) {
      key = `${slugify(label)}-${randomSuffix()}`;
    }

    saveFields([...fields, { key, label, type: "text" }]);
    setNewFieldLabel("");
  };

  const updateField = (key, patch) => {
    saveFields(
      fields.map((field) =>
        field.key === key ? { ...field, ...patch } : field,
      ),
    );
  };

  const removeField = (key) => {
    saveFields(fields.filter((field) => field.key !== key));
  };

  const addItem = async () => {
    try {
      await createItem.mutateAsync({
        formId,
        projectId,
        areaId: area.ID,
        payload: { UPDATED_BY: userId ?? 0 },
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add item.");
    }
  };

  const addChild = async () => {
    const next = childName.trim();
    if (!next) return;
    const created = await onCreateArea(next, area.ID);
    if (created) {
      setChildName("");
      setAddingChild(false);
    }
  };

  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        select(AREA_SCOPE, area.ID);
      }}
      className={cn(
        "rounded-lg border text-[15px] transition-all duration-200 focus-within:ring-2 focus-within:ring-ring/50",
        isChild ? "ml-4 border-dashed p-3" : "p-4",
        selected
          ? CARD_SELECTED
          : cn(
              CARD_IDLE,
              isChild ? "bg-muted/10" : "bg-card",
            ),
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          disabled={disabled}
          className="h-10 max-w-xs flex-1 text-[15px] font-semibold"
        />
        <Badge variant="outline" className="text-xs font-semibold">
          {isChild ? "Sub-area" : "Area"}
        </Badge>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-10 w-10"
            disabled={disabled || !canMoveUp}
            onClick={() => onMove(area, siblings, index, -1)}
            title="Move up"
          >
            <ArrowUp size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-10 w-10"
            disabled={disabled || !canMoveDown}
            onClick={() => onMove(area, siblings, index, 1)}
            title="Move down"
          >
            <ArrowDown size={14} />
          </Button>
          {!isChild && (
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-3 text-sm"
              disabled={disabled}
              onClick={() => setAddingChild((open) => !open)}
            >
              <Plus size={15} />
              Sub-area
            </Button>
          )}
          {!locked && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-10 w-10"
              disabled={updateArea.isPending}
              onClick={() => onDuplicate(area)}
              title="Duplicate area"
            >
              <Copy size={14} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            onClick={() => onDelete(area)}
            className="h-10 w-10 text-muted-foreground hover:text-destructive"
            title="Delete area"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {!isChild && addingChild && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Input
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Sub-area name"
            className="h-10 max-w-xs text-[15px]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addChild();
              }
            }}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-10 px-3 text-sm"
            onClick={addChild}
            disabled={!childName.trim() || disabled}
          >
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-10 px-3 text-sm"
            onClick={() => {
              setAddingChild(false);
              setChildName("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Fields */}
      <div className="mt-4 rounded-md border border-border/70 p-3">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Fields
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto h-10 gap-1 px-2 text-sm text-muted-foreground"
            onClick={() => setShowFields((open) => !open)}
            aria-expanded={showFields}
          >
            Manage fields ({fields.length})
            {showFields ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </Button>
        </div>

        {showFields && (
          <>
            <div className="mt-2 space-y-2">
              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No fields yet.
                </p>
              )}
              {fields.map((field) => (
                <FieldRow
                  key={field.key}
                  field={field}
                  disabled={disabled}
                  onChange={(patch) => updateField(field.key, patch)}
                  onRemove={() => removeField(field.key)}
                />
              ))}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Input
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="New field label"
                disabled={disabled}
                className="h-10 max-w-xs text-[15px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addField();
                  }
                }}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-10 px-3 text-sm"
                onClick={addField}
                disabled={disabled}
              >
                <Plus size={15} />
                Add field
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Items */}
      <div className="mt-3 rounded-md border border-border/70 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Items
            </h4>
            <span className="text-xs text-muted-foreground">
              {items.length}
            </span>
          </div>
          {!locked && (
            <Button
              size="sm"
              variant="outline"
              className="h-10 px-3 text-sm"
              onClick={addItem}
              disabled={createItem.isPending || updateArea.isPending}
            >
              <Plus size={15} />
              Add item
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items yet.</p>
          ) : (
            items.map((item) => (
              <ItemCard
                key={item.ID}
                item={item}
                fields={fields}
                formId={formId}
                projectId={projectId}
                locked={locked}
                userId={userId}
                formStatus={formStatus}
              />
            ))
          )}
        </div>
      </div>

      {React.Children.count(children) > 0 ? (
        <div
          onClick={(event) => event.stopPropagation()}
          className="mt-3 space-y-3"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

// ── Editor page ───────────────────────────────────────────────────────────────

export function SelectionEditorPage() {
  const { id: projectId, formId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthV2();
  const canEdit = useHasPermission("PROJECT_EDIT");
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  const {
    data: form,
    isLoading,
    isError,
    error,
  } = useSelectionForm(formId);

  const updateForm = useUpdateSelectionForm();
  const createArea = useCreateSelectionArea();
  const updateArea = useUpdateSelectionArea();
  const deleteArea = useDeleteSelectionArea();
  const copyArea = useCopyArea();
  const publishForm = usePublishForm();
  const reopenForm = useReopenForm();

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [newAreaName, setNewAreaName] = useState("");

  useEffect(() => {
    if (form) {
      setTitle(form.TITLE ?? "");
      setLevel(form.LEVEL_NO ?? "");
    }
    // Only resync the header inputs when the loaded form (or its header) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.ID, form?.TITLE, form?.LEVEL_NO]);

  const locked = !canEdit || form?.STATUS !== "DRAFT";
  const areas = toArray(form?.AREAS);
  const userId = user?.id;

  const saveHeader = async (field, value) => {
    if (!form || locked) return;

    const next = String(value ?? "").trim();

    try {
      if (field === "TITLE") {
        if (!next || next === form.TITLE) {
          setTitle(form.TITLE ?? "");
          return;
        }
        await updateForm.mutateAsync({
          formId: form.ID,
          projectId,
          payload: { TITLE: next, UPDATED_BY: userId ?? 0 },
        });
      } else {
        if (next === (form.LEVEL_NO ?? "")) return;
        await updateForm.mutateAsync({
          formId: form.ID,
          projectId,
          payload: { LEVEL_NO: next || null, UPDATED_BY: userId ?? 0 },
        });
      }
    } catch (err) {
      if (field === "TITLE") setTitle(form.TITLE ?? "");
      else setLevel(form.LEVEL_NO ?? "");
      toast.error(err?.response?.data?.message || "Failed to save form.");
    }
  };

  const handleCreateArea = async (name, parentId = null) => {
    if (!form) return false;

    try {
      await createArea.mutateAsync({
        formId: form.ID,
        projectId,
        payload: {
          NAME: name,
          PARENT_ID: parentId,
          UPDATED_BY: userId ?? 0,
        },
      });
      toast.success(parentId ? "Sub-area added." : "Area added.");
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add area.");
      return false;
    }
  };

  const handleDeleteArea = async (area) => {
    if (!form) return;

    const confirmed = await showConfirmation({
      title: "Delete Area?",
      description: `Delete "${area.NAME}" and all of its items? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!confirmed) return;

    try {
      await deleteArea.mutateAsync({
        formId: form.ID,
        projectId,
        areaId: area.ID,
        userId,
      });
      toast.success("Area deleted.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete area.");
    }
  };

  const handleMoveArea = async (area, siblings, index, direction) => {
    if (!form) return;

    const target = siblings[index + direction];
    if (!target) return;

    const areaSort = Number(area.SORT_ORDER ?? index);
    const targetSort = Number(target.SORT_ORDER ?? index + direction);
    const [firstSort, secondSort] =
      areaSort === targetSort ? [index, index + direction] : [areaSort, targetSort];

    try {
      await updateArea.mutateAsync({
        formId: form.ID,
        projectId,
        areaId: area.ID,
        payload: { SORT_ORDER: secondSort, UPDATED_BY: userId ?? 0 },
      });
      await updateArea.mutateAsync({
        formId: form.ID,
        projectId,
        areaId: target.ID,
        payload: { SORT_ORDER: firstSort, UPDATED_BY: userId ?? 0 },
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reorder areas.");
    }
  };

  const handleDuplicateArea = async (area) => {
    if (!form) return;

    try {
      await copyArea.mutateAsync({
        formId: form.ID,
        projectId,
        areaId: area.ID,
        payload: { COPY_FILES: "Y", UPDATED_BY: userId ?? 0 },
      });
      toast.success("Area duplicated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to duplicate area.");
    }
  };

  const handlePublish = async () => {
    if (!form) return;

    const confirmed = await showConfirmation({
      title: "Publish Selection?",
      description: `Publish "${form.TITLE}"? The form becomes read-only and is shared with the customer for confirmation.`,
      confirmText: "Publish",
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    try {
      await publishForm.mutateAsync({
        formId: form.ID,
        projectId,
        userId,
      });
      toast.success("Selection published.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to publish selection.",
      );
    }
  };

  const handleReopen = async () => {
    if (!form) return;

    const confirmed = await showConfirmation({
      title: "Reopen Selection?",
      description:
        "Reopening returns this form to draft and clears all customer confirmations and notes. This cannot be undone.",
      confirmText: "Reopen",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!confirmed) return;

    try {
      await reopenForm.mutateAsync({
        formId: form.ID,
        projectId,
        userId,
      });
      toast.success("Selection reopened.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to reopen selection.",
      );
    }
  };

  const addRootArea = async () => {
    const next = newAreaName.trim();
    if (!next) {
      toast.error("Area name is required.");
      return;
    }
    const created = await handleCreateArea(next, null);
    if (created) setNewAreaName("");
  };

  const renderAreaCard = (area, siblings, index, isChild) => (
    <AreaCard
      key={area.ID}
      area={area}
      siblings={siblings}
      index={index}
      isChild={isChild}
      formId={form?.ID}
      projectId={projectId}
      locked={locked}
      userId={userId}
      formStatus={form?.STATUS}
      onMove={handleMoveArea}
      onDelete={handleDeleteArea}
      onDuplicate={handleDuplicateArea}
      onCreateArea={handleCreateArea}
    >
      {!isChild &&
        toArray(area.CHILDREN).map((child, childIndex) =>
          renderAreaCard(
            child,
            toArray(area.CHILDREN),
            childIndex,
            true,
          ),
        )}
    </AreaCard>
  );

  return (
    <SectionContainer variant="dashboard">
      <div className="mx-auto w-full max-w-4xl">
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
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => saveHeader("TITLE", title)}
                placeholder="Form title"
                disabled={locked}
                className="h-11 min-w-0 flex-1 text-[17px] font-semibold"
              />
              <Input
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                onBlur={() => saveHeader("LEVEL_NO", level)}
                placeholder="Level (e.g. L1)"
                disabled={locked}
                className="h-10 w-36 text-[15px]"
              />
              <SelectionStatusBadge status={form?.STATUS} />

              {form?.STATUS === "DRAFT" && (
                <Button
                  size="sm"
                  className="ml-auto h-10 px-3 text-sm"
                  onClick={handlePublish}
                  disabled={publishForm.isPending || areas.length === 0}
                  title={
                    areas.length === 0
                      ? "Add at least one area before publishing."
                      : "Publish this selection to the customer"
                  }
                >
                  {publishForm.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Publish
                </Button>
              )}

              {CUSTOMER_OPEN_STATUSES.includes(form?.STATUS) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto h-10 px-3 text-sm"
                  onClick={handleReopen}
                  disabled={reopenForm.isPending}
                >
                  {reopenForm.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RotateCcw size={14} />
                  )}
                  Reopen
                </Button>
              )}
            </div>
          )}

          <p className="mt-2 text-[13px] text-muted-foreground">
            Manage the areas, fields and items of this selection form.
          </p>
        </div>

        <div className="mt-4">
          {locked && form && (
            <div className="mb-5 flex items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-[15px] font-medium text-foreground">
              <Lock size={16} className="text-warning" aria-hidden="true" />
              Form is locked
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              {error?.response?.data?.message ||
                "Failed to load selection form."}
            </div>
          ) : (
            <>
              {!locked && (
                <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border bg-card p-3">
                  <Input
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    placeholder="New area name"
                    className="h-10 max-w-xs text-[15px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRootArea();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 px-3 text-sm"
                    onClick={addRootArea}
                    disabled={createArea.isPending || !newAreaName.trim()}
                  >
                    {createArea.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    Add area
                  </Button>
                </div>
              )}

              {areas.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
                  <Layers
                    size={20}
                    className="mx-auto text-muted-foreground"
                  />
                  <p className="mt-2 text-[15px] text-muted-foreground">
                    No areas yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {areas.map((area, index) =>
                    renderAreaCard(area, areas, index, false),
                  )}
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
