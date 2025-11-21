import { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";

import { Button } from "@/components/ui/button";
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
import api from "../../../api/Api";
import { SectionContainer } from "@/components/SectionContainer";

export default function CashTransferListTwo() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch unposted vouchers
  const { data, isLoading, error } = useQuery({
    queryKey: ["unpostedVouchers"],
    queryFn: async () => {
      const res = await api.get("/cash_all_unposted.php");
      return res.data;
    },
  });

  // Extract and sort vouchers with useMemo to prevent infinite re-renders
  const sortedVouchers = useMemo(() => {
    const vouchers = data?.status === "success" ? data.data : [];
    return [...vouchers].sort((a, b) => Number(b.ID) - Number(a.ID));
  }, [data]);

  const columns = [
    {
      accessorKey: "ID",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium ml-3">{row.getValue("ID")}</div>
      ),
    },
    {
      accessorKey: "VOUCHERNO",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Voucher No
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-2">{row.getValue("VOUCHERNO")}</div>
      ),
    },
    {
      accessorKey: "TRANS_DATE",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Transaction Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("TRANS_DATE")}</div>,
    },
    {
      accessorKey: "GL_ENTRY_DATE",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GL Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("GL_ENTRY_DATE")}</div>,
    },
    {
      accessorKey: "DESCRIPTION",
      header: "Description",
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate"
          title={row.getValue("DESCRIPTION")}
        >
          {row.getValue("DESCRIPTION")}
        </div>
      ),
    },
    {
      accessorKey: "DEBIT",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Debit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("DEBIT") || 0);
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "CREDIT",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Credit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("CREDIT") || 0);
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
  ];

  const table = useReactTable({
    data: sortedVouchers,
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
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading vouchers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-center py-12">
            <p className="text-red-600">Error loading vouchers.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | Cash Transfer List | HRMS</title>
      </Helmet>

      <div className="min-h-screen ">
       
          
          
          {/* Data Table */}
          <div className="bg-card rounded-md mt-4 shadow-sm p-4">
            <div className="space-y-4">
              {/* Filters and Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Search vouchers..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
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
                      .map((column) => (
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
                      ))}
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
                              No cash transfer records found
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
    </>
  );
}
