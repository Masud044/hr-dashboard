// src/features/setting/pages/statement-upload-three/NonBankingTab.jsx
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
import DateInput from "./DateInput";
import FilterBar from "./FilterBar";
import Pagination from "./Pagination";
import StagingThead from "./StagingThead";
import StagingRow from "./StagingRow";
import DeleteInvoiceModal from "./modals/DeleteInvoiceModal";
import ApproveModal from "./modals/ApproveModal";
import {
  url,
  EMPTY_FILTERS,
  EMPTY_NB,
  PAGE_SIZE,
  downloadCsv,
} from "./constants";
import { toSortedOpts } from "@/lib/utils";

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
  } = mutations;

  const [nbForm, setNbForm] = useState(EMPTY_NB);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  // const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [approvingRowId, setApprovingRowId] = useState(null);
  const [exporting, setExporting] = useState(false);

  // const queryParams = useMemo(() => ({
  //   sourceType: "NON_BANKING", ...appliedFilters, status: sortBy === "recent" ? "PENDING" : appliedFilters.status, page,sortBy, pageSize: PAGE_SIZE,
  // }), [appliedFilters,sortBy, page]);
  //  const sortedContractorOptions = useMemo(
  //   () => [...contractorOptions].sort((a, b) => a.CONTRATOR_NAME.localeCompare(b.CONTRATOR_NAME)),
  //   [contractorOptions]
  // );

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
  const confirmDeleteInvoice = (stagingId) => {
    deleteInvoiceMutation.mutate(stagingId, {
      onSuccess: () => setDeleteTarget(null),
    });
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
      <div className="bg-white border rounded-2xl shadow-sm px-6 py-5 mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <PlusCircle size={15} className="text-blue-600" /> Add Entry
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date *</label>
            <DateInput
              value={nbForm.txnDate}
              onChange={(v) => setNbForm((p) => ({ ...p, txnDate: v }))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Type *</label>
            <Select
              value={nbForm.entryType}
              onValueChange={(v) => setNbForm((p) => ({ ...p, entryType: v }))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEBIT">Receive</SelectItem>
                <SelectItem value="CREDIT">Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Payment By
            </label>
            <Select
              value={nbForm.paymentBy}
              onValueChange={(v) => setNbForm((p) => ({ ...p, paymentBy: v }))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUILDER">Builder</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Amount *</label>
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
          {/* <div>
            <label className="text-xs text-gray-500 mb-1 block">Category</label>
            <Select value={nbForm.category} onValueChange={(v) => setNbForm((p) => ({ ...p, category: v }))}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="address">Address</SelectItem>
                <SelectItem value="place">Place</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">
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
            <label className="text-xs text-gray-500 mb-1 block">Project</label>
            <Select
              value={nbForm.pId || "NONE"}
              onValueChange={(v) =>
                setNbForm((p) => ({ ...p, pId: v === "NONE" ? "" : v }))
              }
            >
              <SelectTrigger className="h-8 text-xs">
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
            <label className="text-xs text-gray-500 mb-1 block">
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
              <SelectTrigger className="h-8 text-xs">
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
            <label className="text-xs text-gray-500 mb-1 block">
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
            <label className="text-xs text-gray-500 mb-1 block">Remarks</label>
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
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-sm"
          >
            <PlusCircle size={14} className="mr-1" />
            {addNonBankingMutation.isPending ? "Adding..." : "Add to Staging"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setNbForm(EMPTY_NB)}
            className="rounded-full text-sm"
          >
            <RotateCcw size={13} className="mr-1" /> Clear
          </Button>
        </div>
      </div>

      <FilterBar
        initialFilters={appliedFilters}
        // onApply={(f) => { setAppliedFilters(f); setPage(1); }}
        // onClear={() => { setAppliedFilters(EMPTY_FILTERS); setPage(1); }}
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
        // showCategory
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-xs text-gray-500">{totalCount} rows</span>
        {isFetching && !isLoading && (
          <span className="text-xs text-blue-500 flex items-center gap-1">
            <Loader2 className="animate-spin" size={12} /> refreshing...
          </span>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            onClick={handleExportCsv}
            disabled={exporting}
            variant="outline"
            className="rounded-full text-sm"
          >
            {exporting ? (
              <Loader2 size={14} className="mr-1 animate-spin" />
            ) : (
              <Download size={14} className="mr-1" />
            )}{" "}
            CSV
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[75vh]">
          <table className="w-full text-sm min-w-[1400px]">
            <StagingThead showPaymentBy />
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-400">
                    <Loader2 className="inline animate-spin mr-2" size={16} />
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-400">
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
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* <Pagination page={page} totalRows={totalCount} onPageChange={setPage} /> */}
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
    </>
  );
}
