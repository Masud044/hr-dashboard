// src/features/worker-attendance/attendance-list.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Pencil, Trash2, PlusIcon, Search } from "lucide-react";
import { toast } from "react-toastify";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { formatDateWithDay } from "@/lib/utils";
import DateInput from "@/components/shared/DateInput";
import EntityCombobox from "@/components/shared/entity-combobox";
const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function AttendanceList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  // const [filters, setFilters] = useState({ WORKER_ID: "", PROJECT_ID: "", FROM_DATE: "", TO_DATE: "" });
  const emptyFilters = {
    WORKER_ID: "",
    WORKER_NAME: "",
    PROJECT_ID: "",
    FROM_DATE: "",
    TO_DATE: "",
  };

  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);
  const [initialData, setInitialData] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Fetch workers and projects for mapping and filters
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

  // Fetch attendance data with server-side pagination and filtering
  const { data: apiData, isLoading } = useQuery({
    queryKey: ["worker-attendance", filters, pagination],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.WORKER_ID) params.append("WORKER_ID", filters.WORKER_ID);
      if (filters.WORKER_NAME)
        params.append("WORKER_NAME", filters.WORKER_NAME); // ADD THIS LINE
      if (filters.PROJECT_ID) params.append("PROJECT_ID", filters.PROJECT_ID);
      if (filters.FROM_DATE) params.append("FROM_DATE", filters.FROM_DATE);
      if (filters.TO_DATE) params.append("TO_DATE", filters.TO_DATE);
      params.append("page", pagination.pageIndex + 1);
      params.append("limit", pagination.pageSize);

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

  // Reset pagination to first page when filters change
  // useEffect(() => {
  //   setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  // }, [filters]);

  //   const handleCreate = () => {
  //     setSelectedAttendanceId(null);
  //     setInitialData(null);
  //     setSheetOpen(true);
  //   };

  //   const handleEdit = (row) => {
  //     setSelectedAttendanceId(row.ID || row.ATTENDANCE_ID);
  //     setInitialData(row);
  //     setSheetOpen(true);
  //   };

  const handleCreate = () => {
    navigate("/dashboard/worker-attendance/create");
  };

  const handleEdit = (row) => {
    const id = row.ID || row.ATTENDANCE_ID;
    navigate(`/dashboard/worker-attendance/${id}/edit`);
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
    setFilters(draftFilters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClear = () => {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const columns = [
    {
      accessorKey: "ATTENDANCE_DATE",
      header: "Date",
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
      accessorKey: "CALC_BASIS",
      header: "Calc Basis",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("CALC_BASIS") || "—"}</div>
      ),
    },
    {
      id: "worked",
      header: "Hours/Days Worked",
      cell: ({ row }) => {
        const original = row.original;
        if (original.CALC_BASIS === "DAY") {
          return (
            <div className="text-sm font-medium text-primary">
              {original.DAYS_WORKED ?? "—"} Days
            </div>
          );
        }
        if (original.CALC_BASIS === "HOUR") {
          if (original.ENTRY_MODE === "HOURS")
            return (
              <div className="text-sm font-medium text-primary">
                {original.HOURS_WORKED ?? "—"} Hours
              </div>
            );
          if (original.ENTRY_MODE === "TIME")
            return (
              <div className="text-sm font-medium text-primary">
                {original.START_TIME} - {original.END_TIME}
              </div>
            );
        }
        return <div className="text-sm">—</div>;
      },
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
              onClick={() => handleEdit(item)}
              title="Edit"
              className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-all duration-150"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => handleDeleteClick(itemId)}
              title="Delete"
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all duration-150"
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={15} />
            </button>
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
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="mt-6 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-5">
          <div className="flex flex-wrap items-center gap-3  flex-1">
            {/* <Select
              value={draftFilters.WORKER_ID}
              onValueChange={(v) =>
                setDraftFilters((f) => ({
                  ...f,
                  WORKER_ID: v === "all" ? "" : v,
                }))
              }
            >
              <SelectTrigger className="w-[180px] h-10 rounded-md border-input-border focus:shadow-focus">
                <SelectValue placeholder="All Workers" />
              </SelectTrigger>
              <SelectContent className="rounded-md">
                <SelectItem value="all">All Workers</SelectItem>
                {workers.map((w) => (
                  <SelectItem key={w.WORKER_ID} value={String(w.WORKER_ID)}>
                    {w.WORKER_NAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
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
              // getImageUrl={(item) =>
              //   `${import.meta.env.VITE_API_BASE_URL}/api/emp-images/person/${item.value}`
              // }
            />

            {/* <Select
              value={draftFilters.PROJECT_ID}
              onValueChange={(v) =>
                setDraftFilters((f) => ({
                  ...f,
                  PROJECT_ID: v === "all" ? "" : v,
                }))
              }
            >
              <SelectTrigger className="w-[180px] h-10 rounded-md border-input-border focus:shadow-focus">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent className="rounded-md">
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.P_ID} value={String(p.P_ID)}>
                    {p.P_NAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}

            <EntityCombobox
  items={projectOpts}
  value={draftFilters.PROJECT_ID}
  onValueChange={(v) => setDraftFilters((f) => ({ ...f, PROJECT_ID: v }))}
  placeholder="All Projects"
  size="md"
  className="w-60"
/>

            {/* <Input
              type="date"
              value={draftFilters.FROM_DATE}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, FROM_DATE: e.target.value }))
              }
              className="w-[160px] h-10"
            />
            <Input
              type="date"
              value={draftFilters.TO_DATE}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, TO_DATE: e.target.value }))
              }
              className="w-[160px] h-10"
            /> */}
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
          <Button
            onClick={handleCreate}
            className="h-10 rounded-full gap-2 font-bold text-primary-dark bg-gradient-to-b from-accent-light via-accent to-accent-dark shadow-accent-glow hover:brightness-105 transition-transform active:scale-95"
          >
            <PlusIcon size={16} />
            Add Attendance
          </Button>
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
