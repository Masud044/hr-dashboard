// src/features/ticketing/components/PriorityBadge.jsx
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Flame, SignalHigh, SignalLow, SignalMedium } from "lucide-react";
import { cn } from "@/lib/utils";

// Keyed on PRIORITY_NAME as returned by the backend (ticket_priorities.priority_name)
// LOW–HIGH stay on a calm neutral pill, severity carried by the icon + text tint.
// URGENT/CRITICAL break the pattern with a solid Error fill so they demand attention.
const STYLES = {
  LOW: "bg-secondary text-muted-foreground border-border",
  MEDIUM: "bg-secondary text-amber-600 border-border",
  HIGH: "bg-secondary text-orange-600 border-border",
  URGENT: "border-transparent bg-destructive text-white",
  CRITICAL: "border-transparent bg-red-700 text-white",
};

const ICONS = {
  LOW: SignalLow,
  MEDIUM: SignalMedium,
  HIGH: SignalHigh,
  URGENT: AlertTriangle,
  CRITICAL: Flame,
};

export default function PriorityBadge({ priority, className }) {
  if (!priority) return <span className="text-muted-foreground text-xs">—</span>;
  const key = priority.toUpperCase();
  const style = STYLES[key] ?? "bg-secondary text-foreground border-border";
  const Icon = ICONS[key];

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", style, className)}
    >
      {Icon && <Icon size={12} />}
      {priority}
    </Badge>
  );
}