"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/api/Api"

import { Link } from "react-router-dom"
import { Pencil, Trash2, ArrowUpDown, ChevronDown, MoreHorizontal, FileText, FileUser } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/DataTablePagination"

// Helper function to get voucher type label
const getVoucherTypeLabel = (type) => {
  switch(type) {
    case "1": return "Receive";
    case "2": return "Payment";
    case "3": return "Journal";
    case "4": return "Bank Transfer";
    default: return "Unknown";
  }
};

// Helper function to get edit route
const getEditRoute = (type, id) => {
  switch(type) {
    case "1": return `/dashboard/receive-voucher/${id}`;
    case "2": return `/dashboard/payment-voucher/${id}`;
    case "3": return `/dashboard/journal-voucher/${id}`;
    default: return `/dashboard/cash-voucher/${id}`;
  }
};

// ⭐ Function to create columns with handlers
const createColumns = (handleActivateVoucher) => [
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
  
  // ✅ VOUCHER TYPE COLUMN WITH CONDITIONAL DISPLAY
  {
    accessorKey: "VOUCHER_TYPE",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Voucher Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const type = row.getValue("VOUCHER_TYPE");
      const label = getVoucherTypeLabel(type);
      const colorClass = 
        type === "1" ? " text-green-800" :
        type === "2" ? " text-red-800" :
        type === "3" ? " text-blue-800" :
        " text-purple-800";
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
          {label}
        </span>
      );
    },
  },
  
  // ✅ SORTABLE COLUMNS
  {
    accessorKey: "VOUCHERNO",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Voucher No
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "TRANS_DATE",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Transaction Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "ENTRY_BY",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Entry By
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },

  // ✅ ACTIONS WITH CONDITIONAL ROUTING
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      const editRoute = getEditRoute(item.VOUCHER_TYPE, item.ID);

      return (
        <div className="flex items-center justify-center gap-2">
          {/* View/Activate Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50"
          >
            <FileText size={16} />
          </Button>

          {/* Edit Button with Dynamic Route */}
          <Link to={editRoute}>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <Pencil size={16} />
            </Button>
          </Link>

          {/* User/Activate Button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleActivateVoucher(item.ID)}
            className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
          >
            <FileUser size={16} />
          </Button>

          {/* Dropdown Menu for Additional Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>More Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(item.ID)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(item.VOUCHERNO)}
              >
                Copy Voucher No
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => console.log("Delete ID:", item.ID)}
                className="text-red-600"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function DashboardVoucherList() {

    const queryClient = useQueryClient();
  // ⭐ Fetch API Using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["unpostedVouchers"],
    queryFn: async () => {
      const res = await api.get("/info_list.php");
      return res.data;
    }
  });

  const apiData = Array.isArray(data?.vouchers) ? data.vouchers : [];

  // ✅ STATE VARIABLES
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Handler for activating voucher
   const handleActivateVoucher = async (id) => {
      try {
        const res = await api.get(`/active_voucher.php?id=${id}`);
        if (res.data.success) {
          queryClient.invalidateQueries(["unpostedVouchers"]); // refresh list
        } else {
          alert("Failed to activate voucher");
        }
      } catch (error) {
        console.error(error);
      }
    };
    
  // ⭐ Setup TanStack Table with Enhanced Features
  const columns = React.useMemo(() => createColumns(handleActivateVoucher), []);
  
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
    <div className="w-full mx-auto px-4 mt-4 shadow-2xl rounded-lg bg-white max-w-7xl">
      
      {/* ✅ SEARCH AND COLUMN TOGGLE */}
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Filter descriptions..."
          value={table.getColumn("DESCRIPTION")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("DESCRIPTION")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
        
        <Input
          placeholder="Filter by voucher no..."
          value={table.getColumn("VOUCHERNO")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("VOUCHERNO")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
        
        {/* ✅ COLUMN VISIBILITY DROPDOWN */}
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
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(group => (
              <TableRow key={group.id}>
                {group.headers.map(header => (
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
            {/* Loading */}
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24">
                  Loading...
                </TableCell>
              </TableRow>
            ) : null}

            {/* Error */}
            {error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24 text-red-600">
                  Error loading data: {error.message}
                </TableCell>
              </TableRow>
            ) : null}

            {/* Data Rows */}
            {!isLoading && !error && table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow 
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50"
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : null}

            {/* No Data */}
            {!isLoading && !error && table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24">
                  No results.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {/* ✅ PAGINATION */}
      <DataTablePagination table={table} />

    </div>
  );
}