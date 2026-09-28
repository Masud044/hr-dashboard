// src\features\setting\owner-info\owner-info-table.jsx
import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  ArrowUpDown,
  ChevronDown,
  PlusIcon,
  Search,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import { useHasPermission } from "@/hooks/use-permission";

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
import { DataTablePagination } from "@/components/DataTablePagination";
import WrappedName from "@/components/shared/WrappedName";
import { cn } from "@/lib/utils";
import { CreateOwnerInfoSheet } from "./create-owner-info-sheet";
import { EditOwnerInfoSheet } from "./edit-owner-info-sheet";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function OwnerInfoTable() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const canCreate = useHasPermission("OWNER_INFO_CREATE");
  const canDelete = useHasPermission("OWNER_INFO_DELETE");

  const { data, isLoading } = useQuery({
    queryKey: ["ownerInfoList"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/owner-info`);
      return res.data?.data || [];
    },
  });

  const apiData = data || [];

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // const handleEdit = (id) => {
  //   setSelectedId(id);
  //   setEditSheetOpen(true);
  // };

  const handleView = (id) => {
    navigate(`/dashboard/owner-info/${id}`);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await axios.delete(`${url}/api/owner-info/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ownerInfoList"]);
      toast.success("Owner deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete owner.");
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this owner?")) {
      deleteMutation.mutate(id);
    }
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
      accessorKey: "O_NAME",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8 px-2 text-overline text-muted-foreground hover:text-foreground"
        >
          OWNER NAME
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="pl-2">
          <WrappedName name={row.getValue("O_NAME")} size="md" showAvatar maxLines={1} />
        </div>
      ),
    },
    {
      accessorKey: "PROJECT_NAME",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8 px-2 text-overline text-muted-foreground hover:text-foreground"
        >
          PROJECT
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="pl-2 text-sm">{row.getValue("PROJECT_NAME") || "-"}</div>
      ),
    },
    {
      accessorKey: "EMAIL",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8 px-2 text-overline text-muted-foreground hover:text-foreground"
        >
          EMAIL
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => <div className="pl-2 text-sm">{row.getValue("EMAIL")}</div>,
    },
    {
      accessorKey: "PHONE",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8 px-2 text-overline text-muted-foreground hover:text-foreground"
        >
          PHONE
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => <div className="pl-2 text-sm">{row.getValue("PHONE")}</div>,
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
    <div className="flex items-center gap-1.5 justify-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            onClick={() => handleView(item.ID)}
            aria-label="View"
            className="h-7 w-7 rounded-full bg-accent-foreground/90 dark:bg-accent-foreground/60 hover:bg-accent-foreground/70 dark:hover:bg-accent-foreground disabled:opacity-40"
          >
            <Eye size={13} className="text-white" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View</TooltipContent>
      </Tooltip>
      {canDelete && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={() => handleDelete(item.ID)}
              disabled={deleteMutation.isPending}
              aria-label="Delete"
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
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter owners..."
              value={table.getColumn("O_NAME")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table.getColumn("O_NAME")?.setFilterValue(e.target.value)
              }
              className="max-w-sm pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto gap-2 rounded-md">
                Columns <ChevronDown className="h-4 w-4" />
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

          <div className="flex justify-end">
            {/* <Button onClick={() => setCreateSheetOpen(true)}>
              <PlusIcon size={16} className="mr-2" />
              Add New Owner
            </Button> */}
            {canCreate && (
  <Button
    onClick={() => navigate("/dashboard/owner-info/create")}
    className="btn-lift rounded-md"
  >
    <PlusIcon size={16} className="mr-2" />
    Add New Owner
  </Button>
)}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow
                  key={group.id}
                  className="border-b border-border bg-card hover:bg-card"
                >
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.id === "actions" &&
                          "sticky right-0 z-20 border-l border-border bg-card text-center shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)]",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : null}

              {!isLoading && table.getRowModel().rows.length
                ? table.getRowModel().rows.map((row, index) => {
                    const isAltStripe = index % 2 === 1;
                    const stripeCellBg = isAltStripe ? "bg-background" : "bg-card";
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
                              cell.column.id === "actions" &&
                                cn(
                                  "sticky right-0 z-10 border-l border-border shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)]",
                                  "group-hover:!bg-muted group-data-[state=selected]:bg-muted",
                                  stripeCellBg,
                                ),
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                : null}

              {!isLoading && table.getRowModel().rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      <CreateOwnerInfoSheet
        isOpen={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
      />

      <EditOwnerInfoSheet
        isOpen={editSheetOpen}
        onClose={() => {
          setEditSheetOpen(false);
          setSelectedId(null);
        }}
        ownerId={selectedId}
      />
    </>
  );
}
