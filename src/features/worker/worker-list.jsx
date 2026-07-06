// src/features/worker/worker-list.jsx
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
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Pencil, 
  Trash2, 
  ArrowUpDown, 
  PlusIcon, 
  Search, 
  ChevronDown, 
  DollarSign, 
  History 
} from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
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
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
import { WorkerRateDialog } from "./worker-rate-dialog";
import { WorkerRateHistoryDialog } from "./worker-rate-history-dialog";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function WorkerList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState([{ id: "WORKER_NAME", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [rateWorkerId, setRateWorkerId] = useState(null);

  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyWorkerId, setHistoryWorkerId] = useState(null);

  const { data: apiData = [], isLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/worker`);
      return res.data?.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => axios.delete(`${url}/api/worker/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["workers"]);
      toast.success("Worker deleted successfully!");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to delete worker."),
  });

  const handleEdit = (workerId) => {
    navigate(`/dashboard/worker/${workerId}/edit`);
  };

  const handleCreate = () => {
    navigate("/dashboard/worker/create");
  };

  const handleDeleteClick = (workerId) => {
    setDeleteTargetId(workerId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) deleteMutation.mutate(deleteTargetId);
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const handleSetRate = (workerId) => {
    setRateWorkerId(workerId);
    setRateDialogOpen(true);
  };

  const handleViewHistory = (workerId) => {
    setHistoryWorkerId(workerId);
    setHistoryDialogOpen(true);
  };

  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
          className="border-border"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          className="border-border"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "WORKER_NAME",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold uppercase tracking-wider"
        >
          Name <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => <div className="font-medium text-sm">{row.getValue("WORKER_NAME") || "—"}</div>,
    },
    {
      accessorKey: "PHONE",
      header: "Phone",
      cell: ({ row }) => <div className="text-sm">{row.getValue("PHONE") || "—"}</div>,
    },
    {
      accessorKey: "ADDRESS",
      header: "Address",
      cell: ({ row }) => (
        <div className="text-sm max-w-[200px] truncate" title={row.getValue("ADDRESS")}>
          {row.getValue("ADDRESS") || "—"}
        </div>
      ),
    },
    {
      accessorKey: "STATUS",
      header: "Status",
      cell: ({ row }) => {
        const status = Number(row.getValue("STATUS"));
        const isActive = status === 1;
        return (
          <Badge
            variant="secondary"
            className={
              isActive
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-0"
                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-0"
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "REMARKS",
      header: "Remarks",
      cell: ({ row }) => (
        <div className="text-sm max-w-[150px] truncate" title={row.getValue("REMARKS")}>
          {row.getValue("REMARKS") || "—"}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => (
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1 justify-center">
            {/* Set Rate */}
            <button
              onClick={() => handleSetRate(item.WORKER_ID)}
              title="Set Rate"
              className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
            >
              <DollarSign size={15} />
            </button>

            {/* Rate History */}
            <button
              onClick={() => handleViewHistory(item.WORKER_ID)}
              title="Rate History"
              className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
            >
              <History size={15} />
            </button>

            {/* Edit */}
            <button
              onClick={() => handleEdit(item.WORKER_ID)}
              title="Edit Worker"
              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-all"
            >
              <Pencil size={15} />
            </button>

            {/* Delete */}
            <button
              onClick={() => handleDeleteClick(item.WORKER_ID)}
              title="Delete Worker"
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-all"
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={15} />
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
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name..."
              value={table.getColumn("WORKER_NAME")?.getFilterValue() ?? ""}
              onChange={(e) => table.getColumn("WORKER_NAME")?.setFilterValue(e.target.value)}
              className="pl-9 h-10 rounded-md border-border bg-card text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-md border-border gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-sm bg-current" />
                      <div className="w-1.5 h-1.5 rounded-sm bg-current" />
                      <div className="w-1.5 h-1.5 rounded-sm bg-current" />
                      <div className="w-1.5 h-1.5 rounded-sm bg-current" />
                    </div>
                  </div>
                  Columns
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border max-h-72 overflow-y-auto">
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize text-sm"
                      checked={col.getIsVisible()}
                      onCheckedChange={(val) => col.toggleVisibility(!!val)}
                    >
                      {col.id.replace(/_/g, " ").toLowerCase()}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleCreate} className="h-10 rounded-md gap-2">
              <PlusIcon size={16} />
              Add New Worker
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="border-b border-border bg-muted/20">
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
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24 text-sm text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                table.getRowModel().rows.length > 0 &&
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
                ))}
              {!isLoading && table.getRowModel().rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24 text-sm text-muted-foreground">
                    No workers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border">
          <DataTablePaginationTwo table={table} tableKey="workers" />
        </div>
      </div>

      <WorkerRateDialog
        isOpen={rateDialogOpen}
        onClose={() => {
          setRateDialogOpen(false);
          setRateWorkerId(null);
        }}
        workerId={rateWorkerId}
      />

      <WorkerRateHistoryDialog
        isOpen={historyDialogOpen}
        onClose={() => {
          setHistoryDialogOpen(false);
          setHistoryWorkerId(null);
        }}
        workerId={historyWorkerId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Worker?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the worker. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTargetId(null)} className="border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}