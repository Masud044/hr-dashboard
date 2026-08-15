// src/features/ticketing/components/CommentThread.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import { Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import EntityCombobox from "@/components/shared/entity-combobox";
import { getAvatarColor } from "@/lib/avatar-utils";
import { useAddComment, useCannedResponses } from "../queries";
import { fmtDateTime } from "../lib/ticket-utils";

function initials(label = "") {
  return label.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function Avatar({ name }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white shrink-0 h-7 w-7 text-[11px] font-semibold"
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {initials(name || "?")}
    </span>
  );
}

/**
 * props:
 *  - ticketId, comments, userMap (id -> username)
 *  - canManage: shows "Internal note" toggle + canned response picker
 */
export default function CommentThread({ ticketId, comments = [], userMap = {}, canManage = false }) {
  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [cannedId, setCannedId] = useState("");

  const addComment = useAddComment();
  const { data: cannedResponses = [] } = useCannedResponses();

  const cannedOpts = cannedResponses.map((c) => ({ value: String(c.RESPONSE_ID), label: c.TITLE }));

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
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {comments.length === 0 && (
          <p className="text-xs text-muted-foreground">No comments yet.</p>
        )}
        {comments.map((c) => {
          const internal = c.IS_INTERNAL === "Y";
          const authorName = userMap[c.AUTHOR_ID] || `${c.AUTHOR_TYPE}${c.AUTHOR_ID ? ` #${c.AUTHOR_ID}` : ""}`;
          return (
            <div
              key={c.COMMENT_ID}
              className={`flex gap-2.5 rounded-lg p-2.5 border ${
                internal ? "bg-amber-500/5 border-amber-500/20" : "bg-secondary/50 border-border"
              }`}
            >
              <Avatar name={authorName} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">{authorName}</span>
                  {internal && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-full px-1.5 py-0.5">
                      <Lock size={9} /> Internal
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground">{fmtDateTime(c.CREATED_AT)}</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap mt-0.5">{c.COMMENT_TEXT}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        {canManage && cannedOpts.length > 0 && (
          <EntityCombobox
            items={cannedOpts}
            value={cannedId}
            onValueChange={handleCannedSelect}
            placeholder="Insert canned response..."
            size="sm"
            className="w-full"
          />
        )}

        <Textarea
          placeholder="Write a reply..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />

        <div className="flex items-center justify-between">
          {canManage ? (
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <Checkbox checked={isInternal} onCheckedChange={setIsInternal} />
              Internal note (not visible to requester)
            </label>
          ) : (
            <span />
          )}

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={addComment.isPending}
            className="rounded-full gap-1.5"
          >
            <Send size={13} />
            {addComment.isPending ? "Sending..." : "Reply"}
          </Button>
        </div>
      </div>
    </div>
  );
}