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
import { Pencil, Trash2, ArrowUpDown, ChevronDown, PlusIcon, Search, Cog, FileText } from "lucide-react";
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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
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
import { EditProjectSheet } from "./edit-project-sheet";
import { CreateProjectSheet } from "./create-project-sheet";
import { ProcessSheet } from "./create-process-page";
import { useNavigate } from "react-router-dom";
import { ProjectReportSheet } from "./project-report-sheet";
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";




const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function NewProjectTable() {
  
  const queryClient   = useQueryClient();
const navigate = useNavigate();
  const [sorting, setSorting]                           = useState([]);
  const [columnFilters, setColumnFilters]               = useState([]);
  const [columnVisibility, setColumnVisibility]         = useState({
    LOT: false, DP: false, INSURANCE_NO: false,
    P_ENTATIVE_START_DATE: false, P_TENTATIVE_END_DATE: false,
    P_CODE: false, DESCRIPTION: false,
  });
  const [rowSelection, setRowSelection]                 = useState({});
  const [createSheetOpen, setCreateSheetOpen]           = useState(false);
  const [editSheetOpen, setEditSheetOpen]               = useState(false);
  const [selectedProjectId, setSelectedProjectId]       = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen]         = useState(false);
  const [deleteTargetId, setDeleteTargetId]             = useState(null);
  const [reportSheetOpen, setReportSheetOpen]   = useState(false);
const [reportProject, setReportProject]       = useState(null); // { id, name }

  // ── ProcessSheet state ───────────────────────────────────────────────────
  const [processSheetOpen, setProcessSheetOpen]         = useState(false);
//   const [processProjectId, setProcessProjectId]         = useState(null);

  // ── queries ──────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project`);
      const d   = res.data?.data || [];
      d.sort((a, b) => (Number(b.P_ID) || 0) - (Number(a.P_ID) || 0));
      return d;
    },
  });

  const { data: projectTypes = [] } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => (await axios.get(`${url}/api/project-type`)).data?.data || [],
  });

  const projectTypeMap = React.useMemo(
    () => Object.fromEntries(projectTypes.map((pt) => [pt.ID.toString(), pt.NAME])),
    [projectTypes]
  );

  const apiData = data || [];

  // ── delete ───────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id) => axios.delete(`${url}/api/project/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      toast.success("Project deleted successfully!");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to delete project."),
  });

 const handleEdit = (projectId) => {
  navigate(`/dashboard/projects/${projectId}/edit`);
};

  const handleDeleteClick = (projectId) => {
    setDeleteTargetId(projectId);
    setDeleteDialogOpen(true);
  };

  const handleOpenReport = (item) => {
  setReportProject({ id: item.P_ID, name: item.P_NAME });
  setReportSheetOpen(true);
};

  const handleDeleteConfirm = () => {
    if (deleteTargetId) deleteMutation.mutate(deleteTargetId);
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  // ── process sheet open ───────────────────────────────────────────────────
  const handleCreateProcess = (projectId) => {
    setSelectedProjectId(projectId);
    setProcessSheetOpen(true);
  };

  // ── columns ──────────────────────────────────────────────────────────────
  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
          className="border-border"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          className="border-border"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "P_NAME",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold uppercase tracking-wider"
        >
          Project Name <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-foreground text-sm">{row.getValue("P_NAME") || "—"}</div>
      ),
    },
    {
      accessorKey: "P_CODE",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold uppercase tracking-wider"
        >
          Code <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.getValue("P_CODE") || "—"}</div>
      ),
    },
    {
      accessorKey: "P_TYPE",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold uppercase tracking-wider"
        >
          Type <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-foreground">
          {projectTypeMap[row.getValue("P_TYPE")] || row.getValue("P_TYPE") || "—"}
        </div>
      ),
    },
    {
      accessorKey: "SUBWRB",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold uppercase tracking-wider"
        >
          Suburb <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => <div className="text-sm">{row.getValue("SUBWRB") || "—"}</div>,
    },
    {
      accessorKey: "POSTCODE",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold uppercase tracking-wider"
        >
          Postcode <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => <div className="text-sm">{row.getValue("POSTCODE") || "—"}</div>,
    },
    {
      accessorKey: "STATE",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold uppercase tracking-wider"
        >
          State <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => <div className="text-sm">{row.getValue("STATE") || "—"}</div>,
    },
    {
      accessorKey: "P_ADDRESS",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold uppercase tracking-wider"
        >
          Address <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm max-w-[180px] truncate" title={row.getValue("P_ADDRESS")}>
          {row.getValue("P_ADDRESS") || "—"}
        </div>
      ),
    },
    // hidden by default
    {
      accessorKey: "LOT",
      header: "Lot",
      cell: ({ row }) => <div className="text-sm">{row.getValue("LOT") || "—"}</div>,
    },
    {
      accessorKey: "DP",
      header: "DP",
      cell: ({ row }) => <div className="text-sm">{row.getValue("DP") || "—"}</div>,
    },
    {
      accessorKey: "INSURANCE_NO",
      header: "Insurance No",
      cell: ({ row }) => <div className="text-sm">{row.getValue("INSURANCE_NO") || "—"}</div>,
    },
    {
      accessorKey: "P_ENTATIVE_START_DATE",
      header: "Start Date",
      cell: ({ row }) => <div className="text-sm">{row.getValue("P_ENTATIVE_START_DATE") || "—"}</div>,
    },
    {
      accessorKey: "P_TENTATIVE_END_DATE",
      header: "End Date",
      cell: ({ row }) => <div className="text-sm">{row.getValue("P_TENTATIVE_END_DATE") || "—"}</div>,
    },
    {
      accessorKey: "DESCRIPTION",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-sm max-w-[160px] truncate" title={row.getValue("DESCRIPTION")}>
          {row.getValue("DESCRIPTION") || "—"}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => (
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1 justify-center">
            {/* Edit */}
            <button
              onClick={() => handleEdit(item.P_ID)}
              title="Edit Project"
              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-all"
            >
              <Pencil size={15} />
            </button>

            {/* Create Process — এখন Sheet খোলে, navigate করে না */}
            <button
              onClick={() => handleCreateProcess(item.P_ID)}
              title="Create Process & Dashboard"
              className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
            >
              <Cog size={15} />
            </button>

            <button
  onClick={() => handleOpenReport(item)}
  title="View Project Report"
  className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
>
  <FileText size={15} />
</button>
            {/* Delete */}
            <button
              onClick={() => handleDeleteClick(item.P_ID)}
              title="Delete Project"
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
              placeholder="Filter by project name..."
              value={table.getColumn("P_NAME")?.getFilterValue() ?? ""}
              onChange={(e) => table.getColumn("P_NAME")?.setFilterValue(e.target.value)}
              className="pl-9 h-10 rounded-md border-border bg-card text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-md border-border gap-2">
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
              <DropdownMenuContent align="end" className="w-48 bg-card border-border max-h-72 overflow-y-auto">
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
                      {col.id.replace(/_/g, " ").toLowerCase()}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

           <Button
  onClick={() => navigate("/dashboard/projects/create")}  // ← CHANGE THIS
  className="h-10 rounded-md gap-2"
>
  <PlusIcon size={16} />
  Add New Project
</Button>
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="border-b border-border bg-muted/20">
                  {group.headers.map((header) => (
                    <TableHead key={header.id} className="px-4 py-3 font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
              {!isLoading && table.getRowModel().rows.length > 0 &&
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!isLoading && table.getRowModel().rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24 text-sm text-muted-foreground">
                    No projects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border">
          <DataTablePaginationTwo table={table} tableKey="projects" />
        </div>
      </div>

      {/* ── Sheets ───────────────────────────────────────────────────────── */}
      <CreateProjectSheet
        isOpen={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
      />

      <EditProjectSheet
        isOpen={editSheetOpen}
        onClose={() => { setEditSheetOpen(false); setSelectedProjectId(null); }}
        projectId={selectedProjectId}
      />

      {/* Process Sheet — নতুন */}
      <ProcessSheet
        isOpen={processSheetOpen}
        onClose={() => { setProcessSheetOpen(false); setSelectedProjectId(null); }}
        projectId={selectedProjectId}
      />

      <ProjectReportSheet
  isOpen={reportSheetOpen}
  onClose={() => { setReportSheetOpen(false); setReportProject(null); }}
  projectId={reportProject?.id}
  projectName={reportProject?.name}
/>

      {/* ── Delete Dialog ─────────────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the project and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTargetId(null)} className="border-border">
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