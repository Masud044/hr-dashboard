// TaskHoverCard.jsx
// File path: src/components/TaskHoverCard.jsx

import React from "react";
import moment from "moment";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Calendar } from "lucide-react";

const TaskHoverCard = ({
  item,
  itemContext,
  getItemProps,
  groups,
  holidayDates,
  projectName,
}) => {
  const getDateColor = (bgColor) => {
    if (!bgColor) return "rgba(255,255,255,0.9)";
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.92)";
  };

  const barColor = item.itemProps?.style?.background;
  const dateColor = getDateColor(barColor);

  const startDate = moment(item.start_time);
  const endDate = moment(item.end_time);
  const totalDays = endDate.diff(startDate, "days") + 1;

  let holidayCount = 0;
  const startDay = moment(item.start_time).startOf("day");
  const endDay = moment(item.end_time).startOf("day");
  let currentDate = startDay.clone();

  while (currentDate.isSameOrBefore(endDay, "day")) {
    const dateStr = currentDate.format("YYYY-MM-DD");
    if (holidayDates && holidayDates.has(dateStr)) {
      holidayCount++;
    }
    currentDate.add(1, "day");
  }

  const workingDays = totalDays - holidayCount;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          {...getItemProps({
            style: {
              ...item.itemProps.style,
              cursor: "pointer",
              overflow: "hidden",
              position: "relative",
            },
            className: "group rounded-sm transition-all hover:brightness-95",
          })}
        >
          {/* ✅ LEFT resize handle — restores drag-to-resize */}
          {itemContext.useResizeHandle && (
            <div
              className="rct-item-handler rct-item-handler-left"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "10px",
                height: "100%",
                cursor: "w-resize",
                zIndex: 10,
              }}
            />
          )}

          {/* ✅ RIGHT resize handle — restores drag-to-resize */}
          {itemContext.useResizeHandle && (
            <div
              className="rct-item-handler rct-item-handler-right"
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "10px",
                height: "100%",
                cursor: "e-resize",
                zIndex: 10,
              }}
            />
          )}

          {/* Content */}
          <div
            style={{
              height: itemContext.dimensions.height,
              display: "flex",
              alignItems: "center",
              paddingLeft: "6px",
              paddingRight: "6px",
              overflow: "hidden",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                overflow: "hidden",
                lineHeight: 1.1,
              }}
            >
              {/* Project Name */}
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: dateColor,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textShadow: dateColor.includes("255,255,255")
                    ? "0 1px 2px rgba(0,0,0,0.4)"
                    : "0 1px 2px rgba(255,255,255,0.3)",
                }}
              >
                {projectName || itemContext.title}
              </span>

              {/* Contractor Name */}
              {item.contractorName && (
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 500,
                    color: dateColor,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.contractorName}
                </span>
              )}

              {/* Date + Working Days */}
              <span
                style={{
                  fontSize: "8px",
                  fontWeight: 500,
                  color: dateColor,
                  whiteSpace: "nowrap",
                  textShadow: dateColor.includes("255,255,255")
                    ? "0 1px 2px rgba(0,0,0,0.4)"
                    : "0 1px 2px rgba(255,255,255,0.3)",
                }}
              >
                {moment(item.start_time).format("MMM D")} –{" "}
                {moment(item.end_time).format("MMM D")} • {workingDays} WD
              </span>
            </div>
          </div>
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        className="w-72 p-0 rounded-lg border border-border bg-card text-card-foreground shadow-sm"
        side="top"
        align="center"
      >
        <div className="flex flex-col">
          {/* Date Range */}
          <div className="px-4 py-3 flex items-center gap-2.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <span className="font-medium">{startDate.format("MMM D")}</span>
              <span className="text-muted-foreground">–</span>
              <span className="font-medium">
                {endDate.format("MMM D, YYYY")}
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 divide-x divide-border/20 border-t border-border/20 bg-muted/20">
            <div className="flex flex-col items-center justify-center py-1.5">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Total
              </span>
              <div className="text-xs font-semibold text-foreground mt-0.5">
                {totalDays}d
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-1.5">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Work
              </span>
              <div className="text-xs font-semibold text-foreground mt-0.5">
                {workingDays}d
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-1.5">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Off
              </span>
              <div
                className={`text-xs font-semibold mt-0.5 ${
                  holidayCount > 0 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
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