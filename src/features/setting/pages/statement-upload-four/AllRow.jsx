// src/features/setting/pages/statement-upload-four/AllRow.jsx
import React from "react";
import {
  CheckCircle2,
  Info,
  Loader2,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import EntityCombobox from "@/components/shared/entity-combobox";
import { STATUS_STYLES, fmtDate, fmtAmount, rowKey } from "./constants";
import { useStagingSelectionStore } from "./useStagingSelectionStore";
import InvoiceCell from "./invoice/InvoiceCell";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHasPermission } from "@/hooks/use-permission";

// A click on any of these (or their descendants) is "interacting with a
// control", not "selecting the row" — skip the row toggle in that case.
const INTERACTIVE_SELECTOR =
  'input, textarea, button, a, select, [role="combobox"], [role="button"], [data-radix-popper-content-wrapper], [cmdk-root]';

function isInteractiveClick(e) {
  return !!e.target.closest(INTERACTIVE_SELECTOR);
}

const AllRow = React.memo(function AllRow({
  row,
  index,
  projectOpts,
  contractorOpts,
  isApproving,
  isRematching,
  isDeleting,
  isExcludingMargin,
  onProjectChange,
  onContractorChange,
  onRemarksBlur,
  onPaymentByChange,
  onExcludeMarginChange,
  onApproveClick,
  onRematchClick,
  onDeleteRowClick,
  onDisapproveClick,
  onDetailsClick,
}) {
  const r = row;
  const approved = r.STATUS === "APPROVED";

  const canEdit = useHasPermission("PROJECT_STATEMENT_EDIT");
  const canDelete = useHasPermission("PROJECT_STATEMENT_DELETE");

  const selectedId = useStagingSelectionStore((s) => s.selectedStagingId);
  const setSelectedId = useStagingSelectionStore(
    (s) => s.setSelectedStagingId,
  );
  const key = rowKey(r);
  const isSelected = selectedId === key;

  const stripe = index % 2 === 1 ? "bg-background" : "bg-card";
  const rowClass = approved
    ? `bg-[#10B981]/[0.06] opacity-80 ${isSelected ? "border-l-[3px] border-l-primary" : ""}`
    : isSelected
      ? "dark:bg-yellow-950 bg-yellow-200/60 border-l-4 border-l-yellow-500 dark:border-l-yellow-700 border-r-4 border-r-yellow-500 dark:border-r-yellow-700"
      : `${stripe} hover:bg-muted/70`;

  // The sticky Action cell paints its own background (it sits above the
  // rest of the row while scrolling), so it mirrors rowClass explicitly.
  const stickyBg = approved
    ? "bg-green-100 dark:bg-green-950"
    : isSelected
      ? "dark:bg-yellow-950 bg-yellow-200/60"
      : `${stripe} group-hover:bg-muted/70`;

  return (
    <tr
      onClick={(e) => {
        if (isInteractiveClick(e)) return;
        setSelectedId(key);
      }}
      className={`group border-b border-border last:border-0 cursor-pointer  ${rowClass}`}
    >
      <td className="px-2 py-2 w-[80px]">
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[r.STATUS] || STATUS_STYLES.PENDING}`}
        >
          {r.STATUS || "PENDING"}
        </span>
      </td>
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
          {r.SOURCE_TYPE === "NON_BANKING" ? "Non-Banking" : "Banking"}
        </span>
      </td>
      <td className="px-3 py-2 w-[220px]">
        <EntityCombobox
          items={projectOpts}
          disabled={!canEdit}
          value={r.P_ID ? String(r.P_ID) : ""}
          onValueChange={(pId) => {
            const proj = projectOpts.find((p) => p.value === pId);
            onProjectChange(r, pId || null, proj?.label || null);
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
            const c = contractorOpts.find((x) => x.value === cId);
            onContractorChange(r, cId || null, c?.label || null);
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
          onBlur={(e) => canEdit && onRemarksBlur(r, e.target.value)}
        />
      </td>
      <td className="px-3 py-2 min-w-[110px]">
        {r.SOURCE_TYPE === "NON_BANKING" ? (
          <Select
            value={r.PAYMENT_BY || "BUILDER"}
            disabled={!canEdit}
            onValueChange={(v) => onPaymentByChange(r, v)}
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
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>
      <td className="px-3 py-2 min-w-[90px] text-center">
        {isExcludingMargin ? (
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
              onExcludeMarginChange(r, e.target.checked ? "Y" : "N")
            }
            className="accent-destructive w-4 h-4 cursor-pointer disabled:cursor-not-allowed rounded"
          />
        )}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-muted-foreground text-xs">
        {approved ? fmtDate(r.APPROVED_DATE) : "—"}
      </td>
      <td className="px-3 py-2 min-w-[160px]">
        <InvoiceCell
          parentType={approved ? "main" : "staging"}
          parentId={approved ? r.TXN_ID : r.STAGING_ID}
          row={r}
          readOnly={!canEdit}
        />
      </td>
      <td
        className={`px-3 py-2 min-w-[90px] backdrop-blur-sm sticky right-0 z-20 ${stickyBg} shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]`}
      >
        <div className="flex items-center gap-1.5">
          {!approved ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={() => onDetailsClick(r)}
                    aria-label="Details"
                    className="h-7 w-7 rounded-full bg-accent-foreground/90 dark:bg-accent-foreground/60 hover:bg-accent-foreground/70 dark:hover:bg-accent-foreground  disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Info size={13} className="text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Details</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={() => onApproveClick(r)}
                    disabled={
                      isApproving || isRematching || isDeleting || !canEdit
                    }
                    aria-label="Approve"
                    className="h-7 w-7 rounded-full bg-green-600 dark:bg-green-800/90 hover:bg-green-500 dark:hover:bg-green-600"
                  >
                    {isApproving ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={13} className="text-white" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Approve</TooltipContent>
              </Tooltip>

              {r.SOURCE_TYPE === "BANKING" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={() => onRematchClick(r)}
                      disabled={
                        isApproving || isRematching || isDeleting || !canEdit
                      }
                      aria-label="Rematch"
                      className="h-7 w-7 rounded-full bg-teal-600 hover:bg-teal-600/80 dark:bg-teal-800 dark:hover:bg-teal-700 text-background"
                    >
                      {isRematching ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <RefreshCw size={13} className="text-white" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rematch</TooltipContent>
                </Tooltip>
              )}

              {r.SOURCE_TYPE === "NON_BANKING" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={() => onDeleteRowClick(r)}
                      disabled={!canDelete}
                      aria-label="Delete"
                      className="h-7 w-7 rounded-full bg-destructive dark:bg-destructive/70 hover:bg-destructive/80 dark:hover:bg-destructive/90 text-destructive-foreground"
                    >
                      {isDeleting ? (
                        <Loader2 size={13} className="animate-spin text-white" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              )}
            </>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={() => onDisapproveClick(r)}
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
                    onClick={() => onDetailsClick(r)}
                    aria-label="Details"
                    className="h-7 w-7 rounded-full bg-accent-foreground/90 dark:bg-accent-foreground/60 hover:bg-accent-foreground/70 dark:hover:bg-accent-foreground"
                  >
                    <Info size={13} className="text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Details</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </td>
    </tr>
  );
});

export default AllRow;
