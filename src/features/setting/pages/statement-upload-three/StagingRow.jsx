// src/features/setting/pages/statement-upload-three/StagingRow.jsx
import React from "react";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Paperclip,
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
import Combobox from "./Combobox";
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
  onProjectChange,
  onContractorChange,
  onInvoiceNoBlur,
  onRemarksBlur,
  onCategoryChange,
  onInvoiceFileSelect,
  onDeleteInvoiceClick,
  onApproveClick,
}) {
  const r = row;
  // const cat = (r.CATEGORY || "other").toLowerCase();
  const approved = r.STATUS === "APPROVED";

  const selectedStagingId = useStagingSelectionStore(
    (s) => s.selectedStagingId,
  );
  const setSelectedStagingId = useStagingSelectionStore(
    (s) => s.setSelectedStagingId,
  );
  const isSelected = selectedStagingId === r.STAGING_ID;

  const stripe = index % 2 === 1 ? "bg-gray-100" : "bg-white";
  const rowClass = approved
    ? `bg-green-50 opacity-70 ${isSelected ? "border-l-4 border-l-yellow-700" : ""}`
    : isSelected
      ? "bg-yellow-200/60 border-l-4 border-l-yellow-700"
      : `${stripe} hover:bg-gray-200 `;

  // The sticky Action cell paints its own background (it sits above the
  // rest of the row while scrolling), so it needs to mirror rowClass's
  // background explicitly rather than relying on the <tr> background /
  // :hover showing through.
  const stickyBg = approved
    ? "bg-green-50"
    : isSelected
      ? "bg-yellow-200/60"
      : `${stripe} group-hover:bg-gray-200 `;

  return (
    <tr
      onClick={(e) => {
        if (isInteractiveClick(e)) return;
        setSelectedStagingId(r.STAGING_ID);
      }}
      className={`group border-b  last:border-0 cursor-pointer ${rowClass}`}
    >
      <td className="px-2 py-2.5 w-[80px]">
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[r.STATUS] || STATUS_STYLES.PENDING}`}
        >
          {r.STATUS || "PENDING"}
        </span>
      </td>
      <td className="px-2 py-2.5 w-[100px] whitespace-nowrap font-medium text-gray-900">
        {fmtDate(r.TXN_DATE)}
      </td>
      <td
        className={`px-2 py-2.5 w-[90px] text-right font-semibold whitespace-nowrap ${Number(r.AMOUNT) < 0 ? "text-red-600" : "text-emerald-600"}`}
      >
        {fmtAmount(r.AMOUNT)}
      </td>
      <td className="px-3 py-2.5 max-w-[240px] text-gray-700 text-xs break-words">
  {r.DESCRIPTION}
  {r.PAYMENT_BY === "CUSTOMER" && (
    <span className="block mt-1 text-[9px] font-medium text-orange-600">
      Paid by Customer
    </span>
  )}
</td>
      <td className="px-3 py-2.5 w-[220px]">
        <Combobox
          options={projectOpts}
          value={r.P_ID ? String(r.P_ID) : ""}
          onChange={(pId) => {
            const proj = projectOpts.find((p) => p.value === pId);
            onProjectChange(r.STAGING_ID, pId || null, proj?.label || null);
          }}
          placeholder="Select project"
          searchPlaceholder="Search projects..."
          disabled={approved}
        />
      </td>
      <td className="px-3 py-2.5 w-[220px]">
        <Combobox
          options={contractorOpts}
          value={r.CONTRACTOR_ID ? String(r.CONTRACTOR_ID) : ""}
          onChange={(cId) => {
            const c = contractorOpts.find((x) => x.value === cId);
            onContractorChange(r.STAGING_ID, cId || null, c?.label || null);
          }}
          placeholder="Select contractor"
          searchPlaceholder="Search contractors..."
          disabled={approved}
        />
      </td>
      <td className="px-3 py-2.5 min-w-[120px]">
        <Input
          defaultValue={r.REMARKS || ""}
          placeholder="Remarks"
          className="h-7 text-xs"
          disabled={approved}
          onBlur={(e) =>
            !approved && onRemarksBlur(r.STAGING_ID, e.target.value)
          }
        />
      </td>
      <td className="px-3 py-2.5 min-w-[110px]">
        <InvoiceCell parentType="staging" parentId={r.STAGING_ID} row={r} />
      </td>
      <td
        className={`px-3 py-2.5 min-w-[60px] backdrop-blur-sm sticky right-0 z-20 ${stickyBg} shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)]`}
      >
        {!approved ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={() => onApproveClick(r)}
                disabled={isApproving}
                aria-label="Approve"
                className="h-7 w-7 rounded-full bg-violet-600 hover:bg-violet-700"
              >
                {isApproving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Approve</TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-[10px] text-green-600 font-semibold">
            Approved
          </span>
        )}
      </td>
    </tr>
  );
});

export default StagingRow;
