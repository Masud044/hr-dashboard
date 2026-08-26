// src/features/ticketing/components/StatsSummary.jsx
import { Circle, Clock, AlertTriangle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

import { useTicketSummary } from "../queries";

// Soft pastel-tinted cards on light backgrounds, deep-toned cards on dark
// backgrounds — same accent family per stat, just adapted per theme via the
// dark: variant. Overdue (amber/orange) stays visually distinct from Urgent
// (red) in both modes.
const STATS = [
  {
    key: "open",
    label: "Open",
    Icon: Circle,
    card: "bg-teal-100 dark:bg-teal-950/30",
    labelColor: "text-teal-700/70 dark:text-white/70",
    numberColor: "text-teal-900 dark:text-white",
    iconWrap: "bg-teal-500/20 dark:bg-teal-500/20",
    iconColor: "text-teal-700 dark:text-teal-400",
  },
  {
    key: "active",
    label: "Active",
    Icon: Clock,
    card: "bg-amber-100 dark:bg-amber-950/30",
    labelColor: "text-amber-700/70 dark:text-white/70",
    numberColor: "text-amber-900 dark:text-white",
    iconWrap: "bg-amber-500/20 dark:bg-amber-500/20",
    iconColor: "text-amber-700 dark:text-amber-400",
  },
  {
    key: "overdue",
    label: "Overdue",
    Icon: AlertTriangle,
    card: "bg-red-50 dark:bg-red-950/30",
    labelColor: "text-red-600/70 dark:text-white/70",
    numberColor: "text-red-800 dark:text-white",
    iconWrap: "bg-red-500/15 dark:bg-red-500/15",
    iconColor: "text-red-600 dark:text-red-400",
  },
  {
    key: "urgent",
    label: "Urgent",
    Icon: Flame,
    card: "bg-red-100 dark:bg-red-950/30",
    labelColor: "text-red-700/70 dark:text-white/70",
    numberColor: "text-red-900 dark:text-white",
    iconWrap: "bg-red-500/20 dark:bg-red-500/20",
    iconColor: "text-red-700 dark:text-red-400",
  },
];

export default function StatsSummary({ className }) {
  const { data, isLoading } = useTicketSummary();

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {STATS.map(({ key, label, Icon, card, labelColor, numberColor, iconWrap, iconColor }) => (
        <div
          key={key}
          className={cn(
            "rounded-lg p-4 flex items-start justify-between gap-3 transition-transform hover:-translate-y-0.5 hover:shadow-lg",
            card
          )}
        >
          <div className="min-w-0">
            <p className={cn("text-sm font-medium", labelColor)}>{label}</p>
            <p
              className={cn(
                "mt-2 text-2xl font-bold tracking-tight tabular-nums",
                isLoading ? "text-muted-foreground" : numberColor
              )}
            >
              {isLoading ? "—" : (data?.[key] ?? 0)}
            </p>
          </div>
          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", iconWrap)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        </div>
      ))}
    </div>
  );
}