// src/features/setting/pages/statement-upload-four/StagingThead.jsx
import React from "react";


const StagingThead = React.memo(function StagingThead({ showPaymentBy = false, showExcludeMargin = false }) {
  return (
    <thead className="bg-secondary border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
      <tr>
        <th className="px-2 py-2.5 w-[80px] text-left sticky top-0 z-10 bg-secondary">Status</th>
        <th className="px-2 py-2.5 w-[100px] text-left sticky top-0 z-10 bg-secondary">Date</th>
        <th className="px-2 py-2.5 w-[90px] text-right sticky top-0 z-10 bg-secondary">Amount</th>
        <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">Description</th>
        <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">Project</th>
        <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">Contractor</th>
        <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">Remarks</th>
        {showPaymentBy && (
          <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">Payment By</th>
        )}
        {showExcludeMargin && (
          <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">Excl. Margin</th>
        )}
        <th className="px-3 py-2.5 text-left sticky top-0 z-10 bg-secondary">Invoice</th>
        <th className="px-3 py-2.5 text-left sticky top-0 right-0 z-30 bg-secondary shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]">Action</th>
      </tr>
    </thead>
  );
});

export default StagingThead;