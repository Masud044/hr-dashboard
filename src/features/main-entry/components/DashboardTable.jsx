"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Pencil, Trash2, ArrowUpDown, ChevronDown, LayoutDashboard, AlertTriangle, Search } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/DataTablePagination";
import { EditDashboardHeaderSheet } from "../pages/EditDashboardHeaderSheet";
import axios from "axios";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function DashboardTable() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/shedule`);
      const fetchedData = res.data?.data || [];
      fetchedData.sort((a, b) => (Number(b.H_ID) || 0) - (Number(a.H_ID) || 0));
      return fetchedData;
    },
  });

  const apiData = data || [];

  const [sorting, setSorting]                   = React.useState([]);
  const [columnFilters, setColumnFilters]       = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection]         = React.useState({});
  const [editSheetOpen, setEditSheetOpen]       = React.useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = React.useState(null);
  const [deleteModal, setDeleteModal]           = React.useState({ open: false, item: null });

  const deleteMutation = useMutation({
    mutationFn: async (hId) => {
      const res = await axios.delete(`${url}/api/shedule`, { data: { H_ID: hId } });
      if (res.data?.success === false) throw new Error(res.data?.message || "Delete failed");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["schedules"]);
      queryClient.invalidateQueries(["allSchedules"]);
      toast.success("Schedule deleted successfully!");
      setDeleteModal({ open: false, item: null });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete schedule.");
    },
  });

  const handleDeleteClick   = (item) => setDeleteModal({ open: true, item });
  const handleDeleteConfirm = () => {
    if (deleteModal.item?.H_ID) deleteMutation.mutate(deleteModal.item.H_ID);
  };
  const handleDeleteCancel  = () => setDeleteModal({ open: false, item: null });
  const handleEdit = (scheduleId) => {
    setSelectedScheduleId(scheduleId);
    setEditSheetOpen(true);
  };

  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-border"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-border"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "P_NAME",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-overline text-muted-foreground hover:text-foreground transition-colors"
        >
          Project Name
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-foreground w-[110px] leading-snug break-words whitespace-normal">
      {row.getValue("P_NAME") || "—"}
    </div>
      ),
    },
    {
      accessorKey: "DESCRIPTION",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-overline text-muted-foreground hover:text-foreground transition-colors"
        >
          Description
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[200px] truncate">
          {row.getValue("DESCRIPTION") || "—"}
        </div>
      ),
    },
        {
      accessorKey: "PROJECT_START_PLAN",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-overline text-muted-foreground hover:text-foreground transition-colors"
        >
          Project Start Plan
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => {
        const val = row.getValue("PROJECT_START_PLAN");
        if (!val) return <span className="text-sm text-muted-foreground">Not set</span>;
        const d = new Date(val);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const parts = dateStr.split(', ');
        return (
          <span className="inline-flex flex-col gap-2 pl-2 pr-5 py-2 rounded-xs text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 leading-tight">
            <span>{parts[0]},</span>
            <span>{parts[1]}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "PROJECT_END_PLAN",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-overline text-muted-foreground hover:text-foreground transition-colors"
        >
          Project End Plan
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => {
        const val = row.getValue("PROJECT_END_PLAN");
        if (!val) return <span className="text-sm text-muted-foreground">Not set</span>;
        const d = new Date(val);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const parts = dateStr.split(', ');
        return (
          <span className="inline-flex flex-col gap-2 pl-2 pr-5 py-2 rounded-xs text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300 leading-tight">
            <span>{parts[0]},</span>
            <span>{parts[1]}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "CREATION_DATE",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-overline text-muted-foreground hover:text-foreground transition-colors"
        >
          Created Date
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => {
        const val = row.getValue("CREATION_DATE");
        if (!val) return <span className="text-sm text-muted-foreground">—</span>;
        const d = new Date(val);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const parts = dateStr.split(', ');
        return (
          <div className="flex flex-col gap-2 text-sm text-muted-foreground leading-tight">
            <span>{parts[0]},</span>
            <span>{parts[1]}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => (
        <div className="text-overline text-muted-foreground text-center">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={() => handleEdit(item.H_ID)}
              title="Edit"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all"
            >
              <Pencil size={14} />
            </button>

            <Link to={`/dashboard/timeline/${item.H_ID}`}>
              <button
                title="Open timeline dashboard"
                className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium border border-border bg-transparent text-foreground hover:bg-muted/50 transition-all"
              >
                <LayoutDashboard size={13} />
                Dashboard
              </button>
            </Link>

            <button
              onClick={() => handleDeleteClick(item)}
              title="Delete"
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: apiData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Filter by project name..."
              value={table.getColumn("P_NAME")?.getFilterValue() ?? ""}
              onChange={(e) => table.getColumn("P_NAME")?.setFilterValue(e.target.value)}
              className="pl-9 h-10 text-sm bg-card border-border rounded-md"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto h-10 text-sm border-border rounded-md gap-1.5 bg-transparent"
              >
                <LayoutDashboard size={14} />
                Columns
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className=" bg-card border-border">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize text-sm"
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow
                  key={group.id}
                  className="border-b border-border bg-muted/20"
                >
                  {group.headers.map((header) => (
                    <TableHead key={header.id} className="px-4 py-3 font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24 text-sm text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24 text-sm text-muted-foreground">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-0 border-t border-border">
          <DataTablePagination table={table} />
        </div>
      </div>

      <EditDashboardHeaderSheet
        isOpen={editSheetOpen}
        onClose={() => {
          setEditSheetOpen(false);
          setSelectedScheduleId(null);
        }}
        scheduleId={selectedScheduleId}
      />

      {deleteModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-96 shadow-lg">
            <div className="flex items-start gap-3 mb-5">
              <div className="p-2 rounded-md bg-destructive/10 shrink-0">
                <AlertTriangle size={18} className="text-destructive" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Delete Schedule</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium text-foreground">
                    {deleteModal.item?.P_NAME || `H_ID: ${deleteModal.item?.H_ID}`}
                  </span>{" "}
                  এর schedule এবং সব lines permanently delete হয়ে যাবে। এই কাজ undo করা যাবে না।
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={deleteMutation.isPending}
                className="h-9 text-sm border-border"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="h-9 text-sm"
              >
                {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}