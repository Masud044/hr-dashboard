// src/features/setting/pages/statement-upload-three/ApprovedTab.jsx
import React, { useState, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  Paperclip,
  RotateCcw,
  Trash2,
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
import Combobox from "./Combobox";
import FilterBar from "./FilterBar";
import Pagination from "./Pagination";
import DisapproveModal from "./modals/DisapproveModal";
import DeleteInvoiceModal from "./modals/DeleteInvoiceModal";
import {
  url,
  EMPTY_FILTERS,
  PAGE_SIZE,
  CATEGORY_STYLES,
  fmtDate,
  fmtAmount,
  downloadCsv,
} from "./constants";
import { useStagingSelectionStore } from "./useStagingSelectionStore";
import InvoiceCell from "./invoice/InvoiceCell";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── ADD THIS BLOCK HERE, before the component definition ──
const INTERACTIVE_SELECTOR =
  'input, textarea, button, a, select, [role="combobox"], [role="button"], [data-radix-popper-content-wrapper], [cmdk-root]';

function isInteractiveClick(e) {
  return !!e.target.closest(INTERACTIVE_SELECTOR);
}
export default function ApprovedTab({
  projectOptions,
  contractorOptions,
  mutations,
}) {
  const {
    disapproveMutation,
    updateMainRowMutation,
    uploadMainInvoiceMutation,
    deleteMainInvoiceMutation,
  } = mutations;
  const selectedStagingId = useStagingSelectionStore(
    (s) => s.selectedStagingId,
  );
  const setSelectedStagingId = useStagingSelectionStore(
    (s) => s.setSelectedStagingId,
  );

  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  // const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [disapproveTarget, setDisapproveTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exporting, setExporting] = useState(false);

  const projectOpts = useMemo(
    () =>
      projectOptions.map((p) => ({ value: String(p.P_ID), label: p.P_NAME })),
    [projectOptions],
  );
  const contractorOpts = useMemo(
    () =>
      contractorOptions.map((c) => ({
        value: String(c.CONTRATOR_ID),
        label: c.CONTRATOR_NAME,
      })),
    [contractorOptions],
  );

  const handleProjectChange = (txnId, pId, projectName) =>
    updateMainRowMutation.mutate({
      txnId,
      pId: pId || null,
      projectName: projectName || null,
    });
  const handleContractorChange = (txnId, contractorId, contractorName) =>
    updateMainRowMutation.mutate({
      txnId,
      contractorId: contractorId || null,
      contractorName: contractorName || null,
    });
  const handleInvoiceNoBlur = (txnId, value) =>
    updateMainRowMutation.mutate({ txnId, invoiceNo: value });
  const handleRemarksBlur = (txnId, value) =>
    updateMainRowMutation.mutate({ txnId, remarks: value });
  const handleCategoryChange = (txnId, value) =>
    updateMainRowMutation.mutate({ txnId, category: value });
  const handleInvoiceFileSelect = (txnId, fileList) => {
    const f = fileList?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      toast.error(`"${f.name}" exceeds 20 MB limit.`);
      return;
    }
    uploadMainInvoiceMutation.mutate({ txnId, file: f });
  };
  const handleDeleteInvoiceClick = (txnId, fileName) =>
    setDeleteTarget({ stagingId: txnId, fileName });
  const confirmDeleteInvoice = (txnId) => {
    deleteMainInvoiceMutation.mutate(txnId, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  // const queryParams = useMemo(
  //   () => ({
  //     ...appliedFilters,
  //     page,
  //     pageSize: PAGE_SIZE,
  //   }),
  //   [appliedFilters, page],
  // );

  const queryParams = useMemo(
    () => ({
      ...appliedFilters,
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    }),
    [appliedFilters, pagination],
  );

  const {
    data: result,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["statementMain", queryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== "" && v != null && k !== "status") params.append(k, v);
      });
      const res = await axios.get(
        `${url}/api/statement/main?${params.toString()}`,
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

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([k, v]) => {
        if (v && k !== "status") params.append(k, v);
      });
      const res = await axios.get(
        `${url}/api/statement/main?${params.toString()}`,
      );
      if (!downloadCsv(res.data?.data || [], "statement_approved.csv"))
        toast.error("No rows to download.");
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
        // onApply={(f) => {
        //   setAppliedFilters(f);
        //   setPage(1);
        // }}
        // onClear={() => {
        //   setAppliedFilters(EMPTY_FILTERS);
        //   setPage(1);
        // }}
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

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-xs text-gray-500">{totalCount} rows</span>
        {isFetching && !isLoading && (
          <span className="text-xs text-blue-500 flex items-center gap-1">
            <Loader2 className="animate-spin" size={12} /> refreshing...
          </span>
        )}
        <Button
          onClick={handleExportCsv}
          disabled={exporting}
          variant="outline"
          className="rounded-full text-sm ml-auto"
        >
          {exporting ? (
            <Loader2 size={14} className="mr-1 animate-spin" />
          ) : (
            <Download size={14} className="mr-1" />
          )}{" "}
          Download CSV
        </Button>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {/* <div className="overflow-x-auto"> */}
        <div className="overflow-auto max-h-[75vh]">
          <table className="w-full text-sm min-w-[1500px]">
            <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-2 py-3 w-[100px] text-left sticky top-0 z-10 bg-gray-50">
                  Date
                </th>
                <th className="px-2 py-3 w-[90px] text-right sticky top-0 z-10 bg-gray-50">
                  Amount
                </th>
                <th className="px-3 py-3 text-right sticky top-0 z-10 bg-gray-50">
                  Receive
                </th>
                <th className="px-3 py-3 text-right sticky top-0 z-10 bg-gray-50">
                  Payment
                </th>
                <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">
                  Description
                </th>
                <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">
                  Source
                </th>
                <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">
                  Project
                </th>
                <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">
                  Contractor
                </th>
                <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">
                  Remarks
                </th>
                <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">
                  Payment By
                </th>
                <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">
                  Approved Date
                </th>
                <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">
                  Invoice
                </th>
                <th className="px-3 py-3 text-left sticky top-0 right-0 z-30 bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={13} className="text-center py-10 text-gray-400">
                    <Loader2 className="inline animate-spin mr-2" size={16} />
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-10 text-gray-400">
                    No approved transactions yet.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  // const cat = (r.CATEGORY || "other").toLowerCase();
                  const isSelected = selectedStagingId === r.TXN_ID;
                  const stripe = idx % 2 === 1 ? "bg-gray-100" : "bg-white";
                  return (
                    <tr
                      key={r.TXN_ID}
                      onClick={(e) => {
                        if (isInteractiveClick(e)) return;
                        setSelectedStagingId(r.TXN_ID);
                      }}
                      className={`group border-b last:border-0 cursor-pointer ${isSelected ? "bg-yellow-200/60 border-l-4 border-l-yellow-700" : `${stripe} hover:bg-gray-200`}`}
                    >
                      <td className="px-2 py-2.5 w-[100px] whitespace-nowrap font-medium text-gray-900">
                        {fmtDate(r.TXN_DATE)}
                      </td>
                      <td
                        className={`px-2 py-2.5 w-[90px] text-right font-semibold whitespace-nowrap ${Number(r.AMOUNT) < 0 ? "text-red-600" : "text-emerald-600"}`}
                      >
                        {fmtAmount(r.AMOUNT)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-red-600 whitespace-nowrap">
                        {r.DEBIT != null
                          ? `$${Number(r.DEBIT).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-emerald-600 whitespace-nowrap">
                        {r.CREDIT != null
                          ? `$${Number(r.CREDIT).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2.5 max-w-[220px] text-gray-700 text-xs break-words">
                        {r.DESCRIPTION}
                      </td>
                      {/* <td className="px-4 py-2.5 min-w-[110px]">
                        <Select
                          value={cat}
                          onValueChange={(v) =>
                            handleCategoryChange(r.TXN_ID, v)
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue>
                              <span
                                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${CATEGORY_STYLES[cat]}`}
                              >
                                {cat}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="address">Address</SelectItem>
                            <SelectItem value="place">Place</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </td> */}
                      <td className="px-3 py-2.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.SOURCE_TYPE === "NON_BANKING" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                        >
                          {r.SOURCE_TYPE === "NON_BANKING"
                            ? "Non-Banking"
                            : "Banking"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 w-[220px]">
                        <Combobox
                          options={projectOpts}
                          value={r.P_ID ? String(r.P_ID) : ""}
                          onChange={(pId) => {
                            const proj = projectOpts.find(
                              (p) => p.value === pId,
                            );
                            handleProjectChange(
                              r.TXN_ID,
                              pId || null,
                              proj?.label || null,
                            );
                          }}
                          placeholder="Select project"
                          searchPlaceholder="Search projects..."
                        />
                      </td>
                      <td className="px-3 py-2.5 w-[220px]">
                        <Combobox
                          options={contractorOpts}
                          value={r.CONTRACTOR_ID ? String(r.CONTRACTOR_ID) : ""}
                          onChange={(cId) => {
                            const c = contractorOpts.find(
                              (x) => x.value === cId,
                            );
                            handleContractorChange(
                              r.TXN_ID,
                              cId || null,
                              c?.label || null,
                            );
                          }}
                          placeholder="Select contractor"
                          searchPlaceholder="Search contractors..."
                        />
                      </td>
                      {/* <td className="px-4 py-2.5 min-w-[100px]">
                        <Input
                          defaultValue={r.INVOICE_NO || ""}
                          placeholder="Inv no."
                          className="h-7 text-xs"
                          onBlur={(e) =>
                            handleInvoiceNoBlur(r.TXN_ID, e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-2.5 min-w-[120px]">
                        <Input
                          defaultValue={r.REMARKS || ""}
                          placeholder="Remarks"
                          className="h-7 text-xs"
                          onBlur={(e) =>
                            handleRemarksBlur(r.TXN_ID, e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-500 text-xs">
                        {fmtDate(r.APPROVED_DATE)}
                      </td>
                      <td className="px-4 py-2.5 min-w-[140px]">
                        {r.INVOICE_FILE_NAME ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`${url}/api/statement/main/${r.TXN_ID}/invoice`}
                              target="_blank"
                              rel="noreferrer"
                              download={r.INVOICE_FILE_NAME}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium truncate max-w-[90px]"
                              title={r.INVOICE_FILE_NAME}
                            >
                              <ExternalLink size={12} className="shrink-0" />
                              {r.INVOICE_FILE_NAME}
                            </a>
                            <button
                              onClick={() =>
                                handleDeleteInvoiceClick(
                                  r.TXN_ID,
                                  r.INVOICE_FILE_NAME,
                                )
                              }
                              className="text-red-500 hover:text-red-700 shrink-0"
                              title="Delete invoice"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 cursor-pointer">
                            <Paperclip size={12} /> Attach
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              className="hidden"
                              onChange={(e) =>
                                handleInvoiceFileSelect(
                                  r.TXN_ID,
                                  e.target.files,
                                )
                              }
                            />
                          </label>
                        )}
                      </td> */}

                      <td className="px-3 py-2.5 min-w-[120px]">
                        <Input
                          defaultValue={r.REMARKS || ""}
                          placeholder="Remarks"
                          className="h-7 text-xs"
                          onBlur={(e) =>
                            handleRemarksBlur(r.TXN_ID, e.target.value)
                          }
                        />
                      </td>
                      <td className="px-3 py-2.5 min-w-[110px]">
  {r.SOURCE_TYPE === "NON_BANKING" ? (
    <Select
      value={r.PAYMENT_BY || "BUILDER"}
      onValueChange={(v) =>
        updateMainRowMutation.mutate({ txnId: r.TXN_ID, paymentBy: v })
      }
    >
      <SelectTrigger className="h-7 text-xs">
        <SelectValue>
          {r.PAYMENT_BY === "CUSTOMER" ? "Customer" : "—"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="BUILDER">Builder</SelectItem>
        <SelectItem value="CUSTOMER">Customer</SelectItem>
      </SelectContent>
    </Select>
  ) : (
    <span className="text-gray-400 text-xs">—</span>
  )}
</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-gray-500 text-xs">
                        {fmtDate(r.APPROVED_DATE)}
                      </td>
                      <td className="px-3 py-2.5 min-w-[160px]">
                        <InvoiceCell
                          parentType="main"
                          parentId={r.TXN_ID}
                          row={r}
                        />
                      </td>

                      <td
                        className={`px-3 py-2.5 min-w-[60px] backdrop-blur-sm sticky right-0 z-20 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)] ${
                          isSelected
                            ? "bg-yellow-200/60"
                            : `${stripe} group-hover:bg-gray-200`
                        }`}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              onClick={() => setDisapproveTarget(r)}
                              disabled={!r.STAGING_ID}
                              aria-label="Disapprove"
                              className="h-7 w-7 rounded-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                            >
                              <RotateCcw size={14} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {!r.STAGING_ID
                              ? "Legacy records cannot be disapproved"
                              : "Disapprove"}
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* <Pagination page={page} totalRows={totalCount} onPageChange={setPage} /> */}
        <DataTablePaginationTwo table={table} tableKey="statementApproved" />
      </div>

      <DisapproveModal
        target={disapproveTarget}
        onCancel={() => setDisapproveTarget(null)}
        onConfirm={(txnId) => {
          disapproveMutation.mutate(txnId);
          setDisapproveTarget(null);
        }}
        isPending={disapproveMutation.isPending}
      />
      <DeleteInvoiceModal
        target={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteInvoice}
        isPending={deleteMainInvoiceMutation.isPending}
      />
    </>
  );
}
