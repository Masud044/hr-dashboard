// src/features/ticketing/components/TicketHistoryTimeline.jsx
import { History } from "lucide-react";
import { fmtDateTime } from "../lib/ticket-utils";

const ACTOR_LABEL = { USER: "User", AGENT: "Agent", SYSTEM: "System" };

/**
 * lookups: { statuses, priorities, categories } from useLookups() — used to
 * resolve STATUS_ID/PRIORITY_ID stored in old_value/new_value to names.
 * userMap: { [userId]: username } — used to resolve AGENT change ids.
 */
export default function TicketHistoryTimeline({ history = [], userMap = {}, lookups = {} }) {
  if (!history.length) {
    return <p className="text-xs text-muted-foreground">No history yet.</p>;
  }

  const statusMap = Object.fromEntries((lookups.statuses || []).map((s) => [String(s.STATUS_ID), s.STATUS_NAME]));
  const priorityMap = Object.fromEntries((lookups.priorities || []).map((p) => [String(p.PRIORITY_ID), p.PRIORITY_NAME]));

  const resolveValue = (fieldChanged, raw) => {
    if (raw === null || raw === undefined || raw === "") return null;
    if (fieldChanged === "STATUS") return statusMap[String(raw)] || raw;
    if (fieldChanged === "PRIORITY") return priorityMap[String(raw)] || raw;
    if (fieldChanged === "AGENT") return userMap[raw] || `User #${raw}`;
    return raw;
  };

  return (
    <div className="space-y-3">
      {history.map((h) => {
        const actorName =
          h.CHANGED_BY === "SYSTEM"
            ? "System"
            : userMap[h.CHANGED_BY_ID] || `${ACTOR_LABEL[h.CHANGED_BY] || h.CHANGED_BY}${h.CHANGED_BY_ID ? ` #${h.CHANGED_BY_ID}` : ""}`;

        const oldVal = resolveValue(h.FIELD_CHANGED, h.OLD_VALUE);
        const newVal = resolveValue(h.FIELD_CHANGED, h.NEW_VALUE);
        const fieldLabel = h.FIELD_CHANGED === "AGENT" ? "assigned agent" : h.FIELD_CHANGED?.toLowerCase();

        return (
          <div key={h.HISTORY_ID} className="flex gap-2.5">
            <div className="shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center mt-0.5">
              <History size={11} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <p className="text-foreground">
                <span className="font-semibold">{actorName}</span>{" "}
                changed <span className="font-medium">{fieldLabel}</span>{" "}
                {oldVal && (
                  <>
                    from <span className="text-muted-foreground">{oldVal}</span>{" "}
                  </>
                )}
                to <span className="font-medium">{newVal ?? "—"}</span>
              </p>
              <span className="text-[11px] text-muted-foreground">{fmtDateTime(h.CHANGED_AT)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}