// src\features\setting\pages\statement-upload-three\DetailsSheet.jsx
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format, isValid } from "date-fns";
import { Info, Tag, ShieldCheck } from "lucide-react";
import { fmtAmount } from "./constants";

// Local formatter for this sheet only — e.g. "Jul 8, 2026, 10:56 AM"
function fmtDateTime(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (!isValid(d)) return "—";
  return format(d, "MMM d, yyyy, h:mm a");
}

function Row({ label, value, valueNode, highlight }) {
  return (
    <div className="flex justify-between items-center py-2.5 text-sm border-b border-border last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      {valueNode ? (
        valueNode
      ) : (
        <span
          className={`font-medium text-right ml-4 ${
            highlight ? highlight : "text-foreground"
          }`}
        >
          {value ?? "—"}
        </span>
      )}
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border">
        <Icon size={13} className="text-primary" />
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </h4>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

// Chip styled per design.md — pill shape, tinted (not the default gray badge)
function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

export default function DetailsSheet({ row, onClose }) {
  if (!row) return null;
  // console.log("row", row)
  const isMain = row.TXN_ID !== undefined;
  const isNegative = Number(row.AMOUNT) < 0;

  return (
    <Sheet open={!!row} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card border-border p-0">
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="font-display font-bold tracking-tight text-foreground">
            Transaction Details
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-4">
          <SectionCard icon={Info} title="Transaction Info">
            <Row label="Date" value={fmtDateTime(row.TXN_DATE)} />
            <Row
              label="Amount"
              valueNode={
                <span
                  className={`font-semibold text-right ml-4 text-base ${
                    isNegative ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {fmtAmount(row.AMOUNT)}
                </span>
              }
            />
            <Row label="Description" value={row.DESCRIPTION} />
            <Row label="Project" value={row.PROJECT_NAME} />
            <Row label="Contractor" value={row.CONTRACTOR_NAME} />
            <Row label="Invoice No" value={row.INVOICE_NO} />
            <Row label="Remarks" value={row.REMARKS} />
          </SectionCard>

          <SectionCard icon={Tag} title="Classification">
            <Row
              label="Source"
              valueNode={
                row.SOURCE_TYPE ? (
                  <Chip>{row.SOURCE_TYPE}</Chip>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )
              }
            />
          </SectionCard>

          <SectionCard icon={ShieldCheck} title="Audit & Approval">
            {!isMain && (
              <>
                <Row label="Created By" value={row.CREATED_BY_NAME} />
                <Row
                  label="Created Date"
                  value={fmtDateTime(row.CREATION_DATE)}
                />
              </>
            )}
            {isMain && (
              <>
                <Row label="Approved By" value={row.APPROVED_BY_NAME} />
                <Row
                  label="Approved Date"
                  value={fmtDateTime(row.APPROVED_DATE)}
                />
              </>
            )}
          </SectionCard>
        </div>
      </SheetContent>
    </Sheet>
  );
}
