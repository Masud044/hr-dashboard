// src/features/worker-attendance/attendance-list.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Pencil, Trash2, PlusIcon } from "lucide-react";
import { toast } from "react-toastify";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function AttendanceList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [filters, setFilters] = useState({ WORKER_ID: "", PROJECT_ID: "", FROM_DATE: "", TO_DATE: "" });

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

  const workerMap = useMemo(() => Object.fromEntries(workers.map((w) => [w.WORKER_ID, w.WORKER_NAME])), [workers]);
  const projectMap = useMemo(() => Object.fromEntries(projects.map((p) => [p.P_ID, p.P_NAME])), [projects]);

  // Fetch attendance data with server-side pagination and filtering
  const { data: apiData, isLoading } = useQuery({
    queryKey: ["worker-attendance", filters, pagination],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.WORKER_ID) params.append("WORKER_ID", filters.WORKER_ID);
      if (filters.PROJECT_ID) params.append("PROJECT_ID", filters.PROJECT_ID);
      if (filters.FROM_DATE) params.append("FROM_DATE", filters.FROM_DATE);
      if (filters.TO_DATE) params.append("TO_DATE", filters.TO_DATE);
      params.append("page", pagination.pageIndex + 1);
      params.append("limit", pagination.pageSize);
      
      const res = await axios.get(`${url}/api/worker-attendance?${params.toString()}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => axios.delete(`${url}/api/worker-attendance/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["worker-attendance"]);
      toast.success("Attendance deleted successfully!");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to delete attendance."),
  });

  // Reset pagination to first page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [filters]);

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



  const columns = [
    {
  accessorKey: "ATTENDANCE_DATE",
  header: "Date",
  cell: ({ row }) => (
    <div className="text-sm">{formatDateWithDay(row.getValue("ATTENDANCE_DATE"))}</div>
  ),
},
    {
      accessorKey: "WORKER_ID",
      header: "Worker",
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          {workerMap[row.getValue("WORKER_ID")] || `ID: ${row.getValue("WORKER_ID")}`}
        </div>
      ),
    },
    {
      accessorKey: "PROJECT_ID",
      header: "Project",
      cell: ({ row }) => (
        <div className="text-sm">
          {projectMap[row.getValue("PROJECT_ID")] || `ID: ${row.getValue("PROJECT_ID")}`}
        </div>
      ),
    },
   
    {
      accessorKey: "CALC_BASIS",
      header: "Calc Basis",
      cell: ({ row }) => <div className="text-sm">{row.getValue("CALC_BASIS") || "—"}</div>,
    },
    {
      id: "worked",
      header: "Hours/Days Worked",
      cell: ({ row }) => {
        const original = row.original;
        if (original.CALC_BASIS === "DAY") {
          return <div className="text-sm">{original.DAYS_WORKED ?? "—"} Days</div>;
        }
        if (original.CALC_BASIS === "HOUR") {
          if (original.ENTRY_MODE === "HOURS") return <div className="text-sm">{original.HOURS_WORKED ?? "—"} Hours</div>;
          if (original.ENTRY_MODE === "TIME") return <div className="text-sm">{original.START_TIME} - {original.END_TIME}</div>;
        }
        return <div className="text-sm">—</div>;
      },
    },
    {
      accessorKey: "REMARKS",
      header: "Remarks",
      cell: ({ row }) => (
        <div className="text-sm max-w-[150px] truncate" title={row.getValue("REMARKS")}>
          {row.getValue("REMARKS") || "—"}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const itemId = item.ID || item.ATTENDANCE_ID;
        return (
          <div className="flex items-center gap-1 justify-center">
            <button
              onClick={() => handleEdit(item)}
              title="Edit"
              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-all"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => handleDeleteClick(itemId)}
              title="Delete"
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-all"
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
      <div className="mt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <Select
              value={filters.WORKER_ID}
              onValueChange={(v) => setFilters((f) => ({ ...f, WORKER_ID: v === "all" ? "" : v }))}
            >
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="All Workers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workers</SelectItem>
                {workers.map((w) => (
                  <SelectItem key={w.WORKER_ID} value={String(w.WORKER_ID)}>
                    {w.WORKER_NAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.PROJECT_ID}
              onValueChange={(v) => setFilters((f) => ({ ...f, PROJECT_ID: v === "all" ? "" : v }))}
            >
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.P_ID} value={String(p.P_ID)}>
                    {p.P_NAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.FROM_DATE}
              onChange={(e) => setFilters((f) => ({ ...f, FROM_DATE: e.target.value }))}
              className="w-[160px] h-10"
              placeholder="From Date"
            />
            <Input
              type="date"
              value={filters.TO_DATE}
              onChange={(e) => setFilters((f) => ({ ...f, TO_DATE: e.target.value }))}
              className="w-[160px] h-10"
              placeholder="To Date"
            />
          </div>
          <Button onClick={handleCreate} className="h-10 rounded-md gap-2">
            <PlusIcon size={16} />
            Add Attendance
          </Button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="border-b border-border bg-muted/20">
                  {group.headers.map((header) => (
                    <TableHead key={header.id} className="px-4 py-3 font-medium">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24 text-sm text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                !isLoading && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center h-24 text-sm text-muted-foreground">
                      No records found.
                    </TableCell>
                  </TableRow>
                )
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
        <AlertDialogContent className="bg-card border-border rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this attendance record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTargetId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}