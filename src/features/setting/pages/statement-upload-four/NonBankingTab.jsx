// src/features/setting/pages/statement-upload-four/NonBankingTab.jsx
import React, { useState, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
import { Download, Loader2, PlusCircle, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DateInput from "@/components/shared/DateInput";
import FilterBar from "./FilterBar";
import Pagination from "./Pagination";
import StagingThead from "./StagingThead";
import StagingRow from "./StagingRow";
import DeleteInvoiceModal from "./modals/DeleteInvoiceModal";
import ApproveModal from "./modals/ApproveModal";
import DeleteRowModal from "./modals/DeleteRowModal";
import DetailsSheet from "./DetailsSheet";
import {
  url,
  EMPTY_FILTERS,
  EMPTY_NB,
  PAGE_SIZE,
  downloadCsv,
} from "./constants";
import { toSortedOpts } from "@/lib/utils";
import { useHasPermission } from "@/hooks/use-permission";

export default function NonBankingTab({
  projectOptions,
  contractorOptions,
  projectOpts,
  contractorOpts,
  mutations,

  sortBy = "txnDate",
}) {
  const {
    updateRowMutation,
    uploadInvoiceMutation,
    deleteInvoiceMutation,
    approveMutation,
    addNonBankingMutation,
    deleteStagingRowMutation,
    rematchRowMutation,
  } = mutations;

  const canCreate = useHasPermission("PROJECT_STATEMENT_CREATE");
  const canDownload = useHasPermission("PROJECT_STATEMENT_DOWNLOAD");

  const [nbForm, setNbForm] = useState(EMPTY_NB);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [deleteRowTarget, setDeleteRowTarget] = useState(null);
  const [approvingRowId, setApprovingRowId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [rematchingRowId, setRematchingRowId] = useState(null);
  const [deletingRowId, setDeletingRowId] = useState(null);
  const [excludingMarginRowId, setExcludingMarginRowId] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);

  const queryParams = useMemo(
    () => ({
      sourceType: "NON_BANKING",
      ...appliedFilters,
      status: sortBy === "recent" ? "PENDING" : appliedFilters.status,
      sortBy,
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    }),
    [appliedFilters, sortBy, pagination],
  );

  const sortedContractorOptions = useMemo(
    () =>
      [...contractorOptions].sort((a, b) =>
        a.CONTRATOR_NAME.localeCompare(b.CONTRATOR_NAME),
      ),
    [contractorOptions],
  );
  const {
    data: result,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["statementStagingAll", "NON_BANKING", queryParams],
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

  const handleNbSubmit = () => {
    if (!nbForm.txnDate || !nbForm.amount) {
      toast.error("Date and Amount are required.");
      return;
    }
    const proj = projectOptions.find(
      (p) => String(p.P_ID) === String(nbForm.pId),
    );
    const cont = contractorOptions.find(
      (c) => String(c.CONTRATOR_ID) === String(nbForm.contractorId),
    );
    addNonBankingMutation.mutate(
      {
        ...nbForm,
        pId: nbForm.pId || null,
        contractorId: nbForm.contractorId || null,
        projectName: proj?.P_NAME || null,
        contractorName: cont?.CONTRATOR_NAME || null,
      },
      { onSuccess: () => setNbForm(EMPTY_NB) },
    );
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
  const handlePaymentByChange = (stagingId, value) =>
    updateRowMutation.mutate({ stagingId, paymentBy: value });
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
  const handleDeleteRowClick = (row) =>
    setDeleteRowTarget({
      stagingId: row.STAGING_ID,
      description: row.DESCRIPTION,
    });
  const confirmDeleteRow = (stagingId) => {
    setDeletingRowId(stagingId);
    deleteStagingRowMutation.mutate(stagingId, {
      onSuccess: () => setDeleteRowTarget(null),
      onSettled: () => setDeletingRowId(null),
    });
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
      const p = { sourceType: "NON_BANKING", ...appliedFilters };
      Object.entries(p).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
      const res = await axios.get(
        `${url}/api/statement/staging/all?${params.toString()}`,
      );
      if (!downloadCsv(res.data?.data || [], "statement_nonbanking.csv"))
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
        <div className="bg-card border border-accent-foreground/30 rounded-md px-4 py-4 mb-4">
          <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5 uppercase tracking-wide">
            <PlusCircle size={14} className="text-primary" /> Add Entry
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date *</label>
              <DateInput
                value={nbForm.txnDate}
                onChange={(v) => setNbForm((p) => ({ ...p, txnDate: v }))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Type *</label>
              <Select
                value={nbForm.entryType}
                onValueChange={(v) => setNbForm((p) => ({ ...p, entryType: v }))}
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEBIT">Receive</SelectItem>
                  <SelectItem value="CREDIT">Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Payment By
              </label>
              <Select
                value={nbForm.paymentBy}
                onValueChange={(v) => setNbForm((p) => ({ ...p, paymentBy: v }))}
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUILDER">Builder</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={nbForm.excludeMargin === "Y"}
                  onChange={(e) =>
                    setNbForm((p) => ({
                      ...p,
                      excludeMargin: e.target.checked ? "Y" : "N",
                    }))
                  }
                  className="accent-destructive w-4 h-4 rounded"
                />
                Exclude Margin
              </label>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Amount *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 1500"
                value={nbForm.amount}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || Number(v) >= 0)
                    setNbForm((p) => ({ ...p, amount: v }));
                }}
                className="h-8 text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">
                Description *
              </label>
              <Input
                placeholder="Description"
                value={nbForm.description}
                onChange={(e) =>
                  setNbForm((p) => ({ ...p, description: e.target.value }))
                }
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Project</label>
              <Select
                value={nbForm.pId || "NONE"}
                onValueChange={(v) =>
                  setNbForm((p) => ({ ...p, pId: v === "NONE" ? "" : v }))
                }
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {projectOptions.map((p) => (
                    <SelectItem key={p.P_ID} value={String(p.P_ID)}>
                      {p.P_NAME}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Contractor
              </label>
              <Select
                value={nbForm.contractorId || "NONE"}
                onValueChange={(v) =>
                  setNbForm((p) => ({
                    ...p,
                    contractorId: v === "NONE" ? "" : v,
                  }))
                }
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue placeholder="Select contractor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {sortedContractorOptions.map((c) => (
                    <SelectItem
                      key={c.CONTRATOR_ID}
                      value={String(c.CONTRATOR_ID)}
                    >
                      {c.CONTRATOR_NAME}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Invoice No
              </label>
              <Input
                placeholder="Invoice no."
                value={nbForm.invoiceNo}
                onChange={(e) =>
                  setNbForm((p) => ({ ...p, invoiceNo: e.target.value }))
                }
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Remarks</label>
              <Input
                placeholder="Remarks"
                value={nbForm.remarks}
                onChange={(e) =>
                  setNbForm((p) => ({ ...p, remarks: e.target.value }))
                }
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleNbSubmit}
              disabled={addNonBankingMutation.isPending}
              size="sm"
              className="rounded-full bg-primary hover:bg-[#4F46E5] text-primary-foreground text-xs btn-lift"
            >
              <PlusCircle size={13} className="mr-1" />
              {addNonBankingMutation.isPending ? "Adding..." : "Add to Staging"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNbForm(EMPTY_NB)}
              className="rounded-full text-xs"
            >
              <RotateCcw size={12} className="mr-1" /> Clear
            </Button>
          </div>
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

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-xs text-muted-foreground">{totalCount} rows</span>
        {isFetching && !isLoading && (
          <span className="text-xs text-primary flex items-center gap-1">
            <Loader2 className="animate-spin" size={12} /> refreshing...
          </span>
        )}
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

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-auto max-h-[75vh]">
          <table className="w-full text-sm min-w-[1400px]">
            <StagingThead showPaymentBy showExcludeMargin />
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-muted-foreground text-xs">
                    <Loader2 className="inline animate-spin mr-2" size={15} />
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-muted-foreground text-xs">
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
                    isDeleting={deletingRowId === r.STAGING_ID}
                    isExcludingMargin={excludingMarginRowId === r.STAGING_ID}
                    onProjectChange={handleProjectChange}
                    onContractorChange={handleContractorChange}
                    onInvoiceNoBlur={handleInvoiceNoBlur}
                    onRemarksBlur={handleRemarksBlur}
                    onCategoryChange={handleCategoryChange}
                    onPaymentByChange={handlePaymentByChange}
                    showPaymentBy
                    onInvoiceFileSelect={handleInvoiceFileSelect}
                    onDeleteInvoiceClick={handleDeleteInvoiceClick}
                    onApproveClick={handleApproveClick}
                    onDeleteRowClick={handleDeleteRowClick}
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
        <DataTablePaginationTwo table={table} tableKey="statementNonBanking" />
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
      <DeleteRowModal
        target={deleteRowTarget}
        onCancel={() => setDeleteRowTarget(null)}
        onConfirm={confirmDeleteRow}
        isPending={deleteStagingRowMutation.isPending}
      />
      <DetailsSheet row={detailsTarget} onClose={() => setDetailsTarget(null)} />
    </>
  );
}