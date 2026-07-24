

// src\features\setting\pages\statement-upload-four\constants.js

import { format, isValid } from "date-fns";
export const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const CATEGORY_STYLES = {
  address: "bg-blue-100 text-blue-700",
  place:   "bg-amber-100 text-amber-700",
  product: "bg-emerald-100 text-emerald-700",
  other:   "bg-slate-100 text-slate-600",
};

export const STATUS_STYLES = {
  PENDING:  "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
};

export const EMPTY_NB = {
  txnDate: "", amount: "", description: "", entryType: "DEBIT", category: "other",
  pId: "", projectName: "", contractorId: "", contractorName: "",
  invoiceNo: "", remarks: "", paymentBy: "BUILDER",
};

export const EMPTY_FILTERS = {
  dateFrom: "", dateTo: "", status: "", pId: "", contractorId: "",
  invoiceNo: "", amountMin: "", amountMax: "", description: "", category: "",
};

export const PAGE_SIZE = 50;

// export const fmtDate = (val) => {
//   if (!val) return "—";
//   const d = new Date(val);
//   if (isNaN(d.getTime())) return "—";
//   const dd = String(d.getDate()).padStart(2, "0");
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const yyyy = d.getFullYear();
//   return `${dd}/${mm}/${yyyy}`;
// };

export const fmtDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (!isValid(d)) return "—";
  return format(d, "dd-MM-yyyy EEE");
};
export const fmtAmount = (amt) => {
  const n = Number(amt) || 0;
  const f = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `-$${f}` : `$${f}`;
};

function buildCsv(dataRows) {
  const headers = ["Date", "Amount", "Debit", "Credit", "Description", "Project", "Contractor", "Invoice No", "Source", "Payment By", "Remarks", "Status"];
  const csvRows = dataRows.map((r) => [
    fmtDate(r.TXN_DATE),
    r.AMOUNT,
    r.DEBIT ?? "",
    r.CREDIT ?? "",
    `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
    `"${(r.PROJECT_NAME || "").replace(/"/g, '""')}"`,
    `"${(r.CONTRACTOR_NAME || "").replace(/"/g, '""')}"`,
    `"${(r.INVOICE_NO || "").replace(/"/g, '""')}"`,
    r.SOURCE_TYPE || "",
    r.SOURCE_TYPE === "NON_BANKING" ? (r.PAYMENT_BY || "") : "",
    `"${(r.REMARKS || "").replace(/"/g, '""')}"`,
    r.STATUS || "",
  ]);
  return [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
}

export function downloadCsv(dataRows, filename) {
  if (!dataRows || dataRows.length === 0) return false;
  const blob = new Blob([buildCsv(dataRows)], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
  return true;
}