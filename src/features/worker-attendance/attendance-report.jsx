// src/features/worker-attendance/attendance-report.jsx
import React, { useState } from "react";
import { FileText, Table2, FileDown } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDailyMoneyReport, useWorkers, useProjects, downloadReportExport } from "./report-queries";

export function AttendanceReport() {
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const pad = (n) => String(n).padStart(2, "0");
    return {
      worker_id: "",
      project_id: "",
      from_date: `${firstDay.getFullYear()}-${pad(firstDay.getMonth() + 1)}-${pad(firstDay.getDate())}`,
      to_date: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
    };
  });
  
  const [downloading, setDownloading] = useState({ csv: false, xlsx: false, pdf: false });

  const { data: workers = [] } = useWorkers();
  const { data: projects = [] } = useProjects();
  const { data: reportData, isFetching, isError, error } = useDailyMoneyReport(filters);

  const formatCurrency = (val) => Number(val || 0).toFixed(2);

  const handleDownload = async (format) => {
    setDownloading((prev) => ({ ...prev, [format]: true }));
    try {
      await downloadReportExport(filters, format);
      toast.success(`${format.toUpperCase()} downloaded successfully!`);
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to download ${format.toUpperCase()} report.`);
    } finally {
      setDownloading((prev) => ({ ...prev, [format]: false }));
    }
  };

  const isDateRangeValid = filters.from_date && filters.to_date;

  return (
    <div className="mt-6 space-y-6 px-4">
      {/* Filter & Export Bar */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <Select
              value={filters.worker_id}
              onValueChange={(v) => setFilters((f) => ({ ...f, worker_id: v === "all" ? "" : v }))}
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
              value={filters.project_id}
              onValueChange={(v) => setFilters((f) => ({ ...f, project_id: v === "all" ? "" : v }))}
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
              value={filters.from_date}
              onChange={(e) => setFilters((f) => ({ ...f, from_date: e.target.value }))}
              className="w-[160px] h-10"
            />
            <Input
              type="date"
              value={filters.to_date}
              onChange={(e) => setFilters((f) => ({ ...f, to_date: e.target.value }))}
              className="w-[160px] h-10"
            />
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-6">
            <span className="text-overline text-muted-foreground whitespace-nowrap">Export</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={() => handleDownload("csv")}
                disabled={!isDateRangeValid || downloading.csv}
              >
                <FileText size={16} />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={() => handleDownload("xlsx")}
                disabled={!isDateRangeValid || downloading.xlsx}
              >
                <Table2 size={16} />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={() => handleDownload("pdf")}
                disabled={!isDateRangeValid || downloading.pdf}
              >
                <FileDown size={16} />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {!isDateRangeValid ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Select a date range to view the report.</p>
        </div>
      ) : isFetching ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Loading report...</p>
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-12 text-center">
          <p className="text-sm text-destructive">
            {error?.response?.data?.message || "Failed to load the report. Please try again."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Grand Total */}
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-overline text-muted-foreground mb-2">Period Total</p>
            <h2 className="text-3xl font-bold text-foreground">
              {formatCurrency(reportData?.grandTotal)}
            </h2>
          </div>

          {/* Daily Totals */}
          <div className="space-y-4">
            <div>
              <p className="text-overline text-muted-foreground mb-1">Breakdown by Date</p>
              <h3 className="text-2xl font-bold text-foreground">Daily Totals</h3>
            </div>
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/20 hover:bg-muted/20">
                    <TableHead className="px-4 py-3 font-medium">Date</TableHead>
                    <TableHead className="px-4 py-3 font-medium text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.dailyTotals?.length > 0 ? (
                    reportData.dailyTotals.map((row, idx) => (
                      <TableRow key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <TableCell className="px-4 py-3 text-sm">{row.ATTENDANCE_DATE}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(row.TOTAL_AMOUNT)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={2} className="text-center h-24 text-sm text-muted-foreground">
                        No daily totals found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Worker Totals */}
          <div className="space-y-4">
            <div>
              <p className="text-overline text-muted-foreground mb-1">Breakdown by Worker</p>
              <h3 className="text-2xl font-bold text-foreground">Worker Totals</h3>
            </div>
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/20 hover:bg-muted/20">
                    <TableHead className="px-4 py-3 font-medium">Worker Name</TableHead>
                    <TableHead className="px-4 py-3 font-medium text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.workerTotals?.length > 0 ? (
                    reportData.workerTotals.map((row, idx) => (
                      <TableRow key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <TableCell className="px-4 py-3 text-sm font-medium">{row.WORKER_NAME}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(row.TOTAL_AMOUNT)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={2} className="text-center h-24 text-sm text-muted-foreground">
                        No worker totals found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <p className="text-overline text-muted-foreground mb-1">Line Items</p>
              <h3 className="text-2xl font-bold text-foreground">Attendance Details</h3>
            </div>
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/20 hover:bg-muted/20">
                    <TableHead className="px-4 py-3 font-medium">Worker</TableHead>
                    <TableHead className="px-4 py-3 font-medium">Date</TableHead>
                    <TableHead className="px-4 py-3 font-medium">Basis</TableHead>
                    <TableHead className="px-4 py-3 font-medium text-right">Hours</TableHead>
                    <TableHead className="px-4 py-3 font-medium text-right">Days</TableHead>
                    <TableHead className="px-4 py-3 font-medium text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.details?.length > 0 ? (
                    reportData.details.map((row) => (
                      <TableRow key={row.ATTENDANCE_ID} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <TableCell className="px-4 py-3 text-sm font-medium">{row.WORKER_NAME}</TableCell>
                        <TableCell className="px-4 py-3 text-sm">{row.ATTENDANCE_DATE}</TableCell>
                        <TableCell className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                            {row.CALC_BASIS}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-right">{row.HOURS_WORKED ?? "—"}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-right">{row.DAYS_WORKED ?? "—"}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(row.AMOUNT)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="text-center h-24 text-sm text-muted-foreground">
                        No records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}