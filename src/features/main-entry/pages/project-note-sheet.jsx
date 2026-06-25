// src\features\main-entry\pages\project-note-sheet.jsx
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { format } from "date-fns";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ── Helpers ──────────────────────────────────────────────────────────────────


function formatDate(dateStr) {
  if (!dateStr) return "";
  return format(new Date(dateStr), "dd MMM yyyy, hh:mm a");
}

function fileIcon(contentType = "") {
  if (contentType.startsWith("image/")) return "🖼️";
  if (contentType === "application/pdf") return "📄";
  if (contentType.includes("word")) return "📝";
  if (contentType.includes("sheet") || contentType.includes("excel"))
    return "📊";
  return "📎";
}

// ── Contractor Multi-Select ───────────────────────────────────────────────────
function ContractorMultiSelect({
  contractors,
  value = [],
  onChange,
  placeholder = "Select contractor types",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  };

  const labels = contractors
    .filter((c) => value.includes(c.id))
    .map((c) => c.title);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border border-border rounded-md bg-card hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      >
        <span
          className={labels.length ? "text-foreground truncate" : "text-muted-foreground"}
        >
          {labels.length ? labels.join(", ") : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-52 overflow-y-auto">
          {contractors.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
            >
              <span
                className={`w-4 h-4 rounded-full flex-shrink-0 border flex items-center justify-center transition-colors ${value.includes(c.id) ? "bg-primary border-primary" : "border-border bg-muted"}`}
              >
                {value.includes(c.id) && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
              <span className="text-foreground">{c.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Add these helper functions at the top of the file (before NoteCard)
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
  if (!name) return "bg-muted";
  const colors = [
    "bg-indigo-500 text-white",
    "bg-green-500 text-white",
    "bg-orange-500 text-white",
    "bg-purple-500 text-white",
    "bg-blue-500 text-white",
    "bg-pink-500 text-white",
    "bg-teal-500 text-white",
    "bg-red-500 text-white",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// NoteCard component
function NoteCard({
  note,
  contractors,
  onEdit,
  onDelete,
  onDeleteDoc,
  createdBy,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ctNames = contractors
    .filter((c) => note.CONTRACTOR_TYPE_IDS?.includes(c.id))
    .map((c) => c.title);

  return (
    <div className="group border border-border rounded-lg p-4 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200">
      {/* Header - Tags */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-1.5">
         {ctNames.map((name) => (
  <span
    key={name}
    className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground border border-indigo-100 hover:bg-indigo-100 transition-colors"
  >
    {name}
  </span>
))}
          {ctNames.length === 0 && (
            <span className="text-xs text-muted-foreground italic">
              No contractor types
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            title="Edit note"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
              title="Delete note"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(note.NOTE_ID)}
                className="px-2 py-1 text-xs bg-destructive text-white rounded-md hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 text-xs border border-border rounded-md hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

           {/* Description */}
      <p className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-wrap break-words overflow-wrap-anywhere">
        {note.DESCRIPTION}
      </p>

            {/* Files */}
      {note.DOCS?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {note.DOCS.map((doc) => (
            <div
              key={doc.ID}
              className="group/doc flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-md border border-border hover:bg-muted/50 hover:border-primary/30 transition-all"
            >
              <svg
                className="w-4 h-4 text-muted-foreground flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <a
                href={`${url}/api/project-note/doc/${doc.ID}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-foreground hover:text-primary max-w-[150px] truncate flex-1"
                title={doc.FILE_NAME}
              >
                {doc.FILE_NAME}
              </a>
              <button
                onClick={() => onDeleteDoc(doc.ID, note.NOTE_ID)}
                className="opacity-0 group-hover/doc:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                title="Remove file"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer - Avatar, Name & Date */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${getAvatarColor(createdBy)}`}>
            <span className="text-[10px] font-bold">
              {getInitials(createdBy)}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground">{createdBy}</span>
        </div>
        <span className="text-xs text-muted-foreground">{formatDate(note.CREATION_DATE)}</span>
      </div>
    </div>
  );
}

// ── Note Form ─────────────────────────────────────────────────────────────────
function NoteForm({
  contractors,
  initialNote = null,
  defaultContractorTypeIds = [],
  createdBy,
  onSave,
  onCancel,
}) {
  const [description, setDescription] = useState(
    initialNote?.DESCRIPTION || "",
  );
  const [contractorTypeIds, setContractorTypeIds] = useState(
    initialNote?.CONTRACTOR_TYPE_IDS?.length
      ? initialNote.CONTRACTOR_TYPE_IDS
      : defaultContractorTypeIds,
  );
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);
  const isEdit = !!initialNote;

  const validate = () => {
    const e = {};
    if (!description.trim()) e.description = "Description is required";
    if (!contractorTypeIds.length)
      e.contractorTypeIds = "Select at least one contractor type";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ description, contractorTypeIds, files });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Description */}
      <div>
        <label className="block text-overline text-muted-foreground mb-1.5">
          Description <span className="text-destructive">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe the note..."
          className={`w-full px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.description ? "border-destructive bg-destructive/5" : "border-border bg-card"}`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-destructive">{errors.description}</p>
        )}
      </div>

      {/* Contractor Types */}
      <div>
        <label className="block text-overline text-muted-foreground mb-1.5">
          Contractor Types <span className="text-destructive">*</span>
        </label>
        <ContractorMultiSelect
          contractors={contractors}
          value={contractorTypeIds}
          onChange={setContractorTypeIds}
        />
        {errors.contractorTypeIds && (
          <p className="mt-1 text-xs text-destructive">
            {errors.contractorTypeIds}
          </p>
        )}
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-overline text-muted-foreground mb-1.5">
          {isEdit ? "Attach More Files" : "Attach Files"}
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border border-dashed border-border rounded-md px-4 py-3 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
        >
          <svg
            className="w-5 h-5 text-muted-foreground group-hover:text-primary mx-auto mb-1 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
          <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
            {files.length > 0
              ? `${files.length} file(s) selected`
              : "Click to upload (multiple allowed)"}
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        {files.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md border border-border text-xs text-foreground"
              >
                <span>{fileIcon(f.type)}</span>
                <span className="max-w-[100px] truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Author (read-only) — username দেখাবে */}
      <div>
        <label className="block text-overline text-muted-foreground mb-1.5">
          Author
        </label>
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-md">
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-sm text-foreground">{createdBy}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-9 text-sm border-border"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 h-9 text-sm bg-primary hover:bg-primary/90 text-white font-medium"
        >
          {isEdit ? "Update Note" : "Save Note"}
        </Button>
      </div>
    </form>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ProjectNotesSheet({
  isOpen,
  onClose,
  pId,
  contractors = [],
  defaultContractorTypeId = null,
  initialMode = "list",
}) {
  const queryClient = useQueryClient();
  const [filterCtIds, setFilterCtIds] = useState([]);
  const [mode, setMode] = useState("list");
  const [editingNote, setEditingNote] = useState(null);

  const { user } = useAuthV2();
  const CREATED_BY = 1; // API এর জন্য — number
  const displayName = user?.username ?? "Unknown"; // display এর জন্য — string

  useEffect(() => {
    if (isOpen) {
      setEditingNote(null);
      setFilterCtIds(defaultContractorTypeId ? [defaultContractorTypeId] : []);
      setMode(initialMode === "add" ? "add" : "list");
    }
  }, [isOpen, defaultContractorTypeId, initialMode]);

  // ── Fetch Notes ───────────────────────────────────────────────────────────
  const { data: notesData, isLoading } = useQuery({
    queryKey: ["project-notes", pId, filterCtIds],
    queryFn: async () => {
      const params = new URLSearchParams({ pId });
      if (filterCtIds.length)
        params.set("contractorTypeIds", filterCtIds.join(","));
      const res = await axios.get(`${url}/api/project-note?${params}`);
      return res.data?.data || [];
    },
    enabled: !!pId && isOpen,
  });

  const notes = notesData || [];

  // ── Create ───────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async ({ description, contractorTypeIds, files }) => {
      const fd = new FormData();
      fd.append("pId", pId);
      fd.append("description", description);
      fd.append("createdBy", CREATED_BY); // number → backend
      fd.append("contractorTypeIds", JSON.stringify(contractorTypeIds));
      files.forEach((f) => fd.append("files", f));
      return axios.post(`${url}/api/project-note`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["project-notes", pId]);
      toast.success("Note added successfully");
      setMode("list");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to add note"),
  });

  // ── Update ────────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ noteId, description, contractorTypeIds, files }) => {
      const fd = new FormData();
      fd.append("description", description);
      fd.append("createdBy", CREATED_BY); // number → backend
      fd.append("contractorTypeIds", JSON.stringify(contractorTypeIds));
      files.forEach((f) => fd.append("files", f));
      return axios.put(`${url}/api/project-note/${noteId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["project-notes", pId]);
      toast.success("Note updated");
      setMode("list");
      setEditingNote(null);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to update note"),
  });

  // ── Delete Note ───────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (noteId) => axios.delete(`${url}/api/project-note/${noteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["project-notes", pId]);
      toast.success("Note deleted");
    },
    onError: () => toast.error("Failed to delete note"),
  });

  // ── Delete Doc ────────────────────────────────────────────────────────────
  const deleteDocMutation = useMutation({
    mutationFn: (docId) => axios.delete(`${url}/api/project-note/doc/${docId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["project-notes", pId]);
      toast.success("File removed");
    },
    onError: () => toast.error("Failed to remove file"),
  });

  const handleSave = (data) => {
    if (mode === "add") {
      createMutation.mutate(data);
    } else if (mode === "edit" && editingNote) {
      updateMutation.mutate({ noteId: editingNote.NOTE_ID, ...data });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="!w-screen !h-screen !max-w-none overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-[104] sm:!w-[480px] sm:!h-screen sm:!max-w-none bg-card border-border">
        <div className="flex-1 overflow-y-auto">
          {/* Add / Edit Form */}
          {(mode === "add" || mode === "edit") && (
            <div className="px-6 py-5">
              <p className="text-overline text-muted-foreground mb-4">
                {mode === "add" ? "New Note" : "Edit Note"}
              </p>
              {isSaving ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                  Saving...
                </div>
              ) : (
                <NoteForm
                  contractors={contractors}
                  initialNote={mode === "edit" ? editingNote : null}
                  defaultContractorTypeIds={
                    defaultContractorTypeId ? [defaultContractorTypeId] : []
                  }
                  createdBy={displayName} // ← username দেখাবে form এ
                  onSave={handleSave}
                  onCancel={() => {
                    setMode("list");
                    setEditingNote(null);
                  }}
                />
              )}
            </div>
          )}

          {/* List View */}
          {mode === "list" && (
            <div className="px-6 py-5 space-y-5">
              {/* Filter */}
              <div>
                <label className="block text-overline text-muted-foreground mb-1.5">
                  Filter by Contractor Type
                </label>
                <ContractorMultiSelect
                  contractors={contractors}
                  value={filterCtIds}
                  onChange={setFilterCtIds}
                  placeholder="All contractor types"
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">
                  {isLoading
                    ? "Loading..."
                    : `${notes.length} note${notes.length !== 1 ? "s" : ""}`}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Notes */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              )}

              {!isLoading && notes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <svg
                    className="w-10 h-10 text-border mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-muted-foreground">
                    No notes yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add the first note for this project
                  </p>
                </div>
              )}

              {!isLoading && notes.length > 0 && (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <NoteCard
                      key={note.NOTE_ID}
                      note={note}
                      createdBy={displayName}
                      contractors={contractors}
                      onEdit={(n) => {
                        setEditingNote(n);
                        setMode("edit");
                      }}
                      onDelete={(noteId) => deleteMutation.mutate(noteId)}
                      onDeleteDoc={(docId) => deleteDocMutation.mutate(docId)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}