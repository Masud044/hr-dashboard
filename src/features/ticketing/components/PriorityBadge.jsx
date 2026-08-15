// src/features/ticketing/components/PriorityBadge.jsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Keyed on PRIORITY_NAME as returned by the backend (ticket_priorities.priority_name)
const STYLES = {
  LOW: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  HIGH: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  URGENT: "bg-red-500/10 text-red-600 border-red-500/20",
  CRITICAL: "bg-red-600/15 text-red-700 border-red-600/30",
};

export default function PriorityBadge({ priority, className }) {
  if (!priority) return <span className="text-muted-foreground text-xs">—</span>;
  const key = priority.toUpperCase();
  const style = STYLES[key] ?? "bg-secondary text-foreground border-border";

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", style, className)}
    >
      {priority}
    </Badge>
  );
}