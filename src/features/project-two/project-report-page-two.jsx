// src\features\project-two\project-report-page-two.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Download,
  Loader2,
  FileText,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Users,
  LandmarkIcon,
  MoveDownIcon,
  MoveUpIcon,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionContainer } from "@/components/SectionContainer";
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
import InvoiceCell from "@/features/setting/pages/statement-upload-three/invoice/InvoiceCell";
import InvoiceSheet from "@/features/setting/pages/statement-upload-three/invoice/InvoiceSheet";
import WrappedName from "@/components/shared/WrappedName";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const CONTRACTOR_ROWS_PREVIEW = 5;

const fmtDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const fmtAmount = (amt) => {
  if (amt == null) return "—";
  const n = Number(amt) || 0;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtHours = (val) => {
  if (val == null) return "—";
  const n = Number(val) || 0;
  return (Math.round(n * 100) / 100).toString();
};

const initials = (name) => (name || "?").trim().charAt(0).toUpperCase();

function SourceBadge({ row }) {
  const isNonBanking = row.SOURCE_TYPE === "NON_BANKING";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={`w-fit whitespace-nowrap text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          isNonBanking
            ? "bg-accent text-accent-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isNonBanking ? "Non-Banking" : "Banking"}
      </span>
      {isNonBanking && row.PAYMENT_BY === "CUSTOMER" && (
        <span className="whitespace-nowrap text-[9px] font-medium text-amber-600 dark:text-amber-400">
          Customer Paid
        </span>
      )}
    </div>
  );
}

function SortableHeader({ column, children, align = "left" }) {
  return (
    <button
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className={`flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-[11px] font-semibold uppercase tracking-wider ${
        align === "right" ? "ml-auto" : ""
      }`}
    >
      {children} <ArrowUpDown className="h-3 w-3" />
    </button>
  );
}

export function ProjectReportPageTwo() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("byContractor"); // "transactions" | "byContractor"
  const [sorting, setSorting] = useState([{ id: "TXN_DATE", desc: true }]);
  const [expandedContractors, setExpandedContractors] = useState({});
  const workerSectionRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToWorkerSection = () => {
    workerSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const { data: report, isLoading } = useQuery({
    queryKey: ["projectReport", projectId],
    queryFn: async () =>
      (await axios.get(`${url}/api/statement/project-report/${projectId}`)).data
        ?.data || {
        transactions: [],
        workerLogs: [],
        workerTotals: {},
        marginPercent: null,
      },
    enabled: !!projectId,
  });

  const rows = useMemo(() => report?.transactions || [], [report]);
  const workerLogs = useMemo(() => report?.workerLogs || [], [report]);
  const workerTotals = useMemo(
    () =>
      report?.workerTotals || { totalHours: 0, totalDays: 0, totalAmount: 0 },
    [report],
  );

  const MARGIN_PERCENT =
    report?.marginPercent != null ? Number(report.marginPercent) : 10;

  const projectName =
    rows.length > 0 ? rows[0].P_NAME : `Project #${projectId}`;

  const totals = useMemo(() => {
    const debit = rows.reduce((s, r) => s + (Number(r.DEBIT) || 0), 0);
    const credit = rows.reduce((s, r) => s + (Number(r.CREDIT) || 0), 0);
    const workerCost = Number(workerTotals.totalAmount) || 0;
    return { debit, credit, workerCost, net: debit - credit - workerCost };
  }, [rows, workerTotals]);

  const summary = useMemo(() => {
    const projectExpenses = totals.credit;
    const workerCost = totals.workerCost;
    const buildExpenses = projectExpenses + workerCost;

    const marginableCredit = rows.reduce((s, r) => {
      if (r.EXCLUDE_MARGIN === "Y") return s;
      return s + (Number(r.CREDIT) || 0);
    }, 0);
    const marginBase = marginableCredit + workerCost;

    const builderMargin = marginBase * (MARGIN_PERCENT / 100);
    const gst = builderMargin * 0.1;
    const totalBuilderMargin = builderMargin + gst;

    const finalProjectExpenses = buildExpenses + totalBuilderMargin;

    const customerPaid = rows.reduce((s, r) => {
      if (
        r.SOURCE_TYPE === "NON_BANKING" &&
        r.PAYMENT_BY === "CUSTOMER" &&
        r.CREDIT != null
      ) {
        return s + Number(r.CREDIT);
      }
      return s;
    }, 0);

    const collectionReceived = totals.debit;
    const balance = collectionReceived + customerPaid - finalProjectExpenses;

    return {
      projectExpenses,
      workerCost,
      buildExpenses,
      builderMargin,
      gst,
      totalBuilderMargin,
      finalProjectExpenses,
      collectionReceived,
      customerPaid,
      balance,
    };
  }, [totals, rows, MARGIN_PERCENT]);

  const groupedByContractor = useMemo(() => {
    const map = new Map();

    for (const r of rows) {
      const key = r.CONTRACTOR_ID != null ? r.CONTRACTOR_ID : "none";
      if (!map.has(key)) {
        map.set(key, {
          contractorId: r.CONTRACTOR_ID ?? null,
          contractorName: r.CONTRACTOR_NAME || "No Contractor",
          rows: [],
        });
      }
      map.get(key).rows.push(r);
    }

    return Array.from(map.values()).map((group) => {
      const sortedRows = [...group.rows].sort(
        (a, b) => new Date(a.TXN_DATE) - new Date(b.TXN_DATE),
      );
      const totalReceived = sortedRows.reduce(
        (s, r) => s + (Number(r.DEBIT) || 0),
        0,
      );
      const totalPayment = sortedRows.reduce(
        (s, r) => s + (Number(r.CREDIT) || 0),
        0,
      );
      return {
        ...group,
        rows: sortedRows,
        totalReceived,
        totalPayment,
        net: totalReceived - totalPayment,
      };
    });
  }, [rows]);

  const toggleContractorExpanded = (key) => {
    setExpandedContractors((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── CSV export helpers ──────────────────────────────────────────────
  const buildSummaryCsvRows = () => [
    "Summary",
    `Project Expenses,${summary.projectExpenses}`,
    `Worker Cost,${summary.workerCost}`,
    `Build Expenses,${summary.buildExpenses}`,
    `Builder Margin (${MARGIN_PERCENT}%),${summary.builderMargin}`,
    `GST,${summary.gst}`,
    `Total Builder Margin,${summary.totalBuilderMargin}`,
    `Final Project Expenses,${summary.finalProjectExpenses}`,
    `Collection/Received,${summary.collectionReceived}`,
    `Customer Paid,${summary.customerPaid}`,
    `Balance,${summary.balance}`,
    "",
  ];

  const buildWorkerCsvRows = () => {
    if (workerLogs.length === 0) return [];
    const workerHeaders = [
      "Worker",
      "Date",
      "Basis",
      "Hours",
      "Days",
      "Rate",
      "Amount",
    ];
    const workerRows = workerLogs.map((w) => [
      `"${(w.WORKER_NAME || "").replace(/"/g, '""')}"`,
      fmtDate(w.ATTENDANCE_DATE),
      w.CALC_BASIS || "",
      w.HOURS_WORKED ?? "",
      w.DAYS_WORKED ?? "",
      w.CALC_BASIS === "HOUR"
        ? (w.RATE_PER_HOUR ?? "")
        : (w.RATE_PER_DAY ?? ""),
      w.AMOUNT ?? "MISSING_RATE",
    ]);
    return [
      "",
      "Worker Hours & Costing",
      workerHeaders.join(","),
      ...workerRows.map((r) => r.join(",")),
      `Total Hours,${workerTotals.totalHours}`,
      `Total Days,${workerTotals.totalDays}`,
      `Total Worker Cost,${workerTotals.totalAmount}`,
    ];
  };

  const downloadCsvFile = (csvParts, suffix) => {
    const csv = csvParts.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${(projectName || "project").replace(/[^a-z0-9]/gi, "_").replace(/^_+|_+$/g, "")}_${suffix}.csv`;
    link.click();
  };

  const handleDownloadAllCsv = () => {
    if (rows.length === 0 && workerLogs.length === 0) {
      toast.error("No data to download.");
      return;
    }
    const csvParts = [...buildSummaryCsvRows()];

    if (rows.length > 0) {
      const headers = [
        "Contractor",
        "Date",
        "Received",
        "Payment",
        "Description",
        "Category",
        "Matched Address",
        "Invoice No",
        "Source",
        "Remarks",
        "Approved Date",
      ];
      const csvRows = rows.map((r) => [
        `"${(r.CONTRACTOR_NAME || "").replace(/"/g, '""')}"`,
        fmtDate(r.TXN_DATE),
        r.DEBIT ?? "",
        r.CREDIT ?? "",
        `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
        r.CATEGORY || "",
        `"${(r.MATCHED_ADDRESS || "").replace(/"/g, '""')}"`,
        `"${(r.INVOICE_NO || "").replace(/"/g, '""')}"`,
        r.SOURCE_TYPE || "",
        `"${(r.REMARKS || "").replace(/"/g, '""')}"`,
        fmtDate(r.APPROVED_DATE),
      ]);
      csvParts.push(
        "Transactions",
        headers.join(","),
        ...csvRows.map((r) => r.join(",")),
        `Total Received,${totals.debit}`,
        `Total Payment,${totals.credit}`,
        "",
      );
    }

    csvParts.push(...buildWorkerCsvRows());
    downloadCsvFile(csvParts, "report_all");
  };

  const handleDownloadByContractorCsv = () => {
    if (groupedByContractor.length === 0 && workerLogs.length === 0) {
      toast.error("No data to download.");
      return;
    }
    const csvParts = [...buildSummaryCsvRows()];

    groupedByContractor.forEach((group) => {
      const headers = [
        "Date",
        "Received",
        "Payment",
        "Description",
        "Source",
        "Remarks",
        "Approved Date",
      ];
      const csvRows = group.rows.map((r) => [
        fmtDate(r.TXN_DATE),
        r.DEBIT ?? "",
        r.CREDIT ?? "",
        `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
        r.SOURCE_TYPE || "",
        `"${(r.REMARKS || "").replace(/"/g, '""')}"`,
        fmtDate(r.APPROVED_DATE),
      ]);
      csvParts.push(
        `Contractor: ${group.contractorName}`,
        headers.join(","),
        ...csvRows.map((r) => r.join(",")),
        `Total Received,${group.totalReceived}`,
        `Total Payment,${group.totalPayment}`,
        `Net,${group.net}`,
        "",
      );
    });

    csvParts.push(...buildWorkerCsvRows());
    downloadCsvFile(csvParts, "report_by_contractor");
  };

  // ── TanStack Table — Transactions tab ───────────────────────────────
  const columns = useMemo(
    () => [
      {
        accessorKey: "P_NAME",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Project
          </span>
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-col gap-0.5 max-w-[180px]">
              {r.P_ID != null && (
                <span className="w-fit text-[10px] font-semibold text-muted-foreground">
                  ID: {r.P_ID}
                </span>
              )}
              <WrappedName name={r.P_NAME} maxChars={70} />
            </div>
          );
        },
      },
      {
        accessorKey: "CONTRACTOR_NAME",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Contractor
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="text-xs text-foreground">
            {getValue() || (
              <span className="text-muted-foreground italic">—</span>
            )}
          </span>
        ),
      },
      {
        accessorKey: "TXN_DATE",
        header: ({ column }) => (
          <SortableHeader column={column}>Date</SortableHeader>
        ),
        sortingFn: (a, b) =>
          new Date(a.original.TXN_DATE || 0) -
          new Date(b.original.TXN_DATE || 0),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap font-medium text-foreground text-xs">
            {fmtDate(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "DEBIT",
        header: ({ column }) => (
          <div className="text-right">
            <SortableHeader column={column} align="right">
              Received
            </SortableHeader>
          </div>
        ),
        cell: ({ getValue }) => {
          const v = getValue();
          return (
            <div className="text-right font-semibold text-[#10B981] whitespace-nowrap text-xs">
              {v != null ? fmtAmount(v) : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "CREDIT",
        header: ({ column }) => (
          <div className="text-right">
            <SortableHeader column={column} align="right">
              Payment
            </SortableHeader>
          </div>
        ),
        cell: ({ getValue }) => {
          const v = getValue();
          return (
            <div className="text-right font-semibold text-destructive whitespace-nowrap text-xs">
              {v != null ? fmtAmount(v) : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "DESCRIPTION",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </span>
        ),
        cell: ({ getValue }) => (
          <div
            title={getValue() || ""}
            className="max-w-[220px] text-foreground text-xs truncate"
          >
            {getValue()}
          </div>
        ),
      },
      {
        accessorKey: "MATCHED_ADDRESS",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Matched Address
          </span>
        ),
        cell: ({ getValue }) => (
          <div className="max-w-[150px]">
            <WrappedName name={getValue()} className="text-primary" />
          </div>
        ),
      },
      {
        accessorKey: "SOURCE_TYPE",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Source
          </span>
        ),
        cell: ({ row }) => <SourceBadge row={row.original} />,
      },
      {
        accessorKey: "REMARKS",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Remarks
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="text-foreground text-xs">
            {getValue() || (
              <span className="text-muted-foreground italic">—</span>
            )}
          </span>
        ),
      },
      {
        accessorKey: "APPROVED_DATE",
        header: ({ column }) => (
          <SortableHeader column={column}>Approved</SortableHeader>
        ),
        sortingFn: (a, b) =>
          new Date(a.original.APPROVED_DATE || 0) -
          new Date(b.original.APPROVED_DATE || 0),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-muted-foreground text-xs">
            {fmtDate(getValue())}
          </span>
        ),
      },
      {
        id: "invoice",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Invoice
          </span>
        ),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-[160px]">
            <InvoiceCell
              parentType="main"
              parentId={row.original.TXN_ID}
              readOnly
            />
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    state: { sorting },
  });

  const hasData = rows.length > 0 || workerLogs.length > 0;

  return (
    <SectionContainer variant="dashboard">
      <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
        {/* ── Page Header ───────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={18} strokeWidth={2} className=" shrink-0" />
                <h1 className="text-base font-semibold text-foreground truncate">
                  {projectName} — Statement Report
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>
                    Showing {rows.length} transaction
                    {rows.length !== 1 ? "s" : ""} across{" "}
                    {groupedByContractor.length} contractor
                    {groupedByContractor.length !== 1 ? "s" : ""}
                    {" · "}
                    As of{" "}
                    {new Date().toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </>
                )}
              </p>
            </div>
            <Button
              onClick={
                activeTab === "transactions"
                  ? handleDownloadAllCsv
                  : handleDownloadByContractorCsv
              }
              size="sm"
              className="text-xs shrink-0"
              disabled={rows.length === 0 && workerLogs.length === 0}
            >
              <Download size={14} className="mr-2" />
              {activeTab === "transactions"
                ? "Download All CSV"
                : "Download by Contractor CSV"}
            </Button>
          </div>
          <div className="w-full h-px bg-border mt-4" />
        </div>

        {/* ── Financial Summary Card ───────────────────────────────── */}
        {!isLoading && hasData && (
          <div className="mb-6 border border-border rounded-md overflow-hidden max-w-2xl">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <LandmarkIcon size={16} strokeWidth={2} className=" shrink-0" />
              <h2 className="text-sm font-semibold text-foreground">
                Financial Summary
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Left column */}
              <div className="text-sm divide-y divide-border sm:border-r sm:border-border">
                <div className="flex items-center h-14 justify-between px-4 py-2.5">
                  <span className="text-foreground">Project Expenses</span>
                  <span className="font-semibold text-destructive">
                    {fmtAmount(summary.projectExpenses)}
                  </span>
                </div>
                <div className="flex items-center h-14 justify-between px-4 py-2.5">
                  <span className="text-muted-foreground">Worker Cost</span>
                  <span className="text-muted-foreground">
                    {fmtAmount(summary.workerCost)}
                  </span>
                </div>
                <div className="flex items-center h-14 justify-between px-4 py-2.5 bg-accent">
                  <span className="font-medium text-accent-foreground">
                    Build Expenses
                  </span>
                  <span className="font-semibold text-accent-foreground">
                    {fmtAmount(summary.buildExpenses)}
                  </span>
                </div>
              </div>

              {/* Right column */}
              <div className="text-sm divide-y divide-border">
                <div className="px-4 h-14 py-2.5">
                  <div className="flex flex-row  items-center  justify-between">
                    <span className="text-foreground">
                      Builder Margin{" "}
                      <span className="text-primary font-semibold">
                        {MARGIN_PERCENT}%
                      </span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {fmtAmount(summary.builderMargin)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground">+ GST</span>
                    <span className="text-xs text-muted-foreground">
                      {fmtAmount(summary.gst)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center  h-14 justify-between px-4 py-2.5">
                  <span className="font-medium text-foreground">
                    Total Builder Margin
                  </span>
                  <span className="font-semibold text-foreground">
                    {fmtAmount(summary.totalBuilderMargin)}
                  </span>
                </div>
                <div className="flex items-center  h-14 justify-between px-4 py-2.5 bg-accent">
                  <span className="font-medium text-accent-foreground">
                    Final Project Expenses
                  </span>
                  <span className="font-semibold text-accent-foreground">
                    {fmtAmount(summary.finalProjectExpenses)}
                  </span>
                </div>
              </div>
            </div>

            {/* footer row: collection + balance — KEEP YOUR EXISTING ONE, UNCHANGED */}
            <div className="border-t border-border min-h-14 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Collection/Received:{" "}
                  </span>
                  <strong className="text-[#10B981]">
                    {fmtAmount(summary.collectionReceived)}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer Paid: </span>
                  <strong className="text-[#10B981]">
                    {fmtAmount(summary.customerPaid)}
                  </strong>
                </div>
              </div>
              <div
                className={`flex items-center justify-between sm:justify-end gap-3 px-4 py-2 rounded-md font-bold text-sm ${
                  summary.balance >= 0
                    ? "bg-[#10B981]/10 text-[#10B981]"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                <span>Balance</span>
                <span>
                  {summary.balance >= 0 ? "+" : ""}
                  {fmtAmount(summary.balance)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Bar ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="inline-flex items-center gap-1 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setActiveTab("byContractor")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                activeTab === "byContractor"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Group by Contractor
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === "byContractor"
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {groupedByContractor.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                activeTab === "transactions"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Transactions
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === "transactions"
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {rows.length}
              </span>
            </button>
          </div>

          {activeTab === "byContractor" && workerLogs.length > 0 && (
            <button
              onClick={scrollToWorkerSection}
              className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-accent px-2.5 py-1 rounded-full transition-colors"
            >
              Jump to Worker
              <MoveDownIcon size={12} />
            </button>
          )}
        </div>

        {/* ── Transactions Tab (TanStack Table) ───────────────────── */}
        {activeTab === "transactions" && (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[1200px] ">
                <TableHeader>
                  {table.getHeaderGroups().map((group) => (
                    <TableRow
                      key={group.id}
                      className="border-b border-border bg-muted/30"
                    >
                      {group.headers.map((header) => (
                        <TableHead key={header.id} className="px-4 py-3">
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
                      <TableCell
                        colSpan={columns.length}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <Loader2
                          className="inline animate-spin mr-2"
                          size={14}
                        />
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No approved transactions for this project.
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row, idx) => (
                      <TableRow
                        key={row.id}
                        className={`border-b border-border last:border-0 hover:bg-[#F3F3F5] dark:hover:bg-muted/40 transition-colors ${
                          idx % 2 === 1 ? "bg-background" : "bg-card"
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="px-4 py-2.5 align-middle"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {!isLoading && rows.length > 0 && (
              <div className="border-t border-border px-2">
                <DataTablePaginationTwo
                  table={table}
                  tableKey="project-report-transactions"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Group by Contractor Tab ─────────────────────────────── */}
        {activeTab === "byContractor" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="inline animate-spin mr-2" size={16} />
                Loading...
              </div>
            ) : groupedByContractor.length === 0 && workerLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-border rounded-lg">
                No approved transactions for this project.
              </div>
            ) : (
              <>
                {groupedByContractor.map((group) => {
                  const key = group.contractorId ?? "none";
                  const isExpanded = !!expandedContractors[key];
                  const visibleRows = isExpanded
                    ? group.rows
                    : group.rows.slice(0, CONTRACTOR_ROWS_PREVIEW);
                  const hasMore = group.rows.length > CONTRACTOR_ROWS_PREVIEW;

                  return (
                    <div
                      key={key}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      {/* Contractor header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-muted/40 border-b border-border">
                        {/* <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                            {initials(group.contractorName)}
                          </span>
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {group.contractorName}
                          </h3>
                        </div> */}
                        <div className="min-w-0">
                          <WrappedName
                            name={group.contractorName}
                            size="md"
                            showAvatar
                            maxLines={1}
                          />
                        </div>
                        <div className="flex items-center gap-5 text-xs shrink-0">
                          <div>
                            <span className="text-muted-foreground">
                              Received:{" "}
                            </span>
                            <strong className="text-[#10B981]">
                              {fmtAmount(group.totalReceived)}
                            </strong>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Payment:{" "}
                            </span>
                            <strong className="text-destructive">
                              {fmtAmount(group.totalPayment)}
                            </strong>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Net: </span>
                            <strong
                              className={
                                group.net >= 0
                                  ? "text-[#10B981]"
                                  : "text-destructive"
                              }
                            >
                              {fmtAmount(group.net)}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Contractor's transactions */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[900px]">
                          <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-2.5 text-left font-semibold">
                                Date
                              </th>
                              <th className="px-4 py-2.5 text-right font-semibold">
                                Received
                              </th>
                              <th className="px-4 py-2.5 text-right font-semibold">
                                Payment
                              </th>
                              <th className="px-4 py-2.5 text-left font-semibold">
                                Description
                              </th>
                              <th className="px-4 py-2.5 text-left font-semibold">
                                Source
                              </th>
                              <th className="px-4 py-2.5 text-left font-semibold">
                                Remarks
                              </th>
                              <th className="px-4 py-2.5 text-left font-semibold">
                                Approved
                              </th>
                              <th className="px-4 py-2.5 text-left font-semibold">
                                Invoice
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleRows.map((r) => (
                              <tr
                                key={r.TXN_ID}
                                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                              >
                                <td className="px-4 py-2.5 whitespace-nowrap font-medium text-foreground text-xs">
                                  {fmtDate(r.TXN_DATE)}
                                </td>
                                <td className="px-4 py-2.5 text-right font-semibold text-[#10B981] whitespace-nowrap text-xs">
                                  {r.DEBIT != null ? fmtAmount(r.DEBIT) : "—"}
                                </td>
                                <td className="px-4 py-2.5 text-right font-semibold text-destructive whitespace-nowrap text-xs">
                                  {r.CREDIT != null ? fmtAmount(r.CREDIT) : "—"}
                                </td>
                                <td className="px-4 py-2.5 max-w-[220px] text-foreground text-xs break-words">
                                  {r.DESCRIPTION}
                                </td>
                                {/* <td className="px-4 py-2.5 max-w-[220px]">
                                  <WrappedName name={r.DESCRIPTION} />
                                </td> */}
                                <td className="px-4 py-2.5">
                                  <SourceBadge row={r} />
                                </td>
                                <td className="px-4 py-2.5 text-foreground text-xs">
                                  {r.REMARKS || (
                                    <span className="text-muted-foreground italic">
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground text-xs">
                                  {fmtDate(r.APPROVED_DATE)}
                                </td>
                                <td className="px-4 py-2.5 min-w-[160px]">
                                  <InvoiceCell
                                    parentType="main"
                                    parentId={r.TXN_ID}
                                    readOnly
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {hasMore && (
                        <div className="border-t border-border px-4 py-2.5 bg-muted/10">
                          <button
                            onClick={() => toggleContractorExpanded(key)}
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                Show less <ChevronUp size={14} />
                              </>
                            ) : (
                              <>
                                View all {group.rows.length} transactions{" "}
                                <ChevronDown size={14} />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Worker Hours & Costing */}
                {workerLogs.length > 0 && (
                  <div
                    ref={workerSectionRef}
                    className="scroll-mt-16 border border-border rounded-lg overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-muted/40 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">
                          Worker Hours & Costing
                        </h3>
                      </div>
                      <div className="flex items-center gap-5 text-xs">
                        <div>
                          <span className="text-muted-foreground">
                            Total Hours:{" "}
                          </span>
                          <strong className="text-foreground">
                            {fmtHours(workerTotals.totalHours)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Total Cost:{" "}
                          </span>
                          <strong className="text-destructive">
                            {fmtAmount(workerTotals.totalAmount)}
                          </strong>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[800px]">
                        <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-semibold">
                              Worker
                            </th>
                            <th className="px-4 py-2.5 text-left font-semibold">
                              Date
                            </th>
                            <th className="px-4 py-2.5 text-left font-semibold">
                              Basis
                            </th>
                            <th className="px-4 py-2.5 text-right font-semibold">
                              Hours
                            </th>
                            <th className="px-4 py-2.5 text-right font-semibold">
                              Days
                            </th>
                            <th className="px-4 py-2.5 text-right font-semibold">
                              Rate
                            </th>
                            <th className="px-4 py-2.5 text-right font-semibold">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {workerLogs.map((w) => (
                            <tr
                              key={w.ATTENDANCE_ID}
                              className="border-b border-border last:border-0 hover:bg-muted/30"
                            >
                              <td className="px-4 py-2.5 ">
                                {/* {w.WORKER_NAME} */}
                                <WrappedName name={w.WORKER_NAME}  showAvatar maxLines={1} />
                              </td>
                              <td className="px-4 py-2.5 whitespace-nowrap text-xs">
                                {fmtDate(w.ATTENDANCE_DATE)}
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                  {w.CALC_BASIS}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right text-xs">
                                {fmtHours(w.HOURS_WORKED)}
                              </td>
                              <td className="px-4 py-2.5 text-right text-xs">
                                {w.DAYS_WORKED ?? "—"}
                              </td>
                              <td className="px-4 py-2.5 text-right text-xs">
                                {fmtAmount(
                                  w.CALC_BASIS === "HOUR"
                                    ? w.RATE_PER_HOUR
                                    : w.RATE_PER_DAY,
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-right text-xs font-semibold">
                                {w.AMOUNT != null ? (
                                  fmtAmount(w.AMOUNT)
                                ) : (
                                  <span className="text-destructive italic">
                                    rate missing
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <InvoiceSheet />
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          size="icon"
          className="fixed bottom-6 right-6 z-[60] h-9 w-9 rounded-full shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <MoveUpIcon size={16} />
        </Button>
      )}
    </SectionContainer>
  );
}
