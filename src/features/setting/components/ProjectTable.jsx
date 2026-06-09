// src\features\setting\components\ProjectTable.jsx
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import axios from "axios";
import { Badge } from "@/components/ui/badge";

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
    LOT: false,
    DP: false,
    INSURANCE_NO: false,
    P_ENTATIVE_START_DATE: false,
    P_TENTATIVE_END_DATE: false,
    P_CODE: false,
    DESCRIPTION: false,
  });
  const [rowSelection, setRowSelection] = React.useState({});

  const handleEditProcess = (projectId) =>
    navigate(`/dashboard/process/${projectId}`);

  // Reusable sortable header
  const SortHeader = ({ column, label }) => (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs font-medium text-muted-foreground uppercase tracking-widest -ml-3 h-8 hover:text-foreground"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown size={12} className="ml-1 opacity-50" />
    </Button>
  );

  const columns = [
    // ── Select ──
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

    // ── Project Name ──
    {
      accessorKey: "P_NAME",
      header: ({ column }) => (
        <SortHeader column={column} label="Project Name" />
      ),
      cell: ({ row }) => (
        <span
          className="text-sm font-medium text-foreground hover:text-primary cursor-pointer transition-colors duration-150"
          onClick={() => handleEditProcess(row.original.P_ID)}
        >
          {row.getValue("P_NAME")}
        </span>
      ),
    },

    // ── Project Code ──
    {
      accessorKey: "P_CODE",
      header: ({ column }) => <SortHeader column={column} label="Code" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-mono">
          {row.getValue("P_CODE") || "—"}
        </span>
      ),
    },

    // ── Project Type ──
    {
      accessorKey: "P_TYPE",
      header: ({ column }) => <SortHeader column={column} label="Type" />,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="bg-accent text-accent-foreground border-0 font-medium"
        >
          Type {row.getValue("P_TYPE")}
        </Badge>
      ),
    },

    // ── Suburb ──
    {
      accessorKey: "SUBWRB",
      header: ({ column }) => <SortHeader column={column} label="Suburb" />,
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {row.getValue("SUBWRB")}
        </span>
      ),
    },

    // ── Postcode ──
    {
      accessorKey: "POSTCODE",
      header: ({ column }) => <SortHeader column={column} label="Postcode" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("POSTCODE")}
        </span>
      ),
    },

    {
  accessorKey: "STATE",
  header: ({ column }) => <SortHeader column={column} label="State" />,
  cell: ({ row }) => {
    const state = row.getValue("STATE");
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-0 font-medium dark:bg-emerald-500/10 dark:text-emerald-400">
        {state || "—"}
      </Badge>
    );
  },
},

    // ── Address ──
    {
      accessorKey: "P_ADDRESS",
      header: ({ column }) => <SortHeader column={column} label="Address" />,
      cell: ({ row }) => (
        <span
          className="text-sm text-muted-foreground max-w-[180px] truncate block"
          title={row.getValue("P_ADDRESS")}
        >
          {row.getValue("P_ADDRESS")}
        </span>
      ),
    },

    // ── LOT (hidden by default) ──
    {
      accessorKey: "LOT",
      header: ({ column }) => <SortHeader column={column} label="Lot" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("LOT") || "—"}
        </span>
      ),
    },

    // ── DP (hidden by default) ──
    {
      accessorKey: "DP",
      header: ({ column }) => <SortHeader column={column} label="DP" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("DP") || "—"}
        </span>
      ),
    },

    // ── Insurance No (hidden by default) ──
    {
      accessorKey: "INSURANCE_NO",
      header: ({ column }) => (
        <SortHeader column={column} label="Insurance No" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("INSURANCE_NO") || "—"}
        </span>
      ),
    },

    // ── Start Date (hidden by default) ──
    {
      accessorKey: "P_ENTATIVE_START_DATE",
      header: ({ column }) => <SortHeader column={column} label="Start Date" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("P_ENTATIVE_START_DATE") || "—"}
        </span>
      ),
    },

    // ── End Date (hidden by default) ──
    {
      accessorKey: "P_TENTATIVE_END_DATE",
      header: ({ column }) => <SortHeader column={column} label="End Date" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("P_TENTATIVE_END_DATE") || "—"}
        </span>
      ),
    },

    // ── Description (hidden by default) ──
    {
      accessorKey: "DESCRIPTION",
      header: ({ column }) => (
        <SortHeader column={column} label="Description" />
      ),
      cell: ({ row }) => (
        <span
          className="text-sm text-muted-foreground max-w-[160px] truncate block"
          title={row.getValue("DESCRIPTION")}
        >
          {row.getValue("DESCRIPTION") || "—"}
        </span>
      ),
    },

    // ── Actions ──
    {
      id: "actions",
      enableHiding: false,
      header: () => (
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Actions
        </span>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <TooltipProvider>
            <div className="flex items-center gap-1 ">
              {/* Edit */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => handleEditProcess(item.P_ID)}
                    aria-label="Edit project"
                  >
                    <Pencil size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>

              {/* Delete */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:border-destructive"
                    onClick={() => console.log("Delete:", item.P_ID)}
                    aria-label="Delete project"
                  >
                    <Trash2 size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
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
    <div className="bg-card border border-border rounded-lg">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
        <Input
          placeholder="Filter by project name..."
          value={table.getColumn("P_NAME")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("P_NAME")?.setFilterValue(e.target.value)
          }
          className="max-w-xs"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto gap-1">
              Columns <ChevronDown size={13} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize text-sm"
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
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow
                key={group.id}
                className="bg-muted/50 hover:bg-muted/50"
              >
                {group.headers.map((header) => (
                  <TableHead key={header.id} className="py-2">
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
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center h-24 text-sm text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              table.getRowModel().rows.length > 0 &&
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-11 border-b border-border last:border-0"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center h-24 text-sm text-muted-foreground"
                >
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
