import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Paperclip } from "lucide-react";
import { url } from "../constants";
import { useInvoiceSheetStore } from "../useInvoiceSheetStore";

export default function InvoiceCell({ parentType, parentId, row, readOnly = false }) {
  const openSheet = useInvoiceSheetStore((s) => s.openSheet);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices", parentType, parentId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/statement/${parentType}/${parentId}/invoices`);
      return res.data?.data || [];
    },
    staleTime: 30 * 1000,
  });

  const visibleInvoices = invoices.slice(0, 2);
  const extraCount = invoices.length - visibleInvoices.length;

  const handleClick = () => openSheet(parentType, parentId, row, readOnly);

  if (isLoading) {
    return <span className="text-xs text-gray-400">Loading...</span>;
  }

  if (invoices.length === 0) {
    if (readOnly) {
      return <span className="text-xs text-gray-400">No invoice</span>;
    }
    return (
      <button
        onClick={handleClick}
        className="text-left w-full hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
      >
        <span className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600">
          <Paperclip size={12} /> Add invoice
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="text-left w-full hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
    >
      <div className="space-y-0.5">
        {visibleInvoices.map((inv) => (
          <div key={inv.INVOICE_ID} className="text-xs text-blue-700 font-medium truncate max-w-[160px]">
            {inv.files?.[0]?.FILE_NAME || inv.INVOICE_NO}
            {inv.files?.length > 1 && <span className="text-gray-400"> +{inv.files.length - 1}</span>}
          </div>
        ))}
        {extraCount > 0 && (
          <div className="text-[10px] text-gray-400">+{extraCount} more...</div>
        )}
      </div>
    </button>
  );
}