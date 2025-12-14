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
import { CreateUserSheet } from "../pages/CreateUserSheet"
import { EditUserSheet } from "../pages/EditUserSheet"



export function UserTable() {
  // State for Sheets
  const [createSheetOpen, setCreateSheetOpen] = React.useState(false);
  const [updateSheetOpen, setUpdateSheetOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);

  // Fetch API Using React Query
  const { data = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/user.php");
      return res.data.data || [];
    },
  });

  const apiData = data || [];

  // Table State Variables
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Handle Edit Click
  const handleEdit = (user) => {
    setSelectedUser(user);
    setUpdateSheetOpen(true);
  };

  // Handle Add New Click
  const handleAddNew = () => {
    setCreateSheetOpen(true);
  };

  // Table Columns
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
      accessorKey: "USER_NAME",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            USER NAME 
            <ArrowUpDown />
          </Button>
        )
      },
       cell: ({ row }) => <div className="ml-3">{row.getValue("USER_NAME")}</div>,
    },
    {
      accessorKey: "TYPE_NAME",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            TYPE NAME
            <ArrowUpDown />
          </Button>
        )
      },
       cell: ({ row }) => <div className="ml-3">{row.getValue("TYPE_NAME")}</div>,
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
    {
      accessorKey: "STATUS",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            STATUS
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const status = row.getValue("STATUS");
        return (
          <span className={`px-2 py-1 rounded-full ml-3 text-xs font-semibold ${
            status === "1" 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {status === "1" ? "Active" : "Inactive"}
          </span>
        );
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

    // // ACTIONS WITH DROPDOWN MENU
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
    //           <DropdownMenuItem onClick={() => handleEdit(item)}>
    //             <div className="flex items-center gap-2 text-blue-600">
    //               <Pencil size={16} className="text-blue-600" />
    //               Edit
    //             </div>
    //           </DropdownMenuItem>
    //           <DropdownMenuItem className="text-red-600">
    //             <Trash2 size={16} className="mr-2" />
    //             Delete
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    // },
  ];

  // Setup TanStack Table
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
    <div className="w-full px-4 mt-4 shadow-2xl rounded-lg bg-white">
       <h1>User List</h1>


      
      {/* SEARCH AND COLUMN TOGGLE */}
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Filter by email..."
          value={table.getColumn("EMAIL")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("EMAIL")?.setFilterValue(e.target.value)
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

        {/* ADD NEW USER BUTTON */}
        <Button onClick={handleAddNew}>
          <PlusIcon  size={16}></PlusIcon>
          Add New User
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

      {/* PAGINATION */}
      <DataTablePagination table={table} />

      {/* CREATE USER SHEET */}
      <CreateUserSheet
        open={createSheetOpen} 
        onOpenChange={setCreateSheetOpen} 
      />

      {/* UPDATE USER SHEET */}
      <EditUserSheet
        open={updateSheetOpen} 
        onOpenChange={setUpdateSheetOpen}
        userData={selectedUser}
      />
    </div>
  );
}