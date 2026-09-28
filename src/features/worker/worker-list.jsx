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
import { useHasPermission } from "@/hooks/use-permission";
import axios from "axios";
import { 
  Trash2, 
  ArrowUpDown, 
  PlusIcon, 
  Search, 
  ChevronDown, 
  DollarSign, 
  History,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import WrappedName from "@/components/shared/WrappedName";
import { cn } from "@/lib/utils";
import { WorkerRateDialog } from "./worker-rate-dialog";
import { WorkerRateHistoryDialog } from "./worker-rate-history-dialog";
import { SectionContainer } from "@/components/SectionContainer";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function WorkerList() {
  const navigate = useNavigate();

const canCreate = useHasPermission("WORKER_CREATE");
const canEdit = useHasPermission("WORKER_EDIT");
const canDelete = useHasPermission("WORKER_DELETE");

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

  const handleView = (workerId) => {
    navigate(`/dashboard/worker/${workerId}`);
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
      cell: ({ row }) => (
        <div className="pl-2">
          <WrappedName name={row.getValue("WORKER_NAME")} size="md" showAvatar maxLines={1} />
        </div>
      ),
    },
    {
      accessorKey: "PHONE",
      header: "Phone",
      cell: ({ row }) => <div className="text-sm">{row.getValue("PHONE") || "—"}</div>,
    },
    {
      accessorKey: "EMAIL",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm max-w-[200px] truncate" title={row.getValue("EMAIL")}>
          {row.getValue("EMAIL") || "—"}
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
    <div className="flex items-center gap-1.5 justify-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            onClick={() => handleView(item.WORKER_ID)}
            aria-label="View"
            className="h-7 w-7 rounded-full bg-accent-foreground/90 dark:bg-accent-foreground/60 hover:bg-accent-foreground/70 dark:hover:bg-accent-foreground disabled:opacity-40"
          >
            <Eye size={13} className="text-white" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View</TooltipContent>
      </Tooltip>
      {canEdit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={() => handleSetRate(item.WORKER_ID)}
              aria-label="Set Rate"
              className="h-7 w-7 rounded-full bg-green-600 dark:bg-green-800/90 hover:bg-green-500 dark:hover:bg-green-600 disabled:opacity-40"
            >
              <DollarSign size={13} className="text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Set Rate</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            onClick={() => handleViewHistory(item.WORKER_ID)}
            aria-label="Rate History"
            className="h-7 w-7 rounded-full bg-blue-600 dark:bg-blue-800/90 hover:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-40"
          >
            <History size={13} className="text-white" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Rate History</TooltipContent>
      </Tooltip>
      {canDelete && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={() => handleDeleteClick(item.WORKER_ID)}
              aria-label="Delete"
              disabled={deleteMutation.isPending}
              className="h-7 w-7 rounded-full bg-destructive dark:bg-destructive/70 hover:bg-destructive/80 dark:hover:bg-destructive/90 disabled:opacity-40"
            >
              <Trash2 size={13} className="text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      )}
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
      <SectionContainer variant="dashboard">
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

           {canCreate && (
  <Button onClick={handleCreate} className="h-10 rounded-md gap-2">
    <PlusIcon size={16} />
    Add New Worker
  </Button>
)}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="border-b border-border bg-muted/20">
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "px-4 py-3 font-medium",
                        header.column.id === "actions" &&
                          "sticky right-0 z-20 bg-card text-center border-l border-border shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)]",
                      )}
                    >
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
                table.getRowModel().rows.map((row) => {
                  const isAltStripe = row.index % 2 === 1;
                  const rowStripeBg = isAltStripe ? "bg-background" : "bg-card";
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        "group border-b border-border transition-colors",
                        isAltStripe ? "!bg-background" : "!bg-card",
                        "hover:!bg-muted data-[state=selected]:!bg-muted",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-4 py-3 align-middle",
                            cell.column.id === "actions" &&
                              cn(
                                "sticky right-0 z-10 border-l border-border shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)]",
                                "group-hover:!bg-muted group-data-[state=selected]:bg-muted",
                                rowStripeBg,
                              ),
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
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
      </SectionContainer>

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