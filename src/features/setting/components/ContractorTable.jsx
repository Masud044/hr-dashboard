// src\features\setting\components\ContractorTable.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { create } from "zustand";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Pencil,
  Trash2,
  ChevronDown,
  PlusIcon,
  Search,
  MoveUpIcon,
  MoveDown,
  Rows2,
  Rows3,
  Rows4,
  RotateCw,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useHasPermission } from "@/hooks/use-permission";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableCell,
  TableHead,
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
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
import { EditContractorSheet } from "../pages/EditContractorSheet";
import { CreateContractorSheet } from "../pages/CreateContractorSheet";
import { useNavigate } from "react-router-dom";
import WrappedName from "@/components/shared/WrappedName";
import { usePersistedColumnVisibility } from "@/hooks/use-persisted-column-visibility";
import { cn } from "@/lib/utils";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const TABLE_ID = "contractors";

// Manual-order table: rows are always sorted by their hand-assigned
// SORT_ORDER ascending, and there is no column sorting UI at all. The Order
// column (up/down arrows + position input) is the only way to reorder rows.
const sortByManualOrder = (items) =>
  [...items].sort((a, b) => {
    const left = Number(a?.SORT_ORDER);
    const right = Number(b?.SORT_ORDER);
    const leftRank = Number.isFinite(left) ? left : Number.MAX_SAFE_INTEGER;
    const rightRank = Number.isFinite(right) ? right : Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });

// Columns hidden from the UI by default but kept in the table so their data
// remains available. Reset columns restores this map.
const DEFAULT_COLUMN_VISIBILITY = {
  ENTRY_DATE: false,
  UPDATE_DATE: false,
  SORT_ORDER: false,
};

// ════════════════════════════════════════════════════════════════════════════
// Row highlight (reading marker) — stored in Zustand by stable row id so it
// survives re-renders, sorting, filtering and pagination. One row at a time.
// ════════════════════════════════════════════════════════════════════════════
const useRowHighlightStore = create((set) => ({
  highlightedByTable: {},
  toggle: (tableId, rowId) =>
    set((state) => ({
      highlightedByTable: {
        ...state.highlightedByTable,
        [tableId]:
          state.highlightedByTable[tableId] === rowId ? null : rowId,
      },
    })),
  clear: (tableId) =>
    set((state) => ({
      highlightedByTable: { ...state.highlightedByTable, [tableId]: null },
    })),
}));

// ════════════════════════════════════════════════════════════════════════════
// Density — one toggle, 40 / 48 / 56px rows. Default is 48px.
// ════════════════════════════════════════════════════════════════════════════
const DENSITY = {
  compact: { cell: "h-10 px-3", head: "h-10 px-3" },
  default: { cell: "h-12 px-4", head: "h-12 px-4" },
  comfortable: { cell: "h-14 px-4", head: "h-14 px-4" },
};

const DENSITY_OPTIONS = [
  { id: "compact", label: "Compact rows", icon: Rows2 },
  { id: "default", label: "Default rows", icon: Rows3 },
  { id: "comfortable", label: "Comfortable rows", icon: Rows4 },
];

const DENSITY_STORAGE_PREFIX = "dataTableDensity";

// Layout preference only: density is persisted per table, and any invalid or
// unavailable stored value falls back to the 48px default.
function readStoredDensity(tableKey) {
  if (typeof window === "undefined") return "default";
  try {
    const raw = window.localStorage.getItem(
      `${DENSITY_STORAGE_PREFIX}:${tableKey}`,
    );
    return DENSITY_OPTIONS.some((option) => option.id === raw)
      ? raw
      : "default";
  } catch {
    // storage unavailable (private mode, quota) — use the default
    return "default";
  }
}

// Column widths: numbers, dates and state are fixed; text columns carry a
// min-width, and address is the one flexible column that absorbs slack.
const COLUMN_WIDTH = {
  select: "w-11 min-w-11",
  CONTRATOR_NAME: "w-[220px] min-w-[220px] max-w-[220px]",
  ENTRY_DATE: "w-[130px] min-w-[130px]",
  UPDATE_DATE: "w-[130px] min-w-[130px]",
  EMAIL: "w-[220px] min-w-[220px] max-w-[220px]",
  ADDRESS: "w-full min-w-[240px]",
  MOBILE: "w-[150px] min-w-[150px]",
  SORT_ORDER: "w-[100px] min-w-[100px]",
  reorder: "w-[104px] min-w-[104px]",
  actions: "w-24 min-w-24",
};

// Horizontal pinning: checkbox + identity on the left, order + actions on the
// right. Every pinned cell paints an opaque row surface so scrolling content
// passes underneath instead of bleeding through.
const PINNED = {
  select: "sticky left-0",
  CONTRATOR_NAME: "sticky left-11",
  reorder: "sticky right-24",
  actions: "sticky right-0",
};

const SKELETON_WIDTH = {
  select: "w-4",
  CONTRATOR_NAME: "w-40",
  ENTRY_DATE: "w-24",
  UPDATE_DATE: "w-24",
  EMAIL: "w-36",
  ADDRESS: "w-44",
  MOBILE: "w-24",
  SORT_ORDER: "w-10",
  reorder: "w-20",
  actions: "w-14",
};

const isMissing = (value) =>
  value === null || value === undefined || value === "";

const isInteractiveTarget = (target) =>
  target instanceof Element &&
  Boolean(
    target.closest(
      "button, a, input, select, textarea, [role='checkbox'], [role='menuitem']",
    ),
  );

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value) {
  const raw = String(value);
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? raw : DATE_FORMATTER.format(date);
}

// Stable row id — never the index.
const getRowId = (item) => String(item?.CONTRATOR_ID ?? "");

function TextCell({ value, className, title, numeric = false }) {
  if (isMissing(value)) {
    return (
      <span className="block text-muted-foreground" aria-label="No value">
        —
      </span>
    );
  }

  return (
    <span
      className={cn(
        "block truncate",
        numeric && "text-right tabular-nums",
        className,
      )}
      title={title ?? String(value)}
    >
      {value}
    </span>
  );
}

function DateCell({ value }) {
  if (isMissing(value)) {
    return <span className="text-muted-foreground">—</span>;
  }

  const text = formatDate(value);

  return (
    <span className="block truncate tabular-nums text-muted-foreground" title={text}>
      {text}
    </span>
  );
}

// Container-query substitute: the row layout switches below ~800px of table
// width — not the viewport — so narrow side panels stack as well.
function useContainerWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    setWidth(element.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

function ReorderCell({
  item,
  itemId,
  moveMutation,
  reorderMutation,
  handleMove,
  handleReorderInput,
  canEdit,
}) {
  const [localValue, setLocalValue] = React.useState(
    String(item.SORT_ORDER ?? ""),
  );

  React.useEffect(() => {
    setLocalValue(String(item.SORT_ORDER ?? ""));
  }, [item.SORT_ORDER]);

  return (
    <div className="flex items-center justify-center gap-1">
      <div className="flex flex-col gap-1">
        <button
          onClick={(event) => {
            event.stopPropagation();
            handleMove(itemId, "up");
          }}
          title="Move up"
          aria-label="Move up"
          disabled={
            moveMutation.isPending ||
            reorderMutation.isPending ||
            !canEdit
          }
          className="rounded p-0.5 text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30"
        >
          <MoveUpIcon size={13} />
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation();
            handleMove(itemId, "down");
          }}
          title="Move down"
          aria-label="Move down"
          disabled={
            moveMutation.isPending ||
            reorderMutation.isPending ||
            !canEdit
          }
          className="rounded p-0.5 text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30"
        >
          <MoveDown size={13} />
        </button>
      </div>
      <Input
        type="text"
        inputMode="numeric"
        aria-label={`Position for ${item.CONTRATOR_NAME ?? "contractor"}`}
        value={localValue}
        disabled={moveMutation.isPending || reorderMutation.isPending || !canEdit}
        onClick={(event) => event.stopPropagation()}
        onChange={(e) => setLocalValue(e.target.value.replace(/[^0-9]/g, ""))}
        onKeyDown={(e) => {
          // Space toggles the row highlight — keep it out of the input.
          e.stopPropagation();
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        onBlur={() => {
          if (localValue !== String(item.SORT_ORDER ?? "")) {
            handleReorderInput(itemId, localValue);
          }
        }}
        className="h-7 w-14 rounded-md border-0 px-1 text-center text-sm tabular-nums disabled:opacity-50"
      />
    </div>
  );
}

export function ContractorTable() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const canEdit = useHasPermission("CONTRACTOR_EDIT");
  const canDelete = useHasPermission("CONTRACTOR_DELETE");
  const canCreate = useHasPermission("CONTRACTOR_CREATE");

  // ── Manual order: fixed SORT_ORDER ascending, no column sorting UI ───────
  const [columnFilters, setColumnFilters] = useState([]);
  // Date and sort-order columns stay in the table (so their data remains
  // available) but are hidden from the UI by default. Visibility is a layout
  // preference and persists per table.
  const [columnVisibility, setColumnVisibility] = usePersistedColumnVisibility(
    TABLE_ID,
    DEFAULT_COLUMN_VISIBILITY,
  );
  const [rowSelection, setRowSelection] = useState({});
  const [density, setDensityState] = useState(() => readStoredDensity(TABLE_ID));
  const setDensity = useCallback((next) => {
    if (!DENSITY_OPTIONS.some((option) => option.id === next)) return;
    setDensityState(next);
    try {
      window.localStorage.setItem(
        `${DENSITY_STORAGE_PREFIX}:${TABLE_ID}`,
        next,
      );
    } catch {
      // storage unavailable — keep the in-memory value
    }
  }, []);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [tableAreaRef, tableAreaWidth] = useContainerWidth();
  const isStacked = tableAreaWidth > 0 && tableAreaWidth < 800;

  const highlightedId = useRowHighlightStore(
    (state) => state.highlightedByTable[TABLE_ID] ?? null,
  );
  const toggleHighlight = useRowHighlightStore((state) => state.toggle);
  const clearHighlight = useRowHighlightStore((state) => state.clear);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["contrators"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/contractor`);
      return res.data?.data || [];
    },
  });

  // Manual order is authoritative: never rely on whatever order the API
  // returns. The Order column writes SORT_ORDER; this keeps rows in step.
  const apiData = useMemo(() => sortByManualOrder(data || []), [data]);

  // Drop the marker when the highlighted row leaves the current data set.
  useEffect(() => {
    if (!highlightedId || isLoading) return;
    const stillPresent = apiData.some(
      (item) => getRowId(item) === highlightedId,
    );
    if (!stillPresent) clearHighlight(TABLE_ID);
  }, [apiData, highlightedId, isLoading, clearHighlight]);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return axios.delete(`${url}/api/contractor/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contrators"]);
      setRowSelection({});
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
      table.setPageIndex(destinationPage - 1); // follow the item
      toast.success(
        `Moved to position ${newPosition} — now on page ${destinationPage}`,
      );
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
      return axios.patch(`${url}/api/contractor/${id}/reorder`, {
        newPosition,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["contrators"]);
      showMoveToast(res?.data?.data?.newPosition);
    },
    onError: (err) => {
      console.error("Reorder error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to reorder contractor.",
      );
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
    // ── Selection (separate from the row highlight) ──────────────────────
    {
      id: "select",
      header: ({ table }) => (
        <div
          className="flex items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="border-border"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div
          className="flex items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select ${row.original.CONTRATOR_NAME || "contractor"}`}
            className="border-border"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { label: "Select" },
    },
    // ── Identity ────────────────────────────────────────────────────────
    {
      accessorKey: "CONTRATOR_NAME",
      header: "Contractor Name",
      enableSorting: false,
      meta: { label: "Contractor Name" },
      cell: ({ row }) => (
        <WrappedName
          name={row.getValue("CONTRATOR_NAME") || ""}
          maxLines={1}
          size="sm"
          showAvatar
          maxChars={20}
        />
      ),
    },
    // ── Date/meta columns, hidden by default but available via Columns ────
    {
      accessorKey: "ENTRY_DATE",
      header: "Entry Date",
      enableSorting: false,
      meta: { label: "Entry Date" },
      cell: ({ row }) => <DateCell value={row.getValue("ENTRY_DATE")} />,
    },
    {
      accessorKey: "UPDATE_DATE",
      header: "Updated",
      enableSorting: false,
      meta: { label: "Updated" },
      cell: ({ row }) => <DateCell value={row.getValue("UPDATE_DATE")} />,
    },
    // ── Meta / contact ──────────────────────────────────────────────────
    {
      accessorKey: "EMAIL",
      header: "Email",
      enableSorting: false,
      meta: { label: "Email" },
      cell: ({ row }) => (
        <TextCell
          value={row.getValue("EMAIL")}
          className="text-foreground"
          title={row.getValue("EMAIL")}
        />
      ),
    },
    {
      accessorKey: "ADDRESS",
      header: "Address",
      enableSorting: false,
      meta: { label: "Address" },
      cell: ({ row }) => (
        <TextCell
          value={row.getValue("ADDRESS")}
          className="text-foreground"
          title={row.getValue("ADDRESS")}
        />
      ),
    },
    {
      accessorKey: "MOBILE",
      header: "Mobile",
      enableSorting: false,
      meta: { label: "Mobile" },
      cell: ({ row }) => (
        <TextCell
          value={row.getValue("MOBILE")}
          className="tabular-nums text-foreground"
        />
      ),
    },
    {
      accessorKey: "SORT_ORDER",
      header: () => <div className="text-right">Sort Order</div>,
      meta: { label: "Sort Order" },
      cell: ({ row }) => {
        const value = row.getValue("SORT_ORDER");
        return (
          <div className="text-right">
            {isMissing(value) ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              <span className="tabular-nums text-muted-foreground">
                {value}
              </span>
            )}
          </div>
        );
      },
    },

    // ── Actions: order controls, then edit/delete (always visible) ───────
    {
      id: "reorder",
      enableHiding: false,
      enableSorting: false,
      meta: { label: "Order" },
      header: () => (
        <div className="text-center text-overline text-muted-foreground">
          Order
        </div>
      ),
      cell: ({ row }) => (
        <ReorderCell
          item={row.original}
          itemId={row.original.CONTRATOR_ID} // P_ID in project-list.jsx
          moveMutation={moveMutation}
          reorderMutation={reorderMutation}
          handleMove={handleMove}
          handleReorderInput={handleReorderInput}
          canEdit={canEdit}
        />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => (
        <div className="text-center text-overline text-muted-foreground">
          Actions
        </div>
      ),
      meta: { label: "Actions" },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-center gap-1">
            {canEdit && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleEdit(item.CONTRATOR_ID);
                }}
                title="Edit"
                aria-label={`Edit ${item.CONTRATOR_NAME || "contractor"}`}
                className="rounded-md p-2 text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Pencil size={16} />
              </button>
            )}

            {canDelete && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteClick(item.CONTRATOR_ID);
                }}
                title="Delete"
                aria-label={`Delete ${item.CONTRATOR_NAME || "contractor"}`}
                className="rounded-md p-2 text-muted-foreground transition-all hover:bg-destructive/5 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: apiData,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableSorting: false, // manual-order table: no sortable columns
    autoResetPageIndex: false,
    state: { columnFilters, columnVisibility, rowSelection },
  });

  const rows = table.getRowModel().rows;
  const columnCount = table.getVisibleLeafColumns().length;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  // Skeleton cells mirror the real row layout (avatar, inputs, buttons) so the
  // loading state and the loaded state have the same rhythm.
  const renderSkeletonCell = (columnId) => {
    if (columnId === "select") {
      return <Skeleton className="mx-auto h-4 w-4 rounded-xs" />;
    }
    if (columnId === "CONTRATOR_NAME") {
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
          <Skeleton className="h-3.5 w-28" />
        </div>
      );
    }
    if (columnId === "reorder") {
      return <Skeleton className="mx-auto h-7 w-24 rounded-md" />;
    }
    if (columnId === "actions") {
      return (
        <div className="flex items-center justify-center gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      );
    }
    return (
      <Skeleton className={cn("h-3.5", SKELETON_WIDTH[columnId] ?? "w-24")} />
    );
  };

  const currentDensity =
    DENSITY_OPTIONS.find((option) => option.id === density) ||
    DENSITY_OPTIONS[1];
  const CurrentDensityIcon = currentDensity.icon;

  // `touch` bumps the call-to-action to a 44px target for the phone layout.
  const renderEmptyState = (align = "center", touch = false) => {
    if (isError) {
      return (
        <div
          className={cn(
            "flex flex-col items-center gap-3 py-10",
            align === "start" && "items-start px-4",
          )}
        >
          <p className="text-sm text-muted-foreground">
            Couldn’t load contractors.
          </p>
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-2 border-border", touch && "h-11")}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RotateCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 py-10",
          align === "start" && "items-start px-4",
        )}
      >
        <p className="text-sm text-muted-foreground">No contractors found.</p>
        {canCreate && (
          <Button
            size="sm"
            className={cn("gap-2", touch && "h-11")}
            onClick={() => navigate("/dashboard/contractor/create")}
          >
            <PlusIcon size={16} />
            Add New Contractor
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-card p-4 sm:p-5 border border-border shadow-xs rounded-md">
        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter contractors..."
              aria-label="Filter contractors by name"
              value={table.getColumn("CONTRATOR_NAME")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table
                  .getColumn("CONTRATOR_NAME")
                  ?.setFilterValue(e.target.value)
              }
              className="h-11 rounded-md border-border bg-card pl-9 text-sm sm:h-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Density: compact 40 / default 48 / comfortable 56 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Row density: ${currentDensity.label}`}
                  className="h-11 rounded-md border-border gap-2 text-sm text-foreground sm:h-10"
                >
                  <CurrentDensityIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">
                    {currentDensity.label.replace(" rows", "")}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 bg-card border-border"
              >
                {DENSITY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = density === option.id;
                  return (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() => setDensity(option.id)}
                      className="flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{option.label}</span>
                      </div>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 rounded-md border-border gap-2 sm:h-10"
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
                className="w-48 bg-card border-border"
              >
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="text-sm"
                      checked={col.getIsVisible()}
                      onCheckedChange={(val) => col.toggleVisibility(!!val)}
                    >
                      {col.columnDef.meta?.label ?? col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-sm"
                  onClick={() => setColumnVisibility(DEFAULT_COLUMN_VISIBILITY)}
                >
                  Reset columns
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {canCreate && (
              <Button
                onClick={() => navigate("/dashboard/contractor/create")}
                className="h-11 rounded-md gap-2 sm:h-10"
              >
                <PlusIcon size={16} />
                Add New Contractor
              </Button>
            )}
          </div>
        </div>

        {/* ── Table / stacked rows ─────────────────────────────────────── */}
        <div ref={tableAreaRef}>
          {selectedCount > 0 && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-accent/60 px-3 py-2">
              <span className="text-sm text-foreground" aria-live="polite">
                {selectedCount} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-11 gap-2 text-muted-foreground hover:text-foreground sm:h-8"
                onClick={() => table.resetRowSelection()}
              >
                Clear selection
              </Button>
            </div>
          )}

          {isStacked ? (
            /* ── Phone / narrow container: rows, not a shrunken table ── */
            <div className="rounded-lg border border-border bg-card">
              {isLoading && (
                <div className="divide-y divide-border">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 px-4 py-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && (isError || rows.length === 0) && (
                <div className="border-b border-border last:border-b-0">
                  {renderEmptyState("start", true)}
                </div>
              )}

              {!isLoading && !isError && rows.length > 0 && (
                <ul>
                  {rows.map((row) => {
                    const item = row.original;
                    const rowId = getRowId(item);
                    const isOpen = highlightedId === rowId;
                    const isSelected = row.getIsSelected();
                    const surface = isOpen
                      ? "bg-selected"
                      : isSelected
                        ? "bg-accent"
                        : "bg-card";

                    return (
                      <li
                        key={row.id}
                        className={cn(
                          "border-b border-b-border border-l-[3px] last:border-b-0",
                          isOpen
                            ? "border-l-selected-border"
                            : "border-l-transparent",
                          surface,
                          !isOpen && "hover:bg-muted",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggleHighlight(TABLE_ID, rowId)}
                          aria-expanded={isOpen}
                          className="flex min-h-[44px] w-full flex-col gap-1 px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <WrappedName
                                name={item.CONTRATOR_NAME || ""}
                                maxLines={2}
                                size="md"
                                showAvatar
                                maxChars={70}
                              />
                            </div>
                            <span
                              className="shrink-0 tabular-nums text-sm text-muted-foreground"
                              aria-label="Sort order"
                            >
                              {isMissing(item.SORT_ORDER)
                                ? "—"
                                : `#${item.SORT_ORDER}`}
                            </span>
                            <ChevronDown
                              aria-hidden="true"
                              className={cn(
                                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out motion-reduce:transition-none",
                                isOpen && "rotate-180",
                              )}
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-11 text-sm text-muted-foreground">
                            <span className="max-w-full truncate">
                              {isMissing(item.EMAIL) ? "—" : item.EMAIL}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              {isMissing(item.MOBILE) ? "—" : item.MOBILE}
                            </span>
                          </div>
                        </button>

                        <div
                          inert={!isOpen}
                          className={cn(
                            "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
                            isOpen
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0",
                          )}
                        >
                          <div className="min-h-0">
                            <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
                              <dl className="grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1 text-sm">
                                <dt className="text-muted-foreground">Address</dt>
                                <dd className="break-words text-foreground">
                                  {isMissing(item.ADDRESS) ? "—" : item.ADDRESS}
                                </dd>
                                <dt className="text-muted-foreground">Added</dt>
                                <dd className="tabular-nums text-foreground">
                                  {isMissing(item.ENTRY_DATE) ? (
                                    "—"
                                  ) : (
                                    formatDate(item.ENTRY_DATE)
                                  )}
                                </dd>
                              </dl>

                              <div className="flex flex-wrap items-center gap-2">
                                {canEdit && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-11 gap-2 border-border"
                                    onClick={() => handleEdit(item.CONTRATOR_ID)}
                                  >
                                    <Pencil size={15} />
                                    Edit
                                  </Button>
                                )}
                                {canDelete && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-11 gap-2 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                                    onClick={() =>
                                      handleDeleteClick(item.CONTRATOR_ID)
                                    }
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 size={15} />
                                    Delete
                                  </Button>
                                )}
                                <label className="ml-auto flex h-11 items-center gap-2 text-sm text-muted-foreground">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(value) =>
                                      row.toggleSelected(!!value)
                                    }
                                    aria-label={`Select ${item.CONTRATOR_NAME || "contractor"}`}
                                    className="border-border"
                                  />
                                  Select
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            /* ── Desktop: one scroll container, pinned header + columns ── */
            <div className="max-h-[calc(100dvh-13rem)] overflow-auto overscroll-contain rounded-lg border border-border bg-card">
              <table className="w-full caption-bottom border-separate border-spacing-0 text-sm">
                <caption className="sr-only">Contractors</caption>
                <thead>
                  {table.getHeaderGroups().map((group) => (
                    <tr key={group.id}>
                      {group.headers.map((header) => {
                        const columnId = header.column.id;
                        const pinned = Boolean(PINNED[columnId]);

                        return (
                          <TableHead
                            key={header.id}
                            scope="col"
                            aria-sort={
                              columnId === "SORT_ORDER"
                                ? "ascending"
                                : undefined
                            }
                            className={cn(
                              "sticky top-0 z-30 border-b border-b-border bg-card text-left align-middle font-medium text-overline text-muted-foreground",
                              DENSITY[density].head,
                              COLUMN_WIDTH[columnId],
                              PINNED[columnId],
                              pinned && "z-40",
                              columnId === "select" &&
                                "border-l-[3px] border-l-transparent px-0",
                              columnId === "CONTRATOR_NAME" &&
                                "border-r border-r-border",
                              columnId === "reorder" &&
                                "border-l border-l-border",
                              columnId === "actions" && "px-2",
                            )}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        );
                      })}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {isLoading &&
                    Array.from({ length: 6 }).map((_, rowIndex) => {
                      const skeletonStripe =
                        rowIndex % 2 === 1 ? "bg-background" : "bg-card";

                      return (
                        <tr
                          key={`skeleton-${rowIndex}`}
                          aria-hidden="true"
                          className={skeletonStripe}
                        >
                          {table.getVisibleLeafColumns().map((column) => {
                            const columnId = column.id;
                            const pinned = Boolean(PINNED[columnId]);

                            return (
                              <TableCell
                                key={column.id}
                                className={cn(
                                  "border-b border-b-border align-middle",
                                  DENSITY[density].cell,
                                  COLUMN_WIDTH[columnId],
                                  PINNED[columnId],
                                  pinned && "z-20",
                                  pinned && skeletonStripe,
                                  columnId === "select" &&
                                    "border-l-[3px] border-l-transparent px-0",
                                  columnId === "CONTRATOR_NAME" &&
                                    "border-r border-r-border",
                                  columnId === "reorder" &&
                                    "border-l border-l-border px-1",
                                  columnId === "actions" && "px-2",
                                )}
                              >
                                {renderSkeletonCell(columnId)}
                              </TableCell>
                            );
                          })}
                        </tr>
                      );
                    })}

                  {!isLoading && isError && (
                    <tr>
                      <td
                        colSpan={columnCount}
                        className="border-b border-border"
                      >
                        {renderEmptyState()}
                      </td>
                    </tr>
                  )}

                  {!isLoading && !isError && rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={columnCount}
                        className="border-b border-border"
                      >
                        {renderEmptyState()}
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    !isError &&
                    rows.map((row) => {
                      const item = row.original;
                      const rowId = getRowId(item);
                      const isHighlighted = highlightedId === rowId;
                      const isSelected = row.getIsSelected();
                      const stripe =
                        row.index % 2 === 1 ? "bg-background" : "bg-card";
                      // Highlight wins over hover; a selected row keeps its
                      // own surface until it is hovered.
                      const surface = isHighlighted
                        ? "bg-selected"
                        : isSelected
                          ? "bg-accent"
                          : stripe;
                      const pinnedSurface = cn(
                        surface,
                        !isHighlighted && "group-hover:bg-muted",
                      );

                      return (
                        <tr
                          key={row.id}
                          data-state={isSelected ? "selected" : undefined}
                          aria-selected={isHighlighted}
                          tabIndex={0}
                          onClick={(event) => {
                            if (isInteractiveTarget(event.target)) return;
                            toggleHighlight(TABLE_ID, rowId);
                          }}
                          onKeyDown={(event) => {
                            if (event.target !== event.currentTarget) return;
                            if (event.key === " " || event.key === "Spacebar") {
                              event.preventDefault();
                              toggleHighlight(TABLE_ID, rowId);
                            }
                          }}
                          className={cn(
                            "group outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                            surface,
                            !isHighlighted && "hover:bg-muted",
                          )}
                        >
                          {row.getVisibleCells().map((cell) => {
                            const columnId = cell.column.id;
                            const pinned = Boolean(PINNED[columnId]);

                            return (
                              <TableCell
                                key={cell.id}
                                className={cn(
                                  "whitespace-nowrap border-b border-b-border align-middle",
                                  DENSITY[density].cell,
                                  COLUMN_WIDTH[columnId],
                                  PINNED[columnId],
                                  pinned && "z-20",
                                  pinned && pinnedSurface,
                                  columnId === "select" &&
                                    cn(
                                      "border-l-[3px] px-0",
                                      isHighlighted
                                        ? "border-l-selected-border"
                                        : "border-l-transparent",
                                    ),
                                  columnId === "CONTRATOR_NAME" &&
                                    "border-r border-r-border",
                                  columnId === "reorder" &&
                                    "border-l border-l-border px-1",
                                  columnId === "actions" && "px-2",
                                )}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            );
                          })}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
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
