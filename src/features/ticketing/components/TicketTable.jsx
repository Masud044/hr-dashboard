// src/features/ticketing/components/TicketTable.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Eye, AlertTriangle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
import WrappedName from "@/components/shared/WrappedName";
import { cn } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import TicketTypeBadge from "./TicketTypeBadge";
import { fmtDateTime, isOverdue } from "../lib/ticket-utils";

/**
 * props:
 *  - data, isLoading
 *  - pagination, setPagination, total
 *  - tableKey (persisted page size)
 *
 * Note: userMap / workerMap / showWorkerColumn are accepted by callers but no
 * longer rendered here — created-by/contractor/owner/category/created/worker
 * details live on the ticket detail page.
 */
export default function TicketTable({
  data = [],
  isLoading,
  pagination,
  setPagination,
  total = 0,
  tableKey = "tickets",
}) {
  const navigate = useNavigate();
  const goToTicket = (ticketId) => navigate(`/dashboard/tickets/${ticketId}`);

  const columns = useMemo(() => {
    const base = [
      {
        accessorKey: "TICKET_NUMBER",
        header: "Ticket #",
        cell: ({ row }) => (
          <span className="text-sm font-mono font-semibold text-foreground">
            {row.original.TICKET_NUMBER}
          </span>
        ),
      },
      {
        accessorKey: "SUBJECT",
        header: "Subject",
        cell: ({ row }) => (
          <WrappedName
            name={row.original.SUBJECT}
            size="sm"
           maxLines={1}
            maxChars={40}
          />
        ),
      },
      {
        accessorKey: "PROJECT_NAME",
        header: "Project",
        cell: ({ row }) => (
          <WrappedName
            name={row.original.PROJECT_NAME || "General"}
            size="sm"
            maxLines={2}
            maxChars={80}
          />
        ),
      },
      {
        accessorKey: "TICKET_TYPE",
        header: "Type",
        cell: ({ row }) => <TicketTypeBadge type={row.original.TICKET_TYPE} />,
      },
      {
        accessorKey: "PRIORITY_NAME",
        header: "Priority",
        cell: ({ row }) => <PriorityBadge priority={row.original.PRIORITY_NAME} />,
      },
      {
        accessorKey: "STATUS_NAME",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.STATUS_NAME} />,
      },
      {
        accessorKey: "DUE_DATE",
        header: "Due",
        cell: ({ row }) => {
          const overdue = isOverdue(row.original);
          return (
            <div className={`text-sm flex items-center gap-1.5 ${overdue ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
              {overdue && <AlertTriangle size={13} />}
              {fmtDateTime(row.original.DUE_DATE)}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToTicket(row.original.TICKET_ID);
              }}
              title="View"
              className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-all duration-150"
            >
              <Eye size={15} />
            </button>
          </div>
        ),
      },
    ];

    return base;
  }, [goToTicket]);

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount: Math.ceil(total / (pagination.pageSize || 1)),
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="rounded-md border border-border overflow-hidden bg-card shadow-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="border-b border-dashed border-border bg-secondary/60 hover:bg-secondary/60">
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "px-4 py-3 font-bold text-foreground",
                      header.column.id === "actions" &&
                        "sticky right-0 z-20 bg-secondary text-center border-l border-border shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)]"
                    )}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24 text-sm text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && table.getRowModel().rows?.length
              ? table.getRowModel().rows.map((row) => {
                  const overdue = isOverdue(row.original);
                  // DESIGN.md striping: odd rows Surface (bg-card), even rows Background
                  // (#FAFAFA). "!" beats the shared TableBody's nth-child(even) tint so
                  // striping is owned entirely by this component.
                  const stripeBg = row.index % 2 === 1 ? "bg-background!" : "bg-card!";
                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => goToTicket(row.original.TICKET_ID)}
                      className={cn(
                        "group border-b border-border transition-colors cursor-pointer",
                        stripeBg,
                        overdue && "bg-red-500/5!",
                        "hover:bg-muted!"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-4 py-3 align-middle",
                            cell.column.id === "actions" &&
                              cn(
                                "sticky right-0 z-10 border-l border-border shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)] group-hover:bg-muted!",
                                stripeBg
                              )
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              : !isLoading && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center h-24 text-sm text-muted-foreground">
                      No tickets found.
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-border">
        <DataTablePaginationTwo table={table} tableKey={tableKey} />
      </div>
    </>
  );
}
