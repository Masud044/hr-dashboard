import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Download, ExternalLink, Loader2, FileText } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";

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

export function ProjectReportSheet({ isOpen, onClose, projectId, projectName }) {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["projectReport", projectId],
    queryFn: async () => (await axios.get(`${url}/api/statement/project-report/${projectId}`)).data?.data || [],
    enabled: !!projectId && isOpen,
  });

  const totals = useMemo(() => {
    const debit  = rows.reduce((s, r) => s + (Number(r.DEBIT) || 0), 0);
    const credit = rows.reduce((s, r) => s + (Number(r.CREDIT) || 0), 0);
    return { debit, credit, net: debit - credit };
  }, [rows]);

  const handleDownloadCsv = () => {
    if (rows.length === 0) { toast.error("No data to download."); return; }
    const headers = ["Date", "Amount", "Debit", "Credit", "Description", "Category", "Matched Address", "Contractor", "Invoice No", "Source", "Remarks", "Approved Date"];
    const csvRows = rows.map((r) => [
      fmtDate(r.TXN_DATE), r.AMOUNT, r.DEBIT ?? "", r.CREDIT ?? "",
      `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
      r.CATEGORY || "",
      `"${(r.MATCHED_ADDRESS || "").replace(/"/g, '""')}"`,
      `"${(r.CONTRACTOR_NAME || "").replace(/"/g, '""')}"`,
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
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="!w-screen !h-screen !max-w-none overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-[104]">
        <SheetHeader className="px-6 pt-6 mb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <div>
                <SheetTitle>{projectName || "Project"} — Statement Report</SheetTitle>
                <SheetDescription>
                  {isLoading ? "Loading..." : `${rows.length} approved transaction${rows.length !== 1 ? "s" : ""}`}
                </SheetDescription>
              </div>
            </div>
            <Button onClick={handleDownloadCsv} variant="outline" size="sm" className="rounded-full text-xs shrink-0" disabled={rows.length === 0}>
              <Download size={13} className="mr-1" /> Download CSV
            </Button>
          </div>
        </SheetHeader>

        {/* Summary bar */}
        {!isLoading && rows.length > 0 && (
          <div className="flex items-center gap-6 px-6 py-3 mx-6 mb-4 bg-gray-50 border rounded-lg text-sm">
            <div>
              <span className="text-gray-500">Total Debit: </span>
              <strong className="text-red-600">{fmtAmount(totals.debit)}</strong>
            </div>
            <div>
              <span className="text-gray-500">Total Credit: </span>
              <strong className="text-emerald-600">{fmtAmount(totals.credit)}</strong>
            </div>
            <div>
              <span className="text-gray-500">Net: </span>
              <strong className={totals.net >= 0 ? "text-emerald-600" : "text-red-600"}>{fmtAmount(totals.net)}</strong>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="px-6 pb-6 flex-1">
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1300px]">
                <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Debit</th>
                    <th className="px-4 py-3 text-right">Credit</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Matched Address</th>
                    <th className="px-4 py-3 text-left">Contractor</th>
                    <th className="px-4 py-3 text-left">Invoice No</th>
                    <th className="px-4 py-3 text-left">Source</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                    <th className="px-4 py-3 text-left">Approved Date</th>
                    <th className="px-4 py-3 text-left">Invoice File</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={13} className="text-center py-12 text-gray-400"><Loader2 className="inline animate-spin mr-2" size={16} />Loading...</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={13} className="text-center py-12 text-gray-400">No approved transactions for this project.</td></tr>
                  ) : (
                    rows.map((r) => {
                      const cat = (r.CATEGORY || "other").toLowerCase();
                      return (
                        <tr key={r.TXN_ID} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-2.5 whitespace-nowrap font-medium text-gray-900">{fmtDate(r.TXN_DATE)}</td>
                          <td className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${Number(r.AMOUNT) < 0 ? "text-red-600" : "text-emerald-600"}`}>
                            {fmtAmount(r.AMOUNT)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-red-600 whitespace-nowrap">
                            {r.DEBIT != null ? fmtAmount(r.DEBIT) : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-emerald-600 whitespace-nowrap">
                            {r.CREDIT != null ? fmtAmount(r.CREDIT) : "—"}
                          </td>
                          <td className="px-4 py-2.5 max-w-[200px] text-gray-700 text-xs break-words">{r.DESCRIPTION}</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${CATEGORY_STYLES[cat] || CATEGORY_STYLES.other}`}>{cat}</span>
                          </td>
                          <td className="px-4 py-2.5 max-w-[150px] text-xs">
                            {r.MATCHED_ADDRESS ? <span className="text-blue-700 font-medium">{r.MATCHED_ADDRESS}</span> : <span className="text-gray-400 italic">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-gray-700 text-xs">{r.CONTRACTOR_NAME || <span className="text-gray-400 italic">—</span>}</td>
                          <td className="px-4 py-2.5 text-gray-700 text-xs">{r.INVOICE_NO || <span className="text-gray-400 italic">—</span>}</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.SOURCE_TYPE === "NON_BANKING" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                              {r.SOURCE_TYPE === "NON_BANKING" ? "Non-Banking" : "Banking"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-700 text-xs">{r.REMARKS || <span className="text-gray-400 italic">—</span>}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-gray-500 text-xs">{fmtDate(r.APPROVED_DATE)}</td>
                          <td className="px-4 py-2.5 min-w-[130px]">
                            {r.INVOICE_FILE_NAME ? (
                              <a
                                href={`${url}/api/statement/main/${r.TXN_ID}/invoice`}
                                target="_blank" rel="noreferrer" download={r.INVOICE_FILE_NAME}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium truncate max-w-[120px]"
                                title={r.INVOICE_FILE_NAME}
                              >
                                <ExternalLink size={12} className="shrink-0" />{r.INVOICE_FILE_NAME}
                              </a>
                            ) : (
                              <span className="text-gray-400 italic text-xs">—</span>
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
      </SheetContent>
    </Sheet>
  );
}