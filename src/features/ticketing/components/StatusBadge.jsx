// src/features/ticketing/components/StatusBadge.jsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Keyed on STATUS_NAME as returned by the backend (ticket_statuses.status_name)
const STYLES = {
  NEW: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  OPEN: "bg-primary/10 text-primary border-primary/20",
  PENDING_USER: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  CLOSED: "bg-muted text-muted-foreground border-border",
};

const LABELS = {
  NEW: "New",
  OPEN: "Open",
  PENDING_USER: "Pending You",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export default function StatusBadge({ status, className }) {
  if (!status) return <span className="text-muted-foreground text-xs">—</span>;
  const style = STYLES[status] ?? "bg-secondary text-foreground border-border";
  const label = LABELS[status] ?? status;

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", style, className)}
    >
      {label}
    </Badge>
  );
}