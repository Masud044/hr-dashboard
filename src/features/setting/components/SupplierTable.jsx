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

import { useQuery } from "@tanstack/react-query"
import api from "@/api/Api"

import { Pencil, Trash2, ArrowUpDown, ChevronDown, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { EditSupplierSheet } from "../pages/EditSupplierSheet"
import { CreateSupplierSheet } from "../pages/CreateSupplierSheet"

export function SupplierTable() {
  // ⭐ Fetch API Using React Query
  const { data = [], isLoading } = useQuery({
    queryKey: ["supplierList"],
    queryFn: async () => {
      const res = await api.get("/supplier_info.php");
      return res.data || [];
    },
  });

  const apiData = data || [];

  // ✅ STATE VARIABLES
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
 const [EditSheetOpen, setEditSheetOpen] = React.useState(false);
   const [createSheetOpen, setCreateSheetOpen] = React.useState(false);
     const [selectedSupplierId, setSelectedSupplierId] = React.useState(null);
   
     // Edit button handler
     const handleEdit = (contractorId) => {
       setSelectedSupplierId(contractorId);
       setEditSheetOpen(true);
     };
 
     const handleAddNew = () => {
     setCreateSheetOpen(true);
   };

  // ⭐ Table Columns
  const columns = [
    // SELECT COLUMN
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
    
    // SORTABLE COLUMNS
    {
      accessorKey: "SUPPLIER_NAME",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            SUPPLIER_NAME 
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className="ml-3">{row.getValue("SUPPLIER_NAME")}</div>,
    },
    {
      accessorKey: "ENTRY_DATE",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ENTRY_DATE
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className="ml-3">{row.getValue("ENTRY_DATE")}</div>,
    },
    {
      accessorKey: "EMAIL",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            EMAIL
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className="ml-3">{row.getValue("EMAIL")}</div>,
    },
    {
      accessorKey: "CONTACT_PERSON",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            CONTACT_PERSON
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className="ml-3">{row.getValue("CONTACT_PERSON")}</div>,
    },
    {
      accessorKey: "PHONE",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PHONE
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className="ml-3">{row.getValue("PHONE")}</div>,
    },

    // ACTIONS COLUMN
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
    
        return (
          <div className="flex items-center gap-3 justify-center">
            
            {/* Edit Button */}
            <Button variant="ghost"
              onClick={() => handleEdit(item.SUPPLIER_ID)}
              // className="text-blue-600 hover:text-blue-800"
            >
              <Pencil size={18} />
            </Button>
    
            {/* Delete Button */}
            <Button variant="ghost"
              onClick={() => console.log("Delete:", item.SUPPLIER_ID)}
              // className="text-red-600 hover:text-red-800"
            >
              <Trash2 size={18} />
            </Button>
    
          </div>
        );
      },
    }
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
      <div className="w-full px-4 mt-4 shadow-2xl rounded-lg bg-white">
        
        {/* SEARCH AND COLUMN TOGGLE */}
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter ENTRY_DATE..."
            value={table.getColumn("ENTRY_DATE")?.getFilterValue() ?? ""}
            onChange={(e) =>
              table.getColumn("ENTRY_DATE")?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
          
          {/* COLUMN VISIBILITY DROPDOWN */}
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
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

           <div className="flex justify-end ml-2">
            <Button onClick={handleAddNew}>
              <PlusIcon size={16} className="mr-2" />
              Add New Supplier
            </Button>
          </div>
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

              {/* Data Rows */}
              {!isLoading && table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow 
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
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

        {/* PAGINATION */}
        <DataTablePagination table={table} />
      </div>

      {/* Edit Supplier Sheet */}
      <EditSupplierSheet
        isOpen={EditSheetOpen}
        onClose={() => {
          setEditSheetOpen(false);
          setSelectedSupplierId(null);
        }}
        supplierId={selectedSupplierId}
      />

      <CreateSupplierSheet
              isOpen={createSheetOpen}
              onClose={() => setCreateSheetOpen(false)}
            />
    </>
  );
}