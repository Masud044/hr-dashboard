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
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import { fmtDate, fmtDateTime, isOverdue } from "../lib/ticket-utils";

/**
 * props:
 *  - data, isLoading
 *  - pagination, setPagination, total
 *  - userMap: { [id]: name } for requester/agent display
 *  - showAgentColumn (hide on "My Tickets")
 *  - tableKey (persisted page size)
 */
export default function TicketTable({
  data = [],
  isLoading,
  pagination,
  setPagination,
  total = 0,
  userMap = {},
  showAgentColumn = true,
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
          <div className="text-sm font-medium text-foreground max-w-[240px] truncate" title={row.original.SUBJECT}>
            {row.original.SUBJECT}
          </div>
        ),
      },
      {
        id: "requester",
        header: "Requested By",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {userMap[row.original.REQUESTED_FOR] || `ID: ${row.original.REQUESTED_FOR}`}
          </div>
        ),
      },
      {
        accessorKey: "CATEGORY_NAME",
        header: "Category",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">{row.original.CATEGORY_NAME || "—"}</div>
        ),
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
    ];

    if (showAgentColumn) {
      base.push({
        id: "agent",
        header: "Agent",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.AGENT_ID ? (userMap[row.original.AGENT_ID] || `ID: ${row.original.AGENT_ID}`) : "Unassigned"}
          </div>
        ),
      });
    }

    base.push(
      {
        accessorKey: "CREATED_AT",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">{fmtDate(row.original.CREATED_AT)}</div>
        ),
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
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              onClick={() => goToTicket(row.original.TICKET_ID)}
              title="View"
              className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-all duration-150"
            >
              <Eye size={15} />
            </button>
          </div>
        ),
      }
    );

    return base;
  }, [showAgentColumn, userMap, goToTicket]);

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
      <div className="rounded-lg border border-border overflow-hidden bg-card shadow-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="border-b border-dashed border-border bg-secondary/60 hover:bg-secondary/60">
                {group.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-3 font-bold text-foreground">
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
                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => goToTicket(row.original.TICKET_ID)}
                      className={`border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer ${
                        row.index % 2 === 1 ? "bg-muted/60" : ""
                      } ${overdue ? "bg-red-500/5" : ""}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-4 py-3 align-middle">
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