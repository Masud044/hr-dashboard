// src/features/setting/pages/statement-upload-four/BankingTab.jsx
import React, { useState, useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
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
import { useHasPermission } from "@/hooks/use-permission";
import {
  url,
  EMPTY_FILTERS,
  PAGE_SIZE,
  CATEGORY_STYLES,
  downloadCsv,
} from "./constants";
import DetailsSheet from "./DetailsSheet";

export default function BankingTab({
  projectOptions,
  contractorOptions,
  projectOpts,
  contractorOpts,
  mutations,
  sortBy = "txnDate",
}) {
  const queryClient = useQueryClient();
  const {
    updateRowMutation,
    uploadInvoiceMutation,
    deleteInvoiceMutation,
    approveMutation,
    rematchRowMutation,
  } = mutations;
  const canCreate = useHasPermission("PROJECT_STATEMENT_CREATE");
  const canDownload = useHasPermission("PROJECT_STATEMENT_DOWNLOAD");

  const [file, setFile] = useState(null);
  const [batchId, setBatchId] = useState(null);
  const [rematchingRowId, setRematchingRowId] = useState(null);
  const [excludingMarginRowId, setExcludingMarginRowId] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [approvingRowId, setApprovingRowId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState(null);

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
      return axios.post(`${url}/api/statement/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: async (res) => {
      setBatchId(res.data?.batchId);
      setFile(null);
      toast.success(res.data?.message || "CSV processed!");
      await queryClient.invalidateQueries({
        queryKey: ["statementStagingAll"],
        refetchType: "active",
      });
      await queryClient.invalidateQueries({
        queryKey: ["statementStagingStats"],
        refetchType: "active",
      });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to process CSV."),
  });

  const queryParams = useMemo(
    () => ({
      sourceType: "BANKING",
      ...appliedFilters,
      status: sortBy === "recent" ? "PENDING" : appliedFilters.status,
      sortBy,
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    }),
    [appliedFilters, sortBy, pagination],
  );

  const {
    data: result,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["statementStagingAll", "BANKING", queryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== "" && v != null) params.append(k, v);
      });
      const res = await axios.get(
        `${url}/api/statement/staging/all?${params.toString()}`,
      );
      return {
        rows: res.data?.data || [],
        totalCount: res.data?.totalCount ?? (res.data?.data?.length || 0),
      };
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
  const rows = result?.rows || [];
  const totalCount = result?.totalCount || 0;
  const table = useReactTable({
    data: rows,
    columns: [],
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(totalCount / pagination.pageSize)),
    getCoreRowModel: getCoreRowModel(),
  });

  const statsParams = useMemo(
    () => ({ sourceType: "BANKING", ...appliedFilters }),
    [appliedFilters],
  );

  const handleFileSelect = (fileList) => {
    const selected = fileList?.[0];
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a CSV file.");
      return;
    }
    setFile(selected);
  };
  const handleLoad = () => {
    if (!file) {
      toast.error("Please choose a CSV file first.");
      return;
    }
    uploadMutation.mutate(file);
  };
  const handleReset = () => {
    setFile(null);
    setBatchId(null);
  };

  const handleProjectChange = (stagingId, pId, projectName) =>
    updateRowMutation.mutate({
      stagingId,
      pId: pId || null,
      projectName: projectName || null,
    });
  const handleContractorChange = (stagingId, contractorId, contractorName) =>
    updateRowMutation.mutate({
      stagingId,
      contractorId: contractorId || null,
      contractorName: contractorName || null,
    });
  const handleInvoiceNoBlur = (stagingId, value) =>
    updateRowMutation.mutate({ stagingId, invoiceNo: value });
  const handleRemarksBlur = (stagingId, value) =>
    updateRowMutation.mutate({ stagingId, remarks: value });
  const handleCategoryChange = (stagingId, value) =>
    updateRowMutation.mutate({ stagingId, category: value });
  const handleInvoiceFileSelect = (stagingId, fileList) => {
    const f = fileList?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      toast.error(`"${f.name}" exceeds 20 MB limit.`);
      return;
    }
    uploadInvoiceMutation.mutate({ stagingId, file: f });
  };
  const handleDeleteInvoiceClick = (stagingId, fileName) =>
    setDeleteTarget({ stagingId, fileName });
  const handleApproveClick = (row) => setApproveTarget(row);
  const confirmApprove = (stagingId) => {
    setApprovingRowId(stagingId);
    approveMutation.mutate(stagingId, {
      onSettled: () => setApprovingRowId(null),
    });
    setApproveTarget(null);
  };
  const confirmDeleteInvoice = (stagingId) => {
    deleteInvoiceMutation.mutate(stagingId, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleRematchClick = (stagingId) => {
    setRematchingRowId(stagingId);
    rematchRowMutation.mutate(stagingId, {
      onSettled: () => setRematchingRowId(null),
    });
  };

  const handleExcludeMarginChange = (stagingId, value) => {
    setExcludingMarginRowId(stagingId);
    updateRowMutation.mutate(
      { stagingId, excludeMargin: value },
      {
        onSuccess: () =>
          toast.success(
            value === "Y" ? "Margin excluded." : "Margin included.",
          ),
        onSettled: () => setExcludingMarginRowId(null),
      },
    );
  };
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      const p = {
        sourceType: "BANKING",
        ...appliedFilters,
      };
      Object.entries(p).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
      const res = await axios.get(
        `${url}/api/statement/staging/all?${params.toString()}`,
      );
      if (!downloadCsv(res.data?.data || [], "statement_banking.csv"))
        toast.error("No rows to download.");
    } catch {
      toast.error("Failed to export CSV.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {canCreate && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-3 bg-card border border-border rounded-full pl-1.5 pr-4 py-1.5">
            <label
              htmlFor="statement-csv-input"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer bg-secondary hover:bg-accent hover:text-accent-foreground rounded-full px-3 py-1.5 transition-colors"
            >
              <Upload size={13} className="text-primary" /> Choose CSV
            </label>
            <span className="text-xs text-muted-foreground max-w-[180px] truncate">
              {file ? file.name : "No file selected"}
            </span>
            <input
              id="statement-csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
          <Button
            onClick={handleLoad}
            disabled={uploadMutation.isPending}
            size="sm"
            className="rounded-full bg-primary hover:bg-[#4F46E5] text-primary-foreground btn-lift"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-1" size={13} />
                Loading...
              </>
            ) : (
              "Load"
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-full"
          >
            <RotateCcw size={13} className="mr-1" /> Reset
          </Button>
          {isFetching && !isLoading && (
            <span className="text-xs text-primary flex items-center gap-1">
              <Loader2 className="animate-spin" size={12} /> refreshing...
            </span>
          )}
        </div>
      )}

      <FilterBar
        initialFilters={appliedFilters}
        onApply={(f) => {
          setAppliedFilters(f);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        onClear={() => {
          setAppliedFilters(EMPTY_FILTERS);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        projectOptions={projectOptions}
        contractorOptions={contractorOptions}
      />

      <div className="flex flex-wrap items-center gap-6 bg-card border border-border rounded-md px-4 py-3 mb-4">
        <div className="text-xs text-muted-foreground">
          <strong className="text-foreground text-sm font-semibold mr-1">
            {totalCount}
          </strong>
          rows
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {canDownload && (
            <Button
              onClick={handleExportCsv}
              disabled={exporting}
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
            >
              {exporting ? (
                <Loader2 size={13} className="mr-1 animate-spin" />
              ) : (
                <Download size={13} className="mr-1" />
              )}{" "}
              CSV
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-auto max-h-[75vh]">
          <table className="w-full text-sm min-w-[1400px]">
            <StagingThead showExcludeMargin />
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-muted-foreground text-xs">
                    <Loader2 className="inline animate-spin mr-2" size={15} />
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-muted-foreground text-xs">
                    No rows found.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <StagingRow
                    key={r.STAGING_ID}
                    row={r}
                    index={idx}
                    projectOpts={projectOpts}
                    contractorOpts={contractorOpts}
                    isApproving={approvingRowId === r.STAGING_ID}
                    isRematching={rematchingRowId === r.STAGING_ID}
                    isExcludingMargin={excludingMarginRowId === r.STAGING_ID}
                    onProjectChange={handleProjectChange}
                    onContractorChange={handleContractorChange}
                    onInvoiceNoBlur={handleInvoiceNoBlur}
                    onRemarksBlur={handleRemarksBlur}
                    onCategoryChange={handleCategoryChange}
                    onInvoiceFileSelect={handleInvoiceFileSelect}
                    onDeleteInvoiceClick={handleDeleteInvoiceClick}
                    onApproveClick={handleApproveClick}
                    onRematchClick={handleRematchClick}
                    onExcludeMarginChange={handleExcludeMarginChange}
                    showExcludeMargin
                    onDetailsClick={setDetailsTarget}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        <DataTablePaginationTwo table={table} tableKey="statementBanking" />
      </div>

      <DeleteInvoiceModal
        target={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteInvoice}
        isPending={deleteInvoiceMutation.isPending}
      />
      <ApproveModal
        target={approveTarget}
        onCancel={() => setApproveTarget(null)}
        onConfirm={confirmApprove}
        isPending={approveMutation.isPending}
      />
      <DetailsSheet
        row={detailsTarget}
        onClose={() => setDetailsTarget(null)}
      />
    </>
  );
}