// src\features\setting\components\ContractorTable.jsx
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
import { Pencil, Trash2, ArrowUpDown, ChevronUp, ChevronDown, PlusIcon, Search } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useNavigate } from "react-router-dom";
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

// Random pastel colors for avatars (based on name hash)
const getAvatarColor = (name) => {
  if (!name) return "bg-muted";
  const colors = [
    "bg-indigo-500 text-white",
    "bg-green-500 text-white",
    "bg-orange-500 text-white",
    "bg-purple-500 text-white",
    "bg-blue-500 text-white",
    "bg-pink-500 text-white",
    "bg-teal-500 text-white",
    "bg-red-500 text-white",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function ContractorTable() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ── Default sort: most recently updated/created contractor first ────────
  // UPDATE_DATE is set to SYSDATE on both insert and update in the backend,
  // so newly added AND newly edited contractors both float to the top.
  // ── Default sort: manual SORT_ORDER first ────────────────────────────────
  const [sorting, setSorting] = useState([{ id: "SORT_ORDER", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  // ENTRY_DATE and UPDATE_DATE stay in the table (so sorting works) but are
  // hidden from the UI by default.
  const [columnVisibility, setColumnVisibility] = useState({
    ENTRY_DATE: false,
    UPDATE_DATE: false,
    SORT_ORDER: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["contrators"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/contractor`);
      return res.data?.data || [];
    },
  });

  const apiData = data || [];

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return axios.delete(`${url}/api/contractor/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contrators"]);
      toast.success("Contractor deleted successfully!");
    },
    onError: (err) => {
      console.error("Delete error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to delete contractor.",
      );
    },
  });

  const showMoveToast = (newPosition) => {
  if (!newPosition) return;
  const pageSize = table.getState().pagination.pageSize;
  const destinationPage = Math.ceil(newPosition / pageSize);
  const currentPage = table.getState().pagination.pageIndex + 1;

  if (destinationPage !== currentPage) {
    toast.success(`Moved to position ${newPosition} — now on page ${destinationPage}`);
  } else {
    toast.success(`Moved to position ${newPosition}`);
  }
};
const moveMutation = useMutation({
  mutationFn: async ({ id, direction }) => {
    return axios.patch(`${url}/api/contractor/${id}/move`, { direction });
  },
  onSuccess: (res) => {
    queryClient.invalidateQueries(["contrators"]);
    showMoveToast(res?.data?.data?.newPosition);
  },
  onError: (err) => {
    console.error("Move error:", err);
    toast.error(err?.response?.data?.message || "Failed to move contractor.");
  },
});

const reorderMutation = useMutation({
  mutationFn: async ({ id, newPosition }) => {
    return axios.patch(`${url}/api/contractor/${id}/reorder`, { newPosition });
  },
  onSuccess: (res) => {
    queryClient.invalidateQueries(["contrators"]);
    showMoveToast(res?.data?.data?.newPosition);
  },
  onError: (err) => {
    console.error("Reorder error:", err);
    toast.error(err?.response?.data?.message || "Failed to reorder contractor.");
  },
});

  const handleMove = (id, direction) => {
    moveMutation.mutate({ id, direction });
  };

  const handleReorderInput = (id, value) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    reorderMutation.mutate({ id, newPosition: parsed });
  };

  // const handleEdit = (contractorId) => {
  //   setSelectedContractorId(contractorId);
  //   setEditSheetOpen(true);
  // };

  const handleEdit = (contractorId) => {
    navigate(`/dashboard/contractor/${contractorId}/edit`);
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
          className="border-border"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-border"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "CONTRATOR_NAME",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-overline text-muted-foreground hover:text-foreground transition-colors"
        >
          Contractor Name
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => {
        const name = row.getValue("CONTRATOR_NAME") || "—";
        const parts = name.trim().split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 rounded-full border border-border">
              <AvatarFallback
                className={`text-xs font-bold ${getAvatarColor(name)}`}
              >
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight">
              <span className="font-medium text-foreground text-sm">
                {firstName}
              </span>
              {lastName && (
                <span className="font-medium text-foreground text-sm">
                  {lastName}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    // ── Hidden by default, kept only so ENTRY_DATE/UPDATE_DATE sorting works ──
    {
      accessorKey: "ENTRY_DATE",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-overline text-muted-foreground hover:text-foreground transition-colors"
        >
          Entry Date
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("ENTRY_DATE") || "—"}
        </div>
      ),
    },
    {
      accessorKey: "UPDATE_DATE",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-overline text-muted-foreground hover:text-foreground transition-colors"
        >
          Updated
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("UPDATE_DATE") || "—"}
        </div>
      ),
    },
    {
      accessorKey: "EMAIL",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-overline text-muted-foreground hover:text-foreground transition-colors"
        >
          Email
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-foreground">
          {row.getValue("EMAIL") || "—"}
        </div>
      ),
    },
    {
      accessorKey: "ADDRESS",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-overline text-muted-foreground hover:text-foreground transition-colors"
        >
          Address
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-foreground max-w-[200px] truncate">
          {row.getValue("ADDRESS") || "—"}
        </div>
      ),
    },
    {
      accessorKey: "MOBILE",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-overline text-muted-foreground hover:text-foreground transition-colors"
        >
          Mobile
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-foreground">
          {row.getValue("MOBILE") || "—"}
        </div>
      ),
    },
    {
      accessorKey: "SORT_ORDER",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-overline text-muted-foreground hover:text-foreground transition-colors"
        >
          Sort Order
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),

      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("SORT_ORDER") ?? "—"}
        </div>
      ),
    },

  {
  id: "reorder",
  enableHiding: false,
  enableSorting: false,
  header: () => (
    <div className="text-overline text-muted-foreground text-center">
      Order
    </div>
  ),
  cell: ({ row }) => {
    const item = row.original;
    const [localValue, setLocalValue] = React.useState(String(item.SORT_ORDER ?? ""));

    React.useEffect(() => {
      setLocalValue(String(item.SORT_ORDER ?? ""));
    }, [item.SORT_ORDER]);

    const totalCount = apiData.length;
    const isFirst = Number(item.SORT_ORDER) <= 1;
    const isLast = Number(item.SORT_ORDER) >= totalCount;

    return (
      <div className="flex items-center gap-1 justify-center">
        <div className="flex flex-col">
          <button
            onClick={() => handleMove(item.CONTRATOR_ID, "up")}
            title="Move up"
            disabled={moveMutation.isPending || isFirst}
            className="p-0.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => handleMove(item.CONTRATOR_ID, "down")}
            title="Move down"
            disabled={moveMutation.isPending || isLast}
            className="p-0.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronDown size={14} />
          </button>
        </div>
        <Input
          type="text"
          inputMode="numeric"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          onBlur={() => {
            if (localValue !== String(item.SORT_ORDER ?? "")) {
              handleReorderInput(item.CONTRATOR_ID, localValue);
            }
          }}
          className="h-7 w-14 text-center text-sm px-1"
        />
      </div>
    );
  },
},
    {
      id: "actions",
      enableHiding: false,
      header: () => (
        <div className="text-overline text-muted-foreground text-center">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1 justify-center">
            <button
              onClick={() => handleEdit(item.CONTRATOR_ID)}
              title="Edit"
              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-all"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => handleDeleteClick(item.CONTRATOR_ID)}
              title="Delete"
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-all"
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={16} />
            </button>
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
    <>
      <div className="mt-6">
        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter contractors..."
              value={table.getColumn("CONTRATOR_NAME")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table
                  .getColumn("CONTRATOR_NAME")
                  ?.setFilterValue(e.target.value)
              }
              className="pl-9 h-10 rounded-md border-border bg-card text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 rounded-md border-border gap-2"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-sm bg-current" />
                      <div className="w-1.5 h-1.5 rounded-sm bg-current" />
                      <div className="w-1.5 h-1.5 rounded-sm bg-current" />
                      <div className="w-1.5 h-1.5 rounded-sm bg-current" />
                    </div>
                  </div>
                  Columns
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 bg-card border-border"
              >
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize text-sm"
                      checked={col.getIsVisible()}
                      onCheckedChange={(val) => col.toggleVisibility(!!val)}
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => navigate("/dashboard/contractor/create")}
              className="h-10 rounded-md gap-2"
            >
              <PlusIcon size={16} />
              Add New Contractor
            </Button>
          </div>
        </div>

        {/* ── Table Card ───────────────────────────────────────────────── */}
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow
                  key={group.id}
                  className="border-b border-border bg-muted/20"
                >
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 py-3 font-medium"
                    >
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
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-3 align-middle"
                      >
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
                    No contractors found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border">
          <DataTablePaginationTwo table={table} tableKey="contractors" />
        </div>
      </div>

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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Contractor?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the contractor and all associated
              contractor types. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteTargetId(null)}
              className="border-border"
            >
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
