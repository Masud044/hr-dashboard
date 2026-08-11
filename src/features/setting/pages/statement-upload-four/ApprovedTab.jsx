// src/features/setting/pages/statement-upload-four/ApprovedTab.jsx
import React, { useState, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
import { useHasPermission } from "@/hooks/use-permission";
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  Paperclip,
  RotateCcw,
  Trash2,
  Info,
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
import EntityCombobox from "@/components/shared/entity-combobox";
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
import DetailsSheet from "./DetailsSheet";

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

  const canEdit = useHasPermission("PROJECT_STATEMENT_EDIT");
  const canDownload = useHasPermission("PROJECT_STATEMENT_DOWNLOAD");
  const selectedStagingId = useStagingSelectionStore(
    (s) => s.selectedStagingId,
  );
  const setSelectedStagingId = useStagingSelectionStore(
    (s) => s.setSelectedStagingId,
  );

  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [disapproveTarget, setDisapproveTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [excludingMarginTxnId, setExcludingMarginTxnId] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);

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

  const handleExcludeMarginChange = (txnId, value) => {
    setExcludingMarginTxnId(txnId);
    updateMainRowMutation.mutate(
      { txnId, excludeMargin: value },
      {
        onSuccess: () =>
          toast.success(
            value === "Y" ? "Margin excluded." : "Margin included.",
          ),
        onSettled: () => setExcludingMarginTxnId(null),
      },
    );
  };

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
        {canDownload && (
          <Button
            onClick={handleExportCsv}
            disabled={exporting}
            variant="outline"
            size="sm"
            className="rounded-full text-xs ml-auto"
          >
            {exporting ? (
              <Loader2 size={13} className="mr-1 animate-spin" />
            ) : (
              <Download size={13} className="mr-1" />
            )}{" "}
            Download CSV
          </Button>
        )}
      </div>

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-auto max-h-[75vh]">
          <table className="w-full  text-sm min-w-[1500px]">
            <thead className="bg-secondary border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              <tr>
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
                    colSpan={14}
                    className="text-center  py-10 text-muted-foreground text-xs"
                  >
                    <Loader2 className="inline animate-spin mr-2" size={15} />
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="text-center  py-10 text-muted-foreground text-xs"
                  >
                    No approved transactions yet.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const isSelected = selectedStagingId === r.TXN_ID;
                  const stripe = idx % 2 === 1 ? "bg-background" : "bg-card";
                  const rowBg = isSelected
                    ? "dark:bg-yellow-950 bg-yellow-200/60 border-l-4 border-l-yellow-500 dark:border-l-yellow-700 border-r-4  border-r-yellow-500 dark:border-r-yellow-700"
                    : `${stripe} hover:bg-muted/70`;
                  return (
                    <tr
                      key={r.TXN_ID}
                      onClick={(e) => {
                        if (isInteractiveClick(e)) return;
                        setSelectedStagingId(r.TXN_ID);
                      }}
                      className={`group border-b border-border last:border-0 cursor-pointer  ${rowBg}`}
                    >
                      <td className="px-2 py-2 w-[100px] whitespace-nowrap font-medium text-foreground text-xs">
                        {fmtDate(r.TXN_DATE)}
                      </td>
                      <td
                        className={`px-2 py-2 w-[90px] text-right font-semibold whitespace-nowrap text-xs ${Number(r.AMOUNT) < 0 ? "text-destructive" : "text-[#10B981]"}`}
                      >
                        {fmtAmount(r.AMOUNT)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-destructive whitespace-nowrap text-xs">
                        {r.DEBIT != null
                          ? `$${Number(r.DEBIT).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-[#10B981] whitespace-nowrap text-xs">
                        {r.CREDIT != null
                          ? `$${Number(r.CREDIT).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2 max-w-[220px] text-muted-foreground text-xs break-words">
                        {r.DESCRIPTION}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.SOURCE_TYPE === "NON_BANKING" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}
                        >
                          {r.SOURCE_TYPE === "NON_BANKING"
                            ? "Non-Banking"
                            : "Banking"}
                        </span>
                      </td>
                      <td className="px-3 py-2 w-[220px]">
                        <EntityCombobox
                          items={projectOpts}
                          disabled={!canEdit}
                          value={r.P_ID ? String(r.P_ID) : ""}
                          onValueChange={(pId) => {
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
                        />
                      </td>
                      <td className="px-3 py-2 w-[220px]">
                        <EntityCombobox
                          items={contractorOpts}
                          disabled={!canEdit}
                          value={r.CONTRACTOR_ID ? String(r.CONTRACTOR_ID) : ""}
                          onValueChange={(cId) => {
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
                        />
                      </td>

                      <td className="px-3 py-2 min-w-[120px]">
                        <Input
                          defaultValue={r.REMARKS || ""}
                          placeholder="Remarks"
                          disabled={!canEdit}
                          className="h-7 text-xs"
                          onBlur={(e) =>
                            canEdit &&
                            handleRemarksBlur(r.TXN_ID, e.target.value)
                          }
                        />
                      </td>
                      <td className="px-3 py-2 min-w-[110px]">
                        {r.SOURCE_TYPE === "NON_BANKING" ? (
                          <Select
                            value={r.PAYMENT_BY || "BUILDER"}
                            disabled={!canEdit}
                            onValueChange={(v) =>
                              updateMainRowMutation.mutate({
                                txnId: r.TXN_ID,
                                paymentBy: v,
                              })
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
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 min-w-[90px] text-center">
                        {excludingMarginTxnId === r.TXN_ID ? (
                          <Loader2
                            size={14}
                            className="animate-spin text-destructive inline-block"
                          />
                        ) : (
                          <input
                            type="checkbox"
                            disabled={!canEdit}
                            checked={r.EXCLUDE_MARGIN === "Y"}
                            onChange={(e) =>
                              handleExcludeMarginChange(
                                r.TXN_ID,
                                e.target.checked ? "Y" : "N",
                              )
                            }
                            className="accent-destructive w-4 h-4 cursor-pointer disabled:cursor-not-allowed rounded"
                          />
                        )}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-muted-foreground text-xs">
                        {fmtDate(r.APPROVED_DATE)}
                      </td>
                      <td className="px-3 py-2 min-w-[160px]">
                        <InvoiceCell
                          parentType="main"
                          parentId={r.TXN_ID}
                          row={r}
                          readOnly={!canEdit}
                        />
                      </td>

                      {/* <td
                        className={`px-3 py-2 min-w-[60px] backdrop-blur-sm sticky right-0 z-20 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] ${
                          isSelected ? "bg-accent" : `${stripe} group-hover:bg-muted/70`
                        }`}
                      > */}
                      <td
                        className={`px-3 py-2 min-w-[60px] backdrop-blur-sm sticky right-0 z-20 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] ${
                          isSelected
                            ? "dark:bg-yellow-950 bg-yellow-200/60"
                            : `${stripe} group-hover:bg-muted/70`
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                
                                onClick={() => setDisapproveTarget(r)}
                                disabled={!r.STAGING_ID || !canEdit}
                                aria-label="Disapprove"
                                className="h-7 w-7 rounded-full bg-destructive dark:bg-destructive/70 hover:bg-destructive/80 dark:hover:bg-destructive/90  disabled:opacity-50"
                              >
                                <RotateCcw size={13} className="text-white" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {!r.STAGING_ID
                                ? "Legacy records cannot be disapproved"
                                : "Disapprove"}
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                onClick={() => setDetailsTarget(r)}
                                aria-label="Details"
                                className="h-7 w-7 rounded-full bg-accent-foreground/90 dark:bg-accent-foreground/60 hover:bg-accent-foreground/70 dark:hover:bg-accent-foreground"
                              >
                                <Info size={13} className="text-white" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Details</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
      <DetailsSheet
        row={detailsTarget}
        onClose={() => setDetailsTarget(null)}
      />
    </>
  );
}
