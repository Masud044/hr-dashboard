// src/features/ticketing/components/StatusBadge.jsx
import { Badge } from "@/components/ui/badge";
import { Archive, CheckCircle, Circle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Keyed on STATUS_NAME as returned by the backend (ticket_statuses.status_name)
// Calm neutral pills; the icon + text tint carries the state. Only CANCELLED
// breaks the pattern with a solid Error fill, as a terminal negative state.
const STYLES = {
  OPEN: "bg-secondary text-primary border-border",
  IN_REVIEW: "bg-secondary text-amber-600 border-border",
  ACKNOWLEDGED: "bg-secondary text-blue-600 border-border",
  CLOSED: "bg-secondary text-muted-foreground border-border",
  CANCELLED: "border-transparent bg-destructive text-white",
};

const LABELS = {
  OPEN: "Open",
  IN_REVIEW: "In Review",
  ACKNOWLEDGED: "Acknowledged",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

const ICONS = {
  OPEN: Circle,
  IN_REVIEW: Clock,
  ACKNOWLEDGED: CheckCircle,
  CLOSED: Archive,
  CANCELLED: XCircle,
};

export default function StatusBadge({ status, className }) {
  if (!status) return <span className="text-muted-foreground text-xs">—</span>;
  const style = STYLES[status] ?? "bg-secondary text-foreground border-border";
  const label = LABELS[status] ?? status;
  const Icon = ICONS[status];

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