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

import { useQuery } from "@tanstack/react-query";
import api from "@/api/Api";

import { Link } from "react-router-dom";
import {
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

// ⭐ All Table Columns with Enhanced Features
const columns = [
  // ✅ SELECT COLUMN (NEW)
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
    accessorKey: "P_ID",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project ID
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="ml-3">{row.getValue("P_ID")}</div>,
  },
  {
    accessorKey: "DESCRIPTION",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-3">{row.getValue("DESCRIPTION")}</div>
    ),
  },
  {
    accessorKey: "CREATED_BY",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created By
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="ml-3">{row.getValue("CREATED_BY")}</div>,
  },
  {
    accessorKey: "UPDATED_BY",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated By
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="ml-3">{row.getValue("UPDATED_BY")}</div>,
  },
  {
    accessorKey: "CREATION_DATE",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created Date
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-3">{row.getValue("CREATION_DATE")}</div>
    ),
  },
  {
    accessorKey: "UPDATED_DATE",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated Date
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-3">{row.getValue("UPDATED_DATE")}</div>
    ),
  },
  // ✅ ACTIONS WITH DROPDOWN MENU (NEW)
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex items-center gap-1.5 justify-center">
          {/* Edit Button */}
          <Link
            to={`/dashboard/dashboard-schedule/${item.H_ID}`}
           
          >
            <Button variant="ghost" size="icon-sm">
              <Pencil size={18} />
            </Button>
          </Link>

          <Link
            to={`/dashboard/timeline/${item.H_ID}`}
            
          >
            <Button variant="ghost" size="icon-sm">
              <ExternalLink size={18} />
            </Button>
          </Link>

          {/* Delete Button */}
         
            <Button onClick={() => console.log("Delete:", item.P_ID)} variant="ghost" size="icon-sm" >
              {" "}
              <Trash2 size={18} />
            </Button>
          
        </div>
      );
    },
  },
];

export function DashboardTable() {
  // ⭐ Fetch API Using React Query
  const { data, isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const res = await api.get("/shedule.php");
      const fetchedData = res.data?.data || [];

      fetchedData.sort((a, b) => (Number(b.H_ID) || 0) - (Number(a.H_ID) || 0));

      return fetchedData;
      // return res.data?.data || [];
    },
  });

  const apiData = data || [];
  console.log(apiData);

  // ✅ NEW STATE VARIABLES
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  // ⭐ Setup TanStack Table with Enhanced Features
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
    <div className=" mt-4 shadow-2xl rounded-lg bg-white ">
      {/* ✅ ENHANCED SEARCH AND COLUMN TOGGLE */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter descriptions..."
          value={table.getColumn("DESCRIPTION")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("DESCRIPTION")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />

        {/* ✅ COLUMN VISIBILITY DROPDOWN (NEW) */}
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
            {!isLoading && table.getRowModel().rows.length
              ? table.getRowModel().rows.map((row) => (
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
              : null}

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

      {/* ✅ ENHANCED PAGINATION WITH ROW SELECTION COUNT */}
      {/* <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div> */}
      <DataTablePagination table={table}></DataTablePagination>
    </div>
  );
}
