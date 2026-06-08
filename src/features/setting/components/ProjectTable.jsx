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
import { Pencil, Trash2, ArrowUpDown, ChevronDown } from "lucide-react";

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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/DataTablePagination";
import axios from "axios";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function ProjectTable() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project`);
      const fetchedData = res.data?.data || [];
      fetchedData.sort((a, b) => (Number(b.P_ID) || 0) - (Number(a.P_ID) || 0));
      return fetchedData;
    },
  });

  const apiData = data || [];

  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({
    // নতুন columns default এ লুকানো থাকবে — Columns button দিয়ে দেখা যাবে
    LOT:                    false,
    DP:                     false,
    INSURANCE_NO:           false,
    P_ENTATIVE_START_DATE: false,
    P_TENTATIVE_END_DATE:   false,
    P_CODE:                 false,
    DESCRIPTION:            false,
  });
  const [rowSelection, setRowSelection] = React.useState({});

  const handleEditProcess = (projectId) => navigate(`/dashboard/process/${projectId}`);

  const columns = [
    // ── Select ──
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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

    // ── Project Name ──
    {
      accessorKey: "P_NAME",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          PROJECT NAME <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("P_NAME")}</div>,
    },

    // ── Project Code ──
    {
      accessorKey: "P_CODE",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          P. CODE <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("P_CODE") || "-"}</div>,
    },

    // ── Project Type ──
    {
      accessorKey: "P_TYPE",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          TYPE <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("P_TYPE")}</div>,
    },

    // ── Suburb ──
    {
      accessorKey: "SUBWRB",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          SUBURB <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("SUBWRB")}</div>,
    },

    // ── Postcode ──
    {
      accessorKey: "POSTCODE",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          POSTCODE <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("POSTCODE")}</div>,
    },

    // ── State ──
    {
      accessorKey: "STATE",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          STATE <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("STATE")}</div>,
    },

    // ── Address ──
    {
      accessorKey: "P_ADDRESS",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          ADDRESS <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3 max-w-[180px] truncate" title={row.getValue("P_ADDRESS")}>
          {row.getValue("P_ADDRESS")}
        </div>
      ),
    },

    // ── LOT (hidden by default) ──
    {
      accessorKey: "LOT",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          LOT <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("LOT") || "-"}</div>,
    },

    // ── DP (hidden by default) ──
    {
      accessorKey: "DP",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          DP <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("DP") || "-"}</div>,
    },

    // ── Insurance No (hidden by default) ──
    {
      accessorKey: "INSURANCE_NO",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          INSURANCE NO <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("INSURANCE_NO") || "-"}</div>,
    },

    // ── Tentative Start Date (hidden by default) ──
    {
      accessorKey: "P_ENTATIVE_START_DATE",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          START DATE <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("P_ENTATIVE_START_DATE") || "-"}</div>,
    },

    // ── Tentative End Date (hidden by default) ──
    {
      accessorKey: "P_TENTATIVE_END_DATE",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          END DATE <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-3">{row.getValue("P_TENTATIVE_END_DATE") || "-"}</div>,
    },

    // ── Description (hidden by default) ──
    {
      accessorKey: "DESCRIPTION",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          DESCRIPTION <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3 max-w-[160px] truncate" title={row.getValue("DESCRIPTION")}>
          {row.getValue("DESCRIPTION") || "-"}
        </div>
      ),
    },

    // ── Actions ──
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3 justify-center">
            <Button variant="ghost" size="icon-sm" onClick={() => handleEditProcess(item.P_ID)}>
              <Pencil size={18} />
            </Button>
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
    <div className="mt-4 shadow-2xl rounded-lg bg-white">
      {/* Search + Column Toggle */}
      <div className="flex items-center py-4 px-4 gap-2">
        <Input
          placeholder="Filter by project name..."
          value={table.getColumn("P_NAME")?.getFilterValue() ?? ""}
          onChange={(e) => table.getColumn("P_NAME")?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id.replace(/_/g, " ").toLowerCase()}
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
            {isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24 text-gray-500">
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
              ))
            }

            {!isLoading && table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24 text-gray-500">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}