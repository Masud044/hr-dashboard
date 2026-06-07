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
import { DataTablePagination } from "@/components/DataTablePagination";
import { CreateOwnerInfoSheet } from "./create-owner-info-sheet";
import { EditOwnerInfoSheet } from "./edit-owner-info-sheet";


const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function OwnerInfoTable() {
  const queryClient = useQueryClient();

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

  const handleEdit = (id) => {
    setSelectedId(id);
    setEditSheetOpen(true);
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
        >
          OWNER NAME
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("O_NAME")}</div>,
    },
    {
      accessorKey: "PROJECT_NAME",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          PROJECT
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("PROJECT_NAME") || "-"}</div>,
    },
    {
      accessorKey: "EMAIL",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          EMAIL
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("EMAIL")}</div>,
    },
    {
      accessorKey: "PHONE",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          PHONE
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("PHONE")}</div>,
    },
    {
      accessorKey: "ADDRESS",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ADDRESS
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("ADDRESS")}</div>,
    },
    {
      accessorKey: "STATE",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          STATE
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("STATE")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3 justify-center">
            <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(item.ID)}>
              <Pencil size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDelete(item.ID)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={18} />
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
        <div className="flex items-center py-4 px-4">
          <Input
            placeholder="Filter owners..."
            value={table.getColumn("O_NAME")?.getFilterValue() ?? ""}
            onChange={(e) =>
              table.getColumn("O_NAME")?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
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

          <div className="flex justify-end ml-2">
            <Button onClick={() => setCreateSheetOpen(true)}>
              <PlusIcon size={16} className="mr-2" />
              Add New Owner
            </Button>
          </div>
        </div>

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
              ) : null}

              {!isLoading && table.getRowModel().rows.length
                ? table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}

              {!isLoading && table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24">
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