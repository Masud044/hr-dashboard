// src/features/selection/selection-note-history.jsx
import { History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { fmtDateTime } from "@/features/ticketing/lib/ticket-utils";

export function SelectionNoteHistory({ history }) {
  if (!Array.isArray(history) || history.length === 0) return null;

  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        <History
          size={13}
          aria-hidden="true"
          className="shrink-0 text-muted-foreground"
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Previous notes
        </span>
      </div>

      <div className="mt-2 space-y-3">
        {history.map((entry) => (
          <div key={entry.ID}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs font-semibold">
                Round {entry.ROUND_NO}
              </Badge>
              <span className="text-[13px] text-muted-foreground">
                {fmtDateTime(entry.SAVED_DATE)}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-[15px] text-foreground">
              {entry.NOTE}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
