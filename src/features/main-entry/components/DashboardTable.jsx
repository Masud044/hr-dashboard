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
import { Pencil, Trash2, ArrowUpDown, ChevronDown, LayoutDashboard, AlertTriangle } from "lucide-react";
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

  const [sorting, setSorting]                 = React.useState([]);
  const [columnFilters, setColumnFilters]     = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection]       = React.useState({});
  const [editSheetOpen, setEditSheetOpen]     = React.useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = React.useState(null);

  // ── Delete state ─────────────────────────────────────────────────────────
  const [deleteModal, setDeleteModal] = React.useState({ open: false, item: null });

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

  const handleDeleteClick = (item) => setDeleteModal({ open: true, item });
  const handleDeleteConfirm = () => {
    if (deleteModal.item?.H_ID) deleteMutation.mutate(deleteModal.item.H_ID);
  };
  const handleDeleteCancel = () => setDeleteModal({ open: false, item: null });

  const handleEdit = (scheduleId) => {
    setSelectedScheduleId(scheduleId);
    setEditSheetOpen(true);
  };

  const columns = [
    // ── Select ────────────────────────────────────────────────────────────
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

    // ── Project Name (P_ID এর বদলে P_NAME) ───────────────────────────────
    {
      accessorKey: "P_NAME",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project Name
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3 font-medium">{row.getValue("P_NAME") || "—"}</div>
      ),
    },

    // ── Description ───────────────────────────────────────────────────────
    {
      accessorKey: "DESCRIPTION",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3">{row.getValue("DESCRIPTION") || "—"}</div>
      ),
    },

    // ── Project Start Plan ────────────────────────────────────────────────
    {
      accessorKey: "PROJECT_START_PLAN",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project Start Plan
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const val = row.getValue("PROJECT_START_PLAN");
        return (
          <div className="ml-3">
            {val ? (
              <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">
                {val}
              </span>
            ) : (
              <span className="text-gray-400 text-xs">Not set</span>
            )}
          </div>
        );
      },
    },

    // ── Project End Plan ──────────────────────────────────────────────────
    {
      accessorKey: "PROJECT_END_PLAN",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          project End Plan
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const val = row.getValue("PROJECT_END_PLAN");
        return (
          <div className="ml-3">
            {val ? (
              <span className="inline-block bg-orange-50 text-orange-700 text-xs font-medium px-2 py-0.5 rounded">
                {val}
              </span>
            ) : (
              <span className="text-gray-400 text-xs">Not set</span>
            )}
          </div>
        );
      },
    },

    // ── Created By ────────────────────────────────────────────────────────
    // {
    //   accessorKey: "CREATION_BY",
    //   header: ({ column }) => (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       Created By
    //       <ArrowUpDown className="ml-1 h-4 w-4" />
    //     </Button>
    //   ),
    //   cell: ({ row }) => <div className="ml-3">{row.getValue("CREATION_BY")}</div>,
    // },

    // ── Creation Date ─────────────────────────────────────────────────────
    {
      accessorKey: "CREATION_DATE",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created Date
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3 text-sm text-gray-600">{row.getValue("CREATION_DATE")}</div>
      ),
    },

    // ── Actions ───────────────────────────────────────────────────────────
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2 justify-center">

            {/* Edit */}
            <Button
              onClick={() => handleEdit(item.H_ID)}
              title="Edit schedule header"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs cursor-pointer font-medium
                         bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
            >
              <Pencil size={13} />
              Edit
            </Button>

            {/* View Dashboard */}
            <Link to={`/dashboard/timeline/${item.H_ID}`}>
              <Button
                title="Open timeline dashboard"
                className="inline-flex items-center gap-1.5 px-3  rounded-md text-sm font-medium
                           "
              >
                <LayoutDashboard size={13} />
                Dashboard
              </Button>
            </Link>

            {/* Delete */}
            <Button
              onClick={() => handleDeleteClick(item)}
              title="Delete schedule"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                     bg-red-50 text-red-600 hover:bg-red-100  transition-colors   "
            >
              <Trash2 size={13} />
             
            </Button>

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
      <div className="mt-4 shadow-2xl rounded-lg bg-white">
        {/* Search + Column Toggle */}
        <div className="flex items-center py-4 px-4">
          <Input
            placeholder="Filter by project name..."
            value={table.getColumn("P_NAME")?.getFilterValue() ?? ""}
            onChange={(e) =>
              table.getColumn("P_NAME")?.setFilterValue(e.target.value)
            }
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
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      <EditDashboardHeaderSheet
        isOpen={editSheetOpen}
        onClose={() => {
          setEditSheetOpen(false);
          setSelectedScheduleId(null);
        }}
        scheduleId={selectedScheduleId}
      />

      {/* ── Delete Confirm Modal ── */}
      {deleteModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={22} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-gray-800">Delete Schedule</h3>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">
                    {deleteModal.item?.P_NAME || `H_ID: ${deleteModal.item?.H_ID}`}
                  </span>{" "}
                  এর schedule এবং সব lines permanently delete হয়ে যাবে। এই কাজ undo করা যাবে না।
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <Button variant="outline" onClick={handleDeleteCancel} disabled={deleteMutation.isPending}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
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