// src/features/ticketing/components/CommentThread.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import {
  Lock,
  Paperclip,
  Zap,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatarColor } from "@/lib/avatar-utils";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import {
  useAddComment,
  useCannedResponses,
  useUpdateComment,
  useDeleteComment,
} from "../queries";
import { fmtDateTime } from "../lib/ticket-utils";

function initials(label = "") {
  return label
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ name }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white shrink-0 h-8 w-8 text-xs font-semibold"
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {initials(name || "?")}
    </span>
  );
}

/**
 * props:
 *  - ticketId, comments, userMap (id -> username)
 *  - canManage: shows "Internal Note" toggle + canned response picker
 *  - currentUserId: enables inline edit/delete on the author's own comments
 *  - ticketCategoryId: prioritizes canned responses matching the ticket's category
 */
export default function CommentThread({
  ticketId,
  comments = [],
  userMap = {},
  canManage = false,
  currentUserId,
  ticketCategoryId,
}) {
  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [cannedId, setCannedId] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");

  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();
  const addComment = useAddComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const { data: cannedResponses = [] } = useCannedResponses();

  const isOwner = (c) =>
    currentUserId != null && String(c.AUTHOR_ID) === String(currentUserId);

  const startEdit = (c) => {
    setEditingCommentId(c.COMMENT_ID);
    setEditedText(c.COMMENT_TEXT || "");
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditedText("");
  };

  const handleSaveEdit = async (c) => {
    try {
      await updateComment.mutateAsync({
        commentId: c.COMMENT_ID,
        ticketId,
        COMMENT_TEXT: editedText,
      });
      cancelEdit();
    } catch (error) {
      toast.error(error?.message || "Failed to update comment.");
    }
  };

  const handleDeleteComment = async (c) => {
    const confirmed = await showConfirmation({
      title: "Delete comment?",
      description:
        "This will remove the comment from the thread. This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!confirmed) return;
    try {
      await deleteComment.mutateAsync({ commentId: c.COMMENT_ID, ticketId });
      toast.success("Comment deleted.");
    } catch (error) {
      toast.error(error?.message || "Failed to delete comment.");
    }
  };

  const cannedOpts = cannedResponses.map((c) => ({
    value: String(c.RESPONSE_ID),
    label: c.TITLE,
  }));

  // Matching-category responses first, then general (no category). Responses
  // with a different category are excluded entirely.
  const matchingCannedOpts = ticketCategoryId
    ? cannedResponses
        .filter((r) => String(r.CATEGORY_ID) === String(ticketCategoryId))
        .map((r) => ({ value: String(r.RESPONSE_ID), label: r.TITLE }))
    : [];
  const generalCannedOpts = cannedResponses
    .filter((r) => r.CATEGORY_ID == null)
    .map((r) => ({ value: String(r.RESPONSE_ID), label: r.TITLE }));

  const handleCannedSelect = (id) => {
    setCannedId(id);
    const found = cannedResponses.find((c) => String(c.RESPONSE_ID) === id);
    if (found) setText(found.BODY);
  };

  const handleSubmit = () => {
    if (!text.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }
    addComment.mutate(
      {
        ticketId,
        data: {
          COMMENT_TEXT: text,
          AUTHOR_TYPE: canManage ? "AGENT" : "USER",
          IS_INTERNAL: isInternal ? "Y" : "N",
          CANNED_RESPONSE_ID: cannedId || null,
        },
      },
      {
        onSuccess: () => {
          setText("");
          setIsInternal(false);
          setCannedId("");
        },
        onError: (err) => toast.error(err?.message || "Failed to add comment."),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4 md:p-5">
        <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground">No comments yet.</p>
          )}
          {comments.map((c) => {
            const internal = c.IS_INTERNAL === "Y";
            const authorName =
              userMap[c.AUTHOR_ID] ||
              `${c.AUTHOR_TYPE}${c.AUTHOR_ID ? ` #${c.AUTHOR_ID}` : ""}`;
            return (
              <div key={c.COMMENT_ID} className="flex gap-3">
                <Avatar name={authorName} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                      {authorName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {fmtDateTime(c.CREATED_AT)}
                    </span>
                    {c.UPDATED_AT && (
                      <span className="text-[10px] text-muted-foreground">
                        (edited)
                      </span>
                    )}
                    {internal && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-warning-foreground bg-warning/10 border border-warning/20 rounded-full px-2 py-0.5">
                        <Lock size={9} />
                        Internal Note
                      </span>
                    )}
                    {isOwner(c) && (
                      <div className="flex items-center gap-1 ml-auto shrink-0">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit comment"
                          className="text-muted-foreground"
                          disabled={updateComment.isPending}
                          onClick={() => startEdit(c)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete comment"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={deleteComment.isPending}
                          onClick={() => handleDeleteComment(c)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    )}
                  </div>
                  {editingCommentId === c.COMMENT_ID ? (
                    <div
                      className={`mt-1.5 rounded-xl border px-3.5 py-2.5 ${
                        internal
                          ? "bg-warning/5 border-warning/20"
                          : "bg-accent border-primary/10"
                      }`}
                    >
                      <Textarea
                        autoFocus
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={3}
                        className="resize-none text-sm border-0 shadow-none focus-visible:ring-0 p-0 bg-transparent leading-relaxed"
                      />
                      <div className="flex justify-end gap-1.5 mt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={updateComment.isPending}
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            updateComment.isPending || !editedText.trim()
                          }
                          onClick={() => handleSaveEdit(c)}
                        >
                          {updateComment.isPending ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`mt-1.5 rounded-tl-none   rounded-xl border px-3.5 py-2.5 text-sm text-foreground whitespace-pre-wrap leading-relaxed ${
                        internal
                          ? "bg-warning/5 border-warning/20"
                          : "bg-accent border-primary/10"
                      }`}
                    >
                      {c.COMMENT_TEXT}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Textarea
          placeholder="Type your message here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="resize-none text-sm border-0 shadow-none focus-visible:ring-0 px-4 py-3.5"
        />
        <div className="flex items-center flex-wrap justify-between gap-3 border-t border-border px-3 py-2.5">
          <div className="flex items-center flex-wrap gap-2 min-w-0">
            {canManage && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <Checkbox
                  checked={isInternal}
                  onCheckedChange={setIsInternal}
                />
                Internal Note
              </label>
            )}
            {canManage && cannedOpts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <Zap size={13} />
                    Canned Responses
                    <ChevronDown size={13} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {matchingCannedOpts.length === 0 &&
                  generalCannedOpts.length === 0 ? (
                    <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                      No canned responses for this category.
                    </div>
                  ) : (
                    <>
                      {matchingCannedOpts.length > 0 &&
                        generalCannedOpts.length > 0 && (
                          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                            Matching category
                          </DropdownMenuLabel>
                        )}
                      {matchingCannedOpts.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onSelect={() => handleCannedSelect(opt.value)}
                        >
                          {opt.label}
                        </DropdownMenuItem>
                      ))}
                      {matchingCannedOpts.length > 0 &&
                        generalCannedOpts.length > 0 && (
                          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                            General
                          </DropdownMenuLabel>
                        )}
                      {generalCannedOpts.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onSelect={() => handleCannedSelect(opt.value)}
                        >
                          {opt.label}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* <Button variant="ghost" size="icon-sm" title="Attach file" className="text-muted-foreground">
              <Paperclip size={15} />
            </Button> */}
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={addComment.isPending}
              className="rounded-full"
            >
              {addComment.isPending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationDialog />
    </div>
  );
}
