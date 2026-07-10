// src/features/setting/pages/statement-upload-three/StagingThead.jsx
import React from "react";

const StagingThead = React.memo(function StagingThead() {
  return (
    <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
      <tr>
        <th className="px-4 py-3 text-left">Status</th>
        <th className="px-4 py-3 text-left">Date</th>
        <th className="px-4 py-3 text-right">Amount</th>
        <th className="px-4 py-3 text-left">Description</th>
        {/* <th className="px-4 py-3 text-left">Category</th> */}
        <th className="px-4 py-3 text-left">Project</th>
        <th className="px-4 py-3 text-left">Contractor</th>
        <th className="px-4 py-3 text-left">Invoice No</th>
        <th className="px-4 py-3 text-left">Remarks</th>
        <th className="px-4 py-3 text-left">Invoice File</th>
        <th className="px-4 py-3 text-left">Action</th>
      </tr>
    </thead>
  );
});

export default StagingThead;