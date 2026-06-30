import React, { useState, useMemo  } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload, RotateCcw, Download, CheckCircle2, ArrowLeft,
  FileSpreadsheet, Paperclip, ExternalLink, PlusCircle,
  Trash2, X, Filter, Loader2, Inbox, BadgeCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";

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

const EMPTY_NB = {
  txnDate: "", amount: "", description: "", entryType: "DEBIT", category: "other",
  pId: "", projectName: "", contractorId: "", contractorName: "",
  invoiceNo: "", remarks: "",
};

const EMPTY_FILTERS = {
  dateFrom: "", dateTo: "", status: "", pId: "", contractorId: "",
  invoiceNo: "", amount: "", description: "", category: "",
};

// ── plain function: table cell-এ date দেখানোর জন্য (Hook নেই) ──
const fmtDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/// ── dd/mm/yyyy দেখায়, কিন্তু click করলে native calendar picker খোলে ──
// ── shadcn Calendar + Popover, display সবসময় dd/MM/yyyy ──
const DateInput = ({ value, onChange, placeholder = "dd/mm/yyyy" }) => {
  // internal value হলো yyyy-mm-dd string (ISO), Calendar-এর জন্য Date object দরকার
  const selectedDate = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const displayText = value && isValid(selectedDate) ? format(selectedDate, "dd/MM/yyyy") : "";

  const handleSelect = (date) => {
    if (!date) { onChange(""); return; }
    onChange(format(date, "yyyy-MM-dd"));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-8 w-full text-xs flex items-center justify-between gap-2 px-3 rounded-md border border-input bg-white text-left hover:bg-gray-50"
        >
          <span className={displayText ? "text-gray-900" : "text-gray-400"}>
            {displayText || placeholder}
          </span>
          <CalendarIcon size={13} className="text-gray-400 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
// ════════════════════════════════════════════════════════════
// FilterBar — component function এর বাইরে define করা, যাতে
// প্রতি parent re-render এ নতুন component instance তৈরি না হয়
// (এটাই ছিল input থেকে cursor হারানোর মূল কারণ)
// ════════════════════════════════════════════════════════════
const FilterBar = ({ filters, onChange, onClear, projectOptions, contractorOptions, showStatus, showCategory }) => {
  const hasActive = Object.values(filters).some((v) => v);
  return (
    <div className="bg-white border rounded-2xl shadow-sm px-5 py-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter size={14} className="text-gray-400" />
        <span className="text-xs font-semibold text-gray-600 uppercase">Filters</span>
        {hasActive && (
          <button onClick={onClear} className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
            <X size={12} /> Clear all
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {/* <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">Date From</label>
          <Input type="date" value={filters.dateFrom} onChange={(e) => onChange("dateFrom", e.target.value)} className="h-8 text-xs" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">Date To</label>
          <Input type="date" value={filters.dateTo} onChange={(e) => onChange("dateTo", e.target.value)} className="h-8 text-xs" />
        </div> */}

        <div>
  <label className="text-[10px] text-gray-400 block mb-0.5">Date From</label>
  <DateInput value={filters.dateFrom} onChange={(v) => onChange("dateFrom", v)} />
</div>
<div>
  <label className="text-[10px] text-gray-400 block mb-0.5">Date To</label>
  <DateInput value={filters.dateTo} onChange={(v) => onChange("dateTo", v)} />
</div>
        {showStatus && (
          <div>
            <label className="text-[10px] text-gray-400 block mb-0.5">Status</label>
            <Select value={filters.status || "ALL"} onValueChange={(v) => onChange("status", v === "ALL" ? "" : v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">Project</label>
          <Select value={filters.pId || "ALL"} onValueChange={(v) => onChange("pId", v === "ALL" ? "" : v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All projects" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All projects</SelectItem>
              {projectOptions.map((p) => <SelectItem key={p.P_ID} value={String(p.P_ID)}>{p.P_NAME}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">Contractor</label>
          <Select value={filters.contractorId || "ALL"} onValueChange={(v) => onChange("contractorId", v === "ALL" ? "" : v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All contractors" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All contractors</SelectItem>
              {contractorOptions.map((c) => <SelectItem key={c.CONTRATOR_ID} value={String(c.CONTRATOR_ID)}>{c.CONTRATOR_NAME}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">Invoice No</label>
          <Input placeholder="Invoice no." value={filters.invoiceNo} onChange={(e) => onChange("invoiceNo", e.target.value)} className="h-8 text-xs" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">Amount</label>
          <Input type="number" step="0.01" placeholder="Exact amount" value={filters.amount} onChange={(e) => onChange("amount", e.target.value)} className="h-8 text-xs" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">Description</label>
          <Input placeholder="Search description" value={filters.description} onChange={(e) => onChange("description", e.target.value)} className="h-8 text-xs" />
        </div>
        {showCategory && (
          <div>
            <label className="text-[10px] text-gray-400 block mb-0.5">Category</label>
            <Select value={filters.category || "ALL"} onValueChange={(v) => onChange("category", v === "ALL" ? "" : v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All categories</SelectItem>
                <SelectItem value="address">Address</SelectItem>
                <SelectItem value="place">Place</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// MainTabBtn / SubTabBtn — component এর বাইরে, distinct design
// ════════════════════════════════════════════════════════════
const MainTabBtn = ({ id, label, icon: Icon, active, onClick, count }) => (
  <button
    onClick={() => onClick(id)}
    className={`relative flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all
      ${active
        ? "text-blue-700 bg-white border-x border-t border-gray-200 rounded-t-xl -mb-px"
        : "text-gray-400 bg-gray-100 hover:bg-gray-50 hover:text-gray-600 border-x border-t border-transparent rounded-t-xl"
      }`}
    style={active ? { boxShadow: "0 -2px 0 0 #2563eb inset" } : {}}
  >
    {Icon && <Icon size={15} className={active ? "text-blue-600" : "text-gray-400"} />}
    {label}
    {count != null && (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"}`}>
        {count}
      </span>
    )}
  </button>
);

const SubTabBtn = ({ id, label, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`px-4 py-2 text-xs font-semibold rounded-full border-2 transition-all ${
      active
        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
    }`}
  >
    {label}
  </button>
);

const StatementUpload = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [mainTab, setMainTab] = useState("pending");
  const [subTab, setSubTab]   = useState("banking");

  const [file, setFile]               = useState(null);
  const [batchId, setBatchId]         = useState(null);
  const [activeCats, setActiveCats]   = useState({ address: true, place: true, product: true, other: true });
  const [selectedIds, setSelectedIds] = useState([]);
  const [nbForm, setNbForm]           = useState(EMPTY_NB);

  const [bankFilters, setBankFilters]         = useState(EMPTY_FILTERS);
  const [nbFilters, setNbFilters]             = useState(EMPTY_FILTERS);
  const [approvedFilters, setApprovedFilters] = useState(EMPTY_FILTERS);

  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── stable onChange handlers per filter group (useState setter ref stable, তাই ঠিক আছে) ──
  const updateBankFilter = (key, value) => setBankFilters((p) => ({ ...p, [key]: value }));
  const updateNbFilter   = (key, value) => setNbFilters((p) => ({ ...p, [key]: value }));
  const updateApprovedFilter = (key, value) => setApprovedFilters((p) => ({ ...p, [key]: value }));

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
    onSuccess: async (res) => {
      const newBatchId = res.data?.batchId;
      setBatchId(newBatchId);
      setSelectedIds([]);
      setFile(null);
      toast.success(res.data?.message || "CSV processed!");
      await queryClient.invalidateQueries({ queryKey: ["statementStagingAll"], refetchType: "active" });
      await queryClient.invalidateQueries({ queryKey: ["statementStaging"], refetchType: "active" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to process CSV."),
  });

  // ── Staging rows: Banking sub-tab ───────────────────────────────────────
  const bankQueryParams = useMemo(() => ({ sourceType: "BANKING", ...bankFilters }), [bankFilters]);
  const { data: rows = [], isLoading: rowsLoading, isFetching: rowsFetching } = useQuery({
    queryKey: ["statementStagingAll", "BANKING", bankQueryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(bankQueryParams).forEach(([k, v]) => { if (v) params.append(k, v); });
      return (await axios.get(`${url}/api/statement/staging/all?${params.toString()}`)).data?.data || [];
    },
    enabled: subTab === "banking" && mainTab === "pending",
    refetchOnWindowFocus: false,
  });

  // ── Non-banking rows ────────────────────────────────────────────────────
  const nbQueryParams = useMemo(() => ({ sourceType: "NON_BANKING", ...nbFilters }), [nbFilters]);
  const { data: nbRows = [], isLoading: nbLoading, isFetching: nbFetching } = useQuery({
    queryKey: ["statementStagingAll", "NON_BANKING", nbQueryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(nbQueryParams).forEach(([k, v]) => { if (v) params.append(k, v); });
      return (await axios.get(`${url}/api/statement/staging/all?${params.toString()}`)).data?.data || [];
    },
    enabled: subTab === "nonbanking" && mainTab === "pending",
    refetchOnWindowFocus: false,
  });

  // ── Approved (Main) rows ────────────────────────────────────────────────
  const approvedQueryParams = useMemo(() => ({ ...approvedFilters }), [approvedFilters]);
  const { data: approvedRows = [], isLoading: approvedLoading, isFetching: approvedFetching } = useQuery({
    queryKey: ["statementMain", approvedQueryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(approvedQueryParams).forEach(([k, v]) => { if (v && k !== "status") params.append(k, v); });
      return (await axios.get(`${url}/api/statement/main?${params.toString()}`)).data?.data || [];
    },
    enabled: mainTab === "approved",
    refetchOnWindowFocus: false,
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
  const invalidateStaging = () => {
    queryClient.invalidateQueries({ queryKey: ["statementStagingAll"], refetchType: "active" });
  };

  const updateRowMutation = useMutation({
    mutationFn: async (payload) => axios.put(`${url}/api/statement/staging/row`, payload),
    onSuccess: invalidateStaging,
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update row."),
  });

  const uploadInvoiceMutation = useMutation({
    mutationFn: async ({ stagingId, file }) => {
      const fd = new FormData();
      fd.append("invoiceFile", file);
      return axios.post(`${url}/api/statement/staging/${stagingId}/invoice`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => { toast.success("Invoice uploaded."); invalidateStaging(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to upload invoice."),
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (stagingId) => axios.delete(`${url}/api/statement/staging/${stagingId}/invoice`),
    onSuccess: () => {
      toast.success("Invoice file deleted.");
      setDeleteTarget(null);
      invalidateStaging();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete invoice."),
  });

  const approveMutation = useMutation({
    mutationFn: async (stagingIds) => axios.post(`${url}/api/statement/approve`, { stagingIds }),
    onSuccess: (res) => {
      toast.success(res.data?.message || "Rows approved!");
      setSelectedIds([]);
      invalidateStaging();
      queryClient.invalidateQueries({ queryKey: ["statementMain"], refetchType: "active" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to approve rows."),
  });

  const addNonBankingMutation = useMutation({
    mutationFn: async (data) => axios.post(`${url}/api/statement/non-banking`, data),
    onSuccess: () => {
      toast.success("Entry added to staging.");
      setNbForm(EMPTY_NB);
      invalidateStaging();
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

  const handleCategoryChange = (row, value) => {
    updateRowMutation.mutate({ stagingId: row.STAGING_ID, category: value });
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

  const handleReset = () => { setFile(null); setBatchId(null); setSelectedIds([]); };

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
    return rows.filter((r) => activeCats[(r.CATEGORY || "other").toLowerCase()]);
  }, [rows, activeCats]);

  const fmtAmount = (amt) => {
    const n = Number(amt) || 0;
    const f = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n < 0 ? `-$${f}` : `$${f}`;
  };

  const handleDownloadCsv = (dataRows, filename) => {
    if (dataRows.length === 0) { toast.error("No rows to download."); return; }
    const headers = ["Date", "Amount", "Debit", "Credit", "Description", "Category", "Project", "Matched Address", "Contractor", "Invoice No", "Source", "Remarks", "Status"];
    const csvRows = dataRows.map((r) => [
      fmtDate(r.TXN_DATE),
      r.AMOUNT,
      r.DEBIT ?? "",
      r.CREDIT ?? "",
      `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
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
  const renderStagingRows = (dataRows, loading) => {
    if (loading) return <tr><td colSpan={12} className="text-center py-10 text-gray-400"><Loader2 className="inline animate-spin mr-2" size={16} />Loading...</td></tr>;
    if (dataRows.length === 0) return <tr><td colSpan={12} className="text-center py-10 text-gray-400">No rows found.</td></tr>;
    return dataRows.map((r) => {
      const cat      = (r.CATEGORY || "other").toLowerCase();
      const approved = r.STATUS === "APPROVED";
      return (
        <tr key={r.STAGING_ID} className={`border-b last:border-0 ${approved ? "bg-green-50 opacity-70" : "hover:bg-gray-50"}`}>
          <td className="px-3 py-2.5">
            <input type="checkbox" className="accent-blue-600 w-4 h-4"
              checked={selectedIds.includes(r.STAGING_ID)} disabled={approved}
              onChange={() => !approved && toggleRow(r.STAGING_ID)} />
          </td>
          <td className="px-4 py-2.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[r.STATUS] || STATUS_STYLES.PENDING}`}>
              {r.STATUS || "PENDING"}
            </span>
          </td>
          <td className="px-4 py-2.5 whitespace-nowrap font-medium text-gray-900">
            {fmtDate(r.TXN_DATE)}
          </td>
          <td className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${Number(r.AMOUNT) < 0 ? "text-red-600" : "text-emerald-600"}`}>
            {fmtAmount(r.AMOUNT)}
          </td>
          <td className="px-4 py-2.5 max-w-[240px] text-gray-700 text-xs break-words">{r.DESCRIPTION}</td>
          <td className="px-4 py-2.5 min-w-[110px]">
            <Select value={cat} onValueChange={(v) => !approved && handleCategoryChange(r, v)} disabled={approved}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue><span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${CATEGORY_STYLES[cat]}`}>{cat}</span></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="address">Address</SelectItem>
                <SelectItem value="place">Place</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </td>
          <td className="px-4 py-2.5 min-w-[150px]">
            <Select value={r.P_ID ? String(r.P_ID) : ""} onValueChange={(v) => !approved && handleProjectChange(r, v)} disabled={approved}>
              <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Project">{r.PROJECT_NAME || "Select project"}</SelectValue></SelectTrigger>
              <SelectContent>{projectOptions.map((p) => <SelectItem key={p.P_ID} value={String(p.P_ID)}>{p.P_NAME}</SelectItem>)}</SelectContent>
            </Select>
          </td>
          <td className="px-4 py-2.5 max-w-[150px] text-xs text-gray-700">
            {r.MATCHED_ADDRESS ? <span className="text-blue-700 font-medium">{r.MATCHED_ADDRESS}</span> : <span className="text-gray-400 italic">—</span>}
          </td>
          <td className="px-4 py-2.5 min-w-[150px]">
            <Select value={r.CONTRACTOR_ID ? String(r.CONTRACTOR_ID) : ""} onValueChange={(v) => !approved && handleContractorChange(r, v)} disabled={approved}>
              <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Contractor">{r.CONTRACTOR_NAME || "Select contractor"}</SelectValue></SelectTrigger>
              <SelectContent>{contractorOptions.map((c) => <SelectItem key={c.CONTRATOR_ID} value={String(c.CONTRATOR_ID)}>{c.CONTRATOR_NAME}</SelectItem>)}</SelectContent>
            </Select>
          </td>
          <td className="px-4 py-2.5 min-w-[100px]">
            <Input defaultValue={r.INVOICE_NO || ""} placeholder="Inv no." className="h-7 text-xs"
              disabled={approved} onBlur={(e) => !approved && handleInvoiceNoBlur(r, e.target.value)} />
          </td>
          <td className="px-4 py-2.5 min-w-[120px]">
            <Input defaultValue={r.REMARKS || ""} placeholder="Remarks" className="h-7 text-xs"
              disabled={approved} onBlur={(e) => !approved && handleRemarksBlur(r, e.target.value)} />
          </td>
          <td className="px-4 py-2.5 min-w-[140px]">
            {r.INVOICE_FILE_NAME ? (
              <div className="flex items-center gap-1.5">
                <a href={`${url}/api/statement/staging/${r.STAGING_ID}/invoice`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium truncate max-w-[90px]" title={r.INVOICE_FILE_NAME}>
                  <ExternalLink size={12} className="shrink-0" />{r.INVOICE_FILE_NAME}
                </a>
                {!approved && (
                  <button onClick={() => setDeleteTarget({ stagingId: r.STAGING_ID, fileName: r.INVOICE_FILE_NAME })}
                    className="text-red-500 hover:text-red-700 shrink-0" title="Delete invoice">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
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

        {/* MAIN TABS — visually distinct active/inactive */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          <MainTabBtn id="pending"  label="Pending Uploads"  icon={Inbox}      active={mainTab === "pending"}  onClick={setMainTab} />
          <MainTabBtn id="approved" label="Approved Records" icon={BadgeCheck} active={mainTab === "approved"} onClick={setMainTab} />
        </div>

        {/* ════════ PENDING ════════ */}
        {mainTab === "pending" && (
          <>
            <div className="flex items-center gap-2 mb-5">
              <SubTabBtn id="banking"    label="Banking (from CSV)"        active={subTab === "banking"}    onClick={setSubTab} />
              <SubTabBtn id="nonbanking" label="Non-banking (manual form)" active={subTab === "nonbanking"} onClick={setSubTab} />
            </div>

            {/* BANKING */}
            {subTab === "banking" && (
              <>
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <div className="flex items-center gap-3 bg-white border rounded-full px-4 py-1.5 shadow-sm">
                    <label htmlFor="statement-csv-input" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                      <Upload size={16} className="text-blue-600" /> Choose CSV
                    </label>
                    <span className="text-xs text-gray-500 max-w-[180px] truncate">{file ? file.name : "No file selected"}</span>
                    <input id="statement-csv-input" type="file" accept=".csv" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
                  </div>
                  <Button onClick={handleLoad} disabled={uploadMutation.isPending} className="rounded-full bg-emerald-600 hover:bg-emerald-700">
                    {uploadMutation.isPending ? <><Loader2 className="animate-spin mr-1" size={14} />Loading...</> : "Load"}
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="rounded-full">
                    <RotateCcw size={14} className="mr-1" /> Reset
                  </Button>
                  {rowsFetching && !rowsLoading && (
                    <span className="text-xs text-blue-500 flex items-center gap-1"><Loader2 className="animate-spin" size={12} /> refreshing...</span>
                  )}
                </div>

                <FilterBar
                  filters={bankFilters}
                  onChange={updateBankFilter}
                  onClear={() => setBankFilters(EMPTY_FILTERS)}
                  projectOptions={projectOptions}
                  contractorOptions={contractorOptions}
                  showCategory
                />

                <div className="flex flex-wrap items-center gap-6 bg-white border rounded-2xl shadow-sm px-6 py-4 mb-5">
                  <div className="text-sm text-gray-600">
                    <strong className="text-gray-900 text-base font-semibold mr-1">{filteredRows.length}</strong> rows
                  </div>
                  {Object.entries(stats).map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-1.5 text-sm text-gray-600">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${CATEGORY_STYLES[cat]}`}>{cat}</span>
                      <strong className="text-gray-900">{count}</strong>
                    </div>
                  ))}
                </div>

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

                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1600px]">
                      <StagingThead rows={filteredRows} />
                      <tbody>{renderStagingRows(filteredRows, rowsLoading)}</tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* NON-BANKING */}
            {subTab === "nonbanking" && (
              <>
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
                      <label className="text-xs text-gray-500 mb-1 block">Type *</label>
                      <Select value={nbForm.entryType} onValueChange={(v) => setNbForm((p) => ({ ...p, entryType: v, amount: "" }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DEBIT">Debit</SelectItem>
                          <SelectItem value="CREDIT">Credit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Amount *</label>
                      <Input type="number" step="0.01" min="0" placeholder="e.g. 1500"
                        value={nbForm.amount}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "" || Number(v) >= 0) setNbForm((p) => ({ ...p, amount: v }));
                        }}
                        className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Category</label>
                      <Select value={nbForm.category} onValueChange={(v) => setNbForm((p) => ({ ...p, category: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="address">Address</SelectItem>
                          <SelectItem value="place">Place</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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

                <FilterBar
                  filters={nbFilters}
                  onChange={updateNbFilter}
                  onClear={() => setNbFilters(EMPTY_FILTERS)}
                  projectOptions={projectOptions}
                  contractorOptions={contractorOptions}
                  showCategory
                />

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="text-xs text-gray-500">{nbRows.length} rows</span>
                  {nbFetching && !nbLoading && (
                    <span className="text-xs text-blue-500 flex items-center gap-1"><Loader2 className="animate-spin" size={12} /> refreshing...</span>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <Button onClick={() => handleDownloadCsv(nbRows, "statement_nonbanking.csv")} variant="outline" className="rounded-full text-sm">
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
                      <StagingThead rows={nbRows} />
                      <tbody>{renderStagingRows(nbRows, nbLoading)}</tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ════════ APPROVED ════════ */}
        {mainTab === "approved" && (
          <>
            <FilterBar
              filters={approvedFilters}
              onChange={updateApprovedFilter}
              onClear={() => setApprovedFilters(EMPTY_FILTERS)}
              projectOptions={projectOptions}
              contractorOptions={contractorOptions}
            />

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-xs text-gray-500">{approvedRows.length} rows</span>
              {approvedFetching && !approvedLoading && (
                <span className="text-xs text-blue-500 flex items-center gap-1"><Loader2 className="animate-spin" size={12} /> refreshing...</span>
              )}
              <Button onClick={() => handleDownloadCsv(approvedRows, "statement_approved.csv")}
                variant="outline" className="rounded-full text-sm ml-auto">
                <Download size={14} className="mr-1" /> Download CSV
              </Button>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1600px]">
                  <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-right">Debit</th>
                      <th className="px-4 py-3 text-right">Credit</th>
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
                      <tr><td colSpan={14} className="text-center py-10 text-gray-400"><Loader2 className="inline animate-spin mr-2" size={16} />Loading...</td></tr>
                    ) : approvedRows.length === 0 ? (
                      <tr><td colSpan={14} className="text-center py-10 text-gray-400">No approved transactions yet.</td></tr>
                    ) : (
                      approvedRows.map((r) => {
                        const cat = (r.CATEGORY || "other").toLowerCase();
                        return (
                          <tr key={r.TXN_ID} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-2.5 whitespace-nowrap font-medium text-gray-900">
                              {fmtDate(r.TXN_DATE)}
                            </td>
                            <td className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${Number(r.AMOUNT) < 0 ? "text-red-600" : "text-emerald-600"}`}>
                              {fmtAmount(r.AMOUNT)}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-red-600 whitespace-nowrap">
                              {r.DEBIT != null ? `$${Number(r.DEBIT).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-emerald-600 whitespace-nowrap">
                              {r.CREDIT != null ? `$${Number(r.CREDIT).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                            </td>
                            <td className="px-4 py-2.5 max-w-[220px] text-gray-700 text-xs break-words">{r.DESCRIPTION}</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${CATEGORY_STYLES[cat] || CATEGORY_STYLES.other}`}>{cat}</span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.SOURCE_TYPE === "NON_BANKING" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                                {r.SOURCE_TYPE === "NON_BANKING" ? "Non-Banking" : "Banking"}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-gray-700 text-xs">{r.PROJECT_NAME || <span className="text-gray-400 italic">—</span>}</td>
                            <td className="px-4 py-2.5 max-w-[150px] text-xs">
                              {r.MATCHED_ADDRESS ? <span className="text-blue-700 font-medium">{r.MATCHED_ADDRESS}</span> : <span className="text-gray-400 italic">—</span>}
                            </td>
                            <td className="px-4 py-2.5 text-gray-700 text-xs">{r.CONTRACTOR_NAME || <span className="text-gray-400 italic">—</span>}</td>
                            <td className="px-4 py-2.5 text-gray-700 text-xs">{r.INVOICE_NO || <span className="text-gray-400 italic">—</span>}</td>
                            <td className="px-4 py-2.5 text-gray-700 text-xs">{r.REMARKS || <span className="text-gray-400 italic">—</span>}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-gray-500 text-xs">
                              {fmtDate(r.APPROVED_DATE)}
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

      {/* ── DELETE INVOICE CONFIRMATION MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="text-red-500" size={18} />
              <h3 className="text-sm font-semibold text-gray-800">Delete Invoice File?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-1">You're about to delete:</p>
            <p className="text-sm font-medium text-gray-900 mb-4 truncate">{deleteTarget.fileName}</p>
            <p className="text-xs text-gray-500 mb-5">You can upload a new file after deleting this one.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-full text-sm">
                Cancel
              </Button>
              <Button
                onClick={() => deleteInvoiceMutation.mutate(deleteTarget.stagingId)}
                disabled={deleteInvoiceMutation.isPending}
                className="rounded-full bg-red-600 hover:bg-red-700 text-sm"
              >
                {deleteInvoiceMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </SectionContainer>
  );
};

export default StatementUpload;