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

import { Link } from "react-router-dom"
import { Pencil, Trash2, ArrowUpDown, ChevronDown, MoreHorizontal, PlusIcon } from "lucide-react"

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
import CreateAdminSheet from "../pages/CreateAdminSheet"
import { EditAdminSheet } from "../pages/EditAdminSheet"



export function AdminTable() {

  const [createSheetOpen, setCreateSheetOpen] = React.useState(false);
    const [updateSheetOpen, setUpdateSheetOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);

    // ⭐ Fetch API Using React Query
  const { data = [], isLoading } = useQuery({
      queryKey: ["adminUsers"],
      queryFn: async () => {
        const res = await api.get("/admin_user.php");
        return res.data.data || [];
      },
    });

  const apiData = data || [];
  console.log(data)

  // ✅ NEW STATE VARIABLES
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  

    // Handle Edit Click
  const handleEdit = (adminId) => {
    setSelectedUser(adminId);
    setUpdateSheetOpen(true);
  };

  // Handle Add New Click
  const handleAddNew = () => {
    setCreateSheetOpen(true);
  };


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
    accessorKey: "USERNAME",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          USERNAME
          <ArrowUpDown />
        </Button>
      )
    },
  },
 
  
  {
    accessorKey: "ADDRESS",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ADDRESS
          <ArrowUpDown />
        </Button>
      )
    },
  },
  {
    accessorKey: "POSITION",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          POSITION
          <ArrowUpDown />
        </Button>
      )
    },
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
                  onClick={() => handleEdit(item)}
                >
                  <Pencil size={18} />
                </Button>
    
                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => console.log("Delete:")}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            );
          },
        },

  // // ✅ ACTIONS WITH DROPDOWN MENU (NEW)
  // {
  //   id: "actions",
  //   enableHiding: false,
  //   header: () => <div className="text-center">Actions</div>,
  //   cell: ({ row }) => {
  //     const item = row.original;

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem
  //             onClick={() => navigator.clipboard.writeText(item.ID)}
  //           >
  //             Copy ID
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem>
  //             <Link to={`/dashboard/admin/${item.ID}`}>
  //               <div className="flex items-center gap-2 text-blue-600">
  //                 <Pencil size={16} className="text-blue-600" />
  //                 Edit
  //               </div>
  //             </Link>
  //           </DropdownMenuItem>
  //           <DropdownMenuItem
  //           //   onClick={() => console.log("Delete ID:", item.H_ID)}
  //             className="text-red-600"
  //           >
  //             <Trash2 size={16} className="mr-2" />
  //             Delete
  //           </DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];
  
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
    <div className="w-full px-4 mt-4 shadow-2xl rounded-lg bg-white ">
      
      {/* ✅ ENHANCED SEARCH AND COLUMN TOGGLE */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter USERNAME..."
          value={table.getColumn("USERNAME")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("USERNAME")?.setFilterValue(e.target.value)
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
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>

          {/* ADD NEW USER BUTTON */}
                 <Button onClick={handleAddNew} className="ml-2">
                   <PlusIcon  size={16}></PlusIcon>
                   Add New Admin
                 </Button>
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

     
      <DataTablePagination table={table}></DataTablePagination>

       {/* CREATE USER SHEET */}
            <CreateAdminSheet
              open={createSheetOpen} 
              onOpenChange={setCreateSheetOpen} 
            />

             <EditAdminSheet
                    open={updateSheetOpen} 
        onOpenChange={setUpdateSheetOpen}
        adminId={selectedUser}
                   
                  />

    </div>
  );
}