// src/features/ticketing/lib/ticket-utils.js
import { format, isValid } from "date-fns";

export function isOverdue(ticket) {
  if (!ticket?.DUE_DATE) return false;
  if (ticket.IS_CLOSED === "Y" || ticket.STATUS_NAME === "CLOSED") return false;
  const due = new Date(ticket.DUE_DATE);
  if (!isValid(due)) return false;
  return due.getTime() < Date.now();
}

const currencyFmt = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

export function fmtCurrency(val) {
  if (val === null || val === undefined || val === "") return "—";
  const num = Number(val);
  if (!Number.isFinite(num)) return "—";
  return currencyFmt.format(num);
}

export function fmtDateTime(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (!isValid(d)) return "—";
  return format(d, "MMM d, yyyy, h:mm a");
}

export function fmtDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (!isValid(d)) return "—";
  return format(d, "MMM d, yyyy");
}