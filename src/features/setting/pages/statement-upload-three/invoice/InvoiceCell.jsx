import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Paperclip } from "lucide-react";
import { url } from "../constants";
import { useStagingSelectionStore } from "../useStagingSelectionStore";

export default function InvoiceCell({ parentType, parentId, row }) {
  const navigate = useNavigate();
  const forceSelect = useStagingSelectionStore((s) => s.forceSelect);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices", parentType, parentId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/statement/${parentType}/${parentId}/invoices`);
      return res.data?.data || [];
    },
    staleTime: 30 * 1000,
  });

  const totalFiles = invoices.reduce((sum, inv) => sum + (inv.files?.length || 0), 0);
  const visibleInvoices = invoices.slice(0, 2);
  const extraCount = invoices.length - visibleInvoices.length;

  const handleClick = () => {
    forceSelect(parentId);
    navigate(`/dashboard/statement/${parentType}/${parentId}/invoices`);
  };

  return (
    <button
      onClick={handleClick}
      className="text-left w-full hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
    >
      {isLoading ? (
        <span className="text-xs text-gray-400">Loading...</span>
      ) : invoices.length === 0 ? (
        <span className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600">
          <Paperclip size={12} /> Add invoice
        </span>
      ) : (
        <div className="space-y-0.5">
          {visibleInvoices.map((inv) => (
            <div key={inv.INVOICE_ID} className="text-xs text-blue-700 font-medium truncate max-w-[160px]">
              {inv.INVOICE_NO || "No number"}
              {inv.files?.[0] && <span className="text-gray-500"> · {inv.files[0].FILE_NAME}</span>}
              {inv.files?.length > 1 && <span className="text-gray-400"> +{inv.files.length - 1}</span>}
            </div>
          ))}
          {extraCount > 0 && (
            <div className="text-[10px] text-gray-400">+{extraCount} more...</div>
          )}
        </div>
      )}
    </button>
  );
}