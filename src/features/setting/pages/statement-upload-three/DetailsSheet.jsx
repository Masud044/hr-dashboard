import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { fmtDate, fmtAmount } from "./constants";

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function DetailsSheet({ row, onClose }) {
  if (!row) return null;
  const isMain = row.TXN_ID !== undefined;

  return (
    <Sheet open={!!row} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Transaction Details</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <Row label="Date" value={fmtDate(row.TXN_DATE)} />
          <Row label="Amount" value={fmtAmount(row.AMOUNT)} />
          <Row label="Description" value={row.DESCRIPTION} />
          <Row label="Project" value={row.PROJECT_NAME} />
          <Row label="Contractor" value={row.CONTRACTOR_NAME} />
          <Row label="Invoice No" value={row.INVOICE_NO} />
          <Row label="Remarks" value={row.REMARKS} />
          <Row label="Source" value={row.SOURCE_TYPE} />
          <Row label="Created By" value={row.CREATED_BY_NAME} />
          <Row label="Created Date" value={fmtDate(row.CREATION_DATE)} />
          {isMain && (
            <>
              <Row label="Approved By" value={row.APPROVED_BY_NAME} />
              <Row label="Approved Date" value={fmtDate(row.APPROVED_DATE)} />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}