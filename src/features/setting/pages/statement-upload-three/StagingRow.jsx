// src/features/setting/pages/statement-upload-three/StagingRow.jsx
import React from "react";
import { CheckCircle2, ExternalLink, Loader2, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Combobox from "./Combobox";
import { CATEGORY_STYLES, STATUS_STYLES, fmtDate, fmtAmount, url } from "./constants";

const StagingRow = React.memo(function StagingRow({
  row, projectOpts, contractorOpts, isApproving,
  onProjectChange, onContractorChange, onInvoiceNoBlur, onRemarksBlur,
  onCategoryChange, onInvoiceFileSelect, onDeleteInvoiceClick, onApproveClick,
}) {
  const r = row;
  // const cat = (r.CATEGORY || "other").toLowerCase();
  const approved = r.STATUS === "APPROVED";

  return (
    <tr className={`border-b last:border-0 ${approved ? "bg-green-50 opacity-70" : "hover:bg-gray-50"}`}>
      <td className="px-4 py-2.5">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[r.STATUS] || STATUS_STYLES.PENDING}`}>
          {r.STATUS || "PENDING"}
        </span>
      </td>
      <td className="px-4 py-2.5 whitespace-nowrap font-medium text-gray-900">{fmtDate(r.TXN_DATE)}</td>
      <td className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${Number(r.AMOUNT) < 0 ? "text-red-600" : "text-emerald-600"}`}>
        {fmtAmount(r.AMOUNT)}
      </td>
      <td className="px-4 py-2.5 max-w-[240px] text-gray-700 text-xs break-words">{r.DESCRIPTION}</td>
      {/* <td className="px-4 py-2.5 min-w-[110px]">
        <Select value={cat} onValueChange={(v) => !approved && onCategoryChange(r.STAGING_ID, v)} disabled={approved}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue><span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${CATEGORY_STYLES[cat]}`}>{cat}</span></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="address">Address</SelectItem>
            <SelectItem value="place">Place</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </td> */}
      <td className="px-4 py-2.5 min-w-[170px]">
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
      <td className="px-4 py-2.5 min-w-[170px]">
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
      <td className="px-4 py-2.5 min-w-[100px]">
        <Input defaultValue={r.INVOICE_NO || ""} placeholder="Inv no." className="h-7 text-xs"
          disabled={approved} onBlur={(e) => !approved && onInvoiceNoBlur(r.STAGING_ID, e.target.value)} />
      </td>
      <td className="px-4 py-2.5 min-w-[120px]">
        <Input defaultValue={r.REMARKS || ""} placeholder="Remarks" className="h-7 text-xs"
          disabled={approved} onBlur={(e) => !approved && onRemarksBlur(r.STAGING_ID, e.target.value)} />
      </td>
      <td className="px-4 py-2.5 min-w-[140px]">
        {r.INVOICE_FILE_NAME ? (
          <div className="flex items-center gap-1.5">
            <a href={`${url}/api/statement/staging/${r.STAGING_ID}/invoice`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium truncate max-w-[90px]" title={r.INVOICE_FILE_NAME}>
              <ExternalLink size={12} className="shrink-0" />{r.INVOICE_FILE_NAME}
            </a>
            {!approved && (
              <button onClick={() => onDeleteInvoiceClick(r.STAGING_ID, r.INVOICE_FILE_NAME)}
                className="text-red-500 hover:text-red-700 shrink-0" title="Delete invoice">
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ) : approved ? (
          <span className="text-gray-400 italic text-xs">—</span>
        ) : (
          <label className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 cursor-pointer">
            <Paperclip size={12} /> Attach
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden"
              onChange={(e) => onInvoiceFileSelect(r.STAGING_ID, e.target.files)} />
          </label>
        )}
      </td>
      <td className="px-4 py-2.5 min-w-[110px]">
        {!approved ? (
          <Button size="sm" onClick={() => onApproveClick(r)} disabled={isApproving}
            className="h-7 px-2.5 text-xs rounded-full bg-violet-600 hover:bg-violet-700">
            {isApproving ? (<><Loader2 size={12} className="mr-1 animate-spin" /> Approving...</>) : (<><CheckCircle2 size={12} className="mr-1" /> Approve</>)}
          </Button>
        ) : (
          <span className="text-[10px] text-green-600 font-semibold">Approved</span>
        )}
      </td>
    </tr>
  );
});

export default StagingRow;