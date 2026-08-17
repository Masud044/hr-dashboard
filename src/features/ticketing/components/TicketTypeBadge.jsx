// src/features/ticketing/components/TicketTypeBadge.jsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TICKET_TYPE_LABELS = {
  CHANGE_REQUEST: "Change Request",
  VARIATION: "Variation",
  SPECIAL_NOTE: "Special Note",
};

const STYLES = {
  CHANGE_REQUEST: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  VARIATION: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  SPECIAL_NOTE: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

export default function TicketTypeBadge({ type, className }) {
  if (!type) return <span className="text-muted-foreground text-xs">—</span>;
  const style = STYLES[type] ?? "bg-secondary text-foreground border-border";
  const label = TICKET_TYPE_LABELS[type] ?? type;

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", style, className)}
    >
      {label}
    </Badge>
  );
}
