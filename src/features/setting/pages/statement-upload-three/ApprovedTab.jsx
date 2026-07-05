// src/features/setting/pages/statement-upload-three/ApprovedTab.jsx
import React, { useState, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Download, ExternalLink, Loader2, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { Button } from "@/components/ui/button";
import FilterBar from "./FilterBar";
import Pagination from "./Pagination";
import DisapproveModal from "./modals/DisapproveModal";
import { url, EMPTY_FILTERS, PAGE_SIZE, CATEGORY_STYLES, fmtDate, fmtAmount, downloadCsv } from "./constants";

export default function ApprovedTab({ projectOptions, contractorOptions, mutations }) {
  const { disapproveMutation } = mutations;

  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [disapproveTarget, setDisapproveTarget] = useState(null);
  const [exporting, setExporting] = useState(false);

  const queryParams = useMemo(() => ({
    ...appliedFilters, page, pageSize: PAGE_SIZE,
  }), [appliedFilters, page]);

  const { data: result, isLoading, isFetching } = useQuery({
    queryKey: ["statementMain", queryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([k, v]) => { if (v !== "" && v != null && k !== "status") params.append(k, v); });
      const res = await axios.get(`${url}/api/statement/main?${params.toString()}`);
      return { rows: res.data?.data || [], totalCount: res.data?.totalCount ?? (res.data?.data?.length || 0) };
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
  const rows = result?.rows || [];
  const totalCount = result?.totalCount || 0;

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([k, v]) => { if (v && k !== "status") params.append(k, v); });
      const res = await axios.get(`${url}/api/statement/main?${params.toString()}`);
      if (!downloadCsv(res.data?.data || [], "statement_approved.csv")) toast.error("No rows to download.");
    } catch {
      toast.error("Failed to export CSV.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <FilterBar
        initialFilters={appliedFilters}
        onApply={(f) => { setAppliedFilters(f); setPage(1); }}
        onClear={() => { setAppliedFilters(EMPTY_FILTERS); setPage(1); }}
        projectOptions={projectOptions}
        contractorOptions={contractorOptions}
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-xs text-gray-500">{totalCount} rows</span>
        {isFetching && !isLoading && (
          <span className="text-xs text-blue-500 flex items-center gap-1"><Loader2 className="animate-spin" size={12} /> refreshing...</span>
        )}
        <Button onClick={handleExportCsv} disabled={exporting} variant="outline" className="rounded-full text-sm ml-auto">
          {exporting ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Download size={14} className="mr-1" />} Download CSV
        </Button>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1500px]">
            <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Receive</th>
                <th className="px-4 py-3 text-right">Payment</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-left">Project</th>
                <th className="px-4 py-3 text-left">Contractor</th>
                <th className="px-4 py-3 text-left">Invoice No</th>
                <th className="px-4 py-3 text-left">Remarks</th>
                <th className="px-4 py-3 text-left">Approved Date</th>
                <th className="px-4 py-3 text-left">Invoice File</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={14} className="text-center py-10 text-gray-400"><Loader2 className="inline animate-spin mr-2" size={16} />Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={14} className="text-center py-10 text-gray-400">No approved transactions yet.</td></tr>
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
                        {r.DEBIT != null ? `$${Number(r.DEBIT).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-emerald-600 whitespace-nowrap">
                        {r.CREDIT != null ? `$${Number(r.CREDIT).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                      </td>
                      <td className="px-4 py-2.5 max-w-[220px] text-gray-700 text-xs break-words">{r.DESCRIPTION}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${CATEGORY_STYLES[cat] || CATEGORY_STYLES.other}`}>{cat}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.SOURCE_TYPE === "NON_BANKING" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                          {r.SOURCE_TYPE === "NON_BANKING" ? "Non-Banking" : "Banking"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 text-xs">{r.PROJECT_NAME || <span className="text-gray-400 italic">—</span>}</td>
                      <td className="px-4 py-2.5 text-gray-700 text-xs">{r.CONTRACTOR_NAME || <span className="text-gray-400 italic">—</span>}</td>
                      <td className="px-4 py-2.5 text-gray-700 text-xs">{r.INVOICE_NO || <span className="text-gray-400 italic">—</span>}</td>
                      <td className="px-4 py-2.5 text-gray-700 text-xs">{r.REMARKS || <span className="text-gray-400 italic">—</span>}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-500 text-xs">{fmtDate(r.APPROVED_DATE)}</td>
                      <td className="px-4 py-2.5 min-w-[130px]">
                        {r.INVOICE_FILE_NAME ? (
                          <a href={`${url}/api/statement/main/${r.TXN_ID}/invoice`} target="_blank" rel="noreferrer"
                            download={r.INVOICE_FILE_NAME}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium truncate max-w-[120px]"
                            title={r.INVOICE_FILE_NAME}>
                            <ExternalLink size={12} className="shrink-0" />{r.INVOICE_FILE_NAME}
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 min-w-[110px]">
                        <Button
                          size="sm"
                          onClick={() => setDisapproveTarget(r)}
                          disabled={!r.STAGING_ID}
                          className="h-7 px-2.5 text-xs rounded-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                          title={!r.STAGING_ID ? "Legacy records cannot be disapproved" : ""}
                        >
                          <RotateCcw size={12} className="mr-1" /> Disapprove
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalRows={totalCount} onPageChange={setPage} />
      </div>

      <DisapproveModal
        target={disapproveTarget}
        onCancel={() => setDisapproveTarget(null)}
        onConfirm={(txnId) => { disapproveMutation.mutate(txnId); setDisapproveTarget(null); }}
        isPending={disapproveMutation.isPending}
      />
    </>
  );
}