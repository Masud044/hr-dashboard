// src/features/ticketing/lib/ticket-utils.js
import { format, isValid } from "date-fns";

export function isOverdue(ticket) {
  if (!ticket?.DUE_DATE) return false;
  if (ticket.IS_CLOSED === "Y") return false;
  const due = new Date(ticket.DUE_DATE);
  if (!isValid(due)) return false;
  return due.getTime() < Date.now();
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