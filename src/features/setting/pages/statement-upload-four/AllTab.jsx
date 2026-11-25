// src/features/setting/pages/statement-upload-four/AllTab.jsx
import React, { useState, useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
import {
  Upload,
  RotateCcw,
  Download,
  Loader2,
  PlusCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
import AllRow from "./AllRow";
import ApproveModal from "./modals/ApproveModal";
import DeleteRowModal from "./modals/DeleteRowModal";
import DisapproveModal from "./modals/DisapproveModal";
import DetailsSheet from "./DetailsSheet";
import {
  url,
  EMPTY_FILTERS,
  EMPTY_NB,
  PAGE_SIZE,
  downloadCsv,
  rowKey,
} from "./constants";
import { useHasPermission } from "@/hooks/use-permission";

export default function AllTab({
  projectOptions,
  contractorOptions,
  projectOpts,
  contractorOpts,
  mutations,
}) {
  const queryClient = useQueryClient();
  const {
    updateRowMutation,
    updateMainRowMutation,
    approveMutation,
    disapproveMutation,
    deleteStagingRowMutation,
    rematchRowMutation,
    addNonBankingMutation,
  } = mutations;

  const canCreate = useHasPermission("PROJECT_STATEMENT_CREATE");
  const canDownload = useHasPermission("PROJECT_STATEMENT_DOWNLOAD");

  const [file, setFile] = useState(null);
  const [batchId, setBatchId] = useState(null);
  const [nbForm, setNbForm] = useState(EMPTY_NB);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [approveTarget, setApproveTarget] = useState(null);
  const [deleteRowTarget, setDeleteRowTarget] = useState(null);
  const [disapproveTarget, setDisapproveTarget] = useState(null);
  const [approvingRowId, setApprovingRowId] = useState(null);
  const [rematchingRowId, setRematchingRowId] = useState(null);
  const [deletingRowId, setDeletingRowId] = useState(null);
  const [excludingMarginKey, setExcludingMarginKey] = useState(null);
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
      await queryClient.invalidateQueries({
        queryKey: ["statementAll"],
        refetchType: "active",
      });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to process CSV."),
  });

  const queryParams = useMemo(
    () => ({
      ...appliedFilters,
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    }),
    [appliedFilters, pagination],
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
    queryKey: ["statementAll", queryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== "" && v != null) params.append(k, v);
      });
      const res = await axios.get(
        `${url}/api/statement/all?${params.toString()}`,
      );
      return {
        rows: res.data?.data || [],
        totalCount: res.data?.totalCount ?? 0,
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
      { onSuccess: () => { setNbForm(EMPTY_NB); setShowAddEntry(false); } },
    );
  };

  // Routes a field update to the right endpoint based on the row's status.
  const patch = (row, fields, options) => {
    if (row.STATUS === "APPROVED") {
      return updateMainRowMutation.mutate(
        { txnId: row.TXN_ID, ...fields },
        options,
      );
    }
    return updateRowMutation.mutate(
      { stagingId: row.STAGING_ID, ...fields },
      options,
    );
  };

  const handleProjectChange = (row, pId, projectName) =>
    patch(row, { pId: pId || null, projectName: projectName || null });
  const handleContractorChange = (row, contractorId, contractorName) =>
    patch(row, {
      contractorId: contractorId || null,
      contractorName: contractorName || null,
    });
  const handleRemarksBlur = (row, value) => patch(row, { remarks: value });
  const handlePaymentByChange = (row, value) =>
    patch(row, { paymentBy: value });
  const handleExcludeMarginChange = (row, value) => {
    setExcludingMarginKey(rowKey(row));
    patch(
      row,
      { excludeMargin: value },
      {
        onSuccess: () =>
          toast.success(
            value === "Y" ? "Margin excluded." : "Margin included.",
          ),
        onSettled: () => setExcludingMarginKey(null),
      },
    );
  };

  const handleApproveClick = (row) => setApproveTarget(row);
  const confirmApprove = (stagingId) => {
    setApprovingRowId(stagingId);
    approveMutation.mutate(stagingId, {
      onSettled: () => setApprovingRowId(null),
    });
    setApproveTarget(null);
  };

  const handleRematchClick = (row) => {
    const stagingId = row.STAGING_ID;
    setRematchingRowId(stagingId);
    rematchRowMutation.mutate(stagingId, {
      onSettled: () => setRematchingRowId(null),
    });
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

  const handleDisapproveClick = (row) => setDisapproveTarget(row);
  const confirmDisapprove = (txnId) => {
    disapproveMutation.mutate(txnId);
    setDisapproveTarget(null);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([k, v]) => {
        if (v !== "" && v != null) params.append(k, v);
      });
      const res = await axios.get(
        `${url}/api/statement/all?${params.toString()}`,
      );
      if (!downloadCsv(res.data?.data || [], "statement_all.csv"))
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

      {canCreate && (
        <div className="bg-card border border-accent-foreground/30 rounded-md mb-4 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAddEntry((v) => !v)}
            aria-expanded={showAddEntry}
            className="w-full flex items-center gap-1.5 px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide transition-colors hover:bg-muted/50"
          >
            <PlusCircle size={14} className="text-primary" /> Add Entry
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary normal-case tracking-normal">
              Non-banking only
            </span>
            {showAddEntry ? (
              <ChevronUp size={14} className="ml-auto text-muted-foreground" />
            ) : (
              <ChevronDown size={14} className="ml-auto text-muted-foreground" />
            )}
          </button>

          {showAddEntry && (
            <div className="px-4 pb-4 pt-3 border-t border-border">
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
        showStatus
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
          <table className="w-full  text-sm min-w-[1500px]">
            <thead className="bg-secondary border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              <tr>
                <th className="px-2 py-2.5 w-[80px] text-left sticky top-0 z-10 bg-secondary">
                  Status
                </th>
                <th className="px-2 py-2.5 w-[100px] text-left sticky top-0 z-10 bg-secondary">
                  Date
                </th>
                <th className="px-2 py-2.5 w-[90px] text-right sticky top-0 z-10 bg-secondary">
                  Amount
                </th>
                <th className="px-3 py-2.5 text-right sticky top-0 z-10 bg-secondary">
                  Receive
                </th>
                <th className="px-3 py-2.5 text-right sticky top-0 z-10 bg-secondary">
                  Payment
                </th>
                <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">
                  Description
                </th>
                <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">
                  Source
                </th>
                <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">
                  Project
                </th>
                <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">
                  Contractor
                </th>
                <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">
                  Remarks
                </th>
                <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">
                  Payment By
                </th>
                <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">
                  Excl. Margin
                </th>
                <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">
                  Approved Date
                </th>
                <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">
                  Invoice
                </th>
                <th className="px-3 py-2.5 text-left sticky top-0 right-0 z-30 bg-secondary shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={15}
                    className="text-center  py-10 text-muted-foreground text-xs"
                  >
                    <Loader2 className="inline animate-spin mr-2" size={15} />
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={15}
                    className="text-center  py-10 text-muted-foreground text-xs"
                  >
                    No rows found.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <AllRow
                    key={rowKey(r)}
                    row={r}
                    index={idx}
                    projectOpts={projectOpts}
                    contractorOpts={contractorOpts}
                    isApproving={approvingRowId === r.STAGING_ID}
                    isRematching={rematchingRowId === r.STAGING_ID}
                    isDeleting={deletingRowId === r.STAGING_ID}
                    isExcludingMargin={excludingMarginKey === rowKey(r)}
                    onProjectChange={handleProjectChange}
                    onContractorChange={handleContractorChange}
                    onRemarksBlur={handleRemarksBlur}
                    onPaymentByChange={handlePaymentByChange}
                    onExcludeMarginChange={handleExcludeMarginChange}
                    onApproveClick={handleApproveClick}
                    onRematchClick={handleRematchClick}
                    onDeleteRowClick={handleDeleteRowClick}
                    onDisapproveClick={handleDisapproveClick}
                    onDetailsClick={setDetailsTarget}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        <DataTablePaginationTwo table={table} tableKey="statementAll" />
      </div>

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
      <DisapproveModal
        target={disapproveTarget}
        onCancel={() => setDisapproveTarget(null)}
        onConfirm={confirmDisapprove}
        isPending={disapproveMutation.isPending}
      />
      <DetailsSheet
        row={detailsTarget}
        onClose={() => setDetailsTarget(null)}
      />
    </>
  );
}
