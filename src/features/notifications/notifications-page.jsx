// src/features/notifications/notifications-page.jsx
import { useMemo, useState } from "react";
import { CheckCheckIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SectionContainer } from "@/components/SectionContainer";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  formatRelativeTime,
} from "./queries";

const PAGE_SIZE = 10;

const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });

  const { data, isLoading } = useNotifications(pagination);
  const { data: unreadCount = 0 } = useUnreadCount();

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.data || [];
  const total = data?.total || 0;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );
  const hasUnread = unreadCount > 0;
  const busy = markAllAsRead.isPending;

  const goToPage = (pageIndex) => {
    const clamped = Math.min(Math.max(0, pageIndex), totalPages - 1);
    setPagination((p) => ({ ...p, pageIndex: clamped }));
  };

  const handleOpenNotification = (n) => {
    if (n.IS_READ !== "Y") markAsRead.mutate(n.NOTIFICATION_ID);
    if (n.LINK) {
      if (/^https?:\/\//i.test(n.LINK)) {
        window.open(n.LINK, "_blank", "noopener,noreferrer");
      } else {
        navigate(n.LINK);
      }
    }
  };

  return (
    <SectionContainer variant="dashboard">
      <div className="bg-card rounded-md shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-lg md:text-2xl font-semibold tracking-tight">
              Notifications
            </h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Notifications</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Button
            variant="outline"
            onClick={() => markAllAsRead.mutate()}
            disabled={!hasUnread || busy}
            className="shrink-0"
          >
            <CheckCheckIcon className="size-4" />
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-md shadow-sm p-4">
        {isLoading ? (
          <div className="space-y-0 divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-3.5 w-2/5" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Empty className="rounded-none border-0">
            <EmptyTitle>No notifications yet</EmptyTitle>
            <EmptyDescription>
              When something needs your attention, it will show up here.
            </EmptyDescription>
          </Empty>
        ) : (
          <>
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <button
                  key={n.NOTIFICATION_ID}
                  type="button"
                  onClick={() => handleOpenNotification(n)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/60 sm:px-5 sm:py-4",
                    n.IS_READ !== "Y" && "bg-accent"
                  )}
                >
                  {n.IS_READ !== "Y" && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-sm font-medium text-foreground",
                          n.IS_READ === "Y" && "font-normal"
                        )}
                      >
                        {n.TITLE}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeTime(n.CREATED_AT)}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {n.MESSAGE}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="pt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(pagination.pageIndex - 1);
                      }}
                      aria-disabled={pagination.pageIndex === 0}
                      className={
                        pagination.pageIndex === 0
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {getPageNumbers(pagination.pageIndex + 1, totalPages).map(
                    (p, i) =>
                      p === "…" ? (
                        <PaginationItem key={`e-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === pagination.pageIndex + 1}
                            onClick={(e) => {
                              e.preventDefault();
                              goToPage(p - 1);
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(pagination.pageIndex + 1);
                      }}
                      aria-disabled={pagination.pageIndex >= totalPages - 1}
                      className={
                        pagination.pageIndex >= totalPages - 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </SectionContainer>
  );
}
