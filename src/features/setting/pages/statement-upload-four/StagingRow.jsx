// src/features/setting/pages/statement-upload-four/StagingRow.jsx
import React from "react";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Paperclip,
  Trash2,
  RefreshCw,
  Info,
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
import Combobox from "./Combobox";
import EntityCombobox from "@/components/shared/entity-combobox";
import {
  CATEGORY_STYLES,
  STATUS_STYLES,
  fmtDate,
  fmtAmount,
  url,
} from "./constants";
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
// Using closest() means this covers every current AND future editable
// cell without needing per-cell stopPropagation calls.
const INTERACTIVE_SELECTOR =
  'input, textarea, button, a, select, [role="combobox"], [role="button"], [data-radix-popper-content-wrapper], [cmdk-root]';

function isInteractiveClick(e) {
  return !!e.target.closest(INTERACTIVE_SELECTOR);
}

const StagingRow = React.memo(function StagingRow({
  row,
  index,
  projectOpts,
  contractorOpts,
  isApproving,
  isRematching, // ← NEW
  isDeleting, // ← NEW
  onProjectChange,
  onContractorChange,

  onInvoiceNoBlur,
  onRemarksBlur,
  onCategoryChange,
  onInvoiceFileSelect,
  onPaymentByChange, // ← NEW
  showPaymentBy = false, // ← NEW
  onExcludeMarginChange, // ← ADD
  showExcludeMargin = false, // ← ADD
  isExcludingMargin,
  onDeleteInvoiceClick,
  onApproveClick,
  onDeleteRowClick, // ← NEW
  onRematchClick,
  onDetailsClick,
}) {
  const r = row;
  const approved = r.STATUS === "APPROVED";

  const canEdit = useHasPermission("PROJECT_STATEMENT_EDIT");
  const canDelete = useHasPermission("PROJECT_STATEMENT_DELETE");

  const selectedStagingId = useStagingSelectionStore(
    (s) => s.selectedStagingId,
  );
  const setSelectedStagingId = useStagingSelectionStore(
    (s) => s.setSelectedStagingId,
  );
  const isSelected = selectedStagingId === r.STAGING_ID;

  const stripe = index % 2 === 1 ? "bg-background" : "bg-card";
  const rowClass = approved
  ? `bg-[#10B981]/[0.06] opacity-80 ${isSelected ? "border-l-[3px] border-l-primary" : ""}`
  : isSelected
    ? "dark:bg-yellow-950 bg-yellow-200/60 border-l-4 border-l-yellow-500 dark:border-l-yellow-700 border-r-4 border-r-yellow-500 dark:border-r-yellow-700"
    : `${stripe} hover:bg-muted/70`;

  // The sticky Action cell paints its own background (it sits above the
  // rest of the row while scrolling), so it needs to mirror rowClass's
  // background explicitly rather than relying on the <tr> background /
  // :hover showing through.
  const stickyBg = approved
  ? "bg-green-100 dark:bg-green-950"
  : isSelected
    ? "dark:bg-yellow-950 bg-yellow-200/60"
    : `${stripe} group-hover:bg-muted/70`;

  return (
    <tr
      onClick={(e) => {
        if (isInteractiveClick(e)) return;
        setSelectedStagingId(r.STAGING_ID);
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
      <td className="px-3 py-2 max-w-[240px] text-muted-foreground text-xs break-words">
        {r.DESCRIPTION}
      </td>
      <td className="px-3 py-2 w-[220px]">
        <EntityCombobox
          items={projectOpts}
          value={r.P_ID ? String(r.P_ID) : ""}
          onValueChange={(pId) => {
            const proj = projectOpts.find((p) => p.value === pId);
            onProjectChange(r.STAGING_ID, pId || null, proj?.label || null);
          }}
          placeholder="Select project"
          disabled={approved || !canEdit}
        />
      </td>
      <td className="px-3 py-2 w-[220px]">
        <EntityCombobox
          items={contractorOpts}
          value={r.CONTRACTOR_ID ? String(r.CONTRACTOR_ID) : ""}
          onValueChange={(cId) => {
            const c = contractorOpts.find((x) => x.value === cId);
            onContractorChange(r.STAGING_ID, cId || null, c?.label || null);
          }}
          placeholder="Select contractor"
          disabled={approved || !canEdit}
        />
      </td>
      <td className="px-3 py-2 min-w-[120px]">
        <Input
          defaultValue={r.REMARKS || ""}
          placeholder="Remarks"
          className="h-7 text-xs"
          disabled={approved || !canEdit}
          onBlur={(e) =>
            !approved && canEdit && onRemarksBlur(r.STAGING_ID, e.target.value)
          }
        />
      </td>
      {showPaymentBy && (
        <td className="px-3 py-2 w-[110px]">
          <Select
            value={r.PAYMENT_BY || "BUILDER"}
            onValueChange={(v) => onPaymentByChange(r.STAGING_ID, v)}
            disabled={approved || !canEdit}
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
        </td>
      )}
      {showExcludeMargin && (
        <td className="px-3 py-2 w-[90px] text-center">
          {isExcludingMargin ? (
            <Loader2
              size={14}
              className="animate-spin text-destructive inline-block"
            />
          ) : (
            <input
              type="checkbox"
              checked={r.EXCLUDE_MARGIN === "Y"}
              disabled={approved || !canEdit}
              onChange={(e) =>
                onExcludeMarginChange(
                  r.STAGING_ID,
                  e.target.checked ? "Y" : "N",
                )
              }
              className="accent-destructive w-4 h-4 cursor-pointer disabled:cursor-not-allowed rounded"
            />
          )}
        </td>
      )}

      <td className="px-3 py-2 min-w-[110px]">
        <InvoiceCell parentType="staging" parentId={r.STAGING_ID} row={r} readOnly={!canEdit} />
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
                    disabled={approved}
                    aria-label="Details"
                    className="h-7 w-7 rounded-full bg-accent-foreground/90 dark:bg-accent-foreground/60 hover:bg-accent-foreground/70 dark:hover:bg-accent-foreground  disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Info size={13} className="text-white"/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Details</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={() => onApproveClick(r)}
                    disabled={isApproving || isRematching || isDeleting || !canEdit}
                    aria-label="Approve"
                    className="h-7 w-7 rounded-full bg-green-600 dark:bg-green-800/90 hover:bg-green-500 dark:hover:bg-green-600"
                  >
                    {isApproving ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={13} className="text-white"/>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Approve</TooltipContent>
              </Tooltip>

              {onDeleteRowClick && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={() => onDeleteRowClick(r)}
                      disabled={isApproving || isRematching || isDeleting || !canDelete}
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

              {onRematchClick && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={() => onRematchClick(r.STAGING_ID)}
                      disabled={isApproving || isRematching || isDeleting || !canEdit}
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
            </>
          ) : (
            <span className="text-[10px] text-[#10B981] font-semibold">
              Approved
            </span>
          )}
        </div>
      </td>
    </tr>
  );
});

export default StagingRow;