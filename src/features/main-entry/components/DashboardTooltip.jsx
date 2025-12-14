// TaskHoverCard.jsx
// File path: src/components/TaskHoverCard.jsx

import React from "react";
import moment from "moment";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Calendar, User, Clock, Briefcase } from "lucide-react";

const TaskHoverCard = ({ item, itemContext, getItemProps, groups, holidayDates }) => {
  // --- Logic Layer ---
  const contractor = groups.find((g) => g.id === item.group);
  const contractorName = contractor?.title || "Unknown";

  const startDate = moment(item.start_time);
  const endDate = moment(item.end_time);
  const totalDays = endDate.diff(startDate, "days") + 1;

  let holidayCount = 0;
  let currentDate = startDate.clone();

  while (currentDate.isSameOrBefore(endDate, "day")) {
    const dateStr = currentDate.format("YYYY-MM-DD");
    if (holidayDates && holidayDates.has(dateStr)) {
      holidayCount++;
    }
    currentDate.add(1, "day");
  }

  const workingDays = totalDays - holidayCount;
  // -------------------

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          {...getItemProps({
            style: {
              ...item.itemProps.style,
              cursor: "pointer",
            },
            className: "group rounded-sm transition-all hover:brightness-95",
          })}
        >
          <div
            className="flex items-center px-2 truncate text-xs font-medium text-foreground"
            style={{
              height: itemContext.dimensions.height,
              lineHeight: `${itemContext.dimensions.height}px`,
            }}
          >
            {itemContext.title}
          </div>
        </div>
      </HoverCardTrigger>

      <HoverCardContent 
        className="w-72 p-0 rounded-lg border border-border bg-card text-card-foreground shadow-sm" 
        side="top" 
        align="center"
      >
        <div className="flex flex-col">
          
          {/* Header Section */}
          <div className="px-4 py-3 border-b border-border/50">
            <h4 className="text-sm font-medium text-foreground leading-tight">
              {itemContext.title}
            </h4>
            <div className="flex items-center gap-2 mt-1.5">
              <User className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{contractorName}</span>
            </div>
          </div>

          {/* Date Range Section */}
          <div className="px-4 py-3 flex items-center gap-2.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <span className="font-medium">{startDate.format("MMM D")}</span>
              <span className="text-muted-foreground">–</span>
              <span className="font-medium">{endDate.format("MMM D, YYYY")}</span>
            </div>
          </div>

          {/* Metrics Grid - Clean, Divided, No Backgrounds */}
          <div className="grid grid-cols-3 divide-x divide-border/20 border-t border-border/20 bg-muted/20">
            
            <div className="flex flex-col items-center justify-center py-1.5">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</span>
              <div className="text-xs font-semibold text-foreground mt-0.5">
                {totalDays}d
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-1.5">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Work</span>
              <div className="text-xs font-semibold text-foreground mt-0.5">
                {workingDays}d
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-1.5">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Off</span>
              <div className={`text-xs font-semibold mt-0.5 ${holidayCount > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {holidayCount}d
              </div>
            </div>

          </div>

        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default TaskHoverCard;