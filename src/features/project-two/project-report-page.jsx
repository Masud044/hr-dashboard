import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Download, ExternalLink, Loader2, FileText } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/SectionContainer";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const CATEGORY_STYLES = {
  address: "bg-blue-100 text-blue-700",
  place:   "bg-amber-100 text-amber-700",
  product: "bg-emerald-100 text-emerald-700",
  other:   "bg-slate-100 text-slate-600",
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

export function ProjectReportPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  
  // Get project name from query or state (you can adjust this based on your routing)
const { data: rows = [], isLoading } = useQuery({
  queryKey: ["projectReport", projectId],
  queryFn: async () => (await axios.get(`${url}/api/statement/project-report/${projectId}`)).data?.data || [],
  enabled: !!projectId,
});

// Extract project name from the first row
const projectName = rows.length > 0 ? rows[0].P_NAME : `Project #${projectId}`;

  const totals = useMemo(() => {
    const debit  = rows.reduce((s, r) => s + (Number(r.DEBIT) || 0), 0);
    const credit = rows.reduce((s, r) => s + (Number(r.CREDIT) || 0), 0);
    return { debit, credit, net: debit - credit };
  }, [rows]);

  const handleDownloadCsv = () => {
if (rows.length === 0) { toast.error("No data to download."); return; }
  const headers = ["Contractor", "Date", "Received", "Payment", "Description", "Category", "Matched Address", "Invoice No", "Source", "Remarks", "Approved Date", "Invoice File"];
  const csvRows = rows.map((r) => [
    `"${(r.CONTRACTOR_NAME || "").replace(/"/g, '""')}"`,
    fmtDate(r.TXN_DATE), r.DEBIT ?? "", r.CREDIT ?? "",
    `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
    r.CATEGORY || "",
    `"${(r.MATCHED_ADDRESS || "").replace(/"/g, '""')}"`,
    `"${(r.INVOICE_NO || "").replace(/"/g, '""')}"`,
    r.SOURCE_TYPE || "",
    `"${(r.REMARKS || "").replace(/"/g, '""')}"`,
    fmtDate(r.APPROVED_DATE),
  ]);
    const csv = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
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
                  {isLoading ? "Loading..." : `${rows.length} approved transaction${rows.length !== 1 ? "s" : ""}`}
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
                disabled={rows.length === 0}
              >
                <Download size={14} className="mr-2" /> Download CSV
              </Button>
            </div>
          </div>
          <div className="w-full h-px bg-border mt-4" />
        </div>

        {/* Summary bar */}
{!isLoading && rows.length > 0 && (
  <div className="flex items-center gap-6 px-6 py-3 mb-6 bg-muted/30 border border-border rounded-lg text-sm">
    <div>
      <span className="text-muted-foreground">Total Received: </span>
      <strong className="text-green-500">{fmtAmount(totals.debit)}</strong>
    </div>
    <div>
      <span className="text-muted-foreground">Total Payment: </span>
      <strong className="text-destructive">{fmtAmount(totals.credit)}</strong>
    </div>
    <div>
      <span className="text-muted-foreground">Total: </span>
      <strong className={totals.net >= 0 ? "text-green-500" : "text-destructive"}>{fmtAmount(totals.net)}</strong>
    </div>
  </div>
)}

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1200px]">
            <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase">
  <tr>
    <th className="px-4 py-3 text-left font-medium">Contractor</th>
    <th className="px-4 py-3 text-left font-medium">Date</th>
    <th className="px-4 py-3 text-right font-medium">Received</th>
    <th className="px-4 py-3 text-right font-medium">Payment</th>
    <th className="px-4 py-3 text-left font-medium">Description</th>
    <th className="px-4 py-3 text-left font-medium">Category</th>
    <th className="px-4 py-3 text-left font-medium">Matched Address</th>
    <th className="px-4 py-3 text-left font-medium">Invoice No</th>
    <th className="px-4 py-3 text-left font-medium">Source</th>
    <th className="px-4 py-3 text-left font-medium">Remarks</th>
    <th className="px-4 py-3 text-left font-medium">Approved Date</th>
    <th className="px-4 py-3 text-left font-medium">Invoice File</th>
  </tr>
</thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={12} className="text-center py-12 text-muted-foreground">
                      <Loader2 className="inline animate-spin mr-2" size={16} />
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-12 text-muted-foreground">
                      No approved transactions for this project.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const cat = (r.CATEGORY || "other").toLowerCase();
                    return (
                     <tr key={r.TXN_ID} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
  <td className="px-4 py-2.5 text-foreground text-xs">
    {r.CONTRACTOR_NAME || <span className="text-muted-foreground italic">—</span>}
  </td>
  <td className="px-4 py-2.5 whitespace-nowrap font-medium text-foreground">{fmtDate(r.TXN_DATE)}</td>
  <td className="px-4 py-2.5 text-right font-semibold text-green-500 whitespace-nowrap">
    {r.DEBIT != null ? fmtAmount(r.DEBIT) : "—"}
  </td>
  <td className="px-4 py-2.5 text-right font-semibold text-destructive whitespace-nowrap">
    {r.CREDIT != null ? fmtAmount(r.CREDIT) : "—"}
  </td>
  <td className="px-4 py-2.5 max-w-[200px] text-foreground text-xs break-words">{r.DESCRIPTION}</td>
  <td className="px-4 py-2.5">
    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${CATEGORY_STYLES[cat] || CATEGORY_STYLES.other}`}>
      {cat}
    </span>
  </td>
  <td className="px-4 py-2.5 max-w-[150px] text-xs">
    {r.MATCHED_ADDRESS ? (
      <span className="text-primary font-medium">{r.MATCHED_ADDRESS}</span>
    ) : (
      <span className="text-muted-foreground italic">—</span>
    )}
  </td>
  <td className="px-4 py-2.5 text-foreground text-xs">
    {r.INVOICE_NO || <span className="text-muted-foreground italic">—</span>}
  </td>
  <td className="px-4 py-2.5">
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
      r.SOURCE_TYPE === "NON_BANKING" 
        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" 
        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    }`}>
      {r.SOURCE_TYPE === "NON_BANKING" ? "Non-Banking" : "Banking"}
    </span>
  </td>
  <td className="px-4 py-2.5 text-foreground text-xs">
    {r.REMARKS || <span className="text-muted-foreground italic">—</span>}
  </td>
  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground text-xs">
    {fmtDate(r.APPROVED_DATE)}
  </td>
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
        <ExternalLink size={12} className="shrink-0" />
        {r.INVOICE_FILE_NAME}
      </a>
    ) : (
      <span className="text-muted-foreground italic text-xs">—</span>
    )}
  </td>
</tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}