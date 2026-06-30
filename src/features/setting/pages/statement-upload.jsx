// import React, { useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//   Upload,
//   RotateCcw,
//   Download,
//   CheckCircle2,
//   ArrowLeft,
//   FileSpreadsheet,
//   Search,
//   Paperclip,
//   ExternalLink,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import axios from "axios";

// import { SectionContainer } from "@/components/SectionContainer";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";

// const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// const CATEGORY_STYLES = {
//   address: "bg-blue-100 text-blue-700",
//   place: "bg-amber-100 text-amber-700",
//   product: "bg-emerald-100 text-emerald-700",
//   other: "bg-slate-100 text-slate-600",
// };

// const StatementUpload = () => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   const [activeTab, setActiveTab] = useState("staging"); // "staging" | "approved"
//   const [file, setFile] = useState(null);
//   const [batchId, setBatchId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [approvedSearch, setApprovedSearch] = useState("");
//   const [activeCats, setActiveCats] = useState({
//     address: true,
//     place: true,
//     product: true,
//     other: true,
//   });
//   const [selectedIds, setSelectedIds] = useState([]);

//   // ── last pending batch auto-fetch ──────────────────────────────────────
//   useQuery({
//     queryKey: ["statementLatestBatch"],
//     queryFn: async () => {
//       const res = await axios.get(`${url}/api/statement/latest-batch`);
//       const latest = res.data?.batchId;
//       if (latest) setBatchId(latest);
//       return latest;
//     },
//     enabled: !batchId,
//     refetchOnWindowFocus: false,
//   });

//   // ── CSV upload ──────────────────────────────────────────────────────────
//   const uploadMutation = useMutation({
//     mutationFn: async (selectedFile) => {
//       const fd = new FormData();
//       fd.append("file", selectedFile);
//       return axios.post(`${url}/api/statement/upload`, fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//     },
//     onSuccess: (res) => {
//       const newBatchId = res.data?.batchId;
//       const skipped = res.data?.skipped || 0;
//       setBatchId(newBatchId);
//       setSelectedIds([]);
//       setActiveTab("staging");
//       const msg =
//         skipped > 0
//           ? `${res.data?.message || "Processed."} (${skipped} duplicate row${skipped > 1 ? "s" : ""} skipped)`
//           : res.data?.message || "CSV processed successfully!";
//       toast.success(msg);
//       queryClient.invalidateQueries(["statementStaging", newBatchId]);
//     },
//     onError: (err) =>
//       toast.error(err.response?.data?.message || "Failed to process CSV."),
//   });

//   // ── Staging rows ────────────────────────────────────────────────────────
//   const { data: rows = [], isLoading: rowsLoading } = useQuery({
//     queryKey: ["statementStaging", batchId],
//     queryFn: async () =>
//       (await axios.get(`${url}/api/statement/staging/${batchId}`)).data?.data ||
//       [],
//     enabled: !!batchId,
//   });

//   // ── Approved (Main) rows ────────────────────────────────────────────────
//   const { data: approvedRows = [], isLoading: approvedLoading } = useQuery({
//     queryKey: ["statementMain"],
//     queryFn: async () =>
//       (await axios.get(`${url}/api/statement/main`)).data?.data || [],
//     enabled: activeTab === "approved",
//   });

//   // ── Dropdowns ───────────────────────────────────────────────────────────
//   const { data: projectOptions = [] } = useQuery({
//     queryKey: ["statementProjects"],
//     queryFn: async () =>
//       (await axios.get(`${url}/api/statement/projects`)).data?.data || [],
//   });

//   const { data: contractorOptions = [] } = useQuery({
//     queryKey: ["statementContractors"],
//     queryFn: async () =>
//       (await axios.get(`${url}/api/statement/contractors`)).data?.data || [],
//   });

//   // ── Row update mutations ────────────────────────────────────────────────
//   const updateRowMutation = useMutation({
//     mutationFn: async (payload) =>
//       axios.put(`${url}/api/statement/staging/row`, payload),
//     onSuccess: () =>
//       queryClient.invalidateQueries(["statementStaging", batchId]),
//     onError: (err) =>
//       toast.error(err.response?.data?.message || "Failed to update row."),
//   });

//   const uploadInvoiceMutation = useMutation({
//     mutationFn: async ({ stagingId, file }) => {
//       const fd = new FormData();
//       fd.append("invoiceFile", file);
//       return axios.post(
//         `${url}/api/statement/staging/${stagingId}/invoice`,
//         fd,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         },
//       );
//     },
//     onSuccess: () => {
//       toast.success("Invoice uploaded.");
//       queryClient.invalidateQueries(["statementStaging", batchId]);
//     },
//     onError: (err) =>
//       toast.error(err.response?.data?.message || "Failed to upload invoice."),
//   });

//   const approveMutation = useMutation({
//     mutationFn: async (stagingIds) =>
//       axios.post(`${url}/api/statement/approve`, { stagingIds }),
//     onSuccess: (res) => {
//       toast.success(res.data?.message || "Rows approved and moved to main!");
//       setSelectedIds([]);
//       queryClient.invalidateQueries(["statementStaging", batchId]);
//       queryClient.invalidateQueries(["statementMain"]);
//     },
//     onError: (err) =>
//       toast.error(err.response?.data?.message || "Failed to approve rows."),
//   });

//   // ── Handlers ────────────────────────────────────────────────────────────
//   const handleProjectChange = (row, pId) => {
//     const proj = projectOptions.find((p) => String(p.P_ID) === String(pId));
//     updateRowMutation.mutate({
//       stagingId: row.STAGING_ID,
//       pId: pId || null,
//       projectName: proj?.P_NAME || null,
//     });
//   };

//   const handleContractorChange = (row, contractorId) => {
//     const c = contractorOptions.find(
//       (c) => String(c.CONTRATOR_ID) === String(contractorId),
//     );
//     updateRowMutation.mutate({
//       stagingId: row.STAGING_ID,
//       contractorId: contractorId || null,
//       contractorName: c?.CONTRATOR_NAME || null,
//     });
//   };

//   const handleInvoiceNoBlur = (row, value) => {
//     if ((row.INVOICE_NO || "") === value) return;
//     updateRowMutation.mutate({ stagingId: row.STAGING_ID, invoiceNo: value });
//   };

//   const handleInvoiceFileSelect = (row, fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     if (file.size > 20 * 1024 * 1024) {
//       toast.error(`"${file.name}" exceeds 20 MB limit.`);
//       return;
//     }
//     uploadInvoiceMutation.mutate({ stagingId: row.STAGING_ID, file });
//   };

//   const handleFileSelect = (fileList) => {
//     const selected = fileList?.[0];
//     if (!selected) return;
//     if (!selected.name.toLowerCase().endsWith(".csv")) {
//       toast.error("Please select a CSV file.");
//       return;
//     }
//     setFile(selected);
//   };

//   const handleLoad = () => {
//     if (!file) {
//       toast.error("Please choose a CSV file first.");
//       return;
//     }
//     uploadMutation.mutate(file);
//   };

//   const handleReset = () => {
//     setFile(null);
//     setBatchId(null);
//     setSearch("");
//     setSelectedIds([]);
//     setActiveCats({ address: true, place: true, product: true, other: true });
//   };

//   const toggleCategory = (cat) =>
//     setActiveCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

//   const toggleRow = (id) =>
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
//     );

//   const toggleSelectAllVisible = () => {
//     const visibleIds = filteredRows.map((r) => r.STAGING_ID);
//     const allSelected = visibleIds.every((id) => selectedIds.includes(id));
//     setSelectedIds(
//       allSelected
//         ? selectedIds.filter((id) => !visibleIds.includes(id))
//         : [...new Set([...selectedIds, ...visibleIds])],
//     );
//   };

//   const handleApprove = () => {
//     if (selectedIds.length === 0) {
//       toast.error("Select at least one row to approve.");
//       return;
//     }
//     approveMutation.mutate(selectedIds);
//   };

//   // ── Derived ─────────────────────────────────────────────────────────────
//   const stats = useMemo(() => {
//     const s = { address: 0, place: 0, product: 0, other: 0 };
//     rows.forEach((r) => {
//       const c = (r.CATEGORY || "other").toLowerCase();
//       if (s[c] !== undefined) s[c]++;
//     });
//     return s;
//   }, [rows]);

//   const filteredRows = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return rows.filter((r) => {
//       const cat = (r.CATEGORY || "other").toLowerCase();
//       if (!activeCats[cat]) return false;
//       if (!q) return true;
//       return (
//         (r.DESCRIPTION || "").toLowerCase().includes(q) ||
//         (r.MATCHED_ADDRESS || "").toLowerCase().includes(q)
//       );
//     });
//   }, [rows, activeCats, search]);

//   const filteredApproved = useMemo(() => {
//     const q = approvedSearch.trim().toLowerCase();
//     if (!q) return approvedRows;
//     return approvedRows.filter(
//       (r) =>
//         (r.DESCRIPTION || "").toLowerCase().includes(q) ||
//         (r.PROJECT_NAME || "").toLowerCase().includes(q) ||
//         (r.CONTRACTOR_NAME || "").toLowerCase().includes(q) ||
//         (r.INVOICE_NO || "").toLowerCase().includes(q),
//     );
//   }, [approvedRows, approvedSearch]);

//   const fmtAmount = (amt) => {
//     const n = Number(amt) || 0;
//     const formatted = Math.abs(n).toLocaleString(undefined, {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });
//     return n < 0 ? `-$${formatted}` : `$${formatted}`;
//   };

//   const handleDownloadCsv = (dataRows, filename) => {
//     if (dataRows.length === 0) {
//       toast.error("No rows to download.");
//       return;
//     }
//     const headers = [
//       "Date",
//       "Amount",
//       "Description",
//       "Balance",
//       "Category",
//       "Project",
//       "Matched Address",
//       "Contractor",
//       "Invoice No",
//     ];
//     const csvRows = dataRows.map((r) => [
//       r.TXN_DATE ? new Date(r.TXN_DATE).toLocaleDateString() : "",
//       r.AMOUNT,
//       `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
//       r.BALANCE ?? "",
//       r.CATEGORY,
//       `"${(r.PROJECT_NAME || "").replace(/"/g, '""')}"`,
//       `"${(r.MATCHED_ADDRESS || "").replace(/"/g, '""')}"`,
//       `"${(r.CONTRACTOR_NAME || "").replace(/"/g, '""')}"`,
//       `"${(r.INVOICE_NO || "").replace(/"/g, '""')}"`,
//     ]);
//     const csvContent = [
//       headers.join(","),
//       ...csvRows.map((row) => row.join(",")),
//     ].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = filename;
//     link.click();
//   };

//   // ── Tab button component ─────────────────────────────────────────────────
//   const TabBtn = ({ id, label, count }) => (
//     <button
//       onClick={() => setActiveTab(id)}
//       className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
//         activeTab === id
//           ? "bg-blue-600 text-white shadow"
//           : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//       }`}
//     >
//       {label}
//       {count != null && (
//         <span
//           className={`ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
//             activeTab === id
//               ? "bg-blue-500 text-white"
//               : "bg-gray-200 text-gray-600"
//           }`}
//         >
//           {count}
//         </span>
//       )}
//     </button>
//   );

//   return (
//     <SectionContainer>
//       <div className="p-6 bg-white shadow rounded-lg mt-8">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6 pb-2 border-b">
//           <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
//             <FileSpreadsheet size={16} className="text-blue-600" />
//             Statement Tool
//             <span className="bg-blue-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
//               CSV
//             </span>
//           </h2>
//           <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
//             <ArrowLeft size={16} className="mr-1" /> Back
//           </Button>
//         </div>

//         {/* File upload row */}
//         <div className="flex flex-wrap items-center gap-3 mb-6">
//           <div className="flex items-center gap-3 bg-white border rounded-full px-4 py-1.5 shadow-sm">
//             <label
//               htmlFor="statement-csv-input"
//               className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
//             >
//               <Upload size={16} className="text-blue-600" /> Choose CSV
//             </label>
//             <span className="text-xs text-gray-500 max-w-[180px] truncate">
//               {file ? file.name : "No file selected"}
//             </span>
//             <input
//               id="statement-csv-input"
//               type="file"
//               accept=".csv"
//               className="hidden"
//               onChange={(e) => handleFileSelect(e.target.files)}
//             />
//           </div>
//           <Button
//             onClick={handleLoad}
//             disabled={uploadMutation.isPending}
//             className="rounded-full bg-emerald-600 hover:bg-emerald-700"
//           >
//             {uploadMutation.isPending ? "Loading..." : "Load"}
//           </Button>
//           <Button
//             variant="outline"
//             onClick={handleReset}
//             className="rounded-full"
//           >
//             <RotateCcw size={14} className="mr-1" /> Reset
//           </Button>
//         </div>

//         {/* ── TABS ── */}
//         <div className="flex items-center gap-2 mb-5 border-b pb-3">
//           <TabBtn
//             id="staging"
//             label="Staging (Pending)"
//             count={batchId ? rows.length : null}
//           />
//           <TabBtn id="approved" label="Approved (Main)" count={null} />
//         </div>

//         {/* ══════════════════════════════════════════════════════
//             TAB 1 — STAGING
//         ══════════════════════════════════════════════════════ */}
//         {activeTab === "staging" && (
//           <>
//             {batchId ? (
//               <>
//                 {/* Stats bar */}
//                 <div className="flex flex-wrap items-center justify-between gap-4 bg-white border rounded-2xl shadow-sm px-6 py-4 mb-5">
//                   <div className="flex flex-wrap items-center gap-6">
//                     <div className="text-sm text-gray-600">
//                       <strong className="text-gray-900 text-base font-semibold mr-1">
//                         {rows.length}
//                       </strong>{" "}
//                       rows
//                     </div>
//                     {Object.entries(stats).map(([cat, count]) => (
//                       <div
//                         key={cat}
//                         className="flex items-center gap-1.5 text-sm text-gray-600"
//                       >
//                         <span
//                           className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${CATEGORY_STYLES[cat]}`}
//                         >
//                           {cat}
//                         </span>
//                         <strong className="text-gray-900">{count}</strong>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Filters */}
//                 <div className="flex flex-wrap items-center gap-4 bg-white border rounded-2xl shadow-sm px-6 py-3 mb-5">
//                   <div className="flex flex-wrap items-center gap-4">
//                     {["address", "place", "product", "other"].map((cat) => (
//                       <label
//                         key={cat}
//                         className="flex items-center gap-1.5 text-sm font-medium text-gray-700 cursor-pointer capitalize"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={activeCats[cat]}
//                           onChange={() => toggleCategory(cat)}
//                           className="accent-blue-600 w-4 h-4"
//                         />
//                         {cat}
//                       </label>
//                     ))}
//                   </div>
//                   <div className="flex items-center gap-2 ml-auto">
//                     <Search size={14} className="text-gray-400" />
//                     <Input
//                       placeholder="Search description or address"
//                       value={search}
//                       onChange={(e) => setSearch(e.target.value)}
//                       className="h-8 text-sm rounded-full min-w-[220px]"
//                     />
//                     <span className="text-xs text-gray-500 whitespace-nowrap">
//                       {filteredRows.length} shown
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Button
//                       onClick={() =>
//                         handleDownloadCsv(filteredRows, "statement_staging.csv")
//                       }
//                       variant="outline"
//                       className="rounded-full text-sm"
//                     >
//                       <Download size={14} className="mr-1" /> Download CSV
//                     </Button>
//                     <Button
//                       onClick={handleApprove}
//                       disabled={
//                         approveMutation.isPending || selectedIds.length === 0
//                       }
//                       className="rounded-full bg-violet-600 hover:bg-violet-700 text-sm"
//                     >
//                       <CheckCircle2 size={14} className="mr-1" />
//                       {approveMutation.isPending
//                         ? "Approving..."
//                         : `Approve & Move to Main${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
//                     </Button>
//                   </div>
//                 </div>

//                 {/* Staging Table */}
//                 <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm min-w-[1400px]">
//                       <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
//                         <tr>
//                           <th className="px-3 py-3 text-left">
//                             <input
//                               type="checkbox"
//                               className="accent-blue-600 w-4 h-4"
//                               checked={
//                                 filteredRows.length > 0 &&
//                                 filteredRows.every((r) =>
//                                   selectedIds.includes(r.STAGING_ID),
//                                 )
//                               }
//                               onChange={toggleSelectAllVisible}
//                             />
//                           </th>
//                           <th className="px-4 py-3 text-left">Date</th>
//                           <th className="px-4 py-3 text-right">Amount</th>
//                           <th className="px-4 py-3 text-left">Description</th>
//                           <th className="px-4 py-3 text-left">Category</th>
//                           <th className="px-4 py-3 text-left">Project</th>
//                           <th className="px-4 py-3 text-left">
//                             Matched Address
//                           </th>
//                           <th className="px-4 py-3 text-left">Contractor</th>
//                           <th className="px-4 py-3 text-left">Invoice No</th>
//                           <th className="px-4 py-3 text-left">Invoice File</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {rowsLoading ? (
//                           <tr>
//                             <td
//                               colSpan={10}
//                               className="text-center py-10 text-gray-400"
//                             >
//                               Loading...
//                             </td>
//                           </tr>
//                         ) : filteredRows.length === 0 ? (
//                           <tr>
//                             <td
//                               colSpan={10}
//                               className="text-center py-10 text-gray-400"
//                             >
//                               No rows match the current filters.
//                             </td>
//                           </tr>
//                         ) : (
//                           filteredRows.map((r) => {
//                             const cat = (r.CATEGORY || "other").toLowerCase();
//                             return (
//                               <tr
//                                 key={r.STAGING_ID}
//                                 className="border-b last:border-0 hover:bg-gray-50"
//                               >
//                                 <td className="px-3 py-2.5">
//                                   <input
//                                     type="checkbox"
//                                     className="accent-blue-600 w-4 h-4"
//                                     checked={selectedIds.includes(r.STAGING_ID)}
//                                     onChange={() => toggleRow(r.STAGING_ID)}
//                                   />
//                                 </td>
//                                 <td className="px-4 py-2.5 whitespace-nowrap font-medium text-gray-900">
//                                   {r.TXN_DATE
//                                     ? new Date(r.TXN_DATE).toLocaleDateString(
//                                         "en-GB",
//                                       )
//                                     : "—"}
//                                 </td>
//                                 <td
//                                   className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${Number(r.AMOUNT) < 0 ? "text-red-600" : "text-emerald-600"}`}
//                                 >
//                                   {fmtAmount(r.AMOUNT)}
//                                 </td>
//                                 <td className="px-4 py-2.5 max-w-[320px] text-gray-700">
//                                   {r.DESCRIPTION}
//                                 </td>
//                                 <td className="px-4 py-2.5">
//                                   <span
//                                     className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${CATEGORY_STYLES[cat]}`}
//                                   >
//                                     {cat}
//                                   </span>
//                                 </td>
//                                 <td className="px-4 py-2.5 text-gray-700 min-w-[170px]">
//                                   <Select
//                                     value={r.P_ID ? String(r.P_ID) : ""}
//                                     onValueChange={(v) =>
//                                       handleProjectChange(r, v)
//                                     }
//                                   >
//                                     <SelectTrigger className="h-8 text-xs">
//                                       <SelectValue placeholder="Select project">
//                                         {r.PROJECT_NAME || "Select project"}
//                                       </SelectValue>
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                       {projectOptions.map((p) => (
//                                         <SelectItem
//                                           key={p.P_ID}
//                                           value={String(p.P_ID)}
//                                         >
//                                           {p.P_NAME}
//                                         </SelectItem>
//                                       ))}
//                                     </SelectContent>
//                                   </Select>
//                                 </td>
//                                 <td className="px-4 py-2.5 max-w-[200px] text-gray-700">
//                                   {r.MATCHED_ADDRESS ? (
//                                     <span className="text-blue-700 font-medium">
//                                       {r.MATCHED_ADDRESS}
//                                     </span>
//                                   ) : (
//                                     <span className="text-gray-400 italic">
//                                       —
//                                     </span>
//                                   )}
//                                 </td>
//                                 <td className="px-4 py-2.5 text-gray-700 min-w-[170px]">
//                                   <Select
//                                     value={
//                                       r.CONTRACTOR_ID
//                                         ? String(r.CONTRACTOR_ID)
//                                         : ""
//                                     }
//                                     onValueChange={(v) =>
//                                       handleContractorChange(r, v)
//                                     }
//                                   >
//                                     <SelectTrigger className="h-8 text-xs">
//                                       <SelectValue placeholder="Select contractor">
//                                         {r.CONTRACTOR_NAME ||
//                                           "Select contractor"}
//                                       </SelectValue>
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                       {contractorOptions.map((c) => (
//                                         <SelectItem
//                                           key={c.CONTRATOR_ID}
//                                           value={String(c.CONTRATOR_ID)}
//                                         >
//                                           {c.CONTRATOR_NAME}
//                                         </SelectItem>
//                                       ))}
//                                     </SelectContent>
//                                   </Select>
//                                 </td>
//                                 <td className="px-4 py-2.5 min-w-[120px]">
//                                   <Input
//                                     defaultValue={r.INVOICE_NO || ""}
//                                     placeholder="Invoice no."
//                                     className="h-8 text-xs"
//                                     onBlur={(e) =>
//                                       handleInvoiceNoBlur(r, e.target.value)
//                                     }
//                                   />
//                                 </td>
//                                 <td className="px-4 py-2.5 min-w-[140px]">
//                                   {r.INVOICE_FILE_NAME ? (
//                                     <a
//                                       href={`${url}/api/statement/staging/${r.STAGING_ID}/invoice`}
//                                       target="_blank"
//                                       rel="noreferrer"
//                                       className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium truncate max-w-[130px]"
//                                       title={r.INVOICE_FILE_NAME}
//                                     >
//                                       <ExternalLink
//                                         size={12}
//                                         className="shrink-0"
//                                       />
//                                       {r.INVOICE_FILE_NAME}
//                                     </a>
//                                   ) : (
//                                     <label className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 cursor-pointer">
//                                       <Paperclip size={12} /> Attach
//                                       <input
//                                         type="file"
//                                         accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
//                                         className="hidden"
//                                         onChange={(e) =>
//                                           handleInvoiceFileSelect(
//                                             r,
//                                             e.target.files,
//                                           )
//                                         }
//                                       />
//                                     </label>
//                                   )}
//                                 </td>
//                               </tr>
//                             );
//                           })
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="text-center py-16 text-gray-400">
//                 <FileSpreadsheet
//                   size={48}
//                   className="mx-auto mb-3 text-gray-300"
//                 />
//                 <p>Choose a CSV file and click Load to get started.</p>
//               </div>
//             )}
//           </>
//         )}

//         {/* ══════════════════════════════════════════════════════
//             TAB 2 — APPROVED (MAIN)
//         ══════════════════════════════════════════════════════ */}
//         {activeTab === "approved" && (
//           <>
//             {/* Search + Download */}
//             <div className="flex flex-wrap items-center gap-3 mb-5">
//               <div className="flex items-center gap-2">
//                 <Search size={14} className="text-gray-400" />
//                 <Input
//                   placeholder="Search description, project, contractor, invoice..."
//                   value={approvedSearch}
//                   onChange={(e) => setApprovedSearch(e.target.value)}
//                   className="h-8 text-sm rounded-full min-w-[280px]"
//                 />
//                 <span className="text-xs text-gray-500 whitespace-nowrap">
//                   {filteredApproved.length} shown
//                 </span>
//               </div>
//               <Button
//                 onClick={() =>
//                   handleDownloadCsv(filteredApproved, "statement_approved.csv")
//                 }
//                 variant="outline"
//                 className="rounded-full text-sm ml-auto"
//               >
//                 <Download size={14} className="mr-1" /> Download CSV
//               </Button>
//             </div>

//             {/* Approved Table */}
//             <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm min-w-[1200px]">
//                   <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
//                     <tr>
//                       <th className="px-4 py-3 text-left">Date</th>
//                       <th className="px-4 py-3 text-right">Amount</th>
//                       <th className="px-4 py-3 text-left">Description</th>
//                       <th className="px-4 py-3 text-left">Category</th>
//                       <th className="px-4 py-3 text-left">Project</th>
//                       <th className="px-4 py-3 text-left">Matched Address</th>
//                       <th className="px-4 py-3 text-left">Contractor</th>
//                       <th className="px-4 py-3 text-left">Invoice No</th>
//                       <th className="px-4 py-3 text-left">Approved date</th>
//                       <th className="px-4 py-3 text-left">Invoice File</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {approvedLoading ? (
//                       <tr>
//                         <td
//                           colSpan={10}
//                           className="text-center py-10 text-gray-400"
//                         >
//                           Loading...
//                         </td>
//                       </tr>
//                     ) : filteredApproved.length === 0 ? (
//                       <tr>
//                         <td
//                           colSpan={10}
//                           className="text-center py-10 text-gray-400"
//                         >
//                           No approved transactions yet.
//                         </td>
//                       </tr>
//                     ) : (
//                       filteredApproved.map((r) => {
//                         const cat = (r.CATEGORY || "other").toLowerCase();
//                         return (
//                           <tr
//                             key={r.TXN_ID}
//                             className="border-b last:border-0 hover:bg-gray-50"
//                           >
//                             <td className="px-4 py-2.5 whitespace-nowrap font-medium text-gray-900">
//                               {r.TXN_DATE
//                                 ? new Date(r.TXN_DATE).toLocaleDateString(
//                                     "en-GB",
//                                   )
//                                 : "—"}
//                             </td>
//                             <td
//                               className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${Number(r.AMOUNT) < 0 ? "text-red-600" : "text-emerald-600"}`}
//                             >
//                               {fmtAmount(r.AMOUNT)}
//                             </td>
//                             <td className="px-4 py-2.5 max-w-[300px] text-gray-700">
//                               {r.DESCRIPTION}
//                             </td>
//                             <td className="px-4 py-2.5">
//                               <span
//                                 className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${CATEGORY_STYLES[cat] || CATEGORY_STYLES.other}`}
//                               >
//                                 {cat}
//                               </span>
//                             </td>
//                             <td className="px-4 py-2.5 text-gray-700">
//                               {r.PROJECT_NAME || (
//                                 <span className="text-gray-400 italic">—</span>
//                               )}
//                             </td>
//                             <td className="px-4 py-2.5 max-w-[180px] text-gray-700">
//                               {r.MATCHED_ADDRESS ? (
//                                 <span className="text-blue-700 font-medium">
//                                   {r.MATCHED_ADDRESS}
//                                 </span>
//                               ) : (
//                                 <span className="text-gray-400 italic">—</span>
//                               )}
//                             </td>
//                             <td className="px-4 py-2.5 text-gray-700">
//                               {r.CONTRACTOR_NAME || (
//                                 <span className="text-gray-400 italic">—</span>
//                               )}
//                             </td>
//                             <td className="px-4 py-2.5 text-gray-700">
//                               {r.INVOICE_NO || (
//                                 <span className="text-gray-400 italic">—</span>
//                               )}
//                             </td>

//                             <td className="px-4 py-2.5 whitespace-nowrap text-gray-500 text-xs">
//                               {r.APPROVED_DATE
//                                 ? new Date(r.APPROVED_DATE).toLocaleDateString(
//                                     "en-GB",
//                                   )
//                                 : "—"}
//                             </td>

//                             <td className="px-4 py-2.5 min-w-[140px]">
//   {r.INVOICE_FILE_NAME ? (
//     <a
//       href={`${url}/api/statement/main/${r.TXN_ID}/invoice`}
//       target="_blank"
//       rel="noreferrer"
//       download={r.INVOICE_FILE_NAME}
//       className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium truncate max-w-[130px]"
//       title={r.INVOICE_FILE_NAME}
//     >
//       <ExternalLink size={12} className="shrink-0" />
//       {r.INVOICE_FILE_NAME}
//     </a>
//   ) : (
//     <span className="text-gray-400 italic text-xs">—</span>
//   )}
// </td>
//                           </tr>
//                         );
//                       })
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </SectionContainer>
//   );
// };

// export default StatementUpload;


import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload, RotateCcw, Download, CheckCircle2, ArrowLeft,
  FileSpreadsheet, Search, Paperclip, ExternalLink, PlusCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const CATEGORY_STYLES = {
  address: "bg-blue-100 text-blue-700",
  place:   "bg-amber-100 text-amber-700",
  product: "bg-emerald-100 text-emerald-700",
  other:   "bg-slate-100 text-slate-600",
};

const STATUS_STYLES = {
  PENDING:  "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
};

// ── Non-banking entry form initial state ──
const EMPTY_NB = {
  txnDate: "", amount: "", description: "",
  pId: "", projectName: "", contractorId: "", contractorName: "",
  invoiceNo: "", remarks: "",
};

const StatementUpload = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  // top-level tabs
  const [mainTab, setMainTab]   = useState("pending");   // "pending" | "approved"
  // pending sub-tabs
  const [subTab, setSubTab]     = useState("banking");   // "banking" | "nonbanking"

  const [file, setFile]               = useState(null);
  const [batchId, setBatchId]         = useState(null);
  const [search, setSearch]           = useState("");
  const [nbSearch, setNbSearch]       = useState("");
  const [approvedSearch, setApprovedSearch] = useState("");
  const [activeCats, setActiveCats]   = useState({ address: true, place: true, product: true, other: true });
  const [selectedIds, setSelectedIds] = useState([]);
  const [nbForm, setNbForm]           = useState(EMPTY_NB);

  // ── latest pending batch ────────────────────────────────────────────────
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

  // ── CSV upload ──────────────────────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: async (f) => {
      const fd = new FormData();
      fd.append("file", f);
      return axios.post(`${url}/api/statement/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: (res) => {
      setBatchId(res.data?.batchId);
      setSelectedIds([]);
      toast.success(res.data?.message || "CSV processed!");
      queryClient.invalidateQueries(["statementStaging", res.data?.batchId]);
      queryClient.invalidateQueries(["statementStagingAll"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to process CSV."),
  });

  // ── Staging rows for active batch (Banking tab) ─────────────────────────
  const { data: rows = [], isLoading: rowsLoading } = useQuery({
    queryKey: ["statementStaging", batchId],
    queryFn: async () =>
      (await axios.get(`${url}/api/statement/staging/${batchId}`)).data?.data || [],
    enabled: !!batchId && subTab === "banking" && mainTab === "pending",
  });

  // ── All staging rows for Non-banking tab ───────────────────────────────
  const { data: nbRows = [], isLoading: nbLoading } = useQuery({
    queryKey: ["statementStagingAll", "NON_BANKING"],
    queryFn: async () =>
      (await axios.get(`${url}/api/statement/staging/all?sourceType=NON_BANKING`)).data?.data || [],
    enabled: subTab === "nonbanking" && mainTab === "pending",
  });

  // ── Approved (Main) rows ────────────────────────────────────────────────
  const { data: approvedRows = [], isLoading: approvedLoading } = useQuery({
    queryKey: ["statementMain"],
    queryFn: async () =>
      (await axios.get(`${url}/api/statement/main`)).data?.data || [],
    enabled: mainTab === "approved",
  });

  // ── Dropdowns ───────────────────────────────────────────────────────────
  const { data: projectOptions = [] } = useQuery({
    queryKey: ["statementProjects"],
    queryFn: async () => (await axios.get(`${url}/api/statement/projects`)).data?.data || [],
  });

  const { data: contractorOptions = [] } = useQuery({
    queryKey: ["statementContractors"],
    queryFn: async () => (await axios.get(`${url}/api/statement/contractors`)).data?.data || [],
  });

  // ── Mutations ───────────────────────────────────────────────────────────
  const updateRowMutation = useMutation({
    mutationFn: async (payload) => axios.put(`${url}/api/statement/staging/row`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["statementStaging", batchId]);
      queryClient.invalidateQueries(["statementStagingAll", "NON_BANKING"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update row."),
  });

  const uploadInvoiceMutation = useMutation({
    mutationFn: async ({ stagingId, file }) => {
      const fd = new FormData();
      fd.append("invoiceFile", file);
      return axios.post(`${url}/api/statement/staging/${stagingId}/invoice`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      toast.success("Invoice uploaded.");
      queryClient.invalidateQueries(["statementStaging", batchId]);
      queryClient.invalidateQueries(["statementStagingAll", "NON_BANKING"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to upload invoice."),
  });

  const approveMutation = useMutation({
    mutationFn: async (stagingIds) =>
      axios.post(`${url}/api/statement/approve`, { stagingIds }),
    onSuccess: (res) => {
      toast.success(res.data?.message || "Rows approved!");
      setSelectedIds([]);
      queryClient.invalidateQueries(["statementStaging", batchId]);
      queryClient.invalidateQueries(["statementStagingAll", "NON_BANKING"]);
      queryClient.invalidateQueries(["statementMain"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to approve rows."),
  });

  const addNonBankingMutation = useMutation({
    mutationFn: async (data) => axios.post(`${url}/api/statement/non-banking`, data),
    onSuccess: () => {
      toast.success("Entry added to staging.");
      setNbForm(EMPTY_NB);
      queryClient.invalidateQueries(["statementStagingAll", "NON_BANKING"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add entry."),
  });

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleProjectChange = (row, pId) => {
    const proj = projectOptions.find((p) => String(p.P_ID) === String(pId));
    updateRowMutation.mutate({ stagingId: row.STAGING_ID, pId: pId || null, projectName: proj?.P_NAME || null });
  };

  const handleContractorChange = (row, contractorId) => {
    const c = contractorOptions.find((c) => String(c.CONTRATOR_ID) === String(contractorId));
    updateRowMutation.mutate({ stagingId: row.STAGING_ID, contractorId: contractorId || null, contractorName: c?.CONTRATOR_NAME || null });
  };

  const handleInvoiceNoBlur = (row, value) => {
    if ((row.INVOICE_NO || "") === value) return;
    updateRowMutation.mutate({ stagingId: row.STAGING_ID, invoiceNo: value });
  };

  const handleRemarksBlur = (row, value) => {
    if ((row.REMARKS || "") === value) return;
    updateRowMutation.mutate({ stagingId: row.STAGING_ID, remarks: value });
  };

  const handleInvoiceFileSelect = (row, fileList) => {
    const f = fileList?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { toast.error(`"${f.name}" exceeds 20 MB limit.`); return; }
    uploadInvoiceMutation.mutate({ stagingId: row.STAGING_ID, file: f });
  };

  const handleFileSelect = (fileList) => {
    const selected = fileList?.[0];
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".csv")) { toast.error("Please select a CSV file."); return; }
    setFile(selected);
  };

  const handleLoad = () => {
    if (!file) { toast.error("Please choose a CSV file first."); return; }
    uploadMutation.mutate(file);
  };

  const handleReset = () => {
    setFile(null); setBatchId(null); setSearch(""); setSelectedIds([]);
    setActiveCats({ address: true, place: true, product: true, other: true });
  };

  const toggleCategory = (cat) => setActiveCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const toggleRow = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleSelectAllVisible = (visibleRows) => {
    const visibleIds = visibleRows.filter((r) => r.STATUS === "PENDING").map((r) => r.STAGING_ID);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected
      ? selectedIds.filter((id) => !visibleIds.includes(id))
      : [...new Set([...selectedIds, ...visibleIds])]);
  };

  const handleApprove = () => {
    if (selectedIds.length === 0) { toast.error("Select at least one row to approve."); return; }
    approveMutation.mutate(selectedIds);
  };

  const handleNbSubmit = () => {
    if (!nbForm.txnDate || !nbForm.amount || !nbForm.description) {
      toast.error("Date, Amount and Description are required.");
      return;
    }
    const proj = projectOptions.find((p) => String(p.P_ID) === String(nbForm.pId));
    const cont = contractorOptions.find((c) => String(c.CONTRATOR_ID) === String(nbForm.contractorId));
    addNonBankingMutation.mutate({
      ...nbForm,
      projectName:    proj?.P_NAME    || null,
      contractorName: cont?.CONTRATOR_NAME || null,
    });
  };

  // ── Derived ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const s = { address: 0, place: 0, product: 0, other: 0 };
    rows.forEach((r) => { const c = (r.CATEGORY || "other").toLowerCase(); if (s[c] !== undefined) s[c]++; });
    return s;
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const cat = (r.CATEGORY || "other").toLowerCase();
      if (!activeCats[cat]) return false;
      if (!q) return true;
      return (r.DESCRIPTION || "").toLowerCase().includes(q) || (r.MATCHED_ADDRESS || "").toLowerCase().includes(q);
    });
  }, [rows, activeCats, search]);

  const filteredNb = useMemo(() => {
    const q = nbSearch.trim().toLowerCase();
    if (!q) return nbRows;
    return nbRows.filter((r) =>
      (r.DESCRIPTION || "").toLowerCase().includes(q) ||
      (r.PROJECT_NAME || "").toLowerCase().includes(q) ||
      (r.CONTRACTOR_NAME || "").toLowerCase().includes(q)
    );
  }, [nbRows, nbSearch]);

  const filteredApproved = useMemo(() => {
    const q = approvedSearch.trim().toLowerCase();
    if (!q) return approvedRows;
    return approvedRows.filter((r) =>
      (r.DESCRIPTION || "").toLowerCase().includes(q) ||
      (r.PROJECT_NAME || "").toLowerCase().includes(q) ||
      (r.CONTRACTOR_NAME || "").toLowerCase().includes(q) ||
      (r.INVOICE_NO || "").toLowerCase().includes(q)
    );
  }, [approvedRows, approvedSearch]);

  const fmtAmount = (amt) => {
    const n = Number(amt) || 0;
    const f = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n < 0 ? `-$${f}` : `$${f}`;
  };

  const handleDownloadCsv = (dataRows, filename) => {
    if (dataRows.length === 0) { toast.error("No rows to download."); return; }
    const headers = ["Date", "Amount", "Description", "Balance", "Category", "Project", "Matched Address", "Contractor", "Invoice No", "Source", "Remarks", "Status"];
    const csvRows = dataRows.map((r) => [
      r.TXN_DATE ? new Date(r.TXN_DATE).toLocaleDateString() : "",
      r.AMOUNT,
      `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
      r.BALANCE ?? "",
      r.CATEGORY,
      `"${(r.PROJECT_NAME || "").replace(/"/g, '""')}"`,
      `"${(r.MATCHED_ADDRESS || "").replace(/"/g, '""')}"`,
      `"${(r.CONTRACTOR_NAME || "").replace(/"/g, '""')}"`,
      `"${(r.INVOICE_NO || "").replace(/"/g, '""')}"`,
      r.SOURCE_TYPE || "",
      `"${(r.REMARKS || "").replace(/"/g, '""')}"`,
      r.STATUS || "",
    ]);
    const blob = new Blob([[headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // ── Reusable staging table rows ─────────────────────────────────────────
  const renderStagingRows = (dataRows, loading, colSpan = 12) => {
    if (loading) return <tr><td colSpan={colSpan} className="text-center py-10 text-gray-400">Loading...</td></tr>;
    if (dataRows.length === 0) return <tr><td colSpan={colSpan} className="text-center py-10 text-gray-400">No rows found.</td></tr>;
    return dataRows.map((r) => {
      const cat      = (r.CATEGORY || "other").toLowerCase();
      const approved = r.STATUS === "APPROVED";
      return (
        <tr key={r.STAGING_ID} className={`border-b last:border-0 ${approved ? "bg-green-50 opacity-70" : "hover:bg-gray-50"}`}>
          <td className="px-3 py-2.5">
            <input
              type="checkbox"
              className="accent-blue-600 w-4 h-4"
              checked={selectedIds.includes(r.STAGING_ID)}
              disabled={approved}
              onChange={() => !approved && toggleRow(r.STAGING_ID)}
            />
          </td>
          <td className="px-4 py-2.5">
            {/* Status badge */}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[r.STATUS] || STATUS_STYLES.PENDING}`}>
              {r.STATUS || "PENDING"}
            </span>
          </td>
          <td className="px-4 py-2.5 whitespace-nowrap font-medium text-gray-900">
            {r.TXN_DATE ? new Date(r.TXN_DATE).toLocaleDateString("en-GB") : "—"}
          </td>
          <td className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${Number(r.AMOUNT) < 0 ? "text-red-600" : "text-emerald-600"}`}>
            {fmtAmount(r.AMOUNT)}
          </td>
          <td className="px-4 py-2.5 max-w-[260px] text-gray-700 text-xs">{r.DESCRIPTION}</td>
          <td className="px-4 py-2.5">
            <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${CATEGORY_STYLES[cat]}`}>{cat}</span>
          </td>
          {/* Project dropdown */}
          <td className="px-4 py-2.5 min-w-[160px]">
            <Select value={r.P_ID ? String(r.P_ID) : ""} onValueChange={(v) => !approved && handleProjectChange(r, v)} disabled={approved}>
              <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Project">{r.PROJECT_NAME || "Select project"}</SelectValue></SelectTrigger>
              <SelectContent>{projectOptions.map((p) => <SelectItem key={p.P_ID} value={String(p.P_ID)}>{p.P_NAME}</SelectItem>)}</SelectContent>
            </Select>
          </td>
          <td className="px-4 py-2.5 max-w-[160px] text-xs text-gray-700">
            {r.MATCHED_ADDRESS ? <span className="text-blue-700 font-medium">{r.MATCHED_ADDRESS}</span> : <span className="text-gray-400 italic">—</span>}
          </td>
          {/* Contractor dropdown */}
          <td className="px-4 py-2.5 min-w-[160px]">
            <Select value={r.CONTRACTOR_ID ? String(r.CONTRACTOR_ID) : ""} onValueChange={(v) => !approved && handleContractorChange(r, v)} disabled={approved}>
              <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Contractor">{r.CONTRACTOR_NAME || "Select contractor"}</SelectValue></SelectTrigger>
              <SelectContent>{contractorOptions.map((c) => <SelectItem key={c.CONTRATOR_ID} value={String(c.CONTRATOR_ID)}>{c.CONTRATOR_NAME}</SelectItem>)}</SelectContent>
            </Select>
          </td>
          <td className="px-4 py-2.5 min-w-[110px]">
            <Input defaultValue={r.INVOICE_NO || ""} placeholder="Inv no." className="h-7 text-xs"
              disabled={approved} onBlur={(e) => !approved && handleInvoiceNoBlur(r, e.target.value)} />
          </td>
          <td className="px-4 py-2.5 min-w-[130px]">
            <Input defaultValue={r.REMARKS || ""} placeholder="Remarks" className="h-7 text-xs"
              disabled={approved} onBlur={(e) => !approved && handleRemarksBlur(r, e.target.value)} />
          </td>
          <td className="px-4 py-2.5 min-w-[130px]">
            {r.INVOICE_FILE_NAME ? (
              <a href={`${url}/api/statement/staging/${r.STAGING_ID}/invoice`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium truncate max-w-[120px]" title={r.INVOICE_FILE_NAME}>
                <ExternalLink size={12} className="shrink-0" />{r.INVOICE_FILE_NAME}
              </a>
            ) : approved ? (
              <span className="text-gray-400 italic text-xs">—</span>
            ) : (
              <label className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 cursor-pointer">
                <Paperclip size={12} /> Attach
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden"
                  onChange={(e) => handleInvoiceFileSelect(r, e.target.files)} />
              </label>
            )}
          </td>
        </tr>
      );
    });
  };

  // ── Staging table header ─────────────────────────────────────────────────
  const StagingThead = ({ rows: visibleRows }) => (
    <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
      <tr>
        <th className="px-3 py-3">
          <input type="checkbox" className="accent-blue-600 w-4 h-4"
            checked={visibleRows.filter(r => r.STATUS === "PENDING").length > 0 &&
              visibleRows.filter(r => r.STATUS === "PENDING").every((r) => selectedIds.includes(r.STAGING_ID))}
            onChange={() => toggleSelectAllVisible(visibleRows)} />
        </th>
        <th className="px-4 py-3 text-left">Status</th>
        <th className="px-4 py-3 text-left">Date</th>
        <th className="px-4 py-3 text-right">Amount</th>
        <th className="px-4 py-3 text-left">Description</th>
        <th className="px-4 py-3 text-left">Category</th>
        <th className="px-4 py-3 text-left">Project</th>
        <th className="px-4 py-3 text-left">Matched Address</th>
        <th className="px-4 py-3 text-left">Contractor</th>
        <th className="px-4 py-3 text-left">Invoice No</th>
        <th className="px-4 py-3 text-left">Remarks</th>
        <th className="px-4 py-3 text-left">Invoice File</th>
      </tr>
    </thead>
  );

  // ── Tab components ───────────────────────────────────────────────────────
  const MainTabBtn = ({ id, label }) => (
    <button onClick={() => setMainTab(id)}
      className={`px-6 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
        mainTab === id ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-gray-500 hover:text-gray-700 bg-gray-50"
      }`}>
      {label}
    </button>
  );

  const SubTabBtn = ({ id, label }) => (
    <button onClick={() => setSubTab(id)}
      className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
        subTab === id ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      }`}>
      {label}
    </button>
  );

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

        {/* ── MAIN TABS ── */}
        <div className="flex border-b mb-6">
          <MainTabBtn id="pending"  label="Pending Uploads" />
          <MainTabBtn id="approved" label="Approved Records" />
        </div>

        {/* ════════════════════════════════════════════
            MAIN TAB 1 — PENDING UPLOADS
        ════════════════════════════════════════════ */}
        {mainTab === "pending" && (
          <>
            {/* Sub-tabs */}
            <div className="flex items-center gap-2 mb-5">
              <SubTabBtn id="banking"    label="Banking (from CSV)" />
              <SubTabBtn id="nonbanking" label="Non-banking (manual form)" />
            </div>

            {/* ── SUB-TAB: BANKING ── */}
            {subTab === "banking" && (
              <>
                {/* CSV upload row */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <div className="flex items-center gap-3 bg-white border rounded-full px-4 py-1.5 shadow-sm">
                    <label htmlFor="statement-csv-input" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                      <Upload size={16} className="text-blue-600" /> Choose CSV
                    </label>
                    <span className="text-xs text-gray-500 max-w-[180px] truncate">{file ? file.name : "No file selected"}</span>
                    <input id="statement-csv-input" type="file" accept=".csv" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
                  </div>
                  <Button onClick={handleLoad} disabled={uploadMutation.isPending} className="rounded-full bg-emerald-600 hover:bg-emerald-700">
                    {uploadMutation.isPending ? "Loading..." : "Load"}
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="rounded-full">
                    <RotateCcw size={14} className="mr-1" /> Reset
                  </Button>
                </div>

                {batchId ? (
                  <>
                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-6 bg-white border rounded-2xl shadow-sm px-6 py-4 mb-5">
                      <div className="text-sm text-gray-600">
                        <strong className="text-gray-900 text-base font-semibold mr-1">{rows.length}</strong> rows
                      </div>
                      {Object.entries(stats).map(([cat, count]) => (
                        <div key={cat} className="flex items-center gap-1.5 text-sm text-gray-600">
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${CATEGORY_STYLES[cat]}`}>{cat}</span>
                          <strong className="text-gray-900">{count}</strong>
                        </div>
                      ))}
                    </div>

                    {/* Filters + Actions */}
                    <div className="flex flex-wrap items-center gap-4 bg-white border rounded-2xl shadow-sm px-6 py-3 mb-5">
                      <div className="flex flex-wrap items-center gap-4">
                        {["address", "place", "product", "other"].map((cat) => (
                          <label key={cat} className="flex items-center gap-1.5 text-sm font-medium text-gray-700 cursor-pointer capitalize">
                            <input type="checkbox" checked={activeCats[cat]} onChange={() => toggleCategory(cat)} className="accent-blue-600 w-4 h-4" />
                            {cat}
                          </label>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <Search size={14} className="text-gray-400" />
                        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 text-sm rounded-full min-w-[200px]" />
                        <span className="text-xs text-gray-500 whitespace-nowrap">{filteredRows.length} shown</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleDownloadCsv(filteredRows, "statement_banking.csv")} variant="outline" className="rounded-full text-sm">
                          <Download size={14} className="mr-1" /> CSV
                        </Button>
                        <Button onClick={handleApprove} disabled={approveMutation.isPending || selectedIds.length === 0}
                          className="rounded-full bg-violet-600 hover:bg-violet-700 text-sm">
                          <CheckCircle2 size={14} className="mr-1" />
                          {approveMutation.isPending ? "Approving..." : `Approve${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
                        </Button>
                      </div>
                    </div>

                    {/* Banking Table */}
                    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[1600px]">
                          <StagingThead rows={filteredRows} />
                          <tbody>{renderStagingRows(filteredRows, rowsLoading)}</tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 text-gray-400">
                    <FileSpreadsheet size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>Choose a CSV file and click Load to get started.</p>
                  </div>
                )}
              </>
            )}

            {/* ── SUB-TAB: NON-BANKING ── */}
            {subTab === "nonbanking" && (
              <>
                {/* Manual entry form */}
                <div className="bg-white border rounded-2xl shadow-sm px-6 py-5 mb-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <PlusCircle size={15} className="text-blue-600" /> Add Entry
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Date *</label>
                      <Input type="date" value={nbForm.txnDate} onChange={(e) => setNbForm((p) => ({ ...p, txnDate: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Amount *</label>
                      <Input type="number" step="0.01" placeholder="e.g. -1500" value={nbForm.amount}
                        onChange={(e) => setNbForm((p) => ({ ...p, amount: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Description *</label>
                      <Input placeholder="Description" value={nbForm.description}
                        onChange={(e) => setNbForm((p) => ({ ...p, description: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Project</label>
                      <Select value={nbForm.pId} onValueChange={(v) => setNbForm((p) => ({ ...p, pId: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select project" /></SelectTrigger>
                        <SelectContent>{projectOptions.map((p) => <SelectItem key={p.P_ID} value={String(p.P_ID)}>{p.P_NAME}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Contractor</label>
                      <Select value={nbForm.contractorId} onValueChange={(v) => setNbForm((p) => ({ ...p, contractorId: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select contractor" /></SelectTrigger>
                        <SelectContent>{contractorOptions.map((c) => <SelectItem key={c.CONTRATOR_ID} value={String(c.CONTRATOR_ID)}>{c.CONTRATOR_NAME}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Invoice No</label>
                      <Input placeholder="Invoice no." value={nbForm.invoiceNo}
                        onChange={(e) => setNbForm((p) => ({ ...p, invoiceNo: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Remarks</label>
                      <Input placeholder="Remarks" value={nbForm.remarks}
                        onChange={(e) => setNbForm((p) => ({ ...p, remarks: e.target.value }))} className="h-8 text-xs" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={handleNbSubmit} disabled={addNonBankingMutation.isPending} className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-sm">
                      <PlusCircle size={14} className="mr-1" />
                      {addNonBankingMutation.isPending ? "Adding..." : "Add to Staging"}
                    </Button>
                    <Button variant="outline" onClick={() => setNbForm(EMPTY_NB)} className="rounded-full text-sm">
                      <RotateCcw size={13} className="mr-1" /> Clear
                    </Button>
                  </div>
                </div>

                {/* Non-banking pending table */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Search size={14} className="text-gray-400" />
                    <Input placeholder="Search..." value={nbSearch} onChange={(e) => setNbSearch(e.target.value)} className="h-8 text-sm rounded-full min-w-[220px]" />
                    <span className="text-xs text-gray-500">{filteredNb.length} shown</span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button onClick={() => handleDownloadCsv(filteredNb, "statement_nonbanking.csv")} variant="outline" className="rounded-full text-sm">
                      <Download size={14} className="mr-1" /> CSV
                    </Button>
                    <Button onClick={handleApprove} disabled={approveMutation.isPending || selectedIds.length === 0}
                      className="rounded-full bg-violet-600 hover:bg-violet-700 text-sm">
                      <CheckCircle2 size={14} className="mr-1" />
                      {approveMutation.isPending ? "Approving..." : `Approve${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
                    </Button>
                  </div>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1600px]">
                      <StagingThead rows={filteredNb} />
                      <tbody>{renderStagingRows(filteredNb, nbLoading)}</tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════
            MAIN TAB 2 — APPROVED RECORDS
        ════════════════════════════════════════════ */}
        {mainTab === "approved" && (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex items-center gap-2">
                <Search size={14} className="text-gray-400" />
                <Input placeholder="Search description, project, contractor, invoice..."
                  value={approvedSearch} onChange={(e) => setApprovedSearch(e.target.value)}
                  className="h-8 text-sm rounded-full min-w-[280px]" />
                <span className="text-xs text-gray-500 whitespace-nowrap">{filteredApproved.length} shown</span>
              </div>
              <Button onClick={() => handleDownloadCsv(filteredApproved, "statement_approved.csv")}
                variant="outline" className="rounded-full text-sm ml-auto">
                <Download size={14} className="mr-1" /> Download CSV
              </Button>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1300px]">
                  <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Source</th>
                      <th className="px-4 py-3 text-left">Project</th>
                      <th className="px-4 py-3 text-left">Matched Address</th>
                      <th className="px-4 py-3 text-left">Contractor</th>
                      <th className="px-4 py-3 text-left">Invoice No</th>
                      <th className="px-4 py-3 text-left">Remarks</th>
                      <th className="px-4 py-3 text-left">Approved Date</th>
                      <th className="px-4 py-3 text-left">Invoice File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedLoading ? (
                      <tr><td colSpan={12} className="text-center py-10 text-gray-400">Loading...</td></tr>
                    ) : filteredApproved.length === 0 ? (
                      <tr><td colSpan={12} className="text-center py-10 text-gray-400">No approved transactions yet.</td></tr>
                    ) : (
                      filteredApproved.map((r) => {
                        const cat = (r.CATEGORY || "other").toLowerCase();
                        return (
                          <tr key={r.TXN_ID} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-2.5 whitespace-nowrap font-medium text-gray-900">
                              {r.TXN_DATE ? new Date(r.TXN_DATE).toLocaleDateString("en-GB") : "—"}
                            </td>
                            <td className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${Number(r.AMOUNT) < 0 ? "text-red-600" : "text-emerald-600"}`}>
                              {fmtAmount(r.AMOUNT)}
                            </td>
                            <td className="px-4 py-2.5 max-w-[260px] text-gray-700 text-xs">{r.DESCRIPTION}</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${CATEGORY_STYLES[cat] || CATEGORY_STYLES.other}`}>{cat}</span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.SOURCE_TYPE === "NON_BANKING" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                                {r.SOURCE_TYPE === "NON_BANKING" ? "Non-Banking" : "Banking"}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-gray-700 text-xs">{r.PROJECT_NAME || <span className="text-gray-400 italic">—</span>}</td>
                            <td className="px-4 py-2.5 max-w-[160px] text-xs">
                              {r.MATCHED_ADDRESS ? <span className="text-blue-700 font-medium">{r.MATCHED_ADDRESS}</span> : <span className="text-gray-400 italic">—</span>}
                            </td>
                            <td className="px-4 py-2.5 text-gray-700 text-xs">{r.CONTRACTOR_NAME || <span className="text-gray-400 italic">—</span>}</td>
                            <td className="px-4 py-2.5 text-gray-700 text-xs">{r.INVOICE_NO || <span className="text-gray-400 italic">—</span>}</td>
                            <td className="px-4 py-2.5 text-gray-700 text-xs">{r.REMARKS || <span className="text-gray-400 italic">—</span>}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-gray-500 text-xs">
                              {r.APPROVED_DATE ? new Date(r.APPROVED_DATE).toLocaleDateString("en-GB") : "—"}
                            </td>
                            <td className="px-4 py-2.5 min-w-[130px]">
                              {r.INVOICE_FILE_NAME ? (
                                <a href={`${url}/api/statement/main/${r.TXN_ID}/invoice`} target="_blank" rel="noreferrer"
                                  download={r.INVOICE_FILE_NAME}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium truncate max-w-[120px]"
                                  title={r.INVOICE_FILE_NAME}>
                                  <ExternalLink size={12} className="shrink-0" />{r.INVOICE_FILE_NAME}
                                </a>
                              ) : (
                                <span className="text-gray-400 italic text-xs">—</span>
                              )}
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

      </div>
    </SectionContainer>
  );
};

export default StatementUpload;