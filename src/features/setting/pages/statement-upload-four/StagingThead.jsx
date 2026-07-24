// src\features\setting\pages\statement-upload-four\StagingThead.jsx
import React from "react";

const StagingThead = React.memo(function StagingThead({ showPaymentBy = false }) {
  return (
    <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
      <tr>
        <th className="px-2 py-3 w-[80px] text-left sticky top-0 z-10 bg-gray-50">
          Status
        </th>
        <th className="px-2 py-3 w-[100px] text-left sticky top-0 z-10 bg-gray-50">
          Date
        </th>
        <th className="px-2 py-3 w-[90px] text-right sticky top-0 z-10 bg-gray-50">
          Amount
        </th>
        <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">
          Description
        </th>
        <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">
          Project
        </th>
        <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">
          Contractor
        </th>
        <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">
          Remarks
        </th>
        {showPaymentBy && (
    <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">Payment By</th>
  )}
        <th className="px-3 py-3 text-left sticky top-0 z-10 bg-gray-50">
          Invoice
        </th>

        <th className="px-3 py-3 text-left sticky top-0 right-0 z-30 bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)]">
          Action
        </th>
      </tr>
    </thead>
  );
});

export default StagingThead;
