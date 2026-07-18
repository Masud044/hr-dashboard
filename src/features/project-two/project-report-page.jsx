import React, { useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Download, ExternalLink, Loader2, FileText } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/SectionContainer";
import InvoiceCell from "@/features/setting/pages/statement-upload-three/invoice/InvoiceCell";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const CATEGORY_STYLES = {
  address: "bg-blue-100 text-blue-700",
  place: "bg-amber-100 text-amber-700",
  product: "bg-emerald-100 text-emerald-700",
  other: "bg-slate-100 text-slate-600",
};

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

export function ProjectReportPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("transactions"); // "transactions" | "byContractor"
  const workerSectionRef = useRef(null);

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
        ?.data || { transactions: [], workerLogs: [], workerTotals: {} },
    enabled: !!projectId,
  });

  const rows = report?.transactions || [];
  const workerLogs = report?.workerLogs || [];
  const workerTotals = report?.workerTotals || {
    totalHours: 0,
    totalDays: 0,
    totalAmount: 0,
  };

  // Extract project name from the first row
  const projectName =
    rows.length > 0 ? rows[0].P_NAME : `Project #${projectId}`;

  const totals = useMemo(() => {
    const debit = rows.reduce((s, r) => s + (Number(r.DEBIT) || 0), 0);
    const credit = rows.reduce((s, r) => s + (Number(r.CREDIT) || 0), 0);
    const workerCost = Number(workerTotals.totalAmount) || 0;
    return { debit, credit, workerCost, net: debit - credit - workerCost };
  }, [rows, workerTotals]);

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

    // rows arrive already ordered by SORT_ORDER (contractor) then TXN_DATE DESC,
    // so first-seen insertion order into the Map already respects contractor sort order.
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

  const handleDownloadCsv = () => {
    if (rows.length === 0 && workerLogs.length === 0) {
      toast.error("No data to download.");
      return;
    }

    const csvParts = [];

    // ── Section 1: Transactions ──
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
      );
    }

    // ── Section 2: Worker Hours & Costing ──
    if (workerLogs.length > 0) {
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
      csvParts.push(
        "",
        "Worker Hours & Costing",
        workerHeaders.join(","),
        ...workerRows.map((r) => r.join(",")),
        `Total Hours,${workerTotals.totalHours}`,
        `Total Days,${workerTotals.totalDays}`,
        `Total Worker Cost,${workerTotals.totalAmount}`,
      );
    }

    // ── Section 3: Overall summary ──
    csvParts.push(
      "",
      "Overall Net (Received - Payment - Worker Cost)",
      `${totals.net}`,
    );

    const csv = csvParts.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${(projectName || "project").replace(/[^a-z0-9]/gi, "_")}_report.csv`;
    link.click();
  };

  return (
    <SectionContainer variant="dashboard">
      {/* Main Container */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground tracking-[-0.03em]">
                  {projectName} — Statement Report
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {isLoading
                    ? "Loading..."
                    : `${rows.length} approved transaction${rows.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                size="sm"
                className="h-9 px-4 text-sm font-medium border-border hover:bg-muted/50"
              >
                Back
              </Button>
              <Button
                onClick={handleDownloadCsv}
                variant="outline"
                size="sm"
                className="h-9 px-4 text-sm font-medium border-border hover:bg-muted/50"
                disabled={rows.length === 0 && workerLogs.length === 0}
              >
                <Download size={14} className="mr-2" /> Download CSV
              </Button>
            </div>
          </div>
          <div className="w-full h-px bg-border mt-4" />
        </div>

        {/* Summary bar — always visible regardless of active tab */}
        {!isLoading && (rows.length > 0 || workerLogs.length > 0) && (
          <div className="flex items-center gap-6 px-6 py-3 mb-6 bg-muted/30 border border-border rounded-lg text-sm">
            <div>
              <span className="text-muted-foreground">Total Received: </span>
              <strong className="text-green-500">
                {fmtAmount(totals.debit)}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Total Payment: </span>
              <strong className="text-destructive">
                {fmtAmount(totals.credit)}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Worker Cost: </span>
              <strong className="text-destructive">
                {fmtAmount(totals.workerCost)}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Total: </span>
              <strong
                className={
                  totals.net >= 0 ? "text-green-500" : "text-destructive"
                }
              >
                {fmtAmount(totals.net)}
              </strong>
            </div>
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex items-center gap-6 border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "transactions"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Transactions ({rows.length})
          </button>
          <button
            onClick={() => setActiveTab("byContractor")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "byContractor"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Group by Contractor ({groupedByContractor.length})
          </button>
          {activeTab === "byContractor" && workerLogs.length > 0 && (
            <button
              onClick={scrollToWorkerSection}
              className="ml-auto text-xs font-medium text-primary hover:underline"
            >
              Jump to Worker ↓
            </button>
          )}
        </div>

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1200px]">
                <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Project</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Contractor
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Received
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Matched Address
                    </th>
                    {/* <th className="px-4 py-3 text-left font-medium">Invoice No</th> */}
                    <th className="px-4 py-3 text-left font-medium">Source</th>
                    <th className="px-4 py-3 text-left font-medium">Remarks</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Approved Date
                    </th>
                    {/* <th className="px-4 py-3 text-left font-medium">Invoice File</th> */}
                    <th className="px-4 py-3 text-left font-medium">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <Loader2
                          className="inline animate-spin mr-2"
                          size={12}
                        />
                        Loading...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No approved transactions for this project.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => {
                      const cat = (r.CATEGORY || "other").toLowerCase();
                      return (
                        <tr
                          key={r.TXN_ID}
                          className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-2.5 max-w-[180px]">
                            <div className="flex flex-col gap-0.5">
                              {r.P_ID != null && (
                                <span className="w-fit text-[10px] font-semibold text-muted-foreground">
                                  ID: {r.P_ID}
                                </span>
                              )}
                              <span className="text-xs font-semibold text-foreground leading-snug break-words">
                                {r.P_NAME || (
                                  <span className="text-muted-foreground italic font-normal">
                                    —
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-foreground text-xs">
                            {r.CONTRACTOR_NAME || (
                              <span className="text-muted-foreground italic">
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap font-medium text-foreground">
                            {fmtDate(r.TXN_DATE)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-green-500 whitespace-nowrap">
                            {r.DEBIT != null ? fmtAmount(r.DEBIT) : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-destructive whitespace-nowrap">
                            {r.CREDIT != null ? fmtAmount(r.CREDIT) : "—"}
                          </td>
                          <td className="px-4 py-2.5 max-w-[200px] text-foreground text-xs break-words">
                            {r.DESCRIPTION}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${CATEGORY_STYLES[cat] || CATEGORY_STYLES.other}`}
                            >
                              {cat}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 max-w-[150px] text-xs">
                            {r.MATCHED_ADDRESS ? (
                              <span className="text-primary font-medium">
                                {r.MATCHED_ADDRESS}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">
                                —
                              </span>
                            )}
                          </td>
                          {/* <td className="px-4 py-2.5 text-foreground text-xs">
                            {r.INVOICE_NO || <span className="text-muted-foreground italic">—</span>}
                          </td> */}
                          <td className="px-4 py-2.5">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                r.SOURCE_TYPE === "NON_BANKING"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              }`}
                            >
                              {r.SOURCE_TYPE === "NON_BANKING"
                                ? "Non-Banking"
                                : "Banking"}
                            </span>
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
                          {/* <td className="px-4 py-2.5 min-w-[130px]">
                            {r.INVOICE_FILE_NAME ? (
                              <a
                                href={`${url}/api/statement/main/${r.TXN_ID}/invoice`}
                                target="_blank"
                                rel="noreferrer"
                                download={r.INVOICE_FILE_NAME}
                                className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium truncate max-w-[120px]"
                                title={r.INVOICE_FILE_NAME}
                              >
                                <ExternalLink size={12} className="shrink-0" />
                                {r.INVOICE_FILE_NAME}
                              </a>
                            ) : (
                              <span className="text-muted-foreground italic text-xs">—</span>
                            )}
                          </td> */}
                          <td className="px-4 py-2.5 min-w-[160px]">
                            <InvoiceCell
                              parentType="main"
                              parentId={r.TXN_ID}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Group by Contractor Tab */}
        {activeTab === "byContractor" && (
          <div className="space-y-6">
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
                {groupedByContractor.map((group) => (
                  <div
                    key={group.contractorId ?? "none"}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    {/* Contractor header + mini totals bar */}
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
                      <h3 className="text-sm font-semibold text-foreground">
                        {group.contractorName}
                      </h3>
                      <div className="flex items-center gap-5 text-xs">
                        <div>
                          <span className="text-muted-foreground">
                            Received:{" "}
                          </span>
                          <strong className="text-green-500">
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
                          <span className="text-muted-foreground">Total: </span>
                          <strong
                            className={
                              group.net >= 0
                                ? "text-green-500"
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
                      <table className="w-full text-sm min-w-[1200px]">
                        <thead className="bg-muted/20 border-b border-border text-xs text-muted-foreground uppercase">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Date
                            </th>
                            <th className="px-4 py-2.5 text-right font-medium">
                              Received
                            </th>
                            <th className="px-4 py-2.5 text-right font-medium">
                              Payment
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Description
                            </th>

                            {/* <th className="px-4 py-2.5 text-left font-medium">
                              Invoice No
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Source
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Remarks
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Approved Date
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Invoice File
                            </th> */}
                            <th className="px-4 py-2.5 text-left font-medium">
                              Source
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Remarks
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Approved Date
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Invoice
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.rows.map((r) => {
                            const cat = (r.CATEGORY || "other").toLowerCase();
                            return (
                              <tr
                                key={r.TXN_ID}
                                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                              >
                                <td className="px-4 py-2.5 whitespace-nowrap font-medium text-foreground">
                                  {fmtDate(r.TXN_DATE)}
                                </td>
                                <td className="px-4 py-2.5 text-right font-semibold text-green-500 whitespace-nowrap">
                                  {r.DEBIT != null ? fmtAmount(r.DEBIT) : "—"}
                                </td>
                                <td className="px-4 py-2.5 text-right font-semibold text-destructive whitespace-nowrap">
                                  {r.CREDIT != null ? fmtAmount(r.CREDIT) : "—"}
                                </td>
                                <td className="px-4 py-2.5 max-w-[220px] text-foreground text-xs break-words">
                                  {r.DESCRIPTION}
                                </td>

                                {/* <td className="px-4 py-2.5 text-foreground text-xs">
                                  {r.INVOICE_NO || (
                                    <span className="text-muted-foreground italic">
                                      —
                                    </span>
                                  )}
                                </td> */}

                                <td className="px-4 py-2.5">
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                      r.SOURCE_TYPE === "NON_BANKING"
                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    }`}
                                  >
                                    {r.SOURCE_TYPE === "NON_BANKING"
                                      ? "Non-Banking"
                                      : "Banking"}
                                  </span>
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
                                {/* 
                                <td className="px-4 py-2.5 min-w-[130px]">
                                  {r.INVOICE_FILE_NAME ? (
                                    <a
                                      href={`${url}/api/statement/main/${r.TXN_ID}/invoice`}
                                      target="_blank"
                                      rel="noreferrer"
                                      download={r.INVOICE_FILE_NAME}
                                      className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium truncate max-w-[120px]"
                                      title={r.INVOICE_FILE_NAME}
                                    >
                                      <ExternalLink
                                        size={12}
                                        className="shrink-0"
                                      />
                                      {r.INVOICE_FILE_NAME}
                                    </a>
                                  ) : (
                                    <span className="text-muted-foreground italic text-xs">
                                      —
                                    </span>
                                  )}
                                </td> */}
                                <td className="px-4 py-2.5 min-w-[160px]">
                                  <InvoiceCell
                                    parentType="main"
                                    parentId={r.TXN_ID}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {/* Worker Hours & Costing — combined, shown under contractor groups */}
                {workerLogs.length > 0 && (
                  <div
                    ref={workerSectionRef}
                    className="scroll-mt-16 border border-border rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
                      <h3 className="text-sm font-semibold text-foreground">
                        Worker
                      </h3>
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
                        <thead className="bg-muted/20 border-b border-border text-xs text-muted-foreground uppercase">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Worker
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Date
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium">
                              Basis
                            </th>
                            <th className="px-4 py-2.5 text-right font-medium">
                              Hours
                            </th>
                            <th className="px-4 py-2.5 text-right font-medium">
                              Days
                            </th>
                            <th className="px-4 py-2.5 text-right font-medium">
                              Rate
                            </th>
                            <th className="px-4 py-2.5 text-right font-medium">
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
                              <td className="px-4 py-2.5 text-foreground text-xs">
                                {w.WORKER_NAME}
                              </td>
                              <td className="px-4 py-2.5 whitespace-nowrap text-xs">
                                {fmtDate(w.ATTENDANCE_DATE)}
                              </td>
                              <td className="px-4 py-2.5 text-xs">
                                {w.CALC_BASIS}
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
                                  <span className="text-red-500 italic">
                                    rate missing
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {/* <tfoot>
          <tr className="bg-muted/30 font-semibold">
            <td className="px-4 py-2.5 text-xs" colSpan={3}>Total</td>
            <td className="px-4 py-2.5 text-right text-xs">{fmtHours(workerTotals.totalHours)}</td>
            <td className="px-4 py-2.5 text-right text-xs">{workerTotals.totalDays}</td>
            <td className="px-4 py-2.5 text-right text-xs"></td>
            <td className="px-4 py-2.5 text-right text-xs">{fmtAmount(workerTotals.totalAmount)}</td>
          </tr>
        </tfoot> */}
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
