import React from "react";

export const STATUS_META = {
  PENDING:     { label: "Pending",     cls: "bg-secondary text-secondary-foreground" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-amber-100 text-amber-700" },
  COMPLETED:   { label: "Completed",   cls: "bg-[#10B981]/10 text-[#10B981]" },
};

export const confirmStatusChange = (current, next) => {
  if (next === current) return false;
  if (next === "COMPLETED" || current === "COMPLETED") {
    return window.confirm(
      `Change status to "${STATUS_META[next].label}"?`
    );
  }
  return true;
};

export function StatusSelect({ value, onChange, disabled }) {
  const v = STATUS_META[value] ? value : "PENDING";
  return (
    <select
      value={v}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`cursor-pointer rounded-full border-0 px-2 py-0.5 text-[10px] font-semibold outline-none disabled:opacity-60 ${STATUS_META[v].cls}`}
    >
      {Object.entries(STATUS_META).map(([k, m]) => (
        <option key={k} value={k}>{m.label}</option>
      ))}
    </select>
  );
}