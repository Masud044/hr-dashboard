// "use client"

// import * as React from "react"
// import { useState } from "react"
// import { Link } from "react-router-dom"
// import { useQuery } from "@tanstack/react-query"
// import { Pencil, Trash2, ArrowUpDown, ChevronDown } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Input } from "@/components/ui/input"
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import { Pagination } from "@/components/ui/pagination"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// import {
//   flexRender,
//   getCoreRowModel,
//   getSortedRowModel,
//   getPaginationRowModel,
//   useReactTable,
// } from "@tanstack/react-table"
// import api from "@/api/Api"
// import PageTitle from "@/components/RouteTitle"

// export default function DataTable({ showTitle = true }) {
//   const [sorting, setSorting] = useState([])
//   const [columnVisibility, setColumnVisibility] = useState({})
//   const [rowSelection, setRowSelection] = useState({})
//   const [filterValue, setFilterValue] = useState("")
//   const [pageSize, setPageSize] = useState(10) // Show 10 rows initially

//   // Fetch schedules
//   const { data: schedules = [], isLoading, error } = useQuery({
//     queryKey: ["schedules"],
//     queryFn: async () => {
//       const res = await api.get("/shedule.php")
//       const response = res.data
//       if (Array.isArray(response)) return response
//       if (Array.isArray(response.data)) return response.data
//       if (Array.isArray(response.data?.records)) return response.data.records
//       return []
//     },
//   })

//   const columns = React.useMemo(
//     () => [
//       {
//         id: "select",
//         header: ({ table }) => (
//           <Checkbox
//             checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
//             onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
//           />
//         ),
//         cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(val) => row.toggleSelected(!!val)} />,
//         enableSorting: false,
//       },
//       {
//         accessorKey: "H_ID",
//         header: ({ column }) => (
//           <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
//             #
//             <ArrowUpDown className="ml-1" size={16} />
//           </Button>
//         ),
//         cell: ({ row }) => row.original.H_ID,
//       },
//       { accessorKey: "P_ID", header: "Project ID" },
//       { accessorKey: "DESCRIPTION", header: "Description" },
//       { accessorKey: "CREATION_BY", header: "Created By" },
//       { accessorKey: "UPDATED_BY", header: "Updated By" },
//       { accessorKey: "CREATION_DATE", header: "Created Date" },
//       { accessorKey: "UPDATED_DATE", header: "Updated Date" },
//       {
//         id: "actions",
//         cell: ({ row }) => (
//           <div className="flex gap-2 justify-center">
//             <Link to={`/dashboard/shedule-line/${row.original.H_ID}`}>
//               <Button variant="ghost" size="icon">
//                 <Pencil size={16} />
//               </Button>
//             </Link>
//             <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800">
//               <Trash2 size={16} />
//             </Button>
//           </div>
//         ),
//       },
//     ],
//     []
//   )

//   const table = useReactTable({
//     data: schedules.filter((item) =>
//       Object.values(item).some((v) => String(v).toLowerCase().includes(filterValue.toLowerCase()))
//     ),
//     columns,
//     state: {
//       sorting,
//       columnVisibility,
//       rowSelection,
//       pagination: { pageIndex: 0, pageSize },
//     },
//     onSortingChange: setSorting,
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//   })

//   if (isLoading) return <p className="text-center mt-6 text-gray-500">Loading schedules...</p>
//   if (error) return <p className="text-center mt-6 text-red-600">Failed to load schedules.</p>

//   return (
//     <div className="w-full mx-auto max-w-4xl">
//       {showTitle && <PageTitle />}

//       {/* Filter & Columns */}
//       <div className="flex items-center py-4 gap-2">
//         <Input
//           placeholder="Search schedules..."
//           value={filterValue}
//           onChange={(e) => setFilterValue(e.target.value)}
//           className="max-w-sm"
//         />

//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="outline" className="ml-auto">
//               Columns <ChevronDown className="ml-1" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             {table.getAllColumns()
//               .filter((col) => col.getCanHide())
//               .map((column) => (
//                 <DropdownMenuCheckboxItem
//                   key={column.id}
//                   checked={column.getIsVisible()}
//                   onCheckedChange={(val) => column.toggleVisibility(!!val)}
//                 >
//                   {column.id}
//                 </DropdownMenuCheckboxItem>
//               ))}
//           </DropdownMenuContent>
//         </DropdownMenu>

//         {/* Page size selector */}
//         <Select
//           value={pageSize.toString()}
//           onValueChange={(val) => setPageSize(Number(val))}
//           className="w-24 ml-2"
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Rows" />
//           </SelectTrigger>
//           <SelectContent>
//             {[5, 10, 20, 50].map((size) => (
//               <SelectItem key={size} value={size.toString()}>
//                 {size} / page
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto border rounded-md">
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((hg) => (
//               <TableRow key={hg.id}>
//                 {hg.headers.map((header) => (
//                   <TableHead key={header.id}>
//                     {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>

//           <TableBody>
//             {table.getRowModel().rows.length > 0 ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow key={row.id}>
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={columns.length} className="text-center py-4">
//                   No schedules found
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Previous / Next Pagination */}
//       <div className="flex justify-between items-center mt-4">
//         <div className="text-sm text-gray-500">
//           {table.getState().pagination.pageIndex * pageSize + 1} -{" "}
//           {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, table.getFilteredRowModel().rows.length)} of{" "}
//           {table.getFilteredRowModel().rows.length} rows
//         </div>
//         <div className="space-x-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//           >
//             Previous
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//           >
//             Next
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }
