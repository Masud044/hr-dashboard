import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
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
import api from "../../../api/Api";

export default function ContractionProcessListTwo () {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch contraction process list
  const {
    data: processes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["contraction_process"],
    queryFn: async () => {
      const res = await api.get("/construction_process.php?action=read");
      const response = res.data;

      let records = [];
      if (Array.isArray(response)) records = response;
      else if (Array.isArray(response.data)) records = response.data;
      else if (Array.isArray(response.records)) records = response.records;

      // Always show latest (highest ID) first
      return records.sort((a, b) => b.ID - a.ID);
    },
  });

  const columns = [
    {
      accessorKey: "ID",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium ml-3">{row.getValue("ID")}</div>
      ),
    },
    {
      accessorKey: "PROCESS_ID",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Process ID
            <ArrowUpDown  />
          </Button>
        );
      },
      cell: ({ row }) => <div className="ml-2">{row.getValue("PROCESS_ID")}</div>,
    },
    {
      accessorKey: "SUB_CONTRACT_ID",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sub Contract ID
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("SUB_CONTRACT_ID")}</div>,
    },
    {
      accessorKey: "DEPENDENT_ID",
      header: "Dependent ID",
      cell: ({ row }) => <div>{row.getValue("DEPENDENT_ID")}</div>,
    },
    {
      accessorKey: "SORT_ID",
      header: "Sort ID",
      cell: ({ row }) => <div>{row.getValue("SORT_ID")}</div>,
    },
    {
      accessorKey: "COST",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Cost
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const cost = parseFloat(row.getValue("COST") || 0);
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(cost);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "CREATION_BY",
      header: "Created By",
      cell: ({ row }) => <div>{row.getValue("CREATION_BY")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const process = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(process.ID.toString())
                }
              >
                Copy Process ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/contraction-process/${process.ID}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Process
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Process
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: processes,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen shadow-2xl bg-background p-4 md:p-6 lg:p-8">
        <div className="">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="">
          <div className="flex items-center justify-center py-12">
            <p className="text-red-600">Error loading data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen shadow-lg bg-background ">
      <div className="">
        {/* Header */}
        {/* <div className="bg-card rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Contraction Processes
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage construction process records
              </p>
            </div>
            <Button asChild>
              <Link to="/dashboard/contraction-process/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Process
              </Link>
            </Button>
          </div>
        </div> */}

        {/* Data Table */}
        <div className="bg-card rounded-lg shadow-sm p-4 md:p-6">
          <div className="space-y-4">
            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search processes..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="max-w-sm"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
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
                          {column.id.replace(/_/g, " ")}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
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
                  {table.getRowModel().rows?.length ? (
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
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        <div className="flex flex-col items-center justify-center py-8">
                          <p className="text-muted-foreground">
                            No processes found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <DataTablePagination table={table} />
          </div>
        </div>
      </div>
    </div>
  );
}
