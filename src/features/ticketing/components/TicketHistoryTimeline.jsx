// src/features/ticketing/components/TicketHistoryTimeline.jsx
import { History, ArrowRight } from "lucide-react";
import { fmtDateTime } from "../lib/ticket-utils";

const ACTOR_LABEL = { USER: "User", AGENT: "Agent", SYSTEM: "System" };

/**
 * lookups: { statuses, priorities, categories } from useLookups() — used to
 * resolve STATUS_ID/PRIORITY_ID stored in old_value/new_value to names.
 * userMap: { [userId]: username } — used to resolve AGENT change ids.
 */
export default function TicketHistoryTimeline({ history = [], userMap = {},workerMap = {}, lookups = {} }) {
  if (!history.length) {
    return <p className="text-xs text-muted-foreground">No history yet.</p>;
  }

  const statusMap = Object.fromEntries((lookups.statuses || []).map((s) => [String(s.STATUS_ID), s.STATUS_NAME]));
  const priorityMap = Object.fromEntries((lookups.priorities || []).map((p) => [String(p.PRIORITY_ID), p.PRIORITY_NAME]));

  const resolveValue = (fieldChanged, raw) => {
    if (raw === null || raw === undefined || raw === "") return null;
    if (fieldChanged === "STATUS") return statusMap[String(raw)] || raw;
    if (fieldChanged === "PRIORITY") return priorityMap[String(raw)] || raw;
    // if (fieldChanged === "AGENT") return userMap[raw] || `User #${raw}`;
    if (fieldChanged === "TRADE_CONTACT") return workerMap[raw] || `Worker #${raw}`;
    return raw;
  };

  return (
    <div>
      {history.map((h, idx) => {
        const actorName =
          h.CHANGED_BY === "SYSTEM"
            ? "System"
            : userMap[h.CHANGED_BY_ID] || `${ACTOR_LABEL[h.CHANGED_BY] || h.CHANGED_BY}${h.CHANGED_BY_ID ? ` #${h.CHANGED_BY_ID}` : ""}`;

        const oldVal = resolveValue(h.FIELD_CHANGED, h.OLD_VALUE);
        const newVal = resolveValue(h.FIELD_CHANGED, h.NEW_VALUE);
        const fieldLabel = h.FIELD_CHANGED === "TRADE_CONTACT" ? "assigned worker" : h.FIELD_CHANGED?.toLowerCase();

        return (
          <div key={h.HISTORY_ID} className="relative flex gap-3 pb-5 last:pb-0">
            {idx < history.length - 1 && (
              <span aria-hidden className="absolute left-[11px] top-7 bottom-0 w-px bg-border" />
            )}
            <span className="relative z-10 shrink-0 size-6 rounded-full bg-secondary border border-border flex items-center justify-center">
              <History size={11} className="text-muted-foreground" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <p className="text-[13px] leading-snug text-foreground">
                  <span className="font-semibold">{actorName}</span>
                  <span className="text-muted-foreground"> changed </span>
                  <span className="font-medium">{fieldLabel}</span>
                </p>
                <span className="text-caption text-muted-foreground shrink-0">{fmtDateTime(h.CHANGED_AT)}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-caption">
                {oldVal && (
                  <>
                    <span className="rounded-xs border border-border bg-secondary text-muted-foreground px-1.5 py-0.5 line-through">
                      {oldVal}
                    </span>
                    <ArrowRight size={11} className="text-muted-foreground shrink-0" />
                  </>
                )}
                <span className="rounded-xs border border-border bg-card text-foreground font-medium px-1.5 py-0.5">
                  {newVal ?? "—"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}