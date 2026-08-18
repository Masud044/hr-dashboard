import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import {
  Pencil,
  Trash2,
  PlusIcon,
  Search,
  Eye,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
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
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
import { AttendanceFormSheet } from "./attendance-form-sheet";
import { useNavigate } from "react-router-dom";

import DateInput from "@/components/shared/DateInput";
import EntityCombobox from "@/components/shared/entity-combobox";
import { formatDateWithDay, formatHoursMinutes } from "@/lib/utils";
import { useHasPermission } from "@/hooks/use-permission";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function SortableHeader({ label, columnId, sortBy, sortOrder, onSort }) {
  const isActive = sortBy === columnId;
  return (
    <button
      type="button"
      onClick={() => onSort(columnId)}
      className="flex items-center gap-1 font-bold hover:text-primary"
    >
      {label}
      {isActive ? (
        sortOrder === "ASC" ? (
          <ArrowUp size={14} />
        ) : (
          <ArrowDown size={14} />
        )
      ) : (
        <ChevronsUpDown size={14} className="opacity-40" />
      )}
    </button>
  );
}

export function AttendanceList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const canCreate = useHasPermission("ATTENDANCE_CREATE");
  const canEdit = useHasPermission("ATTENDANCE_EDIT");
  const canDelete = useHasPermission("ATTENDANCE_DELETE");

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsString.withDefault("ATTENDANCE_DATE"),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsString.withDefault("DESC"),
  );

  // ── Filters — URL-driven via nuqs ───────────────────────
  const [workerId, setWorkerId] = useQueryState(
    "workerId",
    parseAsString.withDefault(""),
  );
  const [workerName, setWorkerName] = useQueryState(
    "workerName",
    parseAsString.withDefault(""),
  );
  const [projectId, setProjectId] = useQueryState(
    "projectId",
    parseAsString.withDefault(""),
  );
  const [fromDate, setFromDate] = useQueryState(
    "fromDate",
    parseAsString.withDefault(""),
  );
  const [toDate, setToDate] = useQueryState(
    "toDate",
    parseAsString.withDefault(""),
  );

  const pagination = useMemo(
    () => ({ pageIndex: page - 1, pageSize: limit }),
    [page, limit],
  );

  const onPaginationChange = (updaterOrValue) => {
    const next =
      typeof updaterOrValue === "function"
        ? updaterOrValue(pagination)
        : updaterOrValue;
    setPage(next.pageIndex + 1);
    setLimit(next.pageSize);
  };

  const handleSort = (columnId) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(columnId);
      setSortOrder("DESC");
    }
    setPage(1);
  };

  // ── Draft filters — local form state, seeded from URL on first render ──
  const [draftFilters, setDraftFilters] = useState({
    WORKER_ID: workerId,
    WORKER_NAME: workerName,
    PROJECT_ID: projectId,
    FROM_DATE: fromDate,
    TO_DATE: toDate,
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);
  const [initialData, setInitialData] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const { data: workers = [] } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/worker`);
      return res.data?.data || [];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project`);
      return res.data?.data || [];
    },
  });
  const workerOpts = useMemo(
    () =>
      workers.map((w) => ({
        value: String(w.WORKER_ID),
        label: w.WORKER_NAME,
      })),
    [workers],
  );

  const workerMap = useMemo(
    () => Object.fromEntries(workers.map((w) => [w.WORKER_ID, w.WORKER_NAME])),
    [workers],
  );

  const projectOpts = useMemo(
    () => projects.map((p) => ({ value: String(p.P_ID), label: p.P_NAME })),
    [projects],
  );
  const projectMap = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.P_ID, p.P_NAME])),
    [projects],
  );

  const { data: apiData, isLoading } = useQuery({
    queryKey: [
      "worker-attendance",
      workerId,
      workerName,
      projectId,
      fromDate,
      toDate,
      page,
      limit,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (workerId) params.append("WORKER_ID", workerId);
      if (workerName) params.append("WORKER_NAME", workerName);
      if (projectId) params.append("PROJECT_ID", projectId);
      if (fromDate) params.append("FROM_DATE", fromDate);
      if (toDate) params.append("TO_DATE", toDate);
      params.append("page", page);
      params.append("limit", limit);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const res = await axios.get(
        `${url}/api/worker-attendance?${params.toString()}`,
      );
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) =>
      axios.delete(`${url}/api/worker-attendance/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["worker-attendance"]);
      toast.success("Attendance deleted successfully!");
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message || "Failed to delete attendance.",
      ),
  });

  const handleCreate = () => {
    navigate("/dashboard/worker-attendance/create");
  };

  const handleEdit = (row) => {
    const id = row.ID || row.ATTENDANCE_ID;
    navigate(`/dashboard/worker-attendance/${id}/edit`);
  };
  const handleView = (id) => {
    navigate(`/dashboard/worker-attendance/${id}`);
  };
  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) deleteMutation.mutate(deleteTargetId);
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const isDateRangeInvalid =
    draftFilters.FROM_DATE &&
    draftFilters.TO_DATE &&
    draftFilters.TO_DATE < draftFilters.FROM_DATE;

  const hasActiveDraftFilter = Object.values(draftFilters).some(
    (v) => v !== "",
  );

  const handleSearch = () => {
    if (isDateRangeInvalid) {
      toast.error("To Date cannot be earlier than From Date.");
      return;
    }
    setWorkerId(draftFilters.WORKER_ID || null);
    setWorkerName(draftFilters.WORKER_NAME || null);
    setProjectId(draftFilters.PROJECT_ID || null);
    setFromDate(draftFilters.FROM_DATE || null);
    setToDate(draftFilters.TO_DATE || null);
    setPage(1);
  };

  const handleClear = () => {
    const empty = {
      WORKER_ID: "",
      WORKER_NAME: "",
      PROJECT_ID: "",
      FROM_DATE: "",
      TO_DATE: "",
    };
    setDraftFilters(empty);
    setWorkerId(null);
    setWorkerName(null);
    setProjectId(null);
    setFromDate(null);
    setToDate(null);
    setPage(1);
  };

  const columns = [
    {
      accessorKey: "ATTENDANCE_DATE",
      header: () => (
        <SortableHeader
          label="Date"
          columnId="ATTENDANCE_DATE"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {formatDateWithDay(row.getValue("ATTENDANCE_DATE"))}
        </div>
      ),
    },
    {
      accessorKey: "WORKER_ID",
      header: "Worker",
      cell: ({ row }) => (
        <div className="text-sm font-semibold text-foreground">
          {workerMap[row.getValue("WORKER_ID")] ||
            `ID: ${row.getValue("WORKER_ID")}`}
        </div>
      ),
    },
    {
      accessorKey: "PROJECT_ID",
      header: "Project",
      cell: ({ row }) => (
        <div className="text-sm">
          {projectMap[row.getValue("PROJECT_ID")] ||
            `ID: ${row.getValue("PROJECT_ID")}`}
        </div>
      ),
    },
    {
      id: "worked",
      header: () => (
        <SortableHeader
          label="Hours Worked"
          columnId="HOURS_WORKED"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      ),
      cell: ({ row }) => (
        <div className="text-sm font-medium text-primary">
          {formatHoursMinutes(row.original.HOURS_WORKED)}
        </div>
      ),
    },
    {
      accessorKey: "REMARKS",
      header: "Remarks",
      cell: ({ row }) => (
        <div
          className="text-sm max-w-[150px] truncate text-muted-foreground"
          title={row.getValue("REMARKS")}
        >
          {row.getValue("REMARKS") || "—"}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const itemId = item.ID || item.ATTENDANCE_ID;
        return (
          <div className="flex items-center gap-1.5 justify-center">
            <button
              onClick={() => handleView(itemId)}
              title="View"
              className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-all duration-150"
            >
              <Eye size={15} />
            </button>
            {canEdit && (
              <button
                onClick={() => handleEdit(item)}
                title="Edit"
                className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-all duration-150"
              >
                <Pencil size={15} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => handleDeleteClick(itemId)}
                title="Delete"
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all duration-150"
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: apiData?.data || [],
    columns,
    manualPagination: true,
    pageCount: Math.ceil((apiData?.total || 0) / pagination.pageSize),
    state: { pagination },
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="mt-6 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-5">
          <div className="flex flex-wrap items-center gap-3  flex-1">
            <EntityCombobox
              items={workerOpts}
              value={draftFilters.WORKER_ID}
              onValueChange={(v) =>
                setDraftFilters((f) => ({ ...f, WORKER_ID: v }))
              }
              placeholder="All Workers"
              size="md"
              className="w-[180px]"
              showAvatar
              avatarInTrigger
            />

            <EntityCombobox
              items={projectOpts}
              value={draftFilters.PROJECT_ID}
              onValueChange={(v) =>
                setDraftFilters((f) => ({ ...f, PROJECT_ID: v }))
              }
              placeholder="All Projects"
              size="md"
              className="w-60"
            />

            <DateInput
              value={draftFilters.FROM_DATE}
              onChange={(v) => setDraftFilters((f) => ({ ...f, FROM_DATE: v }))}
            />
            <DateInput
              value={draftFilters.TO_DATE}
              onChange={(v) => setDraftFilters((f) => ({ ...f, TO_DATE: v }))}
            />

            <div className="relative w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by worker"
                value={draftFilters.WORKER_NAME}
                onChange={(e) =>
                  setDraftFilters((f) => ({
                    ...f,
                    WORKER_NAME: e.target.value,
                  }))
                }
                className="w-full h-10 pl-9 rounded-md border-input-border focus-visible:shadow-focus"
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={!hasActiveDraftFilter || isDateRangeInvalid}
              className="h-10 rounded-full bg-primary text-primary-foreground shadow-teal-glow hover:bg-primary/90 disabled:shadow-none font-semibold transition-transform active:scale-95"
            >
              Search
            </Button>

            {hasActiveDraftFilter && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="h-10 rounded-full border-primary text-primary hover:bg-secondary font-semibold transition-transform active:scale-95"
              >
                Clear
              </Button>
            )}
          </div>
          {canCreate && (
            <Button
              onClick={handleCreate}
              className="h-10 rounded-full gap-2 font-bold text-primary-dark bg-gradient-to-b from-accent-light via-accent to-accent-dark shadow-accent-glow hover:brightness-105 transition-transform active:scale-95"
            >
              <PlusIcon size={16} />
              Add Attendance
            </Button>
          )}
        </div>

        <div className="rounded-lg border border-border overflow-hidden bg-card shadow-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow
                  key={group.id}
                  className="border-b border-dashed border-border bg-secondary/60 hover:bg-secondary/60"
                >
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 py-3 font-bold text-foreground"
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
              {!isLoading && table.getRowModel().rows?.length
                ? table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={`border-b border-border hover:bg-secondary/50 transition-colors ${row.index % 2 === 1 ? "bg-muted/60" : ""}`}
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
                  ))
                : !isLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center h-24 text-sm text-muted-foreground"
                      >
                        No records found.
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border">
          <DataTablePaginationTwo table={table} tableKey="worker-attendance" />
        </div>
      </div>

      <AttendanceFormSheet
        isOpen={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setSelectedAttendanceId(null);
          setInitialData(null);
        }}
        attendanceId={selectedAttendanceId}
        initialData={initialData}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border rounded-xl shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Attendance?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this attendance record. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteTargetId(null)}
              className="rounded-full"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground shadow-coral-glow hover:bg-destructive/90"
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