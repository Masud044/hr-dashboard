import React, { useState, useMemo, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload, RotateCcw, Download, CheckCircle2, ArrowLeft,
  FileSpreadsheet, Paperclip, ExternalLink, PlusCircle,
  Trash2, X, Filter, Loader2, Inbox, BadgeCheck,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  invoiceNo: "", amountMin: "", amountMax: "", description: "", category: "",
};

const PAGE_SIZE = 50;
const fmtDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const DateInput = ({ value, onChange }) => {
  const dayRef   = useRef(null);
  const monthRef = useRef(null);
  const yearRef  = useRef(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const initial = useMemo(() => {
    if (!value) return { d: "", m: "", y: "" };
    const dt = parse(value, "yyyy-MM-dd", new Date());
    if (!isValid(dt)) return { d: "", m: "", y: "" };
    return { d: format(dt, "dd"), m: format(dt, "MM"), y: format(dt, "yyyy") };
  }, [value]);

  const [d, setD] = useState(initial.d);
  const [m, setM] = useState(initial.m);
  const [y, setY] = useState(initial.y);

  useEffect(() => { setD(initial.d); setM(initial.m); setY(initial.y); }, [initial.d, initial.m, initial.y]);

  const emit = (dd, mm, yy) => {
    if (dd.length === 2 && mm.length === 2 && yy.length === 4) {
      const parsed = parse(`${dd}/${mm}/${yy}`, "dd/MM/yyyy", new Date());
      if (isValid(parsed)) { onChange(format(parsed, "yyyy-MM-dd")); return; }
    }
    onChange("");
  };

  const handleD = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setD(v); emit(v, m, y);
    if (v.length === 2) monthRef.current?.focus();
  };
  const handleM = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setM(v); emit(d, v, y);
    if (v.length === 2) yearRef.current?.focus();
  };
  const handleY = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setY(v); emit(d, m, v);
  };

  const handleCalendarSelect = (date) => {
    if (!date) return;
    const dd = format(date, "dd");
    const mm = format(date, "MM");
    const yy = format(date, "yyyy");
    setD(dd); setM(mm); setY(yy);
    onChange(format(date, "yyyy-MM-dd"));
    setCalendarOpen(false);
  };

  const selectedDate = useMemo(() => {
    if (!(d.length === 2 && m.length === 2 && y.length === 4)) return undefined;
    const parsed = parse(`${d}/${m}/${y}`, "dd/MM/yyyy", new Date());
    return isValid(parsed) ? parsed : undefined;
  }, [d, m, y]);

  return (
    <div className="flex items-center gap-1 h-8 px-2 rounded-md border border-input bg-white focus-within:ring-1 focus-within:ring-blue-500">
      <input ref={dayRef} value={d} onChange={handleD} placeholder="dd" maxLength={2}
        inputMode="numeric" className="w-5  text-xs outline-none ring-0 text-center" />
      <span className="text-gray-300 text-xs">/</span>
      <input ref={monthRef} value={m} onChange={handleM} placeholder="mm" maxLength={2}
        inputMode="numeric" className="w-5 text-xs outline-none ring-0 text-center" />
      <span className="text-gray-300 text-xs">/</span>
      <input ref={yearRef} value={y} onChange={handleY} placeholder="yyyy" maxLength={4}
        inputMode="numeric" className="w-9 text-xs outline-none ring-0 text-center" />

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="ml-auto shrink-0" aria-label="Open calendar">
            <CalendarIcon size={13} className="text-gray-400 hover:text-blue-600" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const FilterBar = ({ filters, appliedFilters, onChange, onClear, onSearch, projectOptions, contractorOptions, showStatus, showCategory }) => {
  const hasActive = Object.values(filters).some((v) => v);
  const hasPendingChanges = JSON.stringify(filters) !== JSON.stringify(appliedFilters);
  return (
    <div className="bg-white border rounded-2xl shadow-sm px-5 py-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter size={14} className="text-gray-400" />
        <span className="text-xs font-semibold text-gray-600 uppercase">Filters</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
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
          <label className="text-[10px] text-gray-400 block mb-0.5">Amount Min</label>
          <Input type="number" step="1" placeholder="Min" value={filters.amountMin} onChange={(e) => onChange("amountMin", e.target.value)} className="h-8 text-xs" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">Amount Max</label>
          <Input type="number" step="1" placeholder="Max" value={filters.amountMax} onChange={(e) => onChange("amountMax", e.target.value)} className="h-8 text-xs" />
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

        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5 invisible">Actions</label>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onSearch}
              disabled={!hasPendingChanges}
              className="h-8 flex-1 rounded-md bg-blue-600 hover:bg-blue-700 text-xs disabled:opacity-40"
            >
              <Search size={12} className="mr-1" /> Search
            </Button>
            {hasActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={onClear}
                className="h-8 px-2.5 rounded-md text-xs"
              >
                Reset
                <X size={12} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ page, totalRows, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  if (totalRows === 0) return null;

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalRows);

  const goTo = (p) => onPageChange(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="flex items-center justify-between px-2 py-3 text-xs text-gray-500">
      <span>Showing {from}–{to} of {totalRows}</span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={page <= 1} onClick={() => goTo(page - 1)}>
          Prev
        </Button>
        <span className="px-2">{page} / {totalPages}</span>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={page >= totalPages} onClick={() => goTo(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
};

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

const StatementUploadTwo = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [mainTab, setMainTab] = useState("pending");
  const [subTab, setSubTab]   = useState("banking");

  const [file, setFile]       = useState(null);
  const [batchId, setBatchId] = useState(null);
  const [activeCats, setActiveCats] = useState({ address: true, place: true, product: true, other: true });
  const [nbForm, setNbForm]   = useState(EMPTY_NB);

  const [bankFilters, setBankFilters]         = useState(EMPTY_FILTERS);
  const [nbFilters, setNbFilters]             = useState(EMPTY_FILTERS);
  const [approvedFilters, setApprovedFilters] = useState(EMPTY_FILTERS);
  const [appliedBankFilters, setAppliedBankFilters]         = useState(EMPTY_FILTERS);
  const [appliedNbFilters, setAppliedNbFilters]             = useState(EMPTY_FILTERS);
  const [appliedApprovedFilters, setAppliedApprovedFilters] = useState(EMPTY_FILTERS);

  const [bankPage, setBankPage]         = useState(1);
  const [nbPage, setNbPage]             = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);

  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [approvingRowId, setApprovingRowId] = useState(null);
  
  // ── NEW: State for Disapprove Target ──
  const [disapproveTarget, setDisapproveTarget] = useState(null);

  const updateBankFilter     = (key, value) => setBankFilters((p) => ({ ...p, [key]: value }));
  const updateNbFilter       = (key, value) => setNbFilters((p) => ({ ...p, [key]: value }));
  const updateApprovedFilter = (key, value) => setApprovedFilters((p) => ({ ...p, [key]: value }));

  const handleBankSearch     = () => { setAppliedBankFilters(bankFilters); setBankPage(1); };
  const handleNbSearch       = () => { setAppliedNbFilters(nbFilters); setNbPage(1); };
  const handleApprovedSearch = () => { setAppliedApprovedFilters(approvedFilters); setApprovedPage(1); };

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

  const uploadMutation = useMutation({
    mutationFn: async (f) => {
      const fd = new FormData();
      fd.append("file", f);
      return axios.post(`${url}/api/statement/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: async (res) => {
      const newBatchId = res.data?.batchId;
      setBatchId(newBatchId);
      setFile(null);
      toast.success(res.data?.message || "CSV processed!");
      await queryClient.invalidateQueries({ queryKey: ["statementStagingAll"], refetchType: "active" });
      await queryClient.invalidateQueries({ queryKey: ["statementStaging"], refetchType: "active" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to process CSV."),
  });

  const bankQueryParams = useMemo(() => ({ sourceType: "BANKING", ...appliedBankFilters }), [appliedBankFilters]);
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

  const nbQueryParams = useMemo(() => ({ sourceType: "NON_BANKING", ...appliedNbFilters }), [appliedNbFilters]);
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

  const approvedQueryParams = useMemo(() => ({ ...appliedApprovedFilters }), [appliedApprovedFilters]);
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

  const { data: projectOptions = [] } = useQuery({
    queryKey: ["statementProjects"],
    queryFn: async () => (await axios.get(`${url}/api/statement/projects`)).data?.data || [],
  });

  const { data: contractorOptions = [] } = useQuery({
    queryKey: ["statementContractors"],
    queryFn: async () => (await axios.get(`${url}/api/statement/contractors`)).data?.data || [],
  });

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
    mutationFn: async (stagingId) => axios.post(`${url}/api/statement/approve`, { stagingIds: [stagingId] }),
    onMutate: (stagingId) => setApprovingRowId(stagingId),
    onSuccess: (res) => {
      toast.success(res.data?.message || "Row approved!");
      setApproveTarget(null);
      invalidateStaging();
      queryClient.invalidateQueries({ queryKey: ["statementMain"], refetchType: "active" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to approve row."),
    onSettled: () => setApprovingRowId(null),
  });

  // ── NEW: Disapprove Mutation ──
  const disapproveMutation = useMutation({
    mutationFn: async (txnId) => axios.post(`${url}/api/statement/disapprove`, { txnId }),
    onSuccess: (res) => {
      toast.success(res.data?.message || "Transaction disapproved and moved back to staging.");
      setDisapproveTarget(null);
      queryClient.invalidateQueries({ queryKey: ["statementMain"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["statementStagingAll"], refetchType: "active" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to disapprove transaction."),
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

  const handleReset = () => { setFile(null); setBatchId(null); };

  const toggleCategory = (cat) => { setActiveCats((prev) => ({ ...prev, [cat]: !prev[cat] })); setBankPage(1); };

  const handleApproveClick = (row) => setApproveTarget(row);
  const confirmApprove = () => { if (approveTarget) approveMutation.mutate(approveTarget.STAGING_ID); };

  const handleNbSubmit = () => {
    if (!nbForm.txnDate || !nbForm.amount) {
      toast.error("Date and Amount  are required.");
      return;
    }
    const proj = projectOptions.find((p) => String(p.P_ID) === String(nbForm.pId));
    const cont = contractorOptions.find((c) => String(c.CONTRATOR_ID) === String(nbForm.contractorId));
    addNonBankingMutation.mutate({
      ...nbForm,
      pId:            nbForm.pId || null,
      contractorId:   nbForm.contractorId || null,
      projectName:    proj?.P_NAME    || null,
      contractorName: cont?.CONTRATOR_NAME || null,
    });
  };

  const stats = useMemo(() => {
    const s = { address: 0, place: 0, product: 0, other: 0 };
    rows.forEach((r) => { const c = (r.CATEGORY || "other").toLowerCase(); if (s[c] !== undefined) s[c]++; });
    return s;
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => activeCats[(r.CATEGORY || "other").toLowerCase()]);
  }, [rows, activeCats]);

  const bankPageRows     = useMemo(() => filteredRows.slice((bankPage - 1) * PAGE_SIZE, bankPage * PAGE_SIZE), [filteredRows, bankPage]);
  const nbPageRows       = useMemo(() => nbRows.slice((nbPage - 1) * PAGE_SIZE, nbPage * PAGE_SIZE), [nbRows, nbPage]);
  const approvedPageRows = useMemo(() => approvedRows.slice((approvedPage - 1) * PAGE_SIZE, approvedPage * PAGE_SIZE), [approvedRows, approvedPage]);

  const fmtAmount = (amt) => {
    const n = Number(amt) || 0;
    const f = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n < 0 ? `-$${f}` : `$${f}`;
  };

  const handleDownloadCsv = (dataRows, filename) => {
    if (dataRows.length === 0) { toast.error("No rows to download."); return; }
    const headers = ["Date", "Amount", "Debit", "Credit", "Description", "Category", "Project", "Contractor", "Invoice No", "Source", "Remarks", "Status"];
    const csvRows = dataRows.map((r) => [
      fmtDate(r.TXN_DATE),
      r.AMOUNT,
      r.DEBIT ?? "",
      r.CREDIT ?? "",
      `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
      r.CATEGORY,
      `"${(r.PROJECT_NAME || "").replace(/"/g, '""')}"`,
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

  const renderStagingRows = (dataRows, loading) => {
    if (loading) return <tr><td colSpan={11} className="text-center py-10 text-gray-400"><Loader2 className="inline animate-spin mr-2" size={16} />Loading...</td></tr>;
    if (dataRows.length === 0) return <tr><td colSpan={11} className="text-center py-10 text-gray-400">No rows found.</td></tr>;
    return dataRows.map((r) => {
      const cat      = (r.CATEGORY || "other").toLowerCase();
      const approved = r.STATUS === "APPROVED";
      const isApprovingThisRow = approvingRowId === r.STAGING_ID;
      return (
        <tr key={r.STAGING_ID} className={`border-b last:border-0 ${approved ? "bg-green-50 opacity-70" : "hover:bg-gray-50"}`}>
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
          <td className="px-4 py-2.5 min-w-[110px]">
            {!approved ? (
              <Button
                size="sm"
                onClick={() => handleApproveClick(r)}
                disabled={isApprovingThisRow}
                className="h-7 px-2.5 text-xs rounded-full bg-violet-600 hover:bg-violet-700"
              >
                {isApprovingThisRow ? (
                  <><Loader2 size={12} className="mr-1 animate-spin" /> Approving...</>
                ) : (
                  <><CheckCircle2 size={12} className="mr-1" /> Approve</>
                )}
              </Button>
            ) : (
              <span className="text-[10px] text-green-600 font-semibold">Approved</span>
            )}
          </td>
        </tr>
      );
    });
  };

  const StagingThead = () => (
    <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
      <tr>
        <th className="px-4 py-3 text-left">Status</th>
        <th className="px-4 py-3 text-left">Date</th>
        <th className="px-4 py-3 text-right">Amount</th>
        <th className="px-4 py-3 text-left">Description</th>
        <th className="px-4 py-3 text-left">Category</th>
        <th className="px-4 py-3 text-left">Project</th>
        <th className="px-4 py-3 text-left">Contractor</th>
        <th className="px-4 py-3 text-left">Invoice No</th>
        <th className="px-4 py-3 text-left">Remarks</th>
        <th className="px-4 py-3 text-left">Invoice File</th>
        <th className="px-4 py-3 text-left">Action</th>
      </tr>
    </thead>
  );

  return (
    <SectionContainer>
      <div className="p-6 bg-white shadow rounded-lg mt-8">

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

        <div className="flex gap-1 border-b border-gray-200 mb-6">
          <MainTabBtn id="pending"  label="Pending Uploads"  icon={Inbox}      active={mainTab === "pending"}  onClick={setMainTab} />
          <MainTabBtn id="approved" label="Approved Records" icon={BadgeCheck} active={mainTab === "approved"} onClick={setMainTab} />
        </div>

        {mainTab === "pending" && (
          <>
            <div className="flex items-center gap-2 mb-5">
              <SubTabBtn id="banking"    label="Banking (from CSV)"        active={subTab === "banking"}    onClick={setSubTab} />
              <SubTabBtn id="nonbanking" label="Non-banking (manual form)" active={subTab === "nonbanking"} onClick={setSubTab} />
            </div>

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
                  appliedFilters={appliedBankFilters}
                  onChange={updateBankFilter}
                  onSearch={handleBankSearch}
                  onClear={() => { setBankFilters(EMPTY_FILTERS); setAppliedBankFilters(EMPTY_FILTERS); setBankPage(1); }}
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
                  </div>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1400px]">
                      <StagingThead />
                      <tbody>{renderStagingRows(bankPageRows, rowsLoading)}</tbody>
                    </table>
                  </div>
                  <Pagination page={bankPage} totalRows={filteredRows.length} onPageChange={setBankPage} />
                </div>
              </>
            )}

            {subTab === "nonbanking" && (
              <>
                <div className="bg-white border rounded-2xl shadow-sm px-6 py-5 mb-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <PlusCircle size={15} className="text-blue-600" /> Add Entry
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Date *</label>
                      <DateInput value={nbForm.txnDate} onChange={(v) => setNbForm((p) => ({ ...p, txnDate: v }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Type *</label>
                      <Select value={nbForm.entryType} onValueChange={(v) => setNbForm((p) => ({ ...p, entryType: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DEBIT">Receive</SelectItem>
                          <SelectItem value="CREDIT">Payment</SelectItem>
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
                      <Select value={nbForm.pId || "NONE"} onValueChange={(v) => setNbForm((p) => ({ ...p, pId: v === "NONE" ? "" : v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select project" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">None</SelectItem>
                          {projectOptions.map((p) => <SelectItem key={p.P_ID} value={String(p.P_ID)}>{p.P_NAME}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Contractor</label>
                      <Select value={nbForm.contractorId || "NONE"} onValueChange={(v) => setNbForm((p) => ({ ...p, contractorId: v === "NONE" ? "" : v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select contractor" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">None</SelectItem>
                          {contractorOptions.map((c) => <SelectItem key={c.CONTRATOR_ID} value={String(c.CONTRATOR_ID)}>{c.CONTRATOR_NAME}</SelectItem>)}
                        </SelectContent>
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
                  appliedFilters={appliedNbFilters}
                  onChange={updateNbFilter}
                  onSearch={handleNbSearch}
                  onClear={() => { setNbFilters(EMPTY_FILTERS); setAppliedNbFilters(EMPTY_FILTERS); setNbPage(1); }}
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
                  </div>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1400px]">
                      <StagingThead />
                      <tbody>{renderStagingRows(nbPageRows, nbLoading)}</tbody>
                    </table>
                  </div>
                  <Pagination page={nbPage} totalRows={nbRows.length} onPageChange={setNbPage} />
                </div>
              </>
            )}
          </>
        )}

        {mainTab === "approved" && (
          <>
           <FilterBar
              filters={approvedFilters}
              appliedFilters={appliedApprovedFilters}
              onChange={updateApprovedFilter}
              onSearch={handleApprovedSearch}
              onClear={() => { setApprovedFilters(EMPTY_FILTERS); setAppliedApprovedFilters(EMPTY_FILTERS); setApprovedPage(1); }}
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
                <table className="w-full text-sm min-w-[1500px]">
                  <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-right">Receive</th>
                      <th className="px-4 py-3 text-right">Payment</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Source</th>
                      <th className="px-4 py-3 text-left">Project</th>
                      <th className="px-4 py-3 text-left">Contractor</th>
                      <th className="px-4 py-3 text-left">Invoice No</th>
                      <th className="px-4 py-3 text-left">Remarks</th>
                      <th className="px-4 py-3 text-left">Approved Date</th>
                      <th className="px-4 py-3 text-left">Invoice File</th>
                      {/* ── NEW: Action Column Header ── */}
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                      {approvedLoading ? (
                      <tr><td colSpan={14} className="text-center py-10 text-gray-400"><Loader2 className="inline animate-spin mr-2" size={16} />Loading...</td></tr>
                    ) : approvedRows.length === 0 ? (
                      <tr><td colSpan={14} className="text-center py-10 text-gray-400">No approved transactions yet.</td></tr>
                    ) : (
                      approvedPageRows.map((r) => {
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
                            {/* ── NEW: Action Column Cell ── */}
                            <td className="px-4 py-2.5 min-w-[110px]">
                              <Button
                                size="sm"
                                onClick={() => setDisapproveTarget(r)}
                                disabled={!r.STAGING_ID}
                                className="h-7 px-2.5 text-xs rounded-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                                title={!r.STAGING_ID ? "Legacy records cannot be disapproved" : ""}
                              >
                                <RotateCcw size={12} className="mr-1" /> Disapprove
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
               <Pagination page={approvedPage} totalRows={approvedRows.length} onPageChange={setApprovedPage} />
            </div>
          </>
        )}

      </div>

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

      {approveTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => !approveMutation.isPending && setApproveTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="text-violet-600" size={18} />
              <h3 className="text-sm font-semibold text-gray-800">Approve this transaction?</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-600 space-y-1">
              <div><span className="text-gray-400">Date:</span> {fmtDate(approveTarget.TXN_DATE)}</div>
              <div><span className="text-gray-400">Amount:</span> {fmtAmount(approveTarget.AMOUNT)}</div>
              <div className="break-words"><span className="text-gray-400">Description:</span> {approveTarget.DESCRIPTION}</div>
            </div>
            <p className="text-xs text-gray-500 mb-5">Once approved, this row will move to Approved Records.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setApproveTarget(null)} disabled={approveMutation.isPending} className="rounded-full text-sm">
                Cancel
              </Button>
              <Button
                onClick={confirmApprove}
                disabled={approveMutation.isPending}
                className="rounded-full bg-violet-600 hover:bg-violet-700 text-sm"
              >
                {approveMutation.isPending ? "Approving..." : "Approve"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: DISAPPROVE CONFIRMATION MODAL ── */}
      {disapproveTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => !disapproveMutation.isPending && setDisapproveTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="text-red-600" size={18} />
              <h3 className="text-sm font-semibold text-gray-800">Disapprove this transaction?</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-600 space-y-1">
              <div><span className="text-gray-400">Date:</span> {fmtDate(disapproveTarget.TXN_DATE)}</div>
              <div><span className="text-gray-400">Amount:</span> {fmtAmount(disapproveTarget.AMOUNT)}</div>
              <div className="break-words"><span className="text-gray-400">Description:</span> {disapproveTarget.DESCRIPTION}</div>
            </div>
            <p className="text-xs text-gray-500 mb-5">This will move the transaction back to Pending Uploads.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDisapproveTarget(null)} disabled={disapproveMutation.isPending} className="rounded-full text-sm">
                Cancel
              </Button>
              <Button
                onClick={() => disapproveMutation.mutate(disapproveTarget.TXN_ID)}
                disabled={disapproveMutation.isPending || !disapproveTarget.STAGING_ID}
                className="rounded-full bg-red-600 hover:bg-red-700 text-sm"
              >
                {disapproveMutation.isPending ? "Disapproving..." : "Disapprove"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </SectionContainer>
  );
};

export default StatementUploadTwo;