// src\features\invoice\invoice-list.jsx
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Edit3, Plus, Search, Trash2, FileText } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
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
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
import { useDeleteInvoice, useInvoices, getReceiptUrl, useProjects } from "./queries";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
};

const getReceiptName = (row) => {
  return (
    row.RECEIPT_FILENAME ||
    row.RECEIPT_FILE_NAME ||
    row.RECEIPT ||
    row.RECEIPT_NAME ||
    row.FILE_NAME ||
    row.FILE ||
    null
  );
};

export function InvoiceListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const projectIdFilter = searchParams.get("projectId") || "";
  const { data, isLoading } = useInvoices({
    projectId: projectIdFilter || undefined,
    page,
    limit,
  });

  const { data: projects = [] } = useProjects();
const projectMap = useMemo(
  () => Object.fromEntries(projects.map((p) => [String(p.P_ID), p.P_NAME])),
  [projects]
);
  const deleteInvoice = useDeleteInvoice();

  const invoices = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "PROJECT_ID",
        header: "Project",
        // cell: ({ row }) => <span>{row.original.PROJECT_ID || "—"}</span>,
        cell: ({ row }) => <span>{projectMap[String(row.original.PROJECT_ID)] || row.original.PROJECT_ID || "—"}</span>,
      },
      {
        accessorKey: "AREA_TYPE",
        header: "Area Type",
        cell: ({ row }) => <span>{row.original.AREA_TYPE || "—"}</span>,
      },
      {
        accessorKey: "AMOUNT",
        header: "Amount",
        cell: ({ row }) => <span>{currencyFormatter.format(Number(row.original.AMOUNT || 0))}</span>,
      },
      {
        accessorKey: "PURCHASED_BY",
        header: "Purchased By",
        cell: ({ row }) => <span>{row.original.PURCHASED_BY || "—"}</span>,
      },
      {
        accessorKey: "PAYMENT_METHOD",
        header: "Payment Method",
        cell: ({ row }) => <span>{row.original.PAYMENT_METHOD || "—"}</span>,
      },
      {
        accessorKey: "CREATED_AT",
        header: "Created At",
        cell: ({ row }) => <span>{formatDate(row.original.CREATED_AT)}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const invoice = row.original;
          const invoiceId = invoice.ID ?? invoice.id;
          const receiptName = getReceiptName(invoice);

          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => navigate(`/dashboard/invoices/${invoiceId}/edit`)}
              >
                <Edit3 className="mr-1 h-4 w-4" />
                Edit
              </Button>

              {receiptName ? (
                <a
                  href={getReceiptUrl(invoiceId)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-foreground transition-colors hover:bg-accent"
                >
                  <FileText className="h-4 w-4" />
                  View Receipt
                </a>
              ) : null}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-destructive hover:text-destructive"
                onClick={() => {
                  setDeleteTargetId(invoiceId);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [navigate],
  );

  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages || 1,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
      columnVisibility,
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize: limit })
          : updater;

      setPage(next.pageIndex + 1);
      setLimit(next.pageSize);
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleProjectFilterChange = (value) => {
    const nextValue = value.trim();
    setPage(1);

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    if (nextValue) {
      nextSearchParams.set("projectId", nextValue);
    } else {
      nextSearchParams.delete("projectId");
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;

    deleteInvoice.mutate(deleteTargetId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setDeleteTargetId(null);
        toast.success("Invoice deleted successfully.");
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to delete invoice.");
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage project invoices and receipts.
          </p>
        </div>

        <Button type="button" onClick={() => navigate("/dashboard/invoices/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Invoice
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={projectIdFilter}
              onChange={(event) => handleProjectFilterChange(event.target.value)}
              placeholder="Filter by project ID"
              className="pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllLeafColumns().map((column) => {
                if (column.id === "actions") return null;
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.columnDef.header}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                    Loading invoices...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePaginationTwo table={table} tableKey="invoices" />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The invoice will be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default InvoiceListPage;
