// src\features\setting\pages\statement-upload-four\Pagination.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE } from "./constants";

const Pagination = React.memo(function Pagination({ page, totalRows, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  if (totalRows === 0) return null;

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalRows);
  const goTo = (p) => onPageChange(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="flex items-center justify-between px-2 py-3 text-xs text-gray-500">
      <span>Showing {from}–{to} of {totalRows}</span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={page <= 1} onClick={() => goTo(page - 1)}>Prev</Button>
        <span className="px-2">{page} / {totalPages}</span>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={page >= totalPages} onClick={() => goTo(page + 1)}>Next</Button>
      </div>
    </div>
  );
});

export default Pagination;