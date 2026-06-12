import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Pencil, Trash2, ArrowUpDown, ChevronDown, PlusIcon } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/DataTablePagination";
import { EditCalendarSheet } from "./edit-calendar-sheet";
import { CreateCalendarSheet } from "./create-calendar-sheet";


const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ── Working status badge colour ───────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    WORKING:  "bg-green-100 text-green-700 border-green-200",
    HOLIDAY:  "bg-red-100 text-red-700 border-red-200",
    WEEKEND:  "bg-yellow-100 text-yellow-700 border-yellow-200",
    HALFDAY:  "bg-blue-100 text-blue-700 border-blue-200",
  };
  const cls = map[status?.toUpperCase()] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

// columns এর উপরে এই map টা add করো
const MONTH_NAMES = {
  1: "January", 2: "February", 3: "March",    4: "April",
  5: "May",     6: "June",     7: "July",      8: "August",
  9: "September", 10: "October", 11: "November", 12: "December",
};

export function CalendarTable() {
  const queryClient = useQueryClient();

  // ── State ──────────────────────────────────────────────────────────────────
  const [sorting, setSorting]                 = useState([]);
  const [columnFilters, setColumnFilters]     = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection]       = useState({});
  const [editSheetOpen, setEditSheetOpen]     = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [selectedDayId, setSelectedDayId]     = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId]   = useState(null);

  // ── Fetch all calendar days ───────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["calendar-days"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/calendar`);
      return res.data?.data || [];
    },
  });

  const apiData = data || [];

  // ── Delete mutation ───────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id) => axios.delete(`${url}/api/calendar/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["calendar-days"]);
      toast.success("Calendar day deleted successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete calendar day.");
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEdit = (dayId) => {
    setSelectedDayId(dayId);
    setEditSheetOpen(true);
  };

  const handleDeleteClick = (dayId) => {
    setDeleteTargetId(dayId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) deleteMutation.mutate(deleteTargetId);
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  // ── Columns ───────────────────────────────────────────────────────────────
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
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "DAY",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          DATE <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3 font-medium tabular-nums">{row.getValue("DAY")}</div>
      ),
    },
    {
      accessorKey: "DAY_NAME",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          DAY NAME <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3 text-sm">{row.getValue("DAY_NAME") ?? "—"}</div>
      ),
    },
    {
      accessorKey: "MONTH_ID",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          MONTH <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
  <div className="ml-3 text-sm">
    {MONTH_NAMES[row.getValue("MONTH_ID")] ?? "—"}
  </div>
),
    },
    {
      accessorKey: "WORKING_STATUS",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          STATUS <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3">
          <StatusBadge status={row.getValue("WORKING_STATUS")} />
        </div>
      ),
    },
    {
      accessorKey: "HOLIDAY_DESCRIPTION",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          DESCRIPTION <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3 text-sm max-w-[200px] truncate text-muted-foreground">
          {row.getValue("HOLIDAY_DESCRIPTION") ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "LAST_UPDATED_DATE",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          LAST UPDATED <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3 text-xs text-muted-foreground">
          {row.getValue("LAST_UPDATED_DATE") ?? "—"}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2 justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(item.DAY_ID)}
              title="Edit"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDeleteClick(item.DAY_ID)}
              title="Delete"
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        );
      },
    },
  ];

  // ── Table instance ────────────────────────────────────────────────────────
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
      <div className="mt-4 shadow-2xl rounded-lg bg-white">
        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        <div className="flex items-center py-4 px-4 gap-2">
          <Input
            placeholder="Filter by date..."
            value={table.getColumn("DAY")?.getFilterValue() ?? ""}
            onChange={(e) => table.getColumn("DAY")?.setFilterValue(e.target.value)}
            className="max-w-sm"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(val) => col.toggleVisibility(!!val)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setCreateSheetOpen(true)}>
            <PlusIcon size={16} className="mr-1" />
            Add Calendar Day
          </Button>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && table.getRowModel().rows.length > 0 &&
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!isLoading && table.getRowModel().rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24 text-muted-foreground">
                    No calendar days found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      {/* ── Sheets ─────────────────────────────────────────────────────────── */}
      <CreateCalendarSheet
        isOpen={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
      />

      <EditCalendarSheet
        isOpen={editSheetOpen}
        onClose={() => {
          setEditSheetOpen(false);
          setSelectedDayId(null);
        }}
        dayId={selectedDayId}
      />

      {/* ── Delete Confirm Dialog ──────────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Calendar Day?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this calendar day. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTargetId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}