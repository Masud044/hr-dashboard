// src/features/ticketing/components/TicketTypeBadge.jsx
import { Badge } from "@/components/ui/badge";
import { Calculator, FileText, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

const TICKET_TYPE_LABELS = {
  CHANGE_REQUEST: "Change Request",
  VARIATION: "Variation",
  SPECIAL_NOTE: "Special Note",
};

const ICONS = {
  CHANGE_REQUEST: FileText,
  VARIATION: Calculator,
  SPECIAL_NOTE: StickyNote,
};

// Calm neutral pill; the icon + text tint carries the type distinction.
const STYLES = {
  CHANGE_REQUEST: "bg-secondary text-primary border-border",
  VARIATION: "bg-secondary text-amber-600 border-border",
  SPECIAL_NOTE: "bg-secondary text-violet-600 border-border",
};

export default function TicketTypeBadge({ type, className }) {
  if (!type) return <span className="text-muted-foreground text-xs">—</span>;
  const style = STYLES[type] ?? "bg-secondary text-foreground border-border";
  const label = TICKET_TYPE_LABELS[type] ?? type;
  const Icon = ICONS[type];

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", style, className)}
    >
      {Icon && <Icon size={12} />}
      {label}
    </Badge>
  );
}
