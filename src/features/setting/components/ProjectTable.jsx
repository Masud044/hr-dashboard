"use client";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useQuery } from "@tanstack/react-query";
import api from "@/api/Api";

import {
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronDown,
  PlusIcon,
} from "lucide-react";

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
import { CreateProjectSheet } from "../pages/CreateProjectSheet";


export function ProjectTable() {
  const navigate = useNavigate();
  // ⭐ Fetch API Using React Query
  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get("/project.php");
      const fetchedData = res.data?.data || [];

      fetchedData.sort(
        (a, b) => (Number(b.P_ID) || 0) - (Number(a.P_ID) || 0)
      );

      return fetchedData;
    },
  });

  const apiData = data || [];

  // ✅ STATE VARIABLES
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [createSheetOpen, setCreateSheetOpen] = React.useState(false);

  // Add button handler
  const handleAddNew = () => {
    setCreateSheetOpen(true);
  };

  // Edit/Process button handler - redirects to process page
  const handleEditProcess = (projectId) => {
    navigate(`/dashboard/process/${projectId}`);
  };

  // ⭐ All Table Columns
  const columns = [
    // ✅ SELECT COLUMN
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

    // ✅ SORTABLE COLUMNS
    {
      accessorKey: "P_NAME",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PROJECT NAME
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div className="ml-3">{row.getValue("P_NAME")}</div>,
    },
    {
      accessorKey: "P_TYPE",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PROJECT TYPE
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div className="ml-3">{row.getValue("P_TYPE")}</div>,
    },
    {
      accessorKey: "POSTCODE",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            POSTCODE
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="ml-3">{row.getValue("POSTCODE")}</div>
      ),
    },
    {
      accessorKey: "P_ADDRESS",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ADDRESS
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="ml-3">{row.getValue("P_ADDRESS")}</div>
      ),
    },
    {
      accessorKey: "SUBWRB",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            SUBWRB
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div className="ml-3">{row.getValue("SUBWRB")}</div>,
    },

    // ✅ ACTIONS COLUMN
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <div className="flex items-center gap-3 justify-center">
            {/* Edit Button - Redirects to Process Page */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleEditProcess(item.P_ID)}
            >
              <Pencil size={18} />
            </Button>

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => console.log("Delete:", item.P_ID)}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        );
      },
    },
  ];

  // ⭐ Setup TanStack Table
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <>
      <div className="mt-4 shadow-2xl rounded-lg bg-white">
        {/* ✅ SEARCH AND COLUMN TOGGLE */}
        <div className="flex items-center py-4 px-4">
          <Input
            placeholder="Filter by project name..."
            value={table.getColumn("P_NAME")?.getFilterValue() ?? ""}
            onChange={(e) =>
              table.getColumn("P_NAME")?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />

          {/* ✅ COLUMN VISIBILITY DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ADD NEW BUTTON */}
          <div className="flex justify-end ml-2">
            <Button onClick={handleAddNew}>
              <PlusIcon size={16} className="mr-2" />
              Add New Project
            </Button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {/* Loading */}
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center h-24"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : null}

              {/* Data Rows */}
              {!isLoading && table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : null}

              {/* No Data */}
              {!isLoading && table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center h-24"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <DataTablePagination table={table} />
      </div>

      {/* Create Project Sheet */}
      <CreateProjectSheet
        isOpen={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
      />
    </>
  );
}