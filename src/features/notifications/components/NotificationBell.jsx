// src/features/notifications/components/NotificationBell.jsx
import { useState } from "react";
import { BellIcon, CheckCheckIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  formatRelativeTime,
} from "../queries";

const BELL_PAGE_SIZE = 8;

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: listData, isLoading } = useNotifications({
    pageIndex: 0,
    pageSize: BELL_PAGE_SIZE,
  });
  const { data: unreadCount = 0 } = useUnreadCount();

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = listData?.data || [];
  const hasUnread = unreadCount > 0;
  const busy = markAllAsRead.isPending;

  const handleOpenNotification = (n) => {
    if (n.IS_READ !== "Y") markAsRead.mutate(n.NOTIFICATION_ID);
    setOpen(false);
    if (n.LINK) {
      if (/^https?:\/\//i.test(n.LINK)) {
        window.open(n.LINK, "_blank", "noopener,noreferrer");
      } else {
        navigate(n.LINK);
      }
    }
  };

  const handleMarkAll = () => {
    if (!hasUnread || busy) return;
    markAllAsRead.mutate();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20"
        >
          <BellIcon className="size-[18px]" />
          {hasUnread && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white ring-2 ring-card">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 max-w-[calc(100vw-2rem)] rounded-md border-border shadow-lg p-0 overflow-hidden z-[200]"
        sideOffset={4}
        align="end"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">
            Notifications
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAll}
            disabled={!hasUnread || busy}
            className="h-7 gap-1.5 px-2 text-xs font-medium text-primary hover:text-primary"
          >
            <CheckCheckIcon className="size-3.5" />
            Mark all as read
          </Button>
        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* ── List ── */}
        {isLoading ? (
          <div className="space-y-0 divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 px-4 py-3">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Empty className="gap-3 rounded-none border-0 p-6 md:p-6">
            <EmptyTitle className="text-sm font-semibold">
              No notifications yet
            </EmptyTitle>
            <EmptyDescription className="text-xs">
              You&apos;re all caught up — new activity will show up here.
            </EmptyDescription>
          </Empty>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <button
                  key={n.NOTIFICATION_ID}
                  type="button"
                  onClick={() => handleOpenNotification(n)}
                  className={cn(
                    "flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition-colors hover:bg-accent/60",
                    n.IS_READ !== "Y" && "bg-accent"
                  )}
                >
                  <span className="flex w-full items-center gap-2">
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-sm font-medium text-foreground",
                        n.IS_READ === "Y" && "font-normal"
                      )}
                    >
                      {n.TITLE}
                    </span>
                    {n.IS_READ !== "Y" && (
                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                    )}
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatRelativeTime(n.CREATED_AT)}
                    </span>
                  </span>
                  <span className="line-clamp-1 w-full text-xs text-muted-foreground">
                    {n.MESSAGE}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <DropdownMenuSeparator className="m-0" />

        {/* ── Footer ── */}
        <div className="p-1">
          <Button
            variant="ghost"
            className="h-9 w-full text-sm font-medium"
            onClick={() => {
              setOpen(false);
              navigate("/dashboard/notifications");
            }}
          >
            Show all
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
