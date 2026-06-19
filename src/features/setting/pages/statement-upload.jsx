import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload, RotateCcw, Download, CheckCircle2, ArrowLeft,
  FileSpreadsheet, Search,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const CATEGORY_STYLES = {
  address: "bg-blue-100 text-blue-700",
  place:   "bg-amber-100 text-amber-700",
  product: "bg-emerald-100 text-emerald-700",
  other:   "bg-slate-100 text-slate-600",
};

const StatementUpload = () => {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();

  const [file, setFile]               = useState(null);
  const [batchId, setBatchId]         = useState(null);
  const [search, setSearch]           = useState("");
  const [activeCats, setActiveCats]   = useState({
    address: true, place: true, product: true, other: true,
  });
  const [selectedIds, setSelectedIds] = useState([]);

  // ── page load/refresh hole, last pending batch automatically fetch kora ──
  useQuery({
    queryKey: ["statementLatestBatch"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/statement/latest-batch`);
      const latest = res.data?.batchId;
      if (latest) setBatchId(latest);
      return latest;
    },
    enabled: !batchId,
    refetchOnWindowFocus: false,
  });

  // ── upload CSV -> backend processes -> staging ──────────────────────────
  const uploadMutation = useMutation({
    mutationFn: async (selectedFile) => {
      const fd = new FormData();
      fd.append("file", selectedFile);
      return axios.post(`${url}/api/statement/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (res) => {
      const newBatchId = res.data?.batchId;
      const skipped = res.data?.skipped || 0;
      setBatchId(newBatchId);
      setSelectedIds([]);
      const msg = skipped > 0
        ? `${res.data?.message || "Processed."} (${skipped} duplicate row${skipped > 1 ? "s" : ""} skipped)`
        : (res.data?.message || "CSV processed successfully!");
      toast.success(msg);
      queryClient.invalidateQueries(["statementStaging", newBatchId]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to process CSV."),
  });

  // ── fetch staging rows for the active batch ─────────────────────────────
  const { data: rows = [], isLoading: rowsLoading } = useQuery({
    queryKey: ["statementStaging", batchId],
    queryFn: async () =>
      (await axios.get(`${url}/api/statement/staging/${batchId}`)).data?.data || [],
    enabled: !!batchId,
  });

  // ── approve & move selected rows to main ────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: async (stagingIds) =>
      axios.post(`${url}/api/statement/approve`, { stagingIds }),
    onSuccess: (res) => {
      toast.success(res.data?.message || "Rows approved and moved to main!");
      setSelectedIds([]);
      queryClient.invalidateQueries(["statementStaging", batchId]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to approve rows."),
  });

  // ── file handling ────────────────────────────────────────────────────────
  const handleFileSelect = (fileList) => {
    const selected = fileList?.[0];
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a CSV file.");
      return;
    }
    setFile(selected);
  };

  const handleLoad = () => {
    if (!file) { toast.error("Please choose a CSV file first."); return; }
    uploadMutation.mutate(file);
  };

  const handleReset = () => {
    setFile(null);
    setBatchId(null);
    setSearch("");
    setSelectedIds([]);
    setActiveCats({ address: true, place: true, product: true, other: true });
  };

  const toggleCategory = (cat) =>
    setActiveCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

  // ── derived: stats, filtered rows ───────────────────────────────────────
  const stats = useMemo(() => {
    const s = { address: 0, place: 0, product: 0, other: 0 };
    rows.forEach((r) => {
      const cat = (r.CATEGORY || "other").toLowerCase();
      if (s[cat] !== undefined) s[cat]++;
    });
    return s;
  }, [rows]);

  // Original tool iterates all rows and keeps overwriting with the last
  // non-zero balance seen — since query order is TXN_DATE DESC (newest first),
  // the "last" row in that iteration is the OLDEST transaction in the batch.
  const latestBalance = rows.length > 0 ? rows[rows.length - 1].BALANCE : null;

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const cat = (r.CATEGORY || "other").toLowerCase();
      if (!activeCats[cat]) return false;
      if (!q) return true;
      return (
        (r.DESCRIPTION || "").toLowerCase().includes(q) ||
        (r.MATCHED_ADDRESS || "").toLowerCase().includes(q)
      );
    });
  }, [rows, activeCats, search]);

  const toggleRow = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredRows.map((r) => r.STAGING_ID);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected
      ? selectedIds.filter((id) => !visibleIds.includes(id))
      : [...new Set([...selectedIds, ...visibleIds])]
    );
  };

  const handleDownloadCsv = () => {
    if (filteredRows.length === 0) { toast.error("No rows to download."); return; }
    const headers = ["Date", "Amount", "Description", "Balance", "Category", "Matched Address"];
    const csvRows = filteredRows.map((r) => [
      r.TXN_DATE ? new Date(r.TXN_DATE).toLocaleDateString() : "",
      r.AMOUNT,
      `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
      r.BALANCE,
      r.CATEGORY,
      `"${(r.MATCHED_ADDRESS || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "statement_processed.csv";
    link.click();
  };

  const handleApprove = () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one row to approve.");
      return;
    }
    approveMutation.mutate(selectedIds);
  };

  const fmtAmount = (amt) => {
    const n = Number(amt) || 0;
    const formatted = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  return (
    <SectionContainer>
      <div className="p-6 bg-white shadow rounded-lg mt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b">
          <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-blue-600" />
            Statement Tool
            <span className="bg-blue-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">CSV</span>
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
        </div>

        {/* File upload row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-3 bg-white border rounded-full px-4 py-1.5 shadow-sm">
            <label
              htmlFor="statement-csv-input"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
            >
              <Upload size={16} className="text-blue-600" />
              Choose CSV
            </label>
            <span className="text-xs text-gray-500 max-w-[180px] truncate">
              {file ? file.name : "No file selected"}
            </span>
            <input
              id="statement-csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          <Button onClick={handleLoad} disabled={uploadMutation.isPending} className="rounded-full bg-emerald-600 hover:bg-emerald-700">
            {uploadMutation.isPending ? "Loading..." : "Load"}
          </Button>

          <Button variant="outline" onClick={handleReset} className="rounded-full">
            <RotateCcw size={14} className="mr-1" /> Reset
          </Button>
        </div>

        {batchId && (
          <>
            {/* Stats bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border rounded-2xl shadow-sm px-6 py-4 mb-5">
              <div className="flex flex-wrap items-center gap-6">
                <div className="text-sm text-gray-600">
                  <strong className="text-gray-900 text-base font-semibold mr-1">{rows.length}</strong>
                  rows
                </div>
                {Object.entries(stats).map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${CATEGORY_STYLES[cat]}`}>
                      {cat}
                    </span>
                    <strong className="text-gray-900">{count}</strong>
                  </div>
                ))}
              </div>
              {latestBalance !== null && (
                <div className="text-sm text-gray-600">
                  Balance <strong className="text-gray-900 text-base font-semibold ml-1">
                    ${Number(latestBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white border rounded-2xl shadow-sm px-6 py-3 mb-5">
              <div className="flex flex-wrap items-center gap-4">
                {["address", "place", "product", "other"].map((cat) => (
                  <label key={cat} className="flex items-center gap-1.5 text-sm font-medium text-gray-700 cursor-pointer capitalize">
                    <input
                      type="checkbox"
                      checked={activeCats[cat]}
                      onChange={() => toggleCategory(cat)}
                      className="accent-blue-600 w-4 h-4"
                    />
                    {cat}
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Search size={14} className="text-gray-400" />
                <Input
                  placeholder="Search description or address"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 text-sm rounded-full min-w-[220px]"
                />
                <span className="text-xs text-gray-500 whitespace-nowrap">{filteredRows.length} shown</span>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleDownloadCsv} variant="outline" className="rounded-full text-sm">
                  <Download size={14} className="mr-1" /> Download CSV
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending || selectedIds.length === 0}
                  className="rounded-full bg-violet-600 hover:bg-violet-700 text-sm"
                >
                  <CheckCircle2 size={14} className="mr-1" />
                  {approveMutation.isPending
                    ? "Approving..."
                    : `Approve & Move to Main${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-3 py-3 text-left">
                        <input
                          type="checkbox"
                          className="accent-blue-600 w-4 h-4"
                          checked={filteredRows.length > 0 && filteredRows.every((r) => selectedIds.includes(r.STAGING_ID))}
                          onChange={toggleSelectAllVisible}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Matched Project</th>
                      <th className="px-4 py-3 text-left">Matched Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsLoading ? (
                      <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
                    ) : filteredRows.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-10 text-gray-400">No rows match the current filters.</td></tr>
                    ) : (
                      filteredRows.map((r) => {
                        const cat = (r.CATEGORY || "other").toLowerCase();
                        return (
                          <tr key={r.STAGING_ID} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-3 py-2.5">
                              <input
                                type="checkbox"
                                className="accent-blue-600 w-4 h-4"
                                checked={selectedIds.includes(r.STAGING_ID)}
                                onChange={() => toggleRow(r.STAGING_ID)}
                              />
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap font-medium text-gray-900">
                              {r.TXN_DATE ? new Date(r.TXN_DATE).toLocaleDateString("en-GB") : "—"}
                            </td>
                            <td className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${Number(r.AMOUNT) < 0 ? "text-red-600" : "text-emerald-600"}`}>
                              {fmtAmount(r.AMOUNT)}
                            </td>
                            <td className="px-4 py-2.5 max-w-[320px] text-gray-700">{r.DESCRIPTION}</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${CATEGORY_STYLES[cat]}`}>
                                {cat}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-gray-700">{r.P_NAME || "—"}</td>
                            <td className="px-4 py-2.5 max-w-[220px] text-gray-700">
                              {r.MATCHED_ADDRESS
                                ? <span className="text-blue-700 font-medium">{r.MATCHED_ADDRESS}</span>
                                : <span className="text-gray-400 italic">—</span>}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!batchId && (
          <div className="text-center py-16 text-gray-400">
            <FileSpreadsheet size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Choose a CSV file and click Load to get started.</p>
          </div>
        )}
      </div>
    </SectionContainer>
  );
};

export default StatementUpload;