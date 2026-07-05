// src/features/setting/pages/statement-upload-three/BankingTab.jsx
import React, { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Upload, RotateCcw, Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { Button } from "@/components/ui/button";
import FilterBar from "./FilterBar";
import Pagination from "./Pagination";
import StagingThead from "./StagingThead";
import StagingRow from "./StagingRow";
import DeleteInvoiceModal from "./modals/DeleteInvoiceModal";
import ApproveModal from "./modals/ApproveModal";
import { url, EMPTY_FILTERS, PAGE_SIZE, CATEGORY_STYLES, downloadCsv } from "./constants";

export default function BankingTab({ projectOptions, contractorOptions, projectOpts, contractorOpts, mutations }) {
  const queryClient = useQueryClient();
  const { updateRowMutation, uploadInvoiceMutation, deleteInvoiceMutation, approveMutation } = mutations;

  const [file, setFile] = useState(null);
  const [batchId, setBatchId] = useState(null);
  const [activeCats, setActiveCats] = useState({ address: true, place: true, product: true, other: true });
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [approvingRowId, setApprovingRowId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const selectedCatKeys = useMemo(
    () => Object.entries(activeCats).filter(([, v]) => v).map(([k]) => k),
    [activeCats]
  );
  const categoriesParam = selectedCatKeys.length === 4 ? "" : selectedCatKeys.join(",");
  const noCategoriesSelected = selectedCatKeys.length === 0;

  useQuery({
    queryKey: ["statementLatestBatch"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/statement/latest-batch`);
      const latest = res.data?.batchId;
      if (latest) setBatchId(latest);
      return latest;
    },
    enabled: !batchId,
    refetchOnWindowFocus: false,
  });

  const uploadMutation = useMutation({
    mutationFn: async (f) => {
      const fd = new FormData();
      fd.append("file", f);
      return axios.post(`${url}/api/statement/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: async (res) => {
      setBatchId(res.data?.batchId);
      setFile(null);
      toast.success(res.data?.message || "CSV processed!");
      await queryClient.invalidateQueries({ queryKey: ["statementStagingAll"], refetchType: "active" });
      await queryClient.invalidateQueries({ queryKey: ["statementStagingStats"], refetchType: "active" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to process CSV."),
  });

  const queryParams = useMemo(() => ({
    sourceType: "BANKING", ...appliedFilters, categories: categoriesParam, page, pageSize: PAGE_SIZE,
  }), [appliedFilters, categoriesParam, page]);

  const { data: result, isLoading, isFetching } = useQuery({
    queryKey: ["statementStagingAll", "BANKING", queryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([k, v]) => { if (v !== "" && v != null) params.append(k, v); });
      const res = await axios.get(`${url}/api/statement/staging/all?${params.toString()}`);
      return { rows: res.data?.data || [], totalCount: res.data?.totalCount ?? (res.data?.data?.length || 0) };
    },
    enabled: !noCategoriesSelected,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
  const rows = noCategoriesSelected ? [] : (result?.rows || []);
  const totalCount = noCategoriesSelected ? 0 : (result?.totalCount || 0);

  const statsParams = useMemo(() => ({ sourceType: "BANKING", ...appliedFilters }), [appliedFilters]);
  const { data: categoryStats = { address: 0, place: 0, product: 0, other: 0 } } = useQuery({
    queryKey: ["statementStagingStats", statsParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(statsParams).forEach(([k, v]) => { if (v) params.append(k, v); });
      return (await axios.get(`${url}/api/statement/staging/stats?${params.toString()}`)).data?.data
        || { address: 0, place: 0, product: 0, other: 0 };
    },
    refetchOnWindowFocus: false,
  });

  const handleFileSelect = (fileList) => {
    const selected = fileList?.[0];
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".csv")) { toast.error("Please select a CSV file."); return; }
    setFile(selected);
  };
  const handleLoad = () => {
    if (!file) { toast.error("Please choose a CSV file first."); return; }
    uploadMutation.mutate(file);
  };
  const handleReset = () => { setFile(null); setBatchId(null); };
  const toggleCategory = (cat) => { setActiveCats((prev) => ({ ...prev, [cat]: !prev[cat] })); setPage(1); };

  const handleProjectChange = (stagingId, pId, projectName) =>
    updateRowMutation.mutate({ stagingId, pId: pId || null, projectName: projectName || null });
  const handleContractorChange = (stagingId, contractorId, contractorName) =>
    updateRowMutation.mutate({ stagingId, contractorId: contractorId || null, contractorName: contractorName || null });
  const handleInvoiceNoBlur = (stagingId, value) => updateRowMutation.mutate({ stagingId, invoiceNo: value });
  const handleRemarksBlur = (stagingId, value) => updateRowMutation.mutate({ stagingId, remarks: value });
  const handleCategoryChange = (stagingId, value) => updateRowMutation.mutate({ stagingId, category: value });
  const handleInvoiceFileSelect = (stagingId, fileList) => {
    const f = fileList?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { toast.error(`"${f.name}" exceeds 20 MB limit.`); return; }
    uploadInvoiceMutation.mutate({ stagingId, file: f });
  };
  const handleDeleteInvoiceClick = (stagingId, fileName) => setDeleteTarget({ stagingId, fileName });
  const handleApproveClick = (row) => setApproveTarget(row);
  const confirmApprove = (stagingId) => {
    setApprovingRowId(stagingId);
    approveMutation.mutate(stagingId, { onSettled: () => setApprovingRowId(null) });
    setApproveTarget(null);
  };
  const confirmDeleteInvoice = (stagingId) => {
    deleteInvoiceMutation.mutate(stagingId, { onSuccess: () => setDeleteTarget(null) });
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      const p = { sourceType: "BANKING", ...appliedFilters, categories: categoriesParam };
      Object.entries(p).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await axios.get(`${url}/api/statement/staging/all?${params.toString()}`);
      if (!downloadCsv(res.data?.data || [], "statement_banking.csv")) toast.error("No rows to download.");
    } catch {
      toast.error("Failed to export CSV.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-3 bg-white border rounded-full px-4 py-1.5 shadow-sm">
          <label htmlFor="statement-csv-input" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <Upload size={16} className="text-blue-600" /> Choose CSV
          </label>
          <span className="text-xs text-gray-500 max-w-[180px] truncate">{file ? file.name : "No file selected"}</span>
          <input id="statement-csv-input" type="file" accept=".csv" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
        </div>
        <Button onClick={handleLoad} disabled={uploadMutation.isPending} className="rounded-full bg-emerald-600 hover:bg-emerald-700">
          {uploadMutation.isPending ? <><Loader2 className="animate-spin mr-1" size={14} />Loading...</> : "Load"}
        </Button>
        <Button variant="outline" onClick={handleReset} className="rounded-full">
          <RotateCcw size={14} className="mr-1" /> Reset
        </Button>
        {isFetching && !isLoading && (
          <span className="text-xs text-blue-500 flex items-center gap-1"><Loader2 className="animate-spin" size={12} /> refreshing...</span>
        )}
      </div>

      <FilterBar
        initialFilters={appliedFilters}
        onApply={(f) => { setAppliedFilters(f); setPage(1); }}
        onClear={() => { setAppliedFilters(EMPTY_FILTERS); setPage(1); }}
        projectOptions={projectOptions}
        contractorOptions={contractorOptions}
        showCategory
      />

      <div className="flex flex-wrap items-center gap-6 bg-white border rounded-2xl shadow-sm px-6 py-4 mb-5">
        <div className="text-sm text-gray-600">
          <strong className="text-gray-900 text-base font-semibold mr-1">{totalCount}</strong> rows
        </div>
        {Object.entries(categoryStats).map(([cat, count]) => (
          <div key={cat} className="flex items-center gap-1.5 text-sm text-gray-600">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${CATEGORY_STYLES[cat]}`}>{cat}</span>
            <strong className="text-gray-900">{count}</strong>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white border rounded-2xl shadow-sm px-6 py-3 mb-5">
        <div className="flex flex-wrap items-center gap-4">
          {["address", "place", "product", "other"].map((cat) => (
            <label key={cat} className="flex items-center gap-1.5 text-sm font-medium text-gray-700 cursor-pointer capitalize">
              <input type="checkbox" checked={activeCats[cat]} onChange={() => toggleCategory(cat)} className="accent-blue-600 w-4 h-4" />
              {cat}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button onClick={handleExportCsv} disabled={exporting} variant="outline" className="rounded-full text-sm">
            {exporting ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Download size={14} className="mr-1" />} CSV
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1400px]">
            <StagingThead />
            <tbody>
              {isLoading ? (
                <tr><td colSpan={11} className="text-center py-10 text-gray-400"><Loader2 className="inline animate-spin mr-2" size={16} />Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-10 text-gray-400">No rows found.</td></tr>
              ) : (
                rows.map((r) => (
                  <StagingRow
                    key={r.STAGING_ID}
                    row={r}
                    projectOpts={projectOpts}
                    contractorOpts={contractorOpts}
                    isApproving={approvingRowId === r.STAGING_ID}
                    onProjectChange={handleProjectChange}
                    onContractorChange={handleContractorChange}
                    onInvoiceNoBlur={handleInvoiceNoBlur}
                    onRemarksBlur={handleRemarksBlur}
                    onCategoryChange={handleCategoryChange}
                    onInvoiceFileSelect={handleInvoiceFileSelect}
                    onDeleteInvoiceClick={handleDeleteInvoiceClick}
                    onApproveClick={handleApproveClick}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalRows={totalCount} onPageChange={setPage} />
      </div>

      <DeleteInvoiceModal target={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDeleteInvoice} isPending={deleteInvoiceMutation.isPending} />
      <ApproveModal target={approveTarget} onCancel={() => setApproveTarget(null)} onConfirm={confirmApprove} isPending={approveMutation.isPending} />
    </>
  );
}