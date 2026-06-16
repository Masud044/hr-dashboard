import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Pencil, Trash2, ArrowUpDown, ChevronDown, PlusIcon } from "lucide-react";
import { toast } from "react-toastify";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTablePagination } from "@/components/DataTablePagination";
import { EditContractorSheet } from "../pages/EditContractorSheet";
import { CreateContractorSheet } from "../pages/CreateContractorSheet";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function ContractorTable() {
  const queryClient = useQueryClient();

  // ── State ──────────────────────────────────────────────────────────────────
  const [sorting, setSorting]                       = useState([]);
  const [columnFilters, setColumnFilters]           = useState([]);
  const [columnVisibility, setColumnVisibility]     = useState({});
  const [rowSelection, setRowSelection]             = useState({});
  const [editSheetOpen, setEditSheetOpen]           = useState(false);
  const [createSheetOpen, setCreateSheetOpen]       = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen]     = useState(false);
  const [deleteTargetId, setDeleteTargetId]         = useState(null);

  // ── Fetch all contractors ─────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["contrators"],
    queryFn: async () => {
      // New endpoint: GET /api/contractors
      const res = await axios.get(`${url}/api/contractor`);
      return res.data?.data || [];
    },
  });

  const apiData = data || [];

  // ── Delete mutation ───────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // New endpoint: DELETE /api/contractors/:id
      return axios.delete(`${url}/api/contractor/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contrators"]);
      toast.success("Contractor deleted successfully!");
    },
    onError: (err) => {
      console.error("Delete error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to delete contractor."
      );
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEdit = (contractorId) => {
    setSelectedContractorId(contractorId);
    setEditSheetOpen(true);
  };

  const handleDeleteClick = (contractorId) => {
    setDeleteTargetId(contractorId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = [
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
    {
      accessorKey: "CONTRATOR_NAME",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          CONTRACTOR NAME <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3 font-medium">{row.getValue("CONTRATOR_NAME")}</div>
      ),
    },
    {
      accessorKey: "ENTRY_DATE",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ENTRY DATE <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3 text-sm text-muted-foreground">
          {row.getValue("ENTRY_DATE")}
        </div>
      ),
    },
    {
      accessorKey: "EMAIL",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          EMAIL <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3 text-sm">{row.getValue("EMAIL")}</div>
      ),
    },
    {
      accessorKey: "ADDRESS",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ADDRESS <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3 text-sm max-w-[200px] truncate">
          {row.getValue("ADDRESS")}
        </div>
      ),
    },
    {
      accessorKey: "MOBILE",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          MOBILE <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-3 text-sm">{row.getValue("MOBILE")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2 justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(item.CONTRATOR_ID)}
              title="Edit"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive/80"
              onClick={() => handleDeleteClick(item.CONTRATOR_ID)}
              title="Delete"
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        );
      },
    },
  ];

  // ── Table instance ────────────────────────────────────────────────────────
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
    <>
      <div className="mt-4 shadow-2xl rounded-lg bg-card">
        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        <div className="flex items-center py-4 px-4 gap-2">
          <Input
            placeholder="Filter contractors..."
            value={table.getColumn("CONTRATOR_NAME")?.getFilterValue() ?? ""}
            onChange={(e) =>
              table.getColumn("CONTRATOR_NAME")?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(val) => col.toggleVisibility(!!val)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setCreateSheetOpen(true)}>
            <PlusIcon size={16} className="mr-1" />
            Add New Contractor
          </Button>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
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
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && table.getRowModel().rows.length > 0 &&
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!isLoading && table.getRowModel().rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24 text-muted-foreground">
                    No contractors found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      {/* ── Sheets ─────────────────────────────────────────────────────────── */}
      <CreateContractorSheet
        isOpen={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
      />

      <EditContractorSheet
        isOpen={editSheetOpen}
        onClose={() => {
          setEditSheetOpen(false);
          setSelectedContractorId(null);
        }}
        contractorId={selectedContractorId}
      />

      {/* ── Delete Confirm Dialog ──────────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contractor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contractor and all associated
              contractor types. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTargetId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}