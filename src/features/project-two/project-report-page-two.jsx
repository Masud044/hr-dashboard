// // // // src\features\project-two\project-report-page-two.jsx
// // // import React, { useEffect, useMemo, useRef, useState } from "react";
// // // import { useParams, useNavigate } from "react-router-dom";
// // // import { useQuery } from "@tanstack/react-query";
// // // import axios from "axios";
// // // import {
// // //   flexRender,
// // //   getCoreRowModel,
// // //   getPaginationRowModel,
// // //   getSortedRowModel,
// // //   useReactTable,
// // // } from "@tanstack/react-table";
// // // import {
// // //   Check,
// // //   Download,
// // //   Loader2,
// // //   FileText,
// // //   ArrowUpDown,
// // //   ChevronDown,
// // //   ChevronUp,
// // //   Users,
// // //   LandmarkIcon,
// // //   MoveDownIcon,
// // //   MoveUpIcon,
// // //   List,
// // //   Pencil,
// // // } from "lucide-react";
// // // import { toast } from "react-toastify";

// // // import { Button } from "@/components/ui/button";
// // // import {
// // //   Table,
// // //   TableBody,
// // //   TableCell,
// // //   TableHead,
// // //   TableHeader,
// // //   TableRow,
// // // } from "@/components/ui/table";
// // // import { SectionContainer } from "@/components/SectionContainer";
// // // import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
// // // import InvoiceCell from "@/features/setting/pages/statement-upload-three/invoice/InvoiceCell";
// // // import InvoiceSheet from "@/features/setting/pages/statement-upload-three/invoice/InvoiceSheet";
// // // import WrappedName from "@/components/shared/WrappedName";
// // // import { getAvatarColor, getInitials } from "@/lib/avatar-utils";
// // // import {
// // //   Popover,
// // //   PopoverContent,
// // //   PopoverTrigger,
// // // } from "@/components/ui/popover";

// // // import {
// // //   Tooltip,
// // //   TooltipContent,
// // //   TooltipTrigger,
// // // } from "@/components/ui/tooltip";
// // // import { useHasPermission } from "@/hooks/use-permission";
// // // import { useRowSelectionStore } from "@/hooks/use-row-selection-store";

// // // const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// // // // const CONTRACTOR_ROWS_PREVIEW = 5;

// // // const fmtDate = (val) => {
// // //   if (!val) return "—";
// // //   const d = new Date(val);
// // //   if (isNaN(d.getTime())) return "—";
// // //   return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
// // // };

// // // const fmtAmount = (amt) => {
// // //   if (amt == null) return "—";
// // //   const n = Number(amt) || 0;
// // //   return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// // // };

// // // const fmtHours = (val) => {
// // //   if (val == null) return "—";
// // //   const n = Number(val) || 0;
// // //   return (Math.round(n * 100) / 100).toString();
// // // };

// // // const initials = (name) => (name || "?").trim().charAt(0).toUpperCase();

// // // function SourceBadge({ row }) {
// // //   const isNonBanking = row.SOURCE_TYPE === "NON_BANKING";
// // //   return (
// // //     <div className="flex flex-col items-start">
// // //       <div className="flex flex-col items-center gap-0.5">
// // //         <span
// // //         className={`w-fit whitespace-nowrap text-[10px] font-semibold px-2 py-0.5 rounded-full ${
// // //           isNonBanking
// // //             ? "bg-accent text-accent-foreground"
// // //             : "bg-secondary text-secondary-foreground"
// // //         }`}
// // //       >
// // //         {isNonBanking ? "Non-Banking" : "Banking"}
// // //       </span>
// // //       {isNonBanking && row.PAYMENT_BY === "CUSTOMER" && (
// // //         <span className="whitespace-nowrap text-[9px] font-medium text-amber-600 dark:text-amber-400">
// // //           Customer Paid
// // //         </span>
// // //       )}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // function SortableHeader({ column, children, align = "left" }) {
// // //   return (
// // //     <button
// // //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
// // //       className={`flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-[11px] font-semibold uppercase tracking-wider ${
// // //         align === "right" ? "ml-auto" : ""
// // //       }`}
// // //     >
// // //       {children} <ArrowUpDown className="h-3 w-3" />
// // //     </button>
// // //   );
// // // }

// // // export function ProjectReportPageTwo() {
// // //   const { id: projectId } = useParams();
// // //   const navigate = useNavigate();

// // //   const canEdit = useHasPermission("PROJECT_STATEMENT_EDIT");
// // //   const handleEditNonBanking = (txnId) =>
// // //     navigate(
// // //       `/dashboard/projects/${projectId}/report/non-banking/${txnId}/edit`,
// // //     );

// // //   const [activeTab, setActiveTab] = useState("byContractor"); // "transactions" | "byContractor"
// // //   const [sorting, setSorting] = useState([{ id: "TXN_DATE", desc: true }]);
// // //   // const [expandedContractors, setExpandedContractors] = useState({});
// // //   const workerSectionRef = useRef(null);
// // //   const [showScrollTop, setShowScrollTop] = useState(false);
// // //   const [jumpOpen, setJumpOpen] = useState(false);
// // //   const [jumpSearch, setJumpSearch] = useState("");
// // //   const [activeJumpKey, setActiveJumpKey] = useState(null);

// // //   useEffect(() => {
// // //     const handleScroll = () => {
// // //       setShowScrollTop(window.scrollY > 500);
// // //     };
// // //     window.addEventListener("scroll", handleScroll, { passive: true });
// // //     return () => window.removeEventListener("scroll", handleScroll);
// // //   }, []);

// // //   const scrollToTop = () => {
// // //     window.scrollTo({ top: 0, behavior: "smooth" });
// // //   };

// // //   const scrollToWorkerSection = () => {
// // //     workerSectionRef.current?.scrollIntoView({
// // //       behavior: "smooth",
// // //       block: "start",
// // //     });
// // //   };

// // //   // ── Row selection (one row at a time across the page) ───────────────
// // //   const SELECTION_SCOPE = "project-report";
// // //   const selectedRowKey = useRowSelectionStore(
// // //     (s) => s.selected[SELECTION_SCOPE] ?? null,
// // //   );
// // //   const toggleRow = useRowSelectionStore((s) => s.toggle);

// // //   // Clicks inside interactive children (Edit, Invoice, ...) must not select.
// // //   const isInteractiveTarget = (e) =>
// // //     !!e.target.closest?.(
// // //       "button, a, input, textarea, select, [role='button']",
// // //     );

// // //   const handleRowClick = (rowKey) => (e) => {
// // //     if (isInteractiveTarget(e)) return;
// // //     toggleRow(SELECTION_SCOPE, rowKey);
// // //   };

// // //   const handleRowKeyDown = (rowKey) => (e) => {
// // //     if (e.key !== "Enter" && e.key !== " ") return;
// // //     if (isInteractiveTarget(e)) return;
// // //     e.preventDefault();
// // //     toggleRow(SELECTION_SCOPE, rowKey);
// // //   };

// // //   // Shared row classes for the contractor and worker tables.
// // //   const rowStateClass = (isSelected, idx) =>
// // //     `cursor-pointer border-b border-border last:border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
// // //       isSelected
// // //         ? "bg-selected hover:bg-selected"
// // //         : `hover:bg-accent ${idx % 2 === 1 ? "bg-muted/60" : "bg-transparent"}`
// // //     }`;

// // //   const firstCellClass = (isSelected) =>
// // //     `border-l-4 ${isSelected ? "border-selected-border" : "border-transparent"}`;

// // //   const { data: report, isLoading } = useQuery({
// // //     queryKey: ["projectReport", projectId],
// // //     queryFn: async () =>
// // //       (await axios.get(`${url}/api/statement/project-report/${projectId}`)).data
// // //         ?.data || {
// // //         transactions: [],
// // //         workerLogs: [],
// // //         workerTotals: {},
// // //         marginPercent: null,
// // //       },
// // //     enabled: !!projectId,
// // //   });

// // //   const rows = useMemo(() => report?.transactions || [], [report]);
// // //   const workerLogs = useMemo(() => report?.workerLogs || [], [report]);
// // //   const workerTotals = useMemo(
// // //     () =>
// // //       report?.workerTotals || { totalHours: 0, totalDays: 0, totalAmount: 0 },
// // //     [report],
// // //   );

// // //   const MARGIN_PERCENT =
// // //     report?.marginPercent != null ? Number(report.marginPercent) : 10;

// // //   const projectName =
// // //     rows.length > 0 ? rows[0].P_NAME : `Project #${projectId}`;

// // //   const totals = useMemo(() => {
// // //     const debit = rows.reduce((s, r) => s + (Number(r.DEBIT) || 0), 0);
// // //     const credit = rows.reduce((s, r) => s + (Number(r.CREDIT) || 0), 0);
// // //     const workerCost = Number(workerTotals.totalAmount) || 0;
// // //     return { debit, credit, workerCost, net: debit - credit - workerCost };
// // //   }, [rows, workerTotals]);

// // //   const summary = useMemo(() => {
// // //     const projectExpenses = totals.credit;
// // //     const workerCost = totals.workerCost;
// // //     const buildExpenses = projectExpenses + workerCost;

// // //     const marginableCredit = rows.reduce((s, r) => {
// // //       if (r.EXCLUDE_MARGIN === "Y") return s;
// // //       return s + (Number(r.CREDIT) || 0);
// // //     }, 0);
// // //     const marginBase = marginableCredit + workerCost;

// // //     const builderMargin = marginBase * (MARGIN_PERCENT / 100);
// // //     const gst = builderMargin * 0.1;
// // //     const totalBuilderMargin = builderMargin + gst;

// // //     const finalProjectExpenses = buildExpenses + totalBuilderMargin;

// // //     const customerPaid = rows.reduce((s, r) => {
// // //       if (
// // //         r.SOURCE_TYPE === "NON_BANKING" &&
// // //         r.PAYMENT_BY === "CUSTOMER" &&
// // //         r.CREDIT != null
// // //       ) {
// // //         return s + Number(r.CREDIT);
// // //       }
// // //       return s;
// // //     }, 0);

// // //     const collectionReceived = totals.debit;
// // //     const balance = collectionReceived + customerPaid - finalProjectExpenses;

// // //     return {
// // //       projectExpenses,
// // //       workerCost,
// // //       buildExpenses,
// // //       builderMargin,
// // //       gst,
// // //       totalBuilderMargin,
// // //       finalProjectExpenses,
// // //       collectionReceived,
// // //       customerPaid,
// // //       balance,
// // //     };
// // //   }, [totals, rows, MARGIN_PERCENT]);

// // //   const groupedByContractor = useMemo(() => {
// // //     const map = new Map();

// // //     for (const r of rows) {
// // //       const key = r.CONTRACTOR_ID != null ? r.CONTRACTOR_ID : "none";
// // //       if (!map.has(key)) {
// // //         map.set(key, {
// // //           contractorId: r.CONTRACTOR_ID ?? null,
// // //           contractorName: r.CONTRACTOR_NAME || "No Contractor",
// // //           rows: [],
// // //         });
// // //       }
// // //       map.get(key).rows.push(r);
// // //     }

// // //     return Array.from(map.values()).map((group) => {
// // //       const sortedRows = [...group.rows].sort(
// // //         (a, b) => new Date(a.TXN_DATE) - new Date(b.TXN_DATE),
// // //       );
// // //       const totalReceived = sortedRows.reduce(
// // //         (s, r) => s + (Number(r.DEBIT) || 0),
// // //         0,
// // //       );
// // //       const totalPayment = sortedRows.reduce(
// // //         (s, r) => s + (Number(r.CREDIT) || 0),
// // //         0,
// // //       );
// // //       return {
// // //         ...group,
// // //         rows: sortedRows,
// // //         totalReceived,
// // //         totalPayment,
// // //         net: totalReceived - totalPayment,
// // //       };
// // //     });
// // //   }, [rows]);

// // //   const jumpContractors = useMemo(() => {
// // //     const q = jumpSearch.trim().toLowerCase();
// // //     if (!q) return groupedByContractor;
// // //     return groupedByContractor.filter((group) =>
// // //       group.contractorName.trim().toLowerCase().includes(q),
// // //     );
// // //   }, [groupedByContractor, jumpSearch]);

// // //   // const toggleContractorExpanded = (key) => {
// // //   //   setExpandedContractors((prev) => ({ ...prev, [key]: !prev[key] }));
// // //   // };

// // //   // ── CSV export helpers ──────────────────────────────────────────────
// // //   const buildSummaryCsvRows = () => [
// // //     "Summary",
// // //     `Project Expenses,${summary.projectExpenses}`,
// // //     `Worker Cost,${summary.workerCost}`,
// // //     `Build Expenses,${summary.buildExpenses}`,
// // //     `Builder Margin (${MARGIN_PERCENT}%),${summary.builderMargin}`,
// // //     `GST,${summary.gst}`,
// // //     `Total Builder Margin,${summary.totalBuilderMargin}`,
// // //     `Final Project Expenses,${summary.finalProjectExpenses}`,
// // //     `Collection/Received,${summary.collectionReceived}`,
// // //     `Customer Paid,${summary.customerPaid}`,
// // //     `Balance,${summary.balance}`,
// // //     "",
// // //   ];

// // //   const buildWorkerCsvRows = () => {
// // //     if (workerLogs.length === 0) return [];
// // //     const workerHeaders = [
// // //       "Worker",
// // //       "Date",
// // //       "Basis",
// // //       "Hours",
// // //       "Days",
// // //       "Rate",
// // //       "Amount",
// // //     ];
// // //     const workerRows = workerLogs.map((w) => [
// // //       `"${(w.WORKER_NAME || "").replace(/"/g, '""')}"`,
// // //       fmtDate(w.ATTENDANCE_DATE),
// // //       w.CALC_BASIS || "",
// // //       w.HOURS_WORKED ?? "",
// // //       w.DAYS_WORKED ?? "",
// // //       w.CALC_BASIS === "HOUR"
// // //         ? (w.RATE_PER_HOUR ?? "")
// // //         : (w.RATE_PER_DAY ?? ""),
// // //       w.AMOUNT ?? "MISSING_RATE",
// // //     ]);
// // //     return [
// // //       "",
// // //       "Worker Hours & Costing",
// // //       workerHeaders.join(","),
// // //       ...workerRows.map((r) => r.join(",")),
// // //       `Total Hours,${workerTotals.totalHours}`,
// // //       `Total Days,${workerTotals.totalDays}`,
// // //       `Total Worker Cost,${workerTotals.totalAmount}`,
// // //     ];
// // //   };

// // //   const downloadCsvFile = (csvParts, suffix) => {
// // //     const csv = csvParts.join("\n");
// // //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// // //     const link = document.createElement("a");
// // //     link.href = URL.createObjectURL(blob);
// // //     link.download = `${(projectName || "project").replace(/[^a-z0-9]/gi, "_").replace(/^_+|_+$/g, "")}_${suffix}.csv`;
// // //     link.click();
// // //   };

// // //   const handleDownloadAllCsv = () => {
// // //     if (rows.length === 0 && workerLogs.length === 0) {
// // //       toast.error("No data to download.");
// // //       return;
// // //     }
// // //     const csvParts = [...buildSummaryCsvRows()];

// // //     if (rows.length > 0) {
// // //       const headers = [
// // //         "Contractor",
// // //         "Date",
// // //         "Received",
// // //         "Payment",
// // //         "Description",
// // //         "Category",
// // //         "Matched Address",
// // //         "Invoice No",
// // //         "Source",
// // //         "Remarks",
// // //         "Approved Date",
// // //       ];
// // //       const csvRows = rows.map((r) => [
// // //         `"${(r.CONTRACTOR_NAME || "").replace(/"/g, '""')}"`,
// // //         fmtDate(r.TXN_DATE),
// // //         r.DEBIT ?? "",
// // //         r.CREDIT ?? "",
// // //         `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
// // //         r.CATEGORY || "",
// // //         `"${(r.MATCHED_ADDRESS || "").replace(/"/g, '""')}"`,
// // //         `"${(r.INVOICE_NO || "").replace(/"/g, '""')}"`,
// // //         r.SOURCE_TYPE || "",
// // //         `"${(r.REMARKS || "").replace(/"/g, '""')}"`,
// // //         fmtDate(r.APPROVED_DATE),
// // //       ]);
// // //       csvParts.push(
// // //         "Transactions",
// // //         headers.join(","),
// // //         ...csvRows.map((r) => r.join(",")),
// // //         `Total Received,${totals.debit}`,
// // //         `Total Payment,${totals.credit}`,
// // //         "",
// // //       );
// // //     }

// // //     csvParts.push(...buildWorkerCsvRows());
// // //     downloadCsvFile(csvParts, "report_all");
// // //   };

// // //   const handleDownloadByContractorCsv = () => {
// // //     if (groupedByContractor.length === 0 && workerLogs.length === 0) {
// // //       toast.error("No data to download.");
// // //       return;
// // //     }
// // //     const csvParts = [...buildSummaryCsvRows()];

// // //     groupedByContractor.forEach((group) => {
// // //       const headers = [
// // //         "Date",
// // //         "Received",
// // //         "Payment",
// // //         "Description",
// // //         "Source",
// // //         "Remarks",
// // //         "Approved Date",
// // //       ];
// // //       const csvRows = group.rows.map((r) => [
// // //         fmtDate(r.TXN_DATE),
// // //         r.DEBIT ?? "",
// // //         r.CREDIT ?? "",
// // //         `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
// // //         r.SOURCE_TYPE || "",
// // //         `"${(r.REMARKS || "").replace(/"/g, '""')}"`,
// // //         fmtDate(r.APPROVED_DATE),
// // //       ]);
// // //       csvParts.push(
// // //         `Contractor: ${group.contractorName}`,
// // //         headers.join(","),
// // //         ...csvRows.map((r) => r.join(",")),
// // //         `Total Received,${group.totalReceived}`,
// // //         `Total Payment,${group.totalPayment}`,
// // //         `Net,${group.net}`,
// // //         "",
// // //       );
// // //     });

// // //     csvParts.push(...buildWorkerCsvRows());
// // //     downloadCsvFile(csvParts, "report_by_contractor");
// // //   };

// // //   // ── TanStack Table — Transactions tab ───────────────────────────────
// // //   const columns = useMemo(
// // //     () => [
// // //       {
// // //         accessorKey: "P_NAME",
// // //         header: () => (
// // //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// // //             Project
// // //           </span>
// // //         ),
// // //         cell: ({ row }) => {
// // //           const r = row.original;
// // //           return (
// // //             <div className="flex flex-col gap-0.5 max-w-[180px]">
// // //               {r.P_ID != null && (
// // //                 <span className="w-fit text-[10px] font-semibold text-muted-foreground">
// // //                   ID: {r.P_ID}
// // //                 </span>
// // //               )}
// // //               <WrappedName name={r.P_NAME} maxChars={70} />
// // //             </div>
// // //           );
// // //         },
// // //       },
// // //       {
// // //         accessorKey: "CONTRACTOR_NAME",
// // //         header: () => (
// // //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// // //             Contractor
// // //           </span>
// // //         ),
// // //         cell: ({ getValue }) => (
// // //           <span className="text-sm text-foreground">
// // //             {getValue() || (
// // //               <span className="text-muted-foreground italic">—</span>
// // //             )}
// // //           </span>
// // //         ),
// // //       },
// // //       {
// // //         accessorKey: "TXN_DATE",
// // //         header: ({ column }) => (
// // //           <SortableHeader column={column}>Date</SortableHeader>
// // //         ),
// // //         sortingFn: (a, b) =>
// // //           new Date(a.original.TXN_DATE || 0) -
// // //           new Date(b.original.TXN_DATE || 0),
// // //         cell: ({ getValue }) => (
// // //           <span className="whitespace-nowrap font-medium text-foreground text-sm">
// // //             {fmtDate(getValue())}
// // //           </span>
// // //         ),
// // //       },
// // //       {
// // //         accessorKey: "DEBIT",
// // //         header: ({ column }) => (
// // //           <div className="text-right">
// // //             <SortableHeader column={column} align="right">
// // //               Received
// // //             </SortableHeader>
// // //           </div>
// // //         ),
// // //         cell: ({ getValue }) => {
// // //           const v = getValue();
// // //           return (
// // //             <div className="text-right font-semibold text-[#10B981] whitespace-nowrap text-sm">
// // //               {v != null ? fmtAmount(v) : "—"}
// // //             </div>
// // //           );
// // //         },
// // //       },
// // //       {
// // //         accessorKey: "CREDIT",
// // //         header: ({ column }) => (
// // //           <div className="text-right">
// // //             <SortableHeader column={column} align="right">
// // //               Payment
// // //             </SortableHeader>
// // //           </div>
// // //         ),
// // //         cell: ({ getValue }) => {
// // //           const v = getValue();
// // //           return (
// // //             <div className="text-right font-semibold text-destructive whitespace-nowrap text-sm">
// // //               {v != null ? fmtAmount(v) : "—"}
// // //             </div>
// // //           );
// // //         },
// // //       },
// // //       {
// // //         accessorKey: "DESCRIPTION",
// // //         header: () => (
// // //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// // //             Description
// // //           </span>
// // //         ),
// // //         cell: ({ getValue }) => (
// // //           <div
// // //             title={getValue() || ""}
// // //             className="max-w-[220px] text-foreground text-sm truncate"
// // //           >
// // //             {getValue()}
// // //           </div>
// // //         ),
// // //       },
// // //       {
// // //         accessorKey: "MATCHED_ADDRESS",
// // //         header: () => (
// // //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// // //             Matched Address
// // //           </span>
// // //         ),
// // //         cell: ({ getValue }) => (
// // //           <div className="max-w-[150px]">
// // //             <WrappedName name={getValue()} className="text-primary" />
// // //           </div>
// // //         ),
// // //       },
// // //       {
// // //         accessorKey: "SOURCE_TYPE",
// // //         header: () => (
// // //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// // //             Source
// // //           </span>
// // //         ),
// // //         cell: ({ row }) => <SourceBadge row={row.original} />,
// // //       },
// // //       {
// // //         accessorKey: "REMARKS",
// // //         header: () => (
// // //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// // //             Remarks
// // //           </span>
// // //         ),
// // //         cell: ({ getValue }) => (
// // //           <span className="text-foreground text-sm">
// // //             {getValue() || (
// // //               <span className="text-muted-foreground italic">—</span>
// // //             )}
// // //           </span>
// // //         ),
// // //       },
// // //       {
// // //         accessorKey: "APPROVED_DATE",
// // //         header: ({ column }) => (
// // //           <SortableHeader column={column}>Approved</SortableHeader>
// // //         ),
// // //         sortingFn: (a, b) =>
// // //           new Date(a.original.APPROVED_DATE || 0) -
// // //           new Date(b.original.APPROVED_DATE || 0),
// // //         cell: ({ getValue }) => (
// // //           <span className="whitespace-nowrap text-muted-foreground text-sm">
// // //             {fmtDate(getValue())}
// // //           </span>
// // //         ),
// // //       },
// // //       {
// // //         id: "invoice",
// // //         header: () => (
// // //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// // //             Invoice
// // //           </span>
// // //         ),
// // //         enableSorting: false,
// // //         cell: ({ row }) => (
// // //           <div className="min-w-[160px]">
// // //             <InvoiceCell
// // //               parentType="main"
// // //               parentId={row.original.TXN_ID}
// // //               readOnly
// // //             />
// // //           </div>
// // //         ),
// // //       },
// // //       {
// // //         id: "action",
// // //         header: () => null,
// // //         enableSorting: false,
// // //         cell: ({ row }) => {
// // //           const r = row.original;
// // //           if (r.SOURCE_TYPE !== "NON_BANKING" || !canEdit) return null;
// // //           return (
// // //             <Tooltip>
// // //               <TooltipTrigger asChild>
// // //                 <Button
// // //                   size="icon"
// // //                   variant="ghost"
// // //                   disabled={!canEdit}
// // //                   onClick={() => handleEditNonBanking(r.TXN_ID)}
// // //                   aria-label="Edit"
// // //                   className="h-7 w-7 rounded-full"
// // //                 >
// // //                   <Pencil size={13} />
// // //                 </Button>
// // //               </TooltipTrigger>
// // //               <TooltipContent>Edit</TooltipContent>
// // //             </Tooltip>
// // //           );
// // //         },
// // //       },
// // //     ],
// // //     [canEdit],
// // //   );

// // //   const table = useReactTable({
// // //     data: rows,
// // //     columns,
// // //     onSortingChange: setSorting,
// // //     getCoreRowModel: getCoreRowModel(),
// // //     getSortedRowModel: getSortedRowModel(),
// // //     getPaginationRowModel: getPaginationRowModel(),
// // //     autoResetPageIndex: false,
// // //     state: { sorting },
// // //   });

// // //   const hasData = rows.length > 0 || workerLogs.length > 0;

// // //   return (
// // //     <SectionContainer variant="dashboard">
// // //       <div className="bg-card border border-border rounded-md p-4 md:p-6 shadow-sm">
// // //         {/* ── Page Header ───────────────────────────────────────────── */}
// // //         <div className="mb-6">
// // //           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// // //             <div className="min-w-0">
// // //               <div className="flex items-center gap-2 min-w-0">
// // //                 <FileText size={18} strokeWidth={2} className=" shrink-0" />
// // //                 <h1 className="text-base font-semibold text-foreground truncate">
// // //                   {projectName} — Statement Report
// // //                 </h1>
// // //               </div>
// // //               <p className="text-xs text-muted-foreground mt-0.5">
// // //                 {isLoading ? (
// // //                   "Loading..."
// // //                 ) : (
// // //                   <>
// // //                     Showing {rows.length} transaction
// // //                     {rows.length !== 1 ? "s" : ""} across{" "}
// // //                     {groupedByContractor.length} contractor
// // //                     {groupedByContractor.length !== 1 ? "s" : ""}
// // //                     {" · "}
// // //                     As of{" "}
// // //                     {new Date().toLocaleDateString(undefined, {
// // //                       month: "short",
// // //                       day: "numeric",
// // //                       year: "numeric",
// // //                     })}
// // //                   </>
// // //                 )}
// // //               </p>
// // //             </div>
// // //             <Button
// // //               onClick={
// // //                 activeTab === "transactions"
// // //                   ? handleDownloadAllCsv
// // //                   : handleDownloadByContractorCsv
// // //               }
// // //               size="sm"
// // //               className="text-xs shrink-0"
// // //               disabled={rows.length === 0 && workerLogs.length === 0}
// // //             >
// // //               <Download size={14} className="mr-2" />
// // //               {activeTab === "transactions"
// // //                 ? "Download All CSV"
// // //                 : "Download by Contractor CSV"}
// // //             </Button>
// // //           </div>
// // //           <div className="w-full h-px bg-border mt-4" />
// // //         </div>

// // //         {/* ── Financial Summary Card ───────────────────────────────── */}
// // //         {!isLoading && hasData && (
// // //           <div className="mb-6 border border-border rounded-md overflow-hidden max-w-2xl">
// // //             <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
// // //               <LandmarkIcon size={16} strokeWidth={2} className=" shrink-0" />
// // //               <h2 className="text-sm font-semibold text-foreground">
// // //                 Financial Summary
// // //               </h2>
// // //             </div>

// // //             <div className="grid grid-cols-1 sm:grid-cols-2">
// // //               {/* Left column */}
// // //               <div className="text-sm divide-y divide-border sm:border-r sm:border-border">
// // //                 <div className="flex items-center h-14 justify-between px-4 py-2.5">
// // //                   <span className="text-foreground">Project Expenses</span>
// // //                   <span className="font-semibold text-destructive">
// // //                     {fmtAmount(summary.projectExpenses)}
// // //                   </span>
// // //                 </div>
// // //                 <div className="flex items-center h-14 justify-between px-4 py-2.5">
// // //                   <span className="text-muted-foreground">Worker Cost</span>
// // //                   <span className="text-muted-foreground">
// // //                     {fmtAmount(summary.workerCost)}
// // //                   </span>
// // //                 </div>
// // //                 <div className="flex items-center h-14 justify-between px-4 py-2.5 bg-accent">
// // //                   <span className="font-medium text-accent-foreground">
// // //                     Build Expenses
// // //                   </span>
// // //                   <span className="font-semibold text-accent-foreground">
// // //                     {fmtAmount(summary.buildExpenses)}
// // //                   </span>
// // //                 </div>
// // //               </div>

// // //               {/* Right column */}
// // //               <div className="text-sm divide-y divide-border">
// // //                 <div className="px-4 h-14 py-2.5">
// // //                   <div className="flex flex-row  items-center  justify-between">
// // //                     <span className="text-foreground">
// // //                       Builder Margin{" "}
// // //                       <span className="text-primary font-semibold">
// // //                         {MARGIN_PERCENT}%
// // //                       </span>
// // //                     </span>
// // //                     <span className="font-semibold text-foreground">
// // //                       {fmtAmount(summary.builderMargin)}
// // //                     </span>
// // //                   </div>
// // //                   <div className="flex items-center justify-between mt-0.5">
// // //                     <span className="text-xs text-muted-foreground">+ GST</span>
// // //                     <span className="text-xs text-muted-foreground">
// // //                       {fmtAmount(summary.gst)}
// // //                     </span>
// // //                   </div>
// // //                 </div>
// // //                 <div className="flex items-center  h-14 justify-between px-4 py-2.5">
// // //                   <span className="font-medium text-foreground">
// // //                     Total Builder Margin
// // //                   </span>
// // //                   <span className="font-semibold text-foreground">
// // //                     {fmtAmount(summary.totalBuilderMargin)}
// // //                   </span>
// // //                 </div>
// // //                 <div className="flex items-center  h-14 justify-between px-4 py-2.5 bg-accent">
// // //                   <span className="font-medium text-accent-foreground">
// // //                     Final Project Expenses
// // //                   </span>
// // //                   <span className="font-semibold text-accent-foreground">
// // //                     {fmtAmount(summary.finalProjectExpenses)}
// // //                   </span>
// // //                 </div>
// // //               </div>
// // //             </div>

// // //             {/* footer row: collection + balance — KEEP YOUR EXISTING ONE, UNCHANGED */}
// // //             <div className="border-t border-border min-h-14 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
// // //               <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
// // //                 <div>
// // //                   <span className="text-muted-foreground">
// // //                     Collection/Received:{" "}
// // //                   </span>
// // //                   <strong className="text-[#10B981]">
// // //                     {fmtAmount(summary.collectionReceived)}
// // //                   </strong>
// // //                 </div>
// // //                 <div>
// // //                   <span className="text-muted-foreground">Customer Paid: </span>
// // //                   <strong className="text-[#10B981]">
// // //                     {fmtAmount(summary.customerPaid)}
// // //                   </strong>
// // //                 </div>
// // //               </div>
// // //               <div
// // //                 className={`flex items-center justify-between sm:justify-end gap-3 px-4 py-2 rounded-md font-bold text-sm ${
// // //                   summary.balance >= 0
// // //                     ? "bg-[#10B981]/10 text-[#10B981]"
// // //                     : "bg-destructive/10 text-destructive"
// // //                 }`}
// // //               >
// // //                 <span>Balance</span>
// // //                 <span>
// // //                   {summary.balance >= 0 ? "+" : ""}
// // //                   {fmtAmount(summary.balance)}
// // //                 </span>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         )}

// // //         {/* ── Tab Bar ──────────────────────────────────────────────── */}
// // //         <div className="flex flex-wrap items-center gap-4 mb-6">
// // //           <div className="inline-flex items-center gap-1 bg-secondary rounded-md p-1">
// // //             <button
// // //               onClick={() => setActiveTab("byContractor")}
// // //               className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
// // //                 activeTab === "byContractor"
// // //                   ? "bg-card text-foreground shadow-sm"
// // //                   : "text-muted-foreground hover:text-foreground"
// // //               }`}
// // //             >
// // //               Group by Contractor
// // //               <span
// // //                 className={`text-xs px-1.5 py-0.5 rounded-full ${
// // //                   activeTab === "byContractor"
// // //                     ? "bg-accent text-accent-foreground"
// // //                     : "bg-muted text-muted-foreground"
// // //                 }`}
// // //               >
// // //                 {groupedByContractor.length}
// // //               </span>
// // //             </button>

// // //             <button
// // //               onClick={() => setActiveTab("transactions")}
// // //               className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
// // //                 activeTab === "transactions"
// // //                   ? "bg-card text-foreground shadow-sm"
// // //                   : "text-muted-foreground hover:text-foreground"
// // //               }`}
// // //             >
// // //               Transactions
// // //               <span
// // //                 className={`text-xs px-1.5 py-0.5 rounded-full ${
// // //                   activeTab === "transactions"
// // //                     ? "bg-accent text-accent-foreground"
// // //                     : "bg-muted text-muted-foreground"
// // //                 }`}
// // //               >
// // //                 {rows.length}
// // //               </span>
// // //             </button>
// // //           </div>

// // //           {activeTab === "byContractor" && workerLogs.length > 0 && (
// // //             <button
// // //               onClick={scrollToWorkerSection}
// // //               className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-accent px-2.5 py-1 rounded-full transition-colors"
// // //             >
// // //               Jump to Worker
// // //               <MoveDownIcon size={12} />
// // //             </button>
// // //           )}
// // //         </div>

// // //         {/* ── Transactions Tab (TanStack Table) ───────────────────── */}
// // //         {activeTab === "transactions" && (
// // //           <div className="border border-border rounded-md overflow-hidden">
// // //             <div className="overflow-x-auto">
// // //               <Table className="min-w-[1200px] ">
// // //                 <TableHeader>
// // //                   {table.getHeaderGroups().map((group) => (
// // //                     <TableRow
// // //                       key={group.id}
// // //                       className="border-b border-border bg-muted/30"
// // //                     >
// // //                       {group.headers.map((header) => (
// // //                         <TableHead key={header.id} className="px-4 py-3">
// // //                           {header.isPlaceholder
// // //                             ? null
// // //                             : flexRender(
// // //                                 header.column.columnDef.header,
// // //                                 header.getContext(),
// // //                               )}
// // //                         </TableHead>
// // //                       ))}
// // //                     </TableRow>
// // //                   ))}
// // //                 </TableHeader>
// // //                 <TableBody>
// // //                   {isLoading ? (
// // //                     <TableRow>
// // //                       <TableCell
// // //                         colSpan={columns.length}
// // //                         className="text-center py-12 text-muted-foreground"
// // //                       >
// // //                         <Loader2
// // //                           className="inline animate-spin mr-2"
// // //                           size={14}
// // //                         />
// // //                         Loading...
// // //                       </TableCell>
// // //                     </TableRow>
// // //                   ) : table.getRowModel().rows.length === 0 ? (
// // //                     <TableRow>
// // //                       <TableCell
// // //                         colSpan={columns.length}
// // //                         className="text-center py-12 text-muted-foreground"
// // //                       >
// // //                         No approved transactions for this project.
// // //                       </TableCell>
// // //                     </TableRow>
// // //                   ) : (
// // //                     table.getRowModel().rows.map((row, idx) => {
// // //                       const rowKey = `t-${row.original.TXN_ID}`;
// // //                       const isSelected = selectedRowKey === rowKey;
// // //                       return (
// // //                       <TableRow
// // //                         key={row.id}
// // //                         tabIndex={0}
// // //                         aria-selected={isSelected}
// // //                         onClick={handleRowClick(rowKey)}
// // //                         onKeyDown={handleRowKeyDown(rowKey)}
// // //                         className={`cursor-pointer border-b border-border last:border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
// // //                           isSelected
// // //                             ? "bg-selected hover:bg-selected"
// // //                             : `hover:bg-accent ${
// // //                                 idx % 2 === 1 ? "bg-muted/60" : "bg-card"
// // //                               }`
// // //                         }`}
// // //                       >
// // //                         {row.getVisibleCells().map((cell, cellIndex) => (
// // //                           <TableCell
// // //                             key={cell.id}
// // //                             className={`px-4 py-2.5 align-middle ${
// // //                               cellIndex === 0 ? firstCellClass(isSelected) : ""
// // //                             }`}
// // //                           >
// // //                             {flexRender(
// // //                               cell.column.columnDef.cell,
// // //                               cell.getContext(),
// // //                             )}
// // //                           </TableCell>
// // //                         ))}
// // //                       </TableRow>
// // //                       );
// // //                     })
// // //                   )}
// // //                 </TableBody>
// // //               </Table>
// // //             </div>
// // //             {!isLoading && rows.length > 0 && (
// // //               <div className="border-t border-border px-2">
// // //                 <DataTablePaginationTwo
// // //                   table={table}
// // //                   tableKey="project-report-transactions"
// // //                 />
// // //               </div>
// // //             )}
// // //           </div>
// // //         )}

// // //         {/* ── Group by Contractor Tab ─────────────────────────────── */}
// // //         {activeTab === "byContractor" && (
// // //           <div className="space-y-4">
// // //             {isLoading ? (
// // //               <div className="text-center py-12 text-muted-foreground">
// // //                 <Loader2 className="inline animate-spin mr-2" size={16} />
// // //                 Loading...
// // //               </div>
// // //             ) : groupedByContractor.length === 0 && workerLogs.length === 0 ? (
// // //               <div className="text-center py-12 text-muted-foreground border border-border rounded-md">
// // //                 No approved transactions for this project.
// // //               </div>
// // //             ) : (
// // //               <>
// // //                 {groupedByContractor.map((group) => {
// // //                   // const key = group.contractorId ?? "none";
// // //                   // const isExpanded = !!expandedContractors[key];
// // //                   // const visibleRows = isExpanded
// // //                   //   ? group.rows
// // //                   //   : group.rows.slice(0, CONTRACTOR_ROWS_PREVIEW);
// // //                   // const hasMore = group.rows.length > CONTRACTOR_ROWS_PREVIEW;
// // //                   const key = group.contractorId ?? "none";
// // // const visibleRows = group.rows;

// // //                   return (
// // //                     <div
// // //                       key={key}
// // //                       id={`contractor-${key}`}
// // //                       className={`scroll-mt-16 border border-border rounded-md overflow-hidden transition-shadow ${
// // //                         activeJumpKey === key ? "ring-2 ring-selected-border" : ""
// // //                       }`}
// // //                     >
// // //                       {/* Contractor header */}
// // //                       <div
// // //                         className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-border transition-colors ${
// // //                           activeJumpKey === key ? "bg-selected" : "bg-muted/40"
// // //                         }`}
// // //                       >
// // //                         {/* <div className="flex items-center gap-2.5 min-w-0">
// // //                           <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
// // //                             {initials(group.contractorName)}
// // //                           </span>
// // //                           <h3 className="text-sm font-semibold text-foreground truncate">
// // //                             {group.contractorName}
// // //                           </h3>
// // //                         </div> */}
// // //                         <div className="min-w-0">
// // //                           <WrappedName
// // //                             name={group.contractorName}
// // //                             size="md"
// // //                             showAvatar
// // //                             maxLines={1}
// // //                           />
// // //                         </div>
// // //                         <div className="flex items-center gap-5 text-xs shrink-0">
// // //                           <div>
// // //                             <span className="text-muted-foreground">
// // //                               Received:{" "}
// // //                             </span>
// // //                             <strong className="text-[#10B981]">
// // //                               {fmtAmount(group.totalReceived)}
// // //                             </strong>
// // //                           </div>
// // //                           <div>
// // //                             <span className="text-muted-foreground">
// // //                               Payment:{" "}
// // //                             </span>
// // //                             <strong className="text-destructive">
// // //                               {fmtAmount(group.totalPayment)}
// // //                             </strong>
// // //                           </div>
// // //                           <div>
// // //                             <span className="text-muted-foreground">Net: </span>
// // //                             <strong
// // //                               className={
// // //                                 group.net >= 0
// // //                                   ? "text-[#10B981]"
// // //                                   : "text-destructive"
// // //                               }
// // //                             >
// // //                               {fmtAmount(group.net)}
// // //                             </strong>
// // //                           </div>
// // //                         </div>
// // //                       </div>

// // //                       {/* Contractor's transactions */}
// // //                       <div className="overflow-x-auto">
// // //                         <table className="w-full text-sm min-w-[900px]">
// // //                           <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
// // //                             <tr>
// // //                               <th className="px-4 py-2.5 text-left font-semibold">
// // //                                 Date
// // //                               </th>
// // //                               <th className="px-4 py-2.5 text-right font-semibold">
// // //                                 Received
// // //                               </th>
// // //                               <th className="px-4 py-2.5 text-right font-semibold">
// // //                                 Payment
// // //                               </th>
// // //                               <th className="px-4 py-2.5 text-left font-semibold">
// // //                                 Description
// // //                               </th>
// // //                               <th className="px-4 py-2.5 text-left font-semibold">
// // //                                 Source
// // //                               </th>
// // //                               <th className="px-4 py-2.5 text-left font-semibold">
// // //                                 Remarks
// // //                               </th>
// // //                               <th className="px-4 py-2.5 text-left font-semibold">
// // //                                 Approved
// // //                               </th>
// // //                               <th className="px-4 py-2.5 text-left font-semibold">
// // //                                 Invoice
// // //                               </th>
// // //                               <th className="px-4 py-2.5"></th>
// // //                             </tr>
// // //                           </thead>
// // //                           <tbody>
// // //                             {visibleRows.map((r, idx) => {
// // //                               const rowKey = `c-${r.TXN_ID}`;
// // //                               const isSelected = selectedRowKey === rowKey;
// // //                               return (
// // //                               <tr
// // //                                 key={r.TXN_ID}
// // //                                 tabIndex={0}
// // //                                 aria-selected={isSelected}
// // //                                 onClick={handleRowClick(rowKey)}
// // //                                 onKeyDown={handleRowKeyDown(rowKey)}
// // //                                 className={rowStateClass(isSelected, idx)}
// // //                               >
// // //                                 <td
// // //                                   className={`px-4 py-2.5 whitespace-nowrap font-medium text-foreground text-sm ${firstCellClass(
// // //                                     isSelected,
// // //                                   )}`}
// // //                                 >
// // //                                   {fmtDate(r.TXN_DATE)}
// // //                                 </td>
// // //                                 <td className="px-4 py-2.5 text-right font-semibold text-[#10B981] whitespace-nowrap text-sm">
// // //                                   {r.DEBIT != null ? fmtAmount(r.DEBIT) : "—"}
// // //                                 </td>
// // //                                 <td className="px-4 py-2.5 text-right font-semibold text-destructive whitespace-nowrap text-sm">
// // //                                   {r.CREDIT != null ? fmtAmount(r.CREDIT) : "—"}
// // //                                 </td>
// // //                                 <td className="px-4 py-2.5 max-w-[220px] text-foreground text-sm break-words">
// // //                                   {r.DESCRIPTION}
// // //                                 </td>
// // //                                 {/* <td className="px-4 py-2.5 max-w-[220px]">
// // //                                   <WrappedName name={r.DESCRIPTION} />
// // //                                 </td> */}
// // //                                 <td className="px-4 py-2.5">
// // //                                   <SourceBadge row={r} />
// // //                                 </td>
// // //                                 <td className="px-4 py-2.5 text-foreground text-sm">
// // //                                   {r.REMARKS || (
// // //                                     <span className="text-muted-foreground italic">
// // //                                       —
// // //                                     </span>
// // //                                   )}
// // //                                 </td>
// // //                                 <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground text-sm">
// // //                                   {fmtDate(r.APPROVED_DATE)}
// // //                                 </td>
// // //                                 <td className="px-4 py-2.5 min-w-[160px]">
// // //                                   <InvoiceCell
// // //                                     parentType="main"
// // //                                     parentId={r.TXN_ID}
// // //                                     readOnly
// // //                                   />
// // //                                 </td>
// // //                                 <td className="px-4 py-2.5">
// // //                                   {r.SOURCE_TYPE === "NON_BANKING" && canEdit && (
// // //                                     <Tooltip>
// // //                                       <TooltipTrigger asChild>
// // //                                         <Button
// // //                                           size="icon"
// // //                                           variant="ghost"
// // //                                           disabled={!canEdit}
// // //                                           onClick={() => handleEditNonBanking(r.TXN_ID)}
// // //                                           aria-label="Edit"
// // //                                           className="h-7 w-7 rounded-full"
// // //                                         >
// // //                                           <Pencil size={13} />
// // //                                         </Button>
// // //                                       </TooltipTrigger>
// // //                                       <TooltipContent>Edit</TooltipContent>
// // //                                     </Tooltip>
// // //                                   )}
// // //                                 </td>
// // //                               </tr>
// // //                               );
// // //                             })}
// // //                           </tbody>
// // //                         </table>
// // //                       </div>

// // //                       {/* {hasMore && (
// // //                         <div className="border-t border-border px-4 py-2.5 bg-muted/10">
// // //                           <button
// // //                             onClick={() => toggleContractorExpanded(key)}
// // //                             className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
// // //                           >
// // //                             {isExpanded ? (
// // //                               <>
// // //                                 Show less <ChevronUp size={14} />
// // //                               </>
// // //                             ) : (
// // //                               <>
// // //                                 View all {group.rows.length} transactions{" "}
// // //                                 <ChevronDown size={14} />
// // //                               </>
// // //                             )}
// // //                           </button>
// // //                         </div>
// // //                       )} */}
// // //                     </div>
// // //                   );
// // //                 })}

// // //                 {/* Worker Hours & Costing */}
// // //                 {workerLogs.length > 0 && (
// // //                   <div
// // //                     ref={workerSectionRef}
// // //                     className={`scroll-mt-16 border border-border rounded-md overflow-hidden transition-shadow ${
// // //                       activeJumpKey === "worker"
// // //                         ? "ring-2 ring-selected-border"
// // //                         : ""
// // //                     }`}
// // //                   >
// // //                     <div
// // //                       className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-border transition-colors ${
// // //                         activeJumpKey === "worker" ? "bg-selected" : "bg-muted/40"
// // //                       }`}
// // //                     >
// // //                       <div className="flex items-center gap-2">
// // //                         <Users size={16} />
// // //                         <h3 className="text-sm font-semibold text-foreground">
// // //                           Worker Hours & Costing
// // //                         </h3>
// // //                       </div>
// // //                       <div className="flex items-center gap-5 text-xs">
// // //                         <div>
// // //                           <span className="text-muted-foreground">
// // //                             Total Hours:{" "}
// // //                           </span>
// // //                           <strong className="text-foreground">
// // //                             {fmtHours(workerTotals.totalHours)}
// // //                           </strong>
// // //                         </div>
// // //                         <div>
// // //                           <span className="text-muted-foreground">
// // //                             Total Cost:{" "}
// // //                           </span>
// // //                           <strong className="text-destructive">
// // //                             {fmtAmount(workerTotals.totalAmount)}
// // //                           </strong>
// // //                         </div>
// // //                       </div>
// // //                     </div>
// // //                     <div className="overflow-x-auto">
// // //                       <table className="w-full text-sm min-w-[800px]">
// // //                         <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
// // //                           <tr>
// // //                             <th className="px-4 py-2.5 text-left font-semibold">
// // //                               Worker
// // //                             </th>
// // //                             <th className="px-4 py-2.5 text-left font-semibold">
// // //                               Date
// // //                             </th>
// // //                             <th className="px-4 py-2.5 text-left font-semibold">
// // //                               Basis
// // //                             </th>
// // //                             <th className="px-4 py-2.5 text-left font-semibold">
// // //                               Remarks
// // //                             </th>
// // //                             <th className="px-4 py-2.5 text-right font-semibold">
// // //                               Hours
// // //                             </th>
// // //                             <th className="px-4 py-2.5 text-right font-semibold">
// // //                               Days
// // //                             </th>
// // //                             <th className="px-4 py-2.5 text-right font-semibold">
// // //                               Rate
// // //                             </th>
// // //                             <th className="px-4 py-2.5 text-right font-semibold">
// // //                               Amount
// // //                             </th>
// // //                           </tr>
// // //                         </thead>
// // //                         <tbody>
// // //                           {workerLogs.map((w, idx) => {
// // //                             const rowKey = `w-${w.ATTENDANCE_ID}`;
// // //                             const isSelected = selectedRowKey === rowKey;
// // //                             return (
// // //                             <tr
// // //                               key={w.ATTENDANCE_ID}
// // //                               tabIndex={0}
// // //                               aria-selected={isSelected}
// // //                               onClick={handleRowClick(rowKey)}
// // //                               onKeyDown={handleRowKeyDown(rowKey)}
// // //                               className={rowStateClass(isSelected, idx)}
// // //                             >
// // //                               <td
// // //                                 className={`px-4 py-2.5 ${firstCellClass(
// // //                                   isSelected,
// // //                                 )}`}
// // //                               >
// // //                                 {/* {w.WORKER_NAME} */}
// // //                                 <WrappedName
// // //                                   name={w.WORKER_NAME}
// // //                                   showAvatar
// // //                                   maxLines={1}
// // //                                 />
// // //                               </td>
// // //                               <td className="px-4 py-2.5 whitespace-nowrap text-sm">
// // //                                 {fmtDate(w.ATTENDANCE_DATE)}
// // //                               </td>
// // //                               <td className="px-4 py-2.5">
// // //                                 <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
// // //                                   {w.CALC_BASIS}
// // //                                 </span>
// // //                               </td>
// // //                               <td className="px-4 py-2.5 text-foreground text-sm">
// // //                                 {/* <WrappedName
// // //                                   name={w.REMARKS}
                                  
// // //                                   maxLines={2}
// // //                                   maxChars={100}
// // //                                 /> */}
// // //                                 {w.REMARKS || (
// // //                                   <span className="text-muted-foreground italic">
// // //                                     —
// // //                                   </span>
// // //                                 )}
// // //                               </td>
// // //                               <td className="px-4 py-2.5 text-right text-sm">
// // //                                 {fmtHours(w.HOURS_WORKED)}
// // //                               </td>
// // //                               <td className="px-4 py-2.5 text-right text-sm">
// // //                                 {w.DAYS_WORKED ?? "—"}
// // //                               </td>
// // //                               <td className="px-4 py-2.5 text-right text-sm">
// // //                                 {fmtAmount(
// // //                                   w.CALC_BASIS === "HOUR"
// // //                                     ? w.RATE_PER_HOUR
// // //                                     : w.RATE_PER_DAY,
// // //                                 )}
// // //                               </td>
// // //                               <td className="px-4 py-2.5 text-right text-sm font-semibold">
// // //                                 {w.AMOUNT != null ? (
// // //                                   fmtAmount(w.AMOUNT)
// // //                                 ) : (
// // //                                   <span className="text-destructive italic">
// // //                                     rate missing
// // //                                   </span>
// // //                                 )}
// // //                               </td>
// // //                             </tr>
// // //                             );
// // //                           })}
// // //                         </tbody>
// // //                       </table>
// // //                     </div>
// // //                   </div>
// // //                 )}
// // //               </>
// // //             )}
// // //           </div>
// // //         )}
// // //       </div>
// // //       <InvoiceSheet />
// // //       {activeTab === "byContractor" && groupedByContractor.length > 1 && (
// // //         <Popover
// // //           open={jumpOpen}
// // //           onOpenChange={(open) => {
// // //             setJumpOpen(open);
// // //             if (!open) setJumpSearch("");
// // //           }}
// // //         >
// // //           <PopoverTrigger asChild>
// // //             <Button
// // //               aria-label="Jump to contractor"
// // //               className="fixed bottom-16 right-6 z-[60] h-9 rounded-full shadow-lg px-3 gap-1.5"
// // //             >
// // //               <List size={16} />
// // //               <span className="hidden sm:inline text-xs">Contractors</span>
// // //             </Button>
// // //           </PopoverTrigger>
// // //           <PopoverContent
// // //             side="top"
// // //             align="end"
// // //             sideOffset={8}
// // //             className="w-72 p-2"
// // //           >
// // //             {groupedByContractor.length > 8 && (
// // //               <input
// // //                 type="text"
// // //                 value={jumpSearch}
// // //                 onChange={(e) => setJumpSearch(e.target.value)}
// // //                 placeholder="Search contractor..."
// // //                 className="mb-2 h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
// // //               />
// // //             )}
// // //             <div className="max-h-96 overflow-y-auto flex flex-col">
// // //               {jumpContractors.map((group) => {
// // //                 const key = group.contractorId ?? "none";
// // //                 const name = group.contractorName.trim();
// // //                 return (
// // //                   <button
// // //                     key={key}
// // //                     type="button"
// // //                     title={name}
// // //                     aria-current={activeJumpKey === key ? "true" : undefined}
// // //                     onClick={() => {
// // //                       setActiveJumpKey(key);
// // //                       document
// // //                         .getElementById(`contractor-${key}`)
// // //                         ?.scrollIntoView({ behavior: "smooth", block: "start" });
// // //                       setJumpOpen(false);
// // //                     }}
// // //                     className={`flex items-center gap-2 rounded-sm border-l-4 px-2 py-2.5 text-sm text-left text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
// // //                       activeJumpKey === key
// // //                         ? "bg-selected border-selected-border"
// // //                         : "border-transparent"
// // //                     }`}
// // //                   >
// // //                     <span
// // //                       aria-hidden="true"
// // //                       className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
// // //                       style={{ backgroundColor: getAvatarColor(name) }}
// // //                     >
// // //                       {getInitials(name)}
// // //                     </span>
// // //                     <span
// // //                       className={`flex-1 truncate ${
// // //                         activeJumpKey === key ? "font-semibold" : ""
// // //                       }`}
// // //                     >
// // //                       {name}
// // //                     </span>
// // //                     <span className="shrink-0 text-muted-foreground">
// // //                       {group.rows.length}
// // //                     </span>
// // //                     {activeJumpKey === key && (
// // //                       <Check size={16} className="shrink-0 text-primary" />
// // //                     )}
// // //                   </button>
// // //                 );
// // //               })}
// // //               {workerLogs.length > 0 && (
// // //                 <>
// // //                   <div
// // //                     aria-hidden="true"
// // //                     className="mt-1 border-t border-border"
// // //                   />
// // //                   <button
// // //                     type="button"
// // //                     aria-current={
// // //                       activeJumpKey === "worker" ? "true" : undefined
// // //                     }
// // //                     onClick={() => {
// // //                       setActiveJumpKey("worker");
// // //                       workerSectionRef.current?.scrollIntoView({
// // //                         behavior: "smooth",
// // //                         block: "start",
// // //                       });
// // //                       setJumpOpen(false);
// // //                     }}
// // //                     className={`flex items-center gap-2 rounded-sm border-l-4 px-2 py-2.5 text-sm text-left text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
// // //                       activeJumpKey === "worker"
// // //                         ? "bg-selected border-selected-border"
// // //                         : "border-transparent"
// // //                     }`}
// // //                   >
// // //                     <Users
// // //                       size={16}
// // //                       className="shrink-0 text-muted-foreground"
// // //                     />
// // //                     <span
// // //                       className={`flex-1 truncate ${
// // //                         activeJumpKey === "worker" ? "font-semibold" : ""
// // //                       }`}
// // //                     >
// // //                       Worker Hours
// // //                     </span>
// // //                     {activeJumpKey === "worker" && (
// // //                       <Check size={16} className="shrink-0 text-primary" />
// // //                     )}
// // //                   </button>
// // //                 </>
// // //               )}
// // //             </div>
// // //           </PopoverContent>
// // //         </Popover>
// // //       )}
// // //       {showScrollTop && (
// // //         <Button
// // //           onClick={scrollToTop}
// // //           aria-label="Scroll to top"
// // //           size="icon"
// // //           className="fixed bottom-6 right-6 z-[60] h-9 w-9 rounded-full shadow-lg hover:-translate-y-0.5 transition-all"
// // //         >
// // //           <MoveUpIcon size={16} />
// // //         </Button>
// // //       )}
// // //     </SectionContainer>
// // //   );
// // // }


// // // src\features\project-two\project-report-page-two.jsx
// // import React, { useEffect, useMemo, useRef, useState } from "react";
// // import { useParams, useNavigate } from "react-router-dom";
// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// // import axios from "axios";
// // import {
// //   flexRender,
// //   getCoreRowModel,
// //   getPaginationRowModel,
// //   getSortedRowModel,
// //   useReactTable,
// // } from "@tanstack/react-table";
// // import {
// //   Check,
// //   Download,
// //   Loader2,
// //   FileText,
// //   ArrowUpDown,
// //   Users,
// //   LandmarkIcon,
// //   MoveDownIcon,
// //   MoveUpIcon,
// //   List,
// //   Pencil,
// // } from "lucide-react";
// // import { toast } from "react-toastify";

// // import { Button } from "@/components/ui/button";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import { SectionContainer } from "@/components/SectionContainer";
// // import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
// // import InvoiceCell from "@/features/setting/pages/statement-upload-three/invoice/InvoiceCell";
// // import InvoiceSheet from "@/features/setting/pages/statement-upload-three/invoice/InvoiceSheet";
// // import WrappedName from "@/components/shared/WrappedName";
// // import { getAvatarColor, getInitials } from "@/lib/avatar-utils";
// // import {
// //   Popover,
// //   PopoverContent,
// //   PopoverTrigger,
// // } from "@/components/ui/popover";

// // import {
// //   Tooltip,
// //   TooltipContent,
// //   TooltipTrigger,
// // } from "@/components/ui/tooltip";
// // import { useHasPermission } from "@/hooks/use-permission";
// // import { useRowSelectionStore } from "@/hooks/use-row-selection-store";

// // const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// // // ── Status helpers (construction process line status) ────────────────────────
// // const STATUS_META = {
// //   PENDING:     { label: "Pending",     cls: "bg-secondary text-secondary-foreground" },
// //   IN_PROGRESS: { label: "In Progress", cls: "bg-amber-100 text-amber-700" },
// //   COMPLETED:   { label: "Completed",   cls: "bg-[#10B981]/10 text-[#10B981]" },
// // };

// // const confirmStatusChange = (current, next) => {
// //   if (next === current) return false;
// //   if (next === "COMPLETED" || current === "COMPLETED") {
// //     return window.confirm(`Change status to "${STATUS_META[next].label}"?`);
// //   }
// //   return true;
// // };

// // function StatusSelect({ value, onChange, disabled }) {
// //   const v = STATUS_META[value] ? value : "PENDING";
// //   return (
// //     <select
// //       value={v}
// //       disabled={disabled}
// //       onChange={(e) => onChange(e.target.value)}
// //       className={`cursor-pointer rounded-full border-0 px-2 py-0.5 text-[10px] font-semibold outline-none disabled:opacity-60 ${STATUS_META[v].cls}`}
// //     >
// //       {Object.entries(STATUS_META).map(([k, m]) => (
// //         <option key={k} value={k}>{m.label}</option>
// //       ))}
// //     </select>
// //   );
// // }

// // // ── formatters ────────────────────────────────────────────────────────────────
// // const fmtDate = (val) => {
// //   if (!val) return "—";
// //   const d = new Date(val);
// //   if (isNaN(d.getTime())) return "—";
// //   return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
// // };

// // const fmtAmount = (amt) => {
// //   if (amt == null) return "—";
// //   const n = Number(amt) || 0;
// //   return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// // };

// // const fmtHours = (val) => {
// //   if (val == null) return "—";
// //   const n = Number(val) || 0;
// //   return (Math.round(n * 100) / 100).toString();
// // };

// // function SourceBadge({ row }) {
// //   const isNonBanking = row.SOURCE_TYPE === "NON_BANKING";
// //   return (
// //     <div className="flex flex-col items-start">
// //       <div className="flex flex-col items-center gap-0.5">
// //         <span
// //           className={`w-fit whitespace-nowrap text-[10px] font-semibold px-2 py-0.5 rounded-full ${
// //             isNonBanking
// //               ? "bg-accent text-accent-foreground"
// //               : "bg-secondary text-secondary-foreground"
// //           }`}
// //         >
// //           {isNonBanking ? "Non-Banking" : "Banking"}
// //         </span>
// //         {isNonBanking && row.PAYMENT_BY === "CUSTOMER" && (
// //           <span className="whitespace-nowrap text-[9px] font-medium text-amber-600 dark:text-amber-400">
// //             Customer Paid
// //           </span>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // function SortableHeader({ column, children, align = "left" }) {
// //   return (
// //     <button
// //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
// //       className={`flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-[11px] font-semibold uppercase tracking-wider ${
// //         align === "right" ? "ml-auto" : ""
// //       }`}
// //     >
// //       {children} <ArrowUpDown className="h-3 w-3" />
// //     </button>
// //   );
// // }

// // export function ProjectReportPageTwo() {
// //   const { id: projectId } = useParams();
// //   const navigate = useNavigate();
// //   const queryClient = useQueryClient();

// //   const canEdit = useHasPermission("PROJECT_STATEMENT_EDIT");
// //   const handleEditNonBanking = (txnId) =>
// //     navigate(
// //       `/dashboard/projects/${projectId}/report/non-banking/${txnId}/edit`,
// //     );

// //   const [activeTab, setActiveTab] = useState("byContractor"); // "transactions" | "byContractor"
// //   const [sorting, setSorting] = useState([{ id: "TXN_DATE", desc: true }]);
// //   const workerSectionRef = useRef(null);
// //   const [showScrollTop, setShowScrollTop] = useState(false);
// //   const [jumpOpen, setJumpOpen] = useState(false);
// //   const [jumpSearch, setJumpSearch] = useState("");
// //   const [activeJumpKey, setActiveJumpKey] = useState(null);

// //   useEffect(() => {
// //     const handleScroll = () => {
// //       setShowScrollTop(window.scrollY > 500);
// //     };
// //     window.addEventListener("scroll", handleScroll, { passive: true });
// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   const scrollToTop = () => {
// //     window.scrollTo({ top: 0, behavior: "smooth" });
// //   };

// //   const scrollToWorkerSection = () => {
// //     workerSectionRef.current?.scrollIntoView({
// //       behavior: "smooth",
// //       block: "start",
// //     });
// //   };

// //   // ── Row selection (one row at a time across the page) ───────────────
// //   const SELECTION_SCOPE = "project-report";
// //   const selectedRowKey = useRowSelectionStore(
// //     (s) => s.selected[SELECTION_SCOPE] ?? null,
// //   );
// //   const toggleRow = useRowSelectionStore((s) => s.toggle);

// //   // Clicks inside interactive children (Edit, Invoice, Status select ...) must not select.
// //   const isInteractiveTarget = (e) =>
// //     !!e.target.closest?.(
// //       "button, a, input, textarea, select, [role='button']",
// //     );

// //   const handleRowClick = (rowKey) => (e) => {
// //     if (isInteractiveTarget(e)) return;
// //     toggleRow(SELECTION_SCOPE, rowKey);
// //   };

// //   const handleRowKeyDown = (rowKey) => (e) => {
// //     if (e.key !== "Enter" && e.key !== " ") return;
// //     if (isInteractiveTarget(e)) return;
// //     e.preventDefault();
// //     toggleRow(SELECTION_SCOPE, rowKey);
// //   };

// //   // Shared row classes for the contractor and worker tables.
// //   const rowStateClass = (isSelected, idx) =>
// //     `cursor-pointer border-b border-border last:border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
// //       isSelected
// //         ? "bg-selected hover:bg-selected"
// //         : `hover:bg-accent ${idx % 2 === 1 ? "bg-muted/60" : "bg-transparent"}`
// //     }`;

// //   const firstCellClass = (isSelected) =>
// //     `border-l-4 ${isSelected ? "border-selected-border" : "border-transparent"}`;

// //   // ── data ──────────────────────────────────────────────────────────────────
// //   const { data: report, isLoading } = useQuery({
// //     queryKey: ["projectReport", projectId],
// //     queryFn: async () =>
// //       (await axios.get(`${url}/api/statement/project-report/${projectId}`)).data
// //         ?.data || {
// //         transactions: [],
// //         workerLogs: [],
// //         workerTotals: {},
// //         marginPercent: null,
// //         budgetLines: [],
// //       },
// //     enabled: !!projectId,
// //   });

// //   const { data: contractorList = [] } = useQuery({
// //     queryKey: ["contractorNames"],
// //     queryFn: async () =>
// //       (await axios.get(`${url}/api/contractor`)).data?.data || [],
// //   });

// //   const rows = useMemo(() => report?.transactions || [], [report]);
// //   const workerLogs = useMemo(() => report?.workerLogs || [], [report]);
// //   const workerTotals = useMemo(
// //     () =>
// //       report?.workerTotals || { totalHours: 0, totalDays: 0, totalAmount: 0 },
// //     [report],
// //   );
// //   const budgetLines = useMemo(() => report?.budgetLines || [], [report]);

// //   const MARGIN_PERCENT =
// //     report?.marginPercent != null ? Number(report.marginPercent) : 10;

// //   const projectName =
// //     rows.length > 0 ? rows[0].P_NAME : `Project #${projectId}`;

// //   const totals = useMemo(() => {
// //     const debit = rows.reduce((s, r) => s + (Number(r.DEBIT) || 0), 0);
// //     const credit = rows.reduce((s, r) => s + (Number(r.CREDIT) || 0), 0);
// //     const workerCost = Number(workerTotals.totalAmount) || 0;
// //     return { debit, credit, workerCost, net: debit - credit - workerCost };
// //   }, [rows, workerTotals]);

// //   const summary = useMemo(() => {
// //     const projectExpenses = totals.credit;
// //     const workerCost = totals.workerCost;
// //     const buildExpenses = projectExpenses + workerCost;

// //     const marginableCredit = rows.reduce((s, r) => {
// //       if (r.EXCLUDE_MARGIN === "Y") return s;
// //       return s + (Number(r.CREDIT) || 0);
// //     }, 0);
// //     const marginBase = marginableCredit + workerCost;

// //     const builderMargin = marginBase * (MARGIN_PERCENT / 100);
// //     const gst = builderMargin * 0.1;
// //     const totalBuilderMargin = builderMargin + gst;

// //     const finalProjectExpenses = buildExpenses + totalBuilderMargin;

// //     const customerPaid = rows.reduce((s, r) => {
// //       if (
// //         r.SOURCE_TYPE === "NON_BANKING" &&
// //         r.PAYMENT_BY === "CUSTOMER" &&
// //         r.CREDIT != null
// //       ) {
// //         return s + Number(r.CREDIT);
// //       }
// //       return s;
// //     }, 0);

// //     const collectionReceived = totals.debit;
// //     const balance = collectionReceived + customerPaid - finalProjectExpenses;

// //     return {
// //       projectExpenses,
// //       workerCost,
// //       buildExpenses,
// //       builderMargin,
// //       gst,
// //       totalBuilderMargin,
// //       finalProjectExpenses,
// //       collectionReceived,
// //       customerPaid,
// //       balance,
// //     };
// //   }, [totals, rows, MARGIN_PERCENT]);

// //   const groupedByContractor = useMemo(() => {
// //     const map = new Map();

// //     for (const r of rows) {
// //       const key = r.CONTRACTOR_ID != null ? r.CONTRACTOR_ID : "none";
// //       if (!map.has(key)) {
// //         map.set(key, {
// //           contractorId: r.CONTRACTOR_ID ?? null,
// //           contractorName: r.CONTRACTOR_NAME || "No Contractor",
// //           rows: [],
// //         });
// //       }
// //       map.get(key).rows.push(r);
// //     }

// //     return Array.from(map.values()).map((group) => {
// //       const sortedRows = [...group.rows].sort(
// //         (a, b) => new Date(a.TXN_DATE) - new Date(b.TXN_DATE),
// //       );
// //       const totalReceived = sortedRows.reduce(
// //         (s, r) => s + (Number(r.DEBIT) || 0),
// //         0,
// //       );
// //       const totalPayment = sortedRows.reduce(
// //         (s, r) => s + (Number(r.CREDIT) || 0),
// //         0,
// //       );
// //       return {
// //         ...group,
// //         rows: sortedRows,
// //         totalReceived,
// //         totalPayment,
// //         net: totalReceived - totalPayment,
// //       };
// //     });
// //   }, [rows]);

// //   // ── budget / status linking ───────────────────────────────────────────────
// //   const contractorNameMap = useMemo(
// //     () =>
// //       new Map(
// //         contractorList.map((c) => [Number(c.CONTRATOR_ID), c.CONTRATOR_NAME]),
// //       ),
// //     [contractorList],
// //   );

// //   // contractorId -> [budget lines]
// //   const budgetByContractor = useMemo(() => {
// //     const m = new Map();
// //     for (const l of budgetLines) {
// //       for (const cid of l.contractorIds || []) {
// //         const k = Number(cid);
// //         if (!m.has(k)) m.set(k, []);
// //         m.get(k).push(l);
// //       }
// //     }
// //     return m;
// //   }, [budgetLines]);

// //   // contractors with payments + contractors that have a budget line but no payment yet
// //   const contractorGroups = useMemo(() => {
// //     const have = new Set(
// //       groupedByContractor
// //         .filter((g) => g.contractorId != null)
// //         .map((g) => Number(g.contractorId)),
// //     );
// //     const extra = [];
// //     for (const cid of budgetByContractor.keys()) {
// //       if (!have.has(cid)) {
// //         extra.push({
// //           contractorId: cid,
// //           contractorName: contractorNameMap.get(cid) || `Contractor #${cid}`,
// //           rows: [],
// //           totalReceived: 0,
// //           totalPayment: 0,
// //           net: 0,
// //         });
// //       }
// //     }
// //     return [...groupedByContractor, ...extra];
// //   }, [groupedByContractor, budgetByContractor, contractorNameMap]);

// //   const linesWithoutContractor = useMemo(
// //     () => budgetLines.filter((l) => !(l.contractorIds || []).length),
// //     [budgetLines],
// //   );

// //   const jumpContractors = useMemo(() => {
// //     const q = jumpSearch.trim().toLowerCase();
// //     if (!q) return contractorGroups;
// //     return contractorGroups.filter((group) =>
// //       group.contractorName.trim().toLowerCase().includes(q),
// //     );
// //   }, [contractorGroups, jumpSearch]);

// //   const statusMutation = useMutation({
// //     mutationFn: ({ ID, STATUS }) =>
// //       axios.put(`${url}/api/construction-process?action=update_status`, {
// //         ID,
// //         STATUS,
// //         UPDATED_BY: 105,
// //       }),
// //     onSuccess: () => {
// //       toast.success("Status updated");
// //       queryClient.invalidateQueries({ queryKey: ["projectReport", projectId] });
// //       queryClient.invalidateQueries({ queryKey: ["constructionProcess"] });
// //     },
// //     onError: (e) =>
// //       toast.error(e.response?.data?.message || "Status update failed"),
// //   });

// //   const handleStatusChange = (line, next) => {
// //     if (!confirmStatusChange(line.status || "PENDING", next)) return;
// //     statusMutation.mutate({ ID: line.lineId, STATUS: next });
// //   };

// //   // ── CSV export helpers ──────────────────────────────────────────────
// //   const buildSummaryCsvRows = () => [
// //     "Summary",
// //     `Project Expenses,${summary.projectExpenses}`,
// //     `Worker Cost,${summary.workerCost}`,
// //     `Build Expenses,${summary.buildExpenses}`,
// //     `Builder Margin (${MARGIN_PERCENT}%),${summary.builderMargin}`,
// //     `GST,${summary.gst}`,
// //     `Total Builder Margin,${summary.totalBuilderMargin}`,
// //     `Final Project Expenses,${summary.finalProjectExpenses}`,
// //     `Collection/Received,${summary.collectionReceived}`,
// //     `Customer Paid,${summary.customerPaid}`,
// //     `Balance,${summary.balance}`,
// //     "",
// //   ];

// //   const buildWorkerCsvRows = () => {
// //     if (workerLogs.length === 0) return [];
// //     const workerHeaders = [
// //       "Worker",
// //       "Date",
// //       "Basis",
// //       "Hours",
// //       "Days",
// //       "Rate",
// //       "Amount",
// //     ];
// //     const workerRows = workerLogs.map((w) => [
// //       `"${(w.WORKER_NAME || "").replace(/"/g, '""')}"`,
// //       fmtDate(w.ATTENDANCE_DATE),
// //       w.CALC_BASIS || "",
// //       w.HOURS_WORKED ?? "",
// //       w.DAYS_WORKED ?? "",
// //       w.CALC_BASIS === "HOUR"
// //         ? (w.RATE_PER_HOUR ?? "")
// //         : (w.RATE_PER_DAY ?? ""),
// //       w.AMOUNT ?? "MISSING_RATE",
// //     ]);
// //     return [
// //       "",
// //       "Worker Hours & Costing",
// //       workerHeaders.join(","),
// //       ...workerRows.map((r) => r.join(",")),
// //       `Total Hours,${workerTotals.totalHours}`,
// //       `Total Days,${workerTotals.totalDays}`,
// //       `Total Worker Cost,${workerTotals.totalAmount}`,
// //     ];
// //   };

// //   const downloadCsvFile = (csvParts, suffix) => {
// //     const csv = csvParts.join("\n");
// //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// //     const link = document.createElement("a");
// //     link.href = URL.createObjectURL(blob);
// //     link.download = `${(projectName || "project").replace(/[^a-z0-9]/gi, "_").replace(/^_+|_+$/g, "")}_${suffix}.csv`;
// //     link.click();
// //   };

// //   const handleDownloadAllCsv = () => {
// //     if (rows.length === 0 && workerLogs.length === 0) {
// //       toast.error("No data to download.");
// //       return;
// //     }
// //     const csvParts = [...buildSummaryCsvRows()];

// //     if (rows.length > 0) {
// //       const headers = [
// //         "Contractor",
// //         "Date",
// //         "Received",
// //         "Payment",
// //         "Description",
// //         "Category",
// //         "Matched Address",
// //         "Invoice No",
// //         "Source",
// //         "Remarks",
// //         "Approved Date",
// //       ];
// //       const csvRows = rows.map((r) => [
// //         `"${(r.CONTRACTOR_NAME || "").replace(/"/g, '""')}"`,
// //         fmtDate(r.TXN_DATE),
// //         r.DEBIT ?? "",
// //         r.CREDIT ?? "",
// //         `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
// //         r.CATEGORY || "",
// //         `"${(r.MATCHED_ADDRESS || "").replace(/"/g, '""')}"`,
// //         `"${(r.INVOICE_NO || "").replace(/"/g, '""')}"`,
// //         r.SOURCE_TYPE || "",
// //         `"${(r.REMARKS || "").replace(/"/g, '""')}"`,
// //         fmtDate(r.APPROVED_DATE),
// //       ]);
// //       csvParts.push(
// //         "Transactions",
// //         headers.join(","),
// //         ...csvRows.map((r) => r.join(",")),
// //         `Total Received,${totals.debit}`,
// //         `Total Payment,${totals.credit}`,
// //         "",
// //       );
// //     }

// //     csvParts.push(...buildWorkerCsvRows());
// //     downloadCsvFile(csvParts, "report_all");
// //   };

// //   const handleDownloadByContractorCsv = () => {
// //     if (contractorGroups.length === 0 && workerLogs.length === 0) {
// //       toast.error("No data to download.");
// //       return;
// //     }
// //     const csvParts = [...buildSummaryCsvRows()];

// //     contractorGroups.forEach((group) => {
// //       const cLines =
// //         group.contractorId != null
// //           ? budgetByContractor.get(Number(group.contractorId)) || []
// //           : [];
// //       const headers = [
// //         "Date",
// //         "Received",
// //         "Payment",
// //         "Description",
// //         "Source",
// //         "Remarks",
// //         "Approved Date",
// //       ];
// //       const csvRows = group.rows.map((r) => [
// //         fmtDate(r.TXN_DATE),
// //         r.DEBIT ?? "",
// //         r.CREDIT ?? "",
// //         `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
// //         r.SOURCE_TYPE || "",
// //         `"${(r.REMARKS || "").replace(/"/g, '""')}"`,
// //         fmtDate(r.APPROVED_DATE),
// //       ]);
// //       csvParts.push(
// //         `Contractor: ${group.contractorName}`,
// //         ...cLines.map(
// //           (l) =>
// //             `Budget line: ${l.typeName || ""} | ${l.cost} | ${STATUS_META[l.status]?.label || l.status}`,
// //         ),
// //         headers.join(","),
// //         ...csvRows.map((r) => r.join(",")),
// //         `Total Received,${group.totalReceived}`,
// //         `Total Payment,${group.totalPayment}`,
// //         `Net,${group.net}`,
// //         "",
// //       );
// //     });

// //     csvParts.push(...buildWorkerCsvRows());
// //     downloadCsvFile(csvParts, "report_by_contractor");
// //   };

// //   // ── TanStack Table — Transactions tab ───────────────────────────────
// //   const columns = useMemo(
// //     () => [
// //       {
// //         accessorKey: "P_NAME",
// //         header: () => (
// //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// //             Project
// //           </span>
// //         ),
// //         cell: ({ row }) => {
// //           const r = row.original;
// //           return (
// //             <div className="flex flex-col gap-0.5 max-w-[180px]">
// //               {r.P_ID != null && (
// //                 <span className="w-fit text-[10px] font-semibold text-muted-foreground">
// //                   ID: {r.P_ID}
// //                 </span>
// //               )}
// //               <WrappedName name={r.P_NAME} maxChars={70} />
// //             </div>
// //           );
// //         },
// //       },
// //       {
// //         accessorKey: "CONTRACTOR_NAME",
// //         header: () => (
// //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// //             Contractor
// //           </span>
// //         ),
// //         cell: ({ getValue }) => (
// //           <span className="text-sm text-foreground">
// //             {getValue() || (
// //               <span className="text-muted-foreground italic">—</span>
// //             )}
// //           </span>
// //         ),
// //       },
// //       {
// //         accessorKey: "TXN_DATE",
// //         header: ({ column }) => (
// //           <SortableHeader column={column}>Date</SortableHeader>
// //         ),
// //         sortingFn: (a, b) =>
// //           new Date(a.original.TXN_DATE || 0) -
// //           new Date(b.original.TXN_DATE || 0),
// //         cell: ({ getValue }) => (
// //           <span className="whitespace-nowrap font-medium text-foreground text-sm">
// //             {fmtDate(getValue())}
// //           </span>
// //         ),
// //       },
// //       {
// //         accessorKey: "DEBIT",
// //         header: ({ column }) => (
// //           <div className="text-right">
// //             <SortableHeader column={column} align="right">
// //               Received
// //             </SortableHeader>
// //           </div>
// //         ),
// //         cell: ({ getValue }) => {
// //           const v = getValue();
// //           return (
// //             <div className="text-right font-semibold text-[#10B981] whitespace-nowrap text-sm">
// //               {v != null ? fmtAmount(v) : "—"}
// //             </div>
// //           );
// //         },
// //       },
// //       {
// //         accessorKey: "CREDIT",
// //         header: ({ column }) => (
// //           <div className="text-right">
// //             <SortableHeader column={column} align="right">
// //               Payment
// //             </SortableHeader>
// //           </div>
// //         ),
// //         cell: ({ getValue }) => {
// //           const v = getValue();
// //           return (
// //             <div className="text-right font-semibold text-destructive whitespace-nowrap text-sm">
// //               {v != null ? fmtAmount(v) : "—"}
// //             </div>
// //           );
// //         },
// //       },
// //       {
// //         accessorKey: "DESCRIPTION",
// //         header: () => (
// //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// //             Description
// //           </span>
// //         ),
// //         cell: ({ getValue }) => (
// //           <div
// //             title={getValue() || ""}
// //             className="max-w-[220px] text-foreground text-sm truncate"
// //           >
// //             {getValue()}
// //           </div>
// //         ),
// //       },
// //       {
// //         accessorKey: "MATCHED_ADDRESS",
// //         header: () => (
// //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// //             Matched Address
// //           </span>
// //         ),
// //         cell: ({ getValue }) => (
// //           <div className="max-w-[150px]">
// //             <WrappedName name={getValue()} className="text-primary" />
// //           </div>
// //         ),
// //       },
// //       {
// //         accessorKey: "SOURCE_TYPE",
// //         header: () => (
// //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// //             Source
// //           </span>
// //         ),
// //         cell: ({ row }) => <SourceBadge row={row.original} />,
// //       },
// //       {
// //         accessorKey: "REMARKS",
// //         header: () => (
// //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// //             Remarks
// //           </span>
// //         ),
// //         cell: ({ getValue }) => (
// //           <span className="text-foreground text-sm">
// //             {getValue() || (
// //               <span className="text-muted-foreground italic">—</span>
// //             )}
// //           </span>
// //         ),
// //       },
// //       {
// //         accessorKey: "APPROVED_DATE",
// //         header: ({ column }) => (
// //           <SortableHeader column={column}>Approved</SortableHeader>
// //         ),
// //         sortingFn: (a, b) =>
// //           new Date(a.original.APPROVED_DATE || 0) -
// //           new Date(b.original.APPROVED_DATE || 0),
// //         cell: ({ getValue }) => (
// //           <span className="whitespace-nowrap text-muted-foreground text-sm">
// //             {fmtDate(getValue())}
// //           </span>
// //         ),
// //       },
// //       {
// //         id: "invoice",
// //         header: () => (
// //           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
// //             Invoice
// //           </span>
// //         ),
// //         enableSorting: false,
// //         cell: ({ row }) => (
// //           <div className="min-w-[160px]">
// //             <InvoiceCell
// //               parentType="main"
// //               parentId={row.original.TXN_ID}
// //               readOnly
// //             />
// //           </div>
// //         ),
// //       },
// //       {
// //         id: "action",
// //         header: () => null,
// //         enableSorting: false,
// //         cell: ({ row }) => {
// //           const r = row.original;
// //           if (r.SOURCE_TYPE !== "NON_BANKING" || !canEdit) return null;
// //           return (
// //             <Tooltip>
// //               <TooltipTrigger asChild>
// //                 <Button
// //                   size="icon"
// //                   variant="ghost"
// //                   disabled={!canEdit}
// //                   onClick={() => handleEditNonBanking(r.TXN_ID)}
// //                   aria-label="Edit"
// //                   className="h-7 w-7 rounded-full"
// //                 >
// //                   <Pencil size={13} />
// //                 </Button>
// //               </TooltipTrigger>
// //               <TooltipContent>Edit</TooltipContent>
// //             </Tooltip>
// //           );
// //         },
// //       },
// //     ],
// //     [canEdit],
// //   );

// //   const table = useReactTable({
// //     data: rows,
// //     columns,
// //     onSortingChange: setSorting,
// //     getCoreRowModel: getCoreRowModel(),
// //     getSortedRowModel: getSortedRowModel(),
// //     getPaginationRowModel: getPaginationRowModel(),
// //     autoResetPageIndex: false,
// //     state: { sorting },
// //   });

// //   const hasData = rows.length > 0 || workerLogs.length > 0;

// //   return (
// //     <SectionContainer variant="dashboard">
// //       <div className="bg-card border border-border rounded-md p-4 md:p-6 shadow-sm">
// //         {/* ── Page Header ───────────────────────────────────────────── */}
// //         <div className="mb-6">
// //           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// //             <div className="min-w-0">
// //               <div className="flex items-center gap-2 min-w-0">
// //                 <FileText size={18} strokeWidth={2} className=" shrink-0" />
// //                 <h1 className="text-base font-semibold text-foreground truncate">
// //                   {projectName} — Statement Report
// //                 </h1>
// //               </div>
// //               <p className="text-xs text-muted-foreground mt-0.5">
// //                 {isLoading ? (
// //                   "Loading..."
// //                 ) : (
// //                   <>
// //                     Showing {rows.length} transaction
// //                     {rows.length !== 1 ? "s" : ""} across{" "}
// //                     {contractorGroups.length} contractor
// //                     {contractorGroups.length !== 1 ? "s" : ""}
// //                     {" · "}
// //                     As of{" "}
// //                     {new Date().toLocaleDateString(undefined, {
// //                       month: "short",
// //                       day: "numeric",
// //                       year: "numeric",
// //                     })}
// //                   </>
// //                 )}
// //               </p>
// //             </div>
// //             <Button
// //               onClick={
// //                 activeTab === "transactions"
// //                   ? handleDownloadAllCsv
// //                   : handleDownloadByContractorCsv
// //               }
// //               size="sm"
// //               className="text-xs shrink-0"
// //               disabled={rows.length === 0 && workerLogs.length === 0}
// //             >
// //               <Download size={14} className="mr-2" />
// //               {activeTab === "transactions"
// //                 ? "Download All CSV"
// //                 : "Download by Contractor CSV"}
// //             </Button>
// //           </div>
// //           <div className="w-full h-px bg-border mt-4" />
// //         </div>

// //         {/* ── Financial Summary Card ───────────────────────────────── */}
// //         {!isLoading && hasData && (
// //           <div className="mb-6 border border-border rounded-md overflow-hidden max-w-2xl">
// //             <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
// //               <LandmarkIcon size={16} strokeWidth={2} className=" shrink-0" />
// //               <h2 className="text-sm font-semibold text-foreground">
// //                 Financial Summary
// //               </h2>
// //             </div>

// //             <div className="grid grid-cols-1 sm:grid-cols-2">
// //               {/* Left column */}
// //               <div className="text-sm divide-y divide-border sm:border-r sm:border-border">
// //                 <div className="flex items-center h-14 justify-between px-4 py-2.5">
// //                   <span className="text-foreground">Project Expenses</span>
// //                   <span className="font-semibold text-destructive">
// //                     {fmtAmount(summary.projectExpenses)}
// //                   </span>
// //                 </div>
// //                 <div className="flex items-center h-14 justify-between px-4 py-2.5">
// //                   <span className="text-muted-foreground">Worker Cost</span>
// //                   <span className="text-muted-foreground">
// //                     {fmtAmount(summary.workerCost)}
// //                   </span>
// //                 </div>
// //                 <div className="flex items-center h-14 justify-between px-4 py-2.5 bg-accent">
// //                   <span className="font-medium text-accent-foreground">
// //                     Build Expenses
// //                   </span>
// //                   <span className="font-semibold text-accent-foreground">
// //                     {fmtAmount(summary.buildExpenses)}
// //                   </span>
// //                 </div>
// //               </div>

// //               {/* Right column */}
// //               <div className="text-sm divide-y divide-border">
// //                 <div className="px-4 h-14 py-2.5">
// //                   <div className="flex flex-row  items-center  justify-between">
// //                     <span className="text-foreground">
// //                       Builder Margin{" "}
// //                       <span className="text-primary font-semibold">
// //                         {MARGIN_PERCENT}%
// //                       </span>
// //                     </span>
// //                     <span className="font-semibold text-foreground">
// //                       {fmtAmount(summary.builderMargin)}
// //                     </span>
// //                   </div>
// //                   <div className="flex items-center justify-between mt-0.5">
// //                     <span className="text-xs text-muted-foreground">+ GST</span>
// //                     <span className="text-xs text-muted-foreground">
// //                       {fmtAmount(summary.gst)}
// //                     </span>
// //                   </div>
// //                 </div>
// //                 <div className="flex items-center  h-14 justify-between px-4 py-2.5">
// //                   <span className="font-medium text-foreground">
// //                     Total Builder Margin
// //                   </span>
// //                   <span className="font-semibold text-foreground">
// //                     {fmtAmount(summary.totalBuilderMargin)}
// //                   </span>
// //                 </div>
// //                 <div className="flex items-center  h-14 justify-between px-4 py-2.5 bg-accent">
// //                   <span className="font-medium text-accent-foreground">
// //                     Final Project Expenses
// //                   </span>
// //                   <span className="font-semibold text-accent-foreground">
// //                     {fmtAmount(summary.finalProjectExpenses)}
// //                   </span>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="border-t border-border min-h-14 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
// //               <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
// //                 <div>
// //                   <span className="text-muted-foreground">
// //                     Collection/Received:{" "}
// //                   </span>
// //                   <strong className="text-[#10B981]">
// //                     {fmtAmount(summary.collectionReceived)}
// //                   </strong>
// //                 </div>
// //                 <div>
// //                   <span className="text-muted-foreground">Customer Paid: </span>
// //                   <strong className="text-[#10B981]">
// //                     {fmtAmount(summary.customerPaid)}
// //                   </strong>
// //                 </div>
// //               </div>
// //               <div
// //                 className={`flex items-center justify-between sm:justify-end gap-3 px-4 py-2 rounded-md font-bold text-sm ${
// //                   summary.balance >= 0
// //                     ? "bg-[#10B981]/10 text-[#10B981]"
// //                     : "bg-destructive/10 text-destructive"
// //                 }`}
// //               >
// //                 <span>Balance</span>
// //                 <span>
// //                   {summary.balance >= 0 ? "+" : ""}
// //                   {fmtAmount(summary.balance)}
// //                 </span>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* ── Tab Bar ──────────────────────────────────────────────── */}
// //         <div className="flex flex-wrap items-center gap-4 mb-6">
// //           <div className="inline-flex items-center gap-1 bg-secondary rounded-md p-1">
// //             <button
// //               onClick={() => setActiveTab("byContractor")}
// //               className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
// //                 activeTab === "byContractor"
// //                   ? "bg-card text-foreground shadow-sm"
// //                   : "text-muted-foreground hover:text-foreground"
// //               }`}
// //             >
// //               Group by Contractor
// //               <span
// //                 className={`text-xs px-1.5 py-0.5 rounded-full ${
// //                   activeTab === "byContractor"
// //                     ? "bg-accent text-accent-foreground"
// //                     : "bg-muted text-muted-foreground"
// //                 }`}
// //               >
// //                 {contractorGroups.length}
// //               </span>
// //             </button>

// //             <button
// //               onClick={() => setActiveTab("transactions")}
// //               className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
// //                 activeTab === "transactions"
// //                   ? "bg-card text-foreground shadow-sm"
// //                   : "text-muted-foreground hover:text-foreground"
// //               }`}
// //             >
// //               Transactions
// //               <span
// //                 className={`text-xs px-1.5 py-0.5 rounded-full ${
// //                   activeTab === "transactions"
// //                     ? "bg-accent text-accent-foreground"
// //                     : "bg-muted text-muted-foreground"
// //                 }`}
// //               >
// //                 {rows.length}
// //               </span>
// //             </button>
// //           </div>

// //           {activeTab === "byContractor" && workerLogs.length > 0 && (
// //             <button
// //               onClick={scrollToWorkerSection}
// //               className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-accent px-2.5 py-1 rounded-full transition-colors"
// //             >
// //               Jump to Worker
// //               <MoveDownIcon size={12} />
// //             </button>
// //           )}
// //         </div>

// //         {/* ── Transactions Tab (TanStack Table) ───────────────────── */}
// //         {activeTab === "transactions" && (
// //           <div className="border border-border rounded-md overflow-hidden">
// //             <div className="overflow-x-auto">
// //               <Table className="min-w-[1200px] ">
// //                 <TableHeader>
// //                   {table.getHeaderGroups().map((group) => (
// //                     <TableRow
// //                       key={group.id}
// //                       className="border-b border-border bg-muted/30"
// //                     >
// //                       {group.headers.map((header) => (
// //                         <TableHead key={header.id} className="px-4 py-3">
// //                           {header.isPlaceholder
// //                             ? null
// //                             : flexRender(
// //                                 header.column.columnDef.header,
// //                                 header.getContext(),
// //                               )}
// //                         </TableHead>
// //                       ))}
// //                     </TableRow>
// //                   ))}
// //                 </TableHeader>
// //                 <TableBody>
// //                   {isLoading ? (
// //                     <TableRow>
// //                       <TableCell
// //                         colSpan={columns.length}
// //                         className="text-center py-12 text-muted-foreground"
// //                       >
// //                         <Loader2
// //                           className="inline animate-spin mr-2"
// //                           size={14}
// //                         />
// //                         Loading...
// //                       </TableCell>
// //                     </TableRow>
// //                   ) : table.getRowModel().rows.length === 0 ? (
// //                     <TableRow>
// //                       <TableCell
// //                         colSpan={columns.length}
// //                         className="text-center py-12 text-muted-foreground"
// //                       >
// //                         No approved transactions for this project.
// //                       </TableCell>
// //                     </TableRow>
// //                   ) : (
// //                     table.getRowModel().rows.map((row, idx) => {
// //                       const rowKey = `t-${row.original.TXN_ID}`;
// //                       const isSelected = selectedRowKey === rowKey;
// //                       return (
// //                         <TableRow
// //                           key={row.id}
// //                           tabIndex={0}
// //                           aria-selected={isSelected}
// //                           onClick={handleRowClick(rowKey)}
// //                           onKeyDown={handleRowKeyDown(rowKey)}
// //                           className={`cursor-pointer border-b border-border last:border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
// //                             isSelected
// //                               ? "bg-selected hover:bg-selected"
// //                               : `hover:bg-accent ${
// //                                   idx % 2 === 1 ? "bg-muted/60" : "bg-card"
// //                                 }`
// //                           }`}
// //                         >
// //                           {row.getVisibleCells().map((cell, cellIndex) => (
// //                             <TableCell
// //                               key={cell.id}
// //                               className={`px-4 py-2.5 align-middle ${
// //                                 cellIndex === 0 ? firstCellClass(isSelected) : ""
// //                               }`}
// //                             >
// //                               {flexRender(
// //                                 cell.column.columnDef.cell,
// //                                 cell.getContext(),
// //                               )}
// //                             </TableCell>
// //                           ))}
// //                         </TableRow>
// //                       );
// //                     })
// //                   )}
// //                 </TableBody>
// //               </Table>
// //             </div>
// //             {!isLoading && rows.length > 0 && (
// //               <div className="border-t border-border px-2">
// //                 <DataTablePaginationTwo
// //                   table={table}
// //                   tableKey="project-report-transactions"
// //                 />
// //               </div>
// //             )}
// //           </div>
// //         )}

// //         {/* ── Group by Contractor Tab ─────────────────────────────── */}
// //         {activeTab === "byContractor" && (
// //           <div className="space-y-4">
// //             {isLoading ? (
// //               <div className="text-center py-12 text-muted-foreground">
// //                 <Loader2 className="inline animate-spin mr-2" size={16} />
// //                 Loading...
// //               </div>
// //             ) : contractorGroups.length === 0 &&
// //               workerLogs.length === 0 &&
// //               linesWithoutContractor.length === 0 ? (
// //               <div className="text-center py-12 text-muted-foreground border border-border rounded-md">
// //                 No approved transactions for this project.
// //               </div>
// //             ) : (
// //               <>
// //                 {contractorGroups.map((group) => {
// //                   const key = group.contractorId ?? "none";
// //                   const visibleRows = group.rows;

// //                   const cLines =
// //                     group.contractorId != null
// //                       ? budgetByContractor.get(Number(group.contractorId)) || []
// //                       : [];
// //                   // only sole-contractor lines add to Budget (shared lines would be double counted)
// //                   const budget = cLines
// //                     .filter((l) => (l.contractorIds || []).length === 1)
// //                     .reduce((s, l) => s + (Number(l.cost) || 0), 0);
// //                   const remaining = budget - group.totalPayment;
// //                   const usedPct =
// //                     budget > 0
// //                       ? Math.round((group.totalPayment / budget) * 100)
// //                       : null;

// //                   return (
// //                     <div
// //                       key={key}
// //                       id={`contractor-${key}`}
// //                       className={`scroll-mt-16 border border-border rounded-md overflow-hidden transition-shadow ${
// //                         activeJumpKey === key ? "ring-2 ring-selected-border" : ""
// //                       }`}
// //                     >
// //                       {/* Contractor header */}
// //                       <div
// //                         className={`px-4 py-3 border-b border-border transition-colors ${
// //                           activeJumpKey === key ? "bg-selected" : "bg-muted/40"
// //                         }`}
// //                       >
// //                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
// //                           <div className="min-w-0">
// //                             <WrappedName
// //                               name={group.contractorName}
// //                               size="md"
// //                               showAvatar
// //                               maxLines={1}
// //                             />
// //                           </div>
// //                           <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
// //                             {budget > 0 && (
// //                               <div>
// //                                 <span className="text-muted-foreground">
// //                                   Budget:{" "}
// //                                 </span>
// //                                 <strong>{fmtAmount(budget)}</strong>
// //                               </div>
// //                             )}
// //                             <div>
// //                               <span className="text-muted-foreground">
// //                                 Received:{" "}
// //                               </span>
// //                               <strong className="text-[#10B981]">
// //                                 {fmtAmount(group.totalReceived)}
// //                               </strong>
// //                             </div>
// //                             <div>
// //                               <span className="text-muted-foreground">
// //                                 Payment:{" "}
// //                               </span>
// //                               <strong className="text-destructive">
// //                                 {fmtAmount(group.totalPayment)}
// //                               </strong>
// //                             </div>
// //                             <div>
// //                               <span className="text-muted-foreground">
// //                                 Net:{" "}
// //                               </span>
// //                               <strong
// //                                 className={
// //                                   group.net >= 0
// //                                     ? "text-[#10B981]"
// //                                     : "text-destructive"
// //                                 }
// //                               >
// //                                 {fmtAmount(group.net)}
// //                               </strong>
// //                             </div>
// //                             {budget > 0 && (
// //                               <div>
// //                                 <span className="text-muted-foreground">
// //                                   Remaining:{" "}
// //                                 </span>
// //                                 <strong
// //                                   className={
// //                                     remaining < 0
// //                                       ? "text-destructive"
// //                                       : "text-[#10B981]"
// //                                   }
// //                                 >
// //                                   {fmtAmount(remaining)}
// //                                 </strong>
// //                                 {usedPct != null && (
// //                                   <span className="text-muted-foreground">
// //                                     {" "}
// //                                     ({usedPct}%)
// //                                   </span>
// //                                 )}
// //                               </div>
// //                             )}
// //                           </div>
// //                         </div>

// //                         {cLines.length > 0 && (
// //                           <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
// //                             {cLines.map((l) => (
// //                               <div
// //                                 key={l.lineId}
// //                                 className="flex items-center gap-1.5 text-xs"
// //                               >
// //                                 <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
// //                                   {l.typeName || "—"}
// //                                 </span>
// //                                 <span className="text-muted-foreground">
// //                                   {fmtAmount(l.cost)}
// //                                   {(l.contractorIds || []).length > 1
// //                                     ? " (shared)"
// //                                     : ""}
// //                                 </span>
// //                                 <StatusSelect
// //                                   value={l.status}
// //                                   onChange={(v) => handleStatusChange(l, v)}
// //                                   disabled={statusMutation.isPending}
// //                                 />
// //                               </div>
// //                             ))}
// //                           </div>
// //                         )}
// //                       </div>

// //                       {/* Contractor's transactions */}
// //                       {visibleRows.length === 0 ? (
// //                         <div className="px-4 py-4 text-xs italic text-muted-foreground">
// //                           No payments yet.
// //                         </div>
// //                       ) : (
// //                         <div className="overflow-x-auto">
// //                           <table className="w-full text-sm min-w-[900px]">
// //                             <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
// //                               <tr>
// //                                 <th className="px-4 py-2.5 text-left font-semibold">
// //                                   Date
// //                                 </th>
// //                                 <th className="px-4 py-2.5 text-right font-semibold">
// //                                   Received
// //                                 </th>
// //                                 <th className="px-4 py-2.5 text-right font-semibold">
// //                                   Payment
// //                                 </th>
// //                                 <th className="px-4 py-2.5 text-left font-semibold">
// //                                   Description
// //                                 </th>
// //                                 <th className="px-4 py-2.5 text-left font-semibold">
// //                                   Source
// //                                 </th>
// //                                 <th className="px-4 py-2.5 text-left font-semibold">
// //                                   Remarks
// //                                 </th>
// //                                 <th className="px-4 py-2.5 text-left font-semibold">
// //                                   Approved
// //                                 </th>
// //                                 <th className="px-4 py-2.5 text-left font-semibold">
// //                                   Invoice
// //                                 </th>
// //                                 <th className="px-4 py-2.5"></th>
// //                               </tr>
// //                             </thead>
// //                             <tbody>
// //                               {visibleRows.map((r, idx) => {
// //                                 const rowKey = `c-${r.TXN_ID}`;
// //                                 const isSelected = selectedRowKey === rowKey;
// //                                 return (
// //                                   <tr
// //                                     key={r.TXN_ID}
// //                                     tabIndex={0}
// //                                     aria-selected={isSelected}
// //                                     onClick={handleRowClick(rowKey)}
// //                                     onKeyDown={handleRowKeyDown(rowKey)}
// //                                     className={rowStateClass(isSelected, idx)}
// //                                   >
// //                                     <td
// //                                       className={`px-4 py-2.5 whitespace-nowrap font-medium text-foreground text-sm ${firstCellClass(
// //                                         isSelected,
// //                                       )}`}
// //                                     >
// //                                       {fmtDate(r.TXN_DATE)}
// //                                     </td>
// //                                     <td className="px-4 py-2.5 text-right font-semibold text-[#10B981] whitespace-nowrap text-sm">
// //                                       {r.DEBIT != null ? fmtAmount(r.DEBIT) : "—"}
// //                                     </td>
// //                                     <td className="px-4 py-2.5 text-right font-semibold text-destructive whitespace-nowrap text-sm">
// //                                       {r.CREDIT != null
// //                                         ? fmtAmount(r.CREDIT)
// //                                         : "—"}
// //                                     </td>
// //                                     <td className="px-4 py-2.5 max-w-[220px] text-foreground text-sm break-words">
// //                                       {r.DESCRIPTION}
// //                                     </td>
// //                                     <td className="px-4 py-2.5">
// //                                       <SourceBadge row={r} />
// //                                     </td>
// //                                     <td className="px-4 py-2.5 text-foreground text-sm">
// //                                       {r.REMARKS || (
// //                                         <span className="text-muted-foreground italic">
// //                                           —
// //                                         </span>
// //                                       )}
// //                                     </td>
// //                                     <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground text-sm">
// //                                       {fmtDate(r.APPROVED_DATE)}
// //                                     </td>
// //                                     <td className="px-4 py-2.5 min-w-[160px]">
// //                                       <InvoiceCell
// //                                         parentType="main"
// //                                         parentId={r.TXN_ID}
// //                                         readOnly
// //                                       />
// //                                     </td>
// //                                     <td className="px-4 py-2.5">
// //                                       {r.SOURCE_TYPE === "NON_BANKING" &&
// //                                         canEdit && (
// //                                           <Tooltip>
// //                                             <TooltipTrigger asChild>
// //                                               <Button
// //                                                 size="icon"
// //                                                 variant="ghost"
// //                                                 disabled={!canEdit}
// //                                                 onClick={() =>
// //                                                   handleEditNonBanking(r.TXN_ID)
// //                                                 }
// //                                                 aria-label="Edit"
// //                                                 className="h-7 w-7 rounded-full"
// //                                               >
// //                                                 <Pencil size={13} />
// //                                               </Button>
// //                                             </TooltipTrigger>
// //                                             <TooltipContent>Edit</TooltipContent>
// //                                           </Tooltip>
// //                                         )}
// //                                     </td>
// //                                   </tr>
// //                                 );
// //                               })}
// //                             </tbody>
// //                           </table>
// //                         </div>
// //                       )}
// //                     </div>
// //                   );
// //                 })}

// //                 {/* Budget lines without contractor */}
// //                 {linesWithoutContractor.length > 0 && (
// //                   <div className="border border-border rounded-md overflow-hidden">
// //                     <div className="px-4 py-3 bg-muted/40 border-b border-border">
// //                       <h3 className="text-sm font-semibold text-foreground">
// //                         Budget lines without contractor
// //                       </h3>
// //                     </div>
// //                     <table className="w-full text-sm">
// //                       <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
// //                         <tr>
// //                           <th className="px-4 py-2.5 text-left font-semibold">
// //                             Type
// //                           </th>
// //                           <th className="px-4 py-2.5 text-right font-semibold">
// //                             Budget
// //                           </th>
// //                           <th className="px-4 py-2.5 text-left font-semibold">
// //                             Status
// //                           </th>
// //                         </tr>
// //                       </thead>
// //                       <tbody>
// //                         {linesWithoutContractor.map((l) => (
// //                           <tr
// //                             key={l.lineId}
// //                             className="border-b border-border last:border-0"
// //                           >
// //                             <td className="px-4 py-2.5 text-sm font-medium">
// //                               {l.typeName || "—"}
// //                             </td>
// //                             <td className="px-4 py-2.5 text-right text-sm">
// //                               {fmtAmount(l.cost)}
// //                             </td>
// //                             <td className="px-4 py-2.5">
// //                               <StatusSelect
// //                                 value={l.status}
// //                                 onChange={(v) => handleStatusChange(l, v)}
// //                                 disabled={statusMutation.isPending}
// //                               />
// //                             </td>
// //                           </tr>
// //                         ))}
// //                       </tbody>
// //                     </table>
// //                   </div>
// //                 )}

// //                 {/* Worker Hours & Costing */}
// //                 {workerLogs.length > 0 && (
// //                   <div
// //                     ref={workerSectionRef}
// //                     className={`scroll-mt-16 border border-border rounded-md overflow-hidden transition-shadow ${
// //                       activeJumpKey === "worker"
// //                         ? "ring-2 ring-selected-border"
// //                         : ""
// //                     }`}
// //                   >
// //                     <div
// //                       className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-border transition-colors ${
// //                         activeJumpKey === "worker" ? "bg-selected" : "bg-muted/40"
// //                       }`}
// //                     >
// //                       <div className="flex items-center gap-2">
// //                         <Users size={16} />
// //                         <h3 className="text-sm font-semibold text-foreground">
// //                           Worker Hours & Costing
// //                         </h3>
// //                       </div>
// //                       <div className="flex items-center gap-5 text-xs">
// //                         <div>
// //                           <span className="text-muted-foreground">
// //                             Total Hours:{" "}
// //                           </span>
// //                           <strong className="text-foreground">
// //                             {fmtHours(workerTotals.totalHours)}
// //                           </strong>
// //                         </div>
// //                         <div>
// //                           <span className="text-muted-foreground">
// //                             Total Cost:{" "}
// //                           </span>
// //                           <strong className="text-destructive">
// //                             {fmtAmount(workerTotals.totalAmount)}
// //                           </strong>
// //                         </div>
// //                       </div>
// //                     </div>
// //                     <div className="overflow-x-auto">
// //                       <table className="w-full text-sm min-w-[800px]">
// //                         <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
// //                           <tr>
// //                             <th className="px-4 py-2.5 text-left font-semibold">
// //                               Worker
// //                             </th>
// //                             <th className="px-4 py-2.5 text-left font-semibold">
// //                               Date
// //                             </th>
// //                             <th className="px-4 py-2.5 text-left font-semibold">
// //                               Basis
// //                             </th>
// //                             <th className="px-4 py-2.5 text-left font-semibold">
// //                               Remarks
// //                             </th>
// //                             <th className="px-4 py-2.5 text-right font-semibold">
// //                               Hours
// //                             </th>
// //                             <th className="px-4 py-2.5 text-right font-semibold">
// //                               Days
// //                             </th>
// //                             <th className="px-4 py-2.5 text-right font-semibold">
// //                               Rate
// //                             </th>
// //                             <th className="px-4 py-2.5 text-right font-semibold">
// //                               Amount
// //                             </th>
// //                           </tr>
// //                         </thead>
// //                         <tbody>
// //                           {workerLogs.map((w, idx) => {
// //                             const rowKey = `w-${w.ATTENDANCE_ID}`;
// //                             const isSelected = selectedRowKey === rowKey;
// //                             return (
// //                               <tr
// //                                 key={w.ATTENDANCE_ID}
// //                                 tabIndex={0}
// //                                 aria-selected={isSelected}
// //                                 onClick={handleRowClick(rowKey)}
// //                                 onKeyDown={handleRowKeyDown(rowKey)}
// //                                 className={rowStateClass(isSelected, idx)}
// //                               >
// //                                 <td
// //                                   className={`px-4 py-2.5 ${firstCellClass(
// //                                     isSelected,
// //                                   )}`}
// //                                 >
// //                                   <WrappedName
// //                                     name={w.WORKER_NAME}
// //                                     showAvatar
// //                                     maxLines={1}
// //                                   />
// //                                 </td>
// //                                 <td className="px-4 py-2.5 whitespace-nowrap text-sm">
// //                                   {fmtDate(w.ATTENDANCE_DATE)}
// //                                 </td>
// //                                 <td className="px-4 py-2.5">
// //                                   <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
// //                                     {w.CALC_BASIS}
// //                                   </span>
// //                                 </td>
// //                                 <td className="px-4 py-2.5 text-foreground text-sm">
// //                                   {w.REMARKS || (
// //                                     <span className="text-muted-foreground italic">
// //                                       —
// //                                     </span>
// //                                   )}
// //                                 </td>
// //                                 <td className="px-4 py-2.5 text-right text-sm">
// //                                   {fmtHours(w.HOURS_WORKED)}
// //                                 </td>
// //                                 <td className="px-4 py-2.5 text-right text-sm">
// //                                   {w.DAYS_WORKED ?? "—"}
// //                                 </td>
// //                                 <td className="px-4 py-2.5 text-right text-sm">
// //                                   {fmtAmount(
// //                                     w.CALC_BASIS === "HOUR"
// //                                       ? w.RATE_PER_HOUR
// //                                       : w.RATE_PER_DAY,
// //                                   )}
// //                                 </td>
// //                                 <td className="px-4 py-2.5 text-right text-sm font-semibold">
// //                                   {w.AMOUNT != null ? (
// //                                     fmtAmount(w.AMOUNT)
// //                                   ) : (
// //                                     <span className="text-destructive italic">
// //                                       rate missing
// //                                     </span>
// //                                   )}
// //                                 </td>
// //                               </tr>
// //                             );
// //                           })}
// //                         </tbody>
// //                       </table>
// //                     </div>
// //                   </div>
// //                 )}
// //               </>
// //             )}
// //           </div>
// //         )}
// //       </div>
// //       <InvoiceSheet />
// //       {activeTab === "byContractor" && contractorGroups.length > 1 && (
// //         <Popover
// //           open={jumpOpen}
// //           onOpenChange={(open) => {
// //             setJumpOpen(open);
// //             if (!open) setJumpSearch("");
// //           }}
// //         >
// //           <PopoverTrigger asChild>
// //             <Button
// //               aria-label="Jump to contractor"
// //               className="fixed bottom-16 right-6 z-[60] h-9 rounded-full shadow-lg px-3 gap-1.5"
// //             >
// //               <List size={16} />
// //               <span className="hidden sm:inline text-xs">Contractors</span>
// //             </Button>
// //           </PopoverTrigger>
// //           <PopoverContent
// //             side="top"
// //             align="end"
// //             sideOffset={8}
// //             className="w-72 p-2"
// //           >
// //             {contractorGroups.length > 8 && (
// //               <input
// //                 type="text"
// //                 value={jumpSearch}
// //                 onChange={(e) => setJumpSearch(e.target.value)}
// //                 placeholder="Search contractor..."
// //                 className="mb-2 h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
// //               />
// //             )}
// //             <div className="max-h-96 overflow-y-auto flex flex-col">
// //               {jumpContractors.map((group) => {
// //                 const key = group.contractorId ?? "none";
// //                 const name = group.contractorName.trim();
// //                 return (
// //                   <button
// //                     key={key}
// //                     type="button"
// //                     title={name}
// //                     aria-current={activeJumpKey === key ? "true" : undefined}
// //                     onClick={() => {
// //                       setActiveJumpKey(key);
// //                       document
// //                         .getElementById(`contractor-${key}`)
// //                         ?.scrollIntoView({ behavior: "smooth", block: "start" });
// //                       setJumpOpen(false);
// //                     }}
// //                     className={`flex items-center gap-2 rounded-sm border-l-4 px-2 py-2.5 text-sm text-left text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
// //                       activeJumpKey === key
// //                         ? "bg-selected border-selected-border"
// //                         : "border-transparent"
// //                     }`}
// //                   >
// //                     <span
// //                       aria-hidden="true"
// //                       className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
// //                       style={{ backgroundColor: getAvatarColor(name) }}
// //                     >
// //                       {getInitials(name)}
// //                     </span>
// //                     <span
// //                       className={`flex-1 truncate ${
// //                         activeJumpKey === key ? "font-semibold" : ""
// //                       }`}
// //                     >
// //                       {name}
// //                     </span>
// //                     <span className="shrink-0 text-muted-foreground">
// //                       {group.rows.length}
// //                     </span>
// //                     {activeJumpKey === key && (
// //                       <Check size={16} className="shrink-0 text-primary" />
// //                     )}
// //                   </button>
// //                 );
// //               })}
// //               {workerLogs.length > 0 && (
// //                 <>
// //                   <div
// //                     aria-hidden="true"
// //                     className="mt-1 border-t border-border"
// //                   />
// //                   <button
// //                     type="button"
// //                     aria-current={
// //                       activeJumpKey === "worker" ? "true" : undefined
// //                     }
// //                     onClick={() => {
// //                       setActiveJumpKey("worker");
// //                       workerSectionRef.current?.scrollIntoView({
// //                         behavior: "smooth",
// //                         block: "start",
// //                       });
// //                       setJumpOpen(false);
// //                     }}
// //                     className={`flex items-center gap-2 rounded-sm border-l-4 px-2 py-2.5 text-sm text-left text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
// //                       activeJumpKey === "worker"
// //                         ? "bg-selected border-selected-border"
// //                         : "border-transparent"
// //                     }`}
// //                   >
// //                     <Users
// //                       size={16}
// //                       className="shrink-0 text-muted-foreground"
// //                     />
// //                     <span
// //                       className={`flex-1 truncate ${
// //                         activeJumpKey === "worker" ? "font-semibold" : ""
// //                       }`}
// //                     >
// //                       Worker Hours
// //                     </span>
// //                     {activeJumpKey === "worker" && (
// //                       <Check size={16} className="shrink-0 text-primary" />
// //                     )}
// //                   </button>
// //                 </>
// //               )}
// //             </div>
// //           </PopoverContent>
// //         </Popover>
// //       )}
// //       {showScrollTop && (
// //         <Button
// //           onClick={scrollToTop}
// //           aria-label="Scroll to top"
// //           size="icon"
// //           className="fixed bottom-6 right-6 z-[60] h-9 w-9 rounded-full shadow-lg hover:-translate-y-0.5 transition-all"
// //         >
// //           <MoveUpIcon size={16} />
// //         </Button>
// //       )}
// //     </SectionContainer>
// //   );
// // }

// // src\features\project-two\project-report-page-two.jsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
// import {
//   flexRender,
//   getCoreRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import {
//   Check,
//   Download,
//   Loader2,
//   FileText,
//   ArrowUpDown,
//   Users,
//   LandmarkIcon,
//   MoveDownIcon,
//   MoveUpIcon,
//   List,
//   Pencil,
//   Paperclip,
//   X,
// } from "lucide-react";
// import { toast } from "react-toastify";

// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { SectionContainer } from "@/components/SectionContainer";
// import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
// import InvoiceCell from "@/features/setting/pages/statement-upload-three/invoice/InvoiceCell";
// import InvoiceSheet from "@/features/setting/pages/statement-upload-three/invoice/InvoiceSheet";
// import WrappedName from "@/components/shared/WrappedName";
// import { getAvatarColor, getInitials } from "@/lib/avatar-utils";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { useHasPermission } from "@/hooks/use-permission";
// import { useRowSelectionStore } from "@/hooks/use-row-selection-store";

// const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// // ── Status helpers (construction process line status) ────────────────────────
// const STATUS_META = {
//   PENDING:     { label: "Pending",     cls: "bg-secondary text-secondary-foreground" },
//   IN_PROGRESS: { label: "In Progress", cls: "bg-amber-100 text-amber-700" },
//   COMPLETED:   { label: "Completed",   cls: "bg-[#10B981]/10 text-[#10B981]" },
// };

// const confirmStatusChange = (current, next) => {
//   if (next === current) return false;
//   if (next === "COMPLETED" || current === "COMPLETED") {
//     return window.confirm(`Change status to "${STATUS_META[next].label}"?`);
//   }
//   return true;
// };

// function StatusSelect({ value, onChange, disabled }) {
//   const v = STATUS_META[value] ? value : "PENDING";
//   return (
//     <select
//       value={v}
//       disabled={disabled}
//       onChange={(e) => onChange(e.target.value)}
//       className={`cursor-pointer rounded-full border-0 px-2 py-0.5 text-[10px] font-semibold outline-none disabled:opacity-60 ${STATUS_META[v].cls}`}
//     >
//       {Object.entries(STATUS_META).map(([k, m]) => (
//         <option key={k} value={k}>{m.label}</option>
//       ))}
//     </select>
//   );
// }

// // ── Files attached to a construction process line (contractor type row) ─────
// function LineFiles({ line, onUpload, onDelete, busy }) {
//   const inputRef = useRef(null);
//   const files = line.files || [];

//   return (
//     <div className="flex flex-wrap items-center gap-1.5">
//       {files.map((f) => (
//         <span
//           key={f.fileId}
//           className="inline-flex items-center gap-1 rounded-md border border-border bg-background py-0.5 pl-1.5 pr-1 text-[10px]"
//         >
//           <a
//             href={`${url}/api/construction-process/file/${f.fileId}`}
//             target="_blank"
//             rel="noreferrer"
//             title={f.fileName}
//             className="max-w-[140px] truncate font-medium text-primary hover:underline"
//           >
//             {f.fileName}
//           </a>
//           <button
//             type="button"
//             disabled={busy}
//             onClick={() => onDelete(f)}
//             aria-label={`Delete ${f.fileName}`}
//             className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-destructive disabled:opacity-50"
//           >
//             <X size={10} />
//           </button>
//         </span>
//       ))}
//       <input
//         ref={inputRef}
//         type="file"
//         multiple
//         className="hidden"
//         onChange={(e) => {
//           const picked = Array.from(e.target.files || []);
//           e.target.value = "";
//           if (picked.length) onUpload(line, picked);
//         }}
//       />
//       <button
//         type="button"
//         disabled={busy}
//         onClick={() => inputRef.current?.click()}
//         className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
//       >
//         <Paperclip size={10} />
//         Attach
//       </button>
//     </div>
//   );
// }

// // ── formatters ────────────────────────────────────────────────────────────────
// const fmtDate = (val) => {
//   if (!val) return "—";
//   const d = new Date(val);
//   if (isNaN(d.getTime())) return "—";
//   return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
// };

// const fmtAmount = (amt) => {
//   if (amt == null) return "—";
//   const n = Number(amt) || 0;
//   return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// };

// const fmtHours = (val) => {
//   if (val == null) return "—";
//   const n = Number(val) || 0;
//   return (Math.round(n * 100) / 100).toString();
// };

// function SourceBadge({ row }) {
//   const isNonBanking = row.SOURCE_TYPE === "NON_BANKING";
//   return (
//     <div className="flex flex-col items-start">
//       <div className="flex flex-col items-center gap-0.5">
//         <span
//           className={`w-fit whitespace-nowrap text-[10px] font-semibold px-2 py-0.5 rounded-full ${
//             isNonBanking
//               ? "bg-accent text-accent-foreground"
//               : "bg-secondary text-secondary-foreground"
//           }`}
//         >
//           {isNonBanking ? "Non-Banking" : "Banking"}
//         </span>
//         {isNonBanking && row.PAYMENT_BY === "CUSTOMER" && (
//           <span className="whitespace-nowrap text-[9px] font-medium text-amber-600 dark:text-amber-400">
//             Customer Paid
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }

// function SortableHeader({ column, children, align = "left" }) {
//   return (
//     <button
//       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       className={`flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-[11px] font-semibold uppercase tracking-wider ${
//         align === "right" ? "ml-auto" : ""
//       }`}
//     >
//       {children} <ArrowUpDown className="h-3 w-3" />
//     </button>
//   );
// }

// export function ProjectReportPageTwo() {
//   const { id: projectId } = useParams();
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   const canEdit = useHasPermission("PROJECT_STATEMENT_EDIT");
//   const handleEditNonBanking = (txnId) =>
//     navigate(
//       `/dashboard/projects/${projectId}/report/non-banking/${txnId}/edit`,
//     );

//   const [activeTab, setActiveTab] = useState("byContractor"); // "transactions" | "byContractor"
//   const [sorting, setSorting] = useState([{ id: "TXN_DATE", desc: true }]);
//   const workerSectionRef = useRef(null);
//   const [showScrollTop, setShowScrollTop] = useState(false);
//   const [jumpOpen, setJumpOpen] = useState(false);
//   const [jumpSearch, setJumpSearch] = useState("");
//   const [activeJumpKey, setActiveJumpKey] = useState(null);

//   useEffect(() => {
//     const handleScroll = () => {
//       setShowScrollTop(window.scrollY > 500);
//     };
//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const scrollToWorkerSection = () => {
//     workerSectionRef.current?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     });
//   };

//   // ── Row selection (one row at a time across the page) ───────────────
//   const SELECTION_SCOPE = "project-report";
//   const selectedRowKey = useRowSelectionStore(
//     (s) => s.selected[SELECTION_SCOPE] ?? null,
//   );
//   const toggleRow = useRowSelectionStore((s) => s.toggle);

//   // Clicks inside interactive children (Edit, Invoice, Status select ...) must not select.
//   const isInteractiveTarget = (e) =>
//     !!e.target.closest?.(
//       "button, a, input, textarea, select, [role='button']",
//     );

//   const handleRowClick = (rowKey) => (e) => {
//     if (isInteractiveTarget(e)) return;
//     toggleRow(SELECTION_SCOPE, rowKey);
//   };

//   const handleRowKeyDown = (rowKey) => (e) => {
//     if (e.key !== "Enter" && e.key !== " ") return;
//     if (isInteractiveTarget(e)) return;
//     e.preventDefault();
//     toggleRow(SELECTION_SCOPE, rowKey);
//   };

//   // Shared row classes for the contractor and worker tables.
//   const rowStateClass = (isSelected, idx) =>
//     `cursor-pointer border-b border-border last:border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
//       isSelected
//         ? "bg-selected hover:bg-selected"
//         : `hover:bg-accent ${idx % 2 === 1 ? "bg-muted/60" : "bg-transparent"}`
//     }`;

//   const firstCellClass = (isSelected) =>
//     `border-l-4 ${isSelected ? "border-selected-border" : "border-transparent"}`;

//   // ── data ──────────────────────────────────────────────────────────────────
//   const { data: report, isLoading } = useQuery({
//     queryKey: ["projectReport", projectId],
//     queryFn: async () =>
//       (await axios.get(`${url}/api/statement/project-report/${projectId}`)).data
//         ?.data || {
//         transactions: [],
//         workerLogs: [],
//         workerTotals: {},
//         marginPercent: null,
//         budgetLines: [],
//       },
//     enabled: !!projectId,
//   });

//   const { data: contractorList = [] } = useQuery({
//     queryKey: ["contractorNames"],
//     queryFn: async () =>
//       (await axios.get(`${url}/api/contractor`)).data?.data || [],
//   });

//   const rows = useMemo(() => report?.transactions || [], [report]);
//   const workerLogs = useMemo(() => report?.workerLogs || [], [report]);
//   const workerTotals = useMemo(
//     () =>
//       report?.workerTotals || { totalHours: 0, totalDays: 0, totalAmount: 0 },
//     [report],
//   );
//   const budgetLines = useMemo(() => report?.budgetLines || [], [report]);

//   const MARGIN_PERCENT =
//     report?.marginPercent != null ? Number(report.marginPercent) : 10;

//   const projectName =
//     rows.length > 0 ? rows[0].P_NAME : `Project #${projectId}`;

//   const totals = useMemo(() => {
//     const debit = rows.reduce((s, r) => s + (Number(r.DEBIT) || 0), 0);
//     const credit = rows.reduce((s, r) => s + (Number(r.CREDIT) || 0), 0);
//     const workerCost = Number(workerTotals.totalAmount) || 0;
//     return { debit, credit, workerCost, net: debit - credit - workerCost };
//   }, [rows, workerTotals]);

//   const summary = useMemo(() => {
//     const projectExpenses = totals.credit;
//     const workerCost = totals.workerCost;
//     const buildExpenses = projectExpenses + workerCost;

//     const marginableCredit = rows.reduce((s, r) => {
//       if (r.EXCLUDE_MARGIN === "Y") return s;
//       return s + (Number(r.CREDIT) || 0);
//     }, 0);
//     const marginBase = marginableCredit + workerCost;

//     const builderMargin = marginBase * (MARGIN_PERCENT / 100);
//     const gst = builderMargin * 0.1;
//     const totalBuilderMargin = builderMargin + gst;

//     const finalProjectExpenses = buildExpenses + totalBuilderMargin;

//     const customerPaid = rows.reduce((s, r) => {
//       if (
//         r.SOURCE_TYPE === "NON_BANKING" &&
//         r.PAYMENT_BY === "CUSTOMER" &&
//         r.CREDIT != null
//       ) {
//         return s + Number(r.CREDIT);
//       }
//       return s;
//     }, 0);

//     const collectionReceived = totals.debit;
//     const balance = collectionReceived + customerPaid - finalProjectExpenses;

//     return {
//       projectExpenses,
//       workerCost,
//       buildExpenses,
//       builderMargin,
//       gst,
//       totalBuilderMargin,
//       finalProjectExpenses,
//       collectionReceived,
//       customerPaid,
//       balance,
//     };
//   }, [totals, rows, MARGIN_PERCENT]);

//   const groupedByContractor = useMemo(() => {
//     const map = new Map();

//     for (const r of rows) {
//       const key = r.CONTRACTOR_ID != null ? r.CONTRACTOR_ID : "none";
//       if (!map.has(key)) {
//         map.set(key, {
//           contractorId: r.CONTRACTOR_ID ?? null,
//           contractorName: r.CONTRACTOR_NAME || "No Contractor",
//           rows: [],
//         });
//       }
//       map.get(key).rows.push(r);
//     }

//     return Array.from(map.values()).map((group) => {
//       const sortedRows = [...group.rows].sort(
//         (a, b) => new Date(a.TXN_DATE) - new Date(b.TXN_DATE),
//       );
//       const totalReceived = sortedRows.reduce(
//         (s, r) => s + (Number(r.DEBIT) || 0),
//         0,
//       );
//       const totalPayment = sortedRows.reduce(
//         (s, r) => s + (Number(r.CREDIT) || 0),
//         0,
//       );
//       return {
//         ...group,
//         rows: sortedRows,
//         totalReceived,
//         totalPayment,
//         net: totalReceived - totalPayment,
//       };
//     });
//   }, [rows]);

//   // ── budget / status linking ───────────────────────────────────────────────
//   const contractorNameMap = useMemo(
//     () =>
//       new Map(
//         contractorList.map((c) => [Number(c.CONTRATOR_ID), c.CONTRATOR_NAME]),
//       ),
//     [contractorList],
//   );

//   // contractorId -> [budget lines]
//   const budgetByContractor = useMemo(() => {
//     const m = new Map();
//     for (const l of budgetLines) {
//       for (const cid of l.contractorIds || []) {
//         const k = Number(cid);
//         if (!m.has(k)) m.set(k, []);
//         m.get(k).push(l);
//       }
//     }
//     return m;
//   }, [budgetLines]);

//   // contractors with payments + contractors that have a budget line but no payment yet
//   const contractorGroups = useMemo(() => {
//     const have = new Set(
//       groupedByContractor
//         .filter((g) => g.contractorId != null)
//         .map((g) => Number(g.contractorId)),
//     );
//     const extra = [];
//     for (const cid of budgetByContractor.keys()) {
//       if (!have.has(cid)) {
//         extra.push({
//           contractorId: cid,
//           contractorName: contractorNameMap.get(cid) || `Contractor #${cid}`,
//           rows: [],
//           totalReceived: 0,
//           totalPayment: 0,
//           net: 0,
//         });
//       }
//     }
//     return [...groupedByContractor, ...extra];
//   }, [groupedByContractor, budgetByContractor, contractorNameMap]);

//   const linesWithoutContractor = useMemo(
//     () => budgetLines.filter((l) => !(l.contractorIds || []).length),
//     [budgetLines],
//   );

//   const jumpContractors = useMemo(() => {
//     const q = jumpSearch.trim().toLowerCase();
//     if (!q) return contractorGroups;
//     return contractorGroups.filter((group) =>
//       group.contractorName.trim().toLowerCase().includes(q),
//     );
//   }, [contractorGroups, jumpSearch]);

//   const statusMutation = useMutation({
//     mutationFn: ({ ID, STATUS }) =>
//       axios.put(`${url}/api/construction-process?action=update_status`, {
//         ID,
//         STATUS,
//         UPDATED_BY: 105,
//       }),
//     onSuccess: () => {
//       toast.success("Status updated");
//       queryClient.invalidateQueries({ queryKey: ["projectReport", projectId] });
//       queryClient.invalidateQueries({ queryKey: ["constructionProcess"] });
//     },
//     onError: (e) =>
//       toast.error(e.response?.data?.message || "Status update failed"),
//   });

//   const handleStatusChange = (line, next) => {
//     if (!confirmStatusChange(line.status || "PENDING", next)) return;
//     statusMutation.mutate({ ID: line.lineId, STATUS: next });
//   };

//   // ── files per construction process line ───────────────────────────────────
//   const uploadFileMutation = useMutation({
//     mutationFn: async ({ lineId, files }) => {
//       for (const f of files) {
//         const fd = new FormData();
//         fd.append("CP_ID", lineId);
//         fd.append("UPLOADED_BY", 105);
//         fd.append("file", f);
//         await axios.post(`${url}/api/construction-process/file`, fd);
//       }
//     },
//     onSuccess: () => {
//       toast.success("File uploaded");
//       queryClient.invalidateQueries({ queryKey: ["projectReport", projectId] });
//     },
//     onError: (e) =>
//       toast.error(e.response?.data?.message || "File upload failed"),
//   });

//   const deleteFileMutation = useMutation({
//     mutationFn: (fileId) =>
//       axios.delete(`${url}/api/construction-process/file/${fileId}`),
//     onSuccess: () => {
//       toast.success("File deleted");
//       queryClient.invalidateQueries({ queryKey: ["projectReport", projectId] });
//     },
//     onError: (e) =>
//       toast.error(e.response?.data?.message || "File delete failed"),
//   });

//   const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

//   const handleUploadFiles = (line, files) => {
//     const tooBig = files.filter((f) => f.size > MAX_FILE_SIZE);
//     const ok = files.filter((f) => f.size <= MAX_FILE_SIZE);
//     if (tooBig.length) {
//       toast.error(
//         `${tooBig.map((f) => f.name).join(", ")} exceeds the 2 MB limit.`,
//       );
//     }
//     if (ok.length) uploadFileMutation.mutate({ lineId: line.lineId, files: ok });
//   };

//   const handleDeleteFile = (f) => {
//     if (!window.confirm(`Delete "${f.fileName}"?`)) return;
//     deleteFileMutation.mutate(f.fileId);
//   };

//   const fileBusy = uploadFileMutation.isPending || deleteFileMutation.isPending;

//   // ── CSV export helpers ──────────────────────────────────────────────
//   const buildSummaryCsvRows = () => [
//     "Summary",
//     `Project Expenses,${summary.projectExpenses}`,
//     `Worker Cost,${summary.workerCost}`,
//     `Build Expenses,${summary.buildExpenses}`,
//     `Builder Margin (${MARGIN_PERCENT}%),${summary.builderMargin}`,
//     `GST,${summary.gst}`,
//     `Total Builder Margin,${summary.totalBuilderMargin}`,
//     `Final Project Expenses,${summary.finalProjectExpenses}`,
//     `Collection/Received,${summary.collectionReceived}`,
//     `Customer Paid,${summary.customerPaid}`,
//     `Balance,${summary.balance}`,
//     "",
//   ];

//   const buildWorkerCsvRows = () => {
//     if (workerLogs.length === 0) return [];
//     const workerHeaders = [
//       "Worker",
//       "Date",
//       "Basis",
//       "Hours",
//       "Days",
//       "Rate",
//       "Amount",
//     ];
//     const workerRows = workerLogs.map((w) => [
//       `"${(w.WORKER_NAME || "").replace(/"/g, '""')}"`,
//       fmtDate(w.ATTENDANCE_DATE),
//       w.CALC_BASIS || "",
//       w.HOURS_WORKED ?? "",
//       w.DAYS_WORKED ?? "",
//       w.CALC_BASIS === "HOUR"
//         ? (w.RATE_PER_HOUR ?? "")
//         : (w.RATE_PER_DAY ?? ""),
//       w.AMOUNT ?? "MISSING_RATE",
//     ]);
//     return [
//       "",
//       "Worker Hours & Costing",
//       workerHeaders.join(","),
//       ...workerRows.map((r) => r.join(",")),
//       `Total Hours,${workerTotals.totalHours}`,
//       `Total Days,${workerTotals.totalDays}`,
//       `Total Worker Cost,${workerTotals.totalAmount}`,
//     ];
//   };

//   const downloadCsvFile = (csvParts, suffix) => {
//     const csv = csvParts.join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `${(projectName || "project").replace(/[^a-z0-9]/gi, "_").replace(/^_+|_+$/g, "")}_${suffix}.csv`;
//     link.click();
//   };

//   const handleDownloadAllCsv = () => {
//     if (rows.length === 0 && workerLogs.length === 0) {
//       toast.error("No data to download.");
//       return;
//     }
//     const csvParts = [...buildSummaryCsvRows()];

//     if (rows.length > 0) {
//       const headers = [
//         "Contractor",
//         "Date",
//         "Received",
//         "Payment",
//         "Description",
//         "Category",
//         "Matched Address",
//         "Invoice No",
//         "Source",
//         "Remarks",
//         "Approved Date",
//       ];
//       const csvRows = rows.map((r) => [
//         `"${(r.CONTRACTOR_NAME || "").replace(/"/g, '""')}"`,
//         fmtDate(r.TXN_DATE),
//         r.DEBIT ?? "",
//         r.CREDIT ?? "",
//         `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
//         r.CATEGORY || "",
//         `"${(r.MATCHED_ADDRESS || "").replace(/"/g, '""')}"`,
//         `"${(r.INVOICE_NO || "").replace(/"/g, '""')}"`,
//         r.SOURCE_TYPE || "",
//         `"${(r.REMARKS || "").replace(/"/g, '""')}"`,
//         fmtDate(r.APPROVED_DATE),
//       ]);
//       csvParts.push(
//         "Transactions",
//         headers.join(","),
//         ...csvRows.map((r) => r.join(",")),
//         `Total Received,${totals.debit}`,
//         `Total Payment,${totals.credit}`,
//         "",
//       );
//     }

//     csvParts.push(...buildWorkerCsvRows());
//     downloadCsvFile(csvParts, "report_all");
//   };

//   const handleDownloadByContractorCsv = () => {
//     if (contractorGroups.length === 0 && workerLogs.length === 0) {
//       toast.error("No data to download.");
//       return;
//     }
//     const csvParts = [...buildSummaryCsvRows()];

//     contractorGroups.forEach((group) => {
//       const cLines =
//         group.contractorId != null
//           ? budgetByContractor.get(Number(group.contractorId)) || []
//           : [];
//       const headers = [
//         "Date",
//         "Received",
//         "Payment",
//         "Description",
//         "Source",
//         "Remarks",
//         "Approved Date",
//       ];
//       const csvRows = group.rows.map((r) => [
//         fmtDate(r.TXN_DATE),
//         r.DEBIT ?? "",
//         r.CREDIT ?? "",
//         `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
//         r.SOURCE_TYPE || "",
//         `"${(r.REMARKS || "").replace(/"/g, '""')}"`,
//         fmtDate(r.APPROVED_DATE),
//       ]);
//       csvParts.push(
//         `Contractor: ${group.contractorName}`,
//         ...cLines.map(
//           (l) =>
//             `Budget line: ${l.typeName || ""} | ${l.cost} | ${STATUS_META[l.status]?.label || l.status}`,
//         ),
//         headers.join(","),
//         ...csvRows.map((r) => r.join(",")),
//         `Total Received,${group.totalReceived}`,
//         `Total Payment,${group.totalPayment}`,
//         `Net,${group.net}`,
//         "",
//       );
//     });

//     csvParts.push(...buildWorkerCsvRows());
//     downloadCsvFile(csvParts, "report_by_contractor");
//   };

//   // ── TanStack Table — Transactions tab ───────────────────────────────
//   const columns = useMemo(
//     () => [
//       {
//         accessorKey: "P_NAME",
//         header: () => (
//           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//             Project
//           </span>
//         ),
//         cell: ({ row }) => {
//           const r = row.original;
//           return (
//             <div className="flex flex-col gap-0.5 max-w-[180px]">
//               {r.P_ID != null && (
//                 <span className="w-fit text-[10px] font-semibold text-muted-foreground">
//                   ID: {r.P_ID}
//                 </span>
//               )}
//               <WrappedName name={r.P_NAME} maxChars={70} />
//             </div>
//           );
//         },
//       },
//       {
//         accessorKey: "CONTRACTOR_NAME",
//         header: () => (
//           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//             Contractor
//           </span>
//         ),
//         cell: ({ getValue }) => (
//           <span className="text-sm text-foreground">
//             {getValue() || (
//               <span className="text-muted-foreground italic">—</span>
//             )}
//           </span>
//         ),
//       },
//       {
//         accessorKey: "TXN_DATE",
//         header: ({ column }) => (
//           <SortableHeader column={column}>Date</SortableHeader>
//         ),
//         sortingFn: (a, b) =>
//           new Date(a.original.TXN_DATE || 0) -
//           new Date(b.original.TXN_DATE || 0),
//         cell: ({ getValue }) => (
//           <span className="whitespace-nowrap font-medium text-foreground text-sm">
//             {fmtDate(getValue())}
//           </span>
//         ),
//       },
//       {
//         accessorKey: "DEBIT",
//         header: ({ column }) => (
//           <div className="text-right">
//             <SortableHeader column={column} align="right">
//               Received
//             </SortableHeader>
//           </div>
//         ),
//         cell: ({ getValue }) => {
//           const v = getValue();
//           return (
//             <div className="text-right font-semibold text-[#10B981] whitespace-nowrap text-sm">
//               {v != null ? fmtAmount(v) : "—"}
//             </div>
//           );
//         },
//       },
//       {
//         accessorKey: "CREDIT",
//         header: ({ column }) => (
//           <div className="text-right">
//             <SortableHeader column={column} align="right">
//               Payment
//             </SortableHeader>
//           </div>
//         ),
//         cell: ({ getValue }) => {
//           const v = getValue();
//           return (
//             <div className="text-right font-semibold text-destructive whitespace-nowrap text-sm">
//               {v != null ? fmtAmount(v) : "—"}
//             </div>
//           );
//         },
//       },
//       {
//         accessorKey: "DESCRIPTION",
//         header: () => (
//           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//             Description
//           </span>
//         ),
//         cell: ({ getValue }) => (
//           <div
//             title={getValue() || ""}
//             className="max-w-[220px] text-foreground text-sm truncate"
//           >
//             {getValue()}
//           </div>
//         ),
//       },
//       {
//         accessorKey: "MATCHED_ADDRESS",
//         header: () => (
//           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//             Matched Address
//           </span>
//         ),
//         cell: ({ getValue }) => (
//           <div className="max-w-[150px]">
//             <WrappedName name={getValue()} className="text-primary" />
//           </div>
//         ),
//       },
//       {
//         accessorKey: "SOURCE_TYPE",
//         header: () => (
//           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//             Source
//           </span>
//         ),
//         cell: ({ row }) => <SourceBadge row={row.original} />,
//       },
//       {
//         accessorKey: "REMARKS",
//         header: () => (
//           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//             Remarks
//           </span>
//         ),
//         cell: ({ getValue }) => (
//           <span className="text-foreground text-sm">
//             {getValue() || (
//               <span className="text-muted-foreground italic">—</span>
//             )}
//           </span>
//         ),
//       },
//       {
//         accessorKey: "APPROVED_DATE",
//         header: ({ column }) => (
//           <SortableHeader column={column}>Approved</SortableHeader>
//         ),
//         sortingFn: (a, b) =>
//           new Date(a.original.APPROVED_DATE || 0) -
//           new Date(b.original.APPROVED_DATE || 0),
//         cell: ({ getValue }) => (
//           <span className="whitespace-nowrap text-muted-foreground text-sm">
//             {fmtDate(getValue())}
//           </span>
//         ),
//       },
//       {
//         id: "invoice",
//         header: () => (
//           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//             Invoice
//           </span>
//         ),
//         enableSorting: false,
//         cell: ({ row }) => (
//           <div className="min-w-[160px]">
//             <InvoiceCell
//               parentType="main"
//               parentId={row.original.TXN_ID}
//               readOnly
//             />
//           </div>
//         ),
//       },
//       {
//         id: "action",
//         header: () => null,
//         enableSorting: false,
//         cell: ({ row }) => {
//           const r = row.original;
//           if (r.SOURCE_TYPE !== "NON_BANKING" || !canEdit) return null;
//           return (
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   size="icon"
//                   variant="ghost"
//                   disabled={!canEdit}
//                   onClick={() => handleEditNonBanking(r.TXN_ID)}
//                   aria-label="Edit"
//                   className="h-7 w-7 rounded-full"
//                 >
//                   <Pencil size={13} />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>Edit</TooltipContent>
//             </Tooltip>
//           );
//         },
//       },
//     ],
//     [canEdit],
//   );

//   const table = useReactTable({
//     data: rows,
//     columns,
//     onSortingChange: setSorting,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     autoResetPageIndex: false,
//     state: { sorting },
//   });

//   const hasData = rows.length > 0 || workerLogs.length > 0;

//   return (
//     <SectionContainer variant="dashboard">
//       <div className="bg-card border border-border rounded-md p-4 md:p-6 shadow-sm">
//         {/* ── Page Header ───────────────────────────────────────────── */}
//         <div className="mb-6">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <div className="min-w-0">
//               <div className="flex items-center gap-2 min-w-0">
//                 <FileText size={18} strokeWidth={2} className=" shrink-0" />
//                 <h1 className="text-base font-semibold text-foreground truncate">
//                   {projectName} — Statement Report
//                 </h1>
//               </div>
//               <p className="text-xs text-muted-foreground mt-0.5">
//                 {isLoading ? (
//                   "Loading..."
//                 ) : (
//                   <>
//                     Showing {rows.length} transaction
//                     {rows.length !== 1 ? "s" : ""} across{" "}
//                     {contractorGroups.length} contractor
//                     {contractorGroups.length !== 1 ? "s" : ""}
//                     {" · "}
//                     As of{" "}
//                     {new Date().toLocaleDateString(undefined, {
//                       month: "short",
//                       day: "numeric",
//                       year: "numeric",
//                     })}
//                   </>
//                 )}
//               </p>
//             </div>
//             <Button
//               onClick={
//                 activeTab === "transactions"
//                   ? handleDownloadAllCsv
//                   : handleDownloadByContractorCsv
//               }
//               size="sm"
//               className="text-xs shrink-0"
//               disabled={rows.length === 0 && workerLogs.length === 0}
//             >
//               <Download size={14} className="mr-2" />
//               {activeTab === "transactions"
//                 ? "Download All CSV"
//                 : "Download by Contractor CSV"}
//             </Button>
//           </div>
//           <div className="w-full h-px bg-border mt-4" />
//         </div>

//         {/* ── Financial Summary Card ───────────────────────────────── */}
//         {!isLoading && hasData && (
//           <div className="mb-6 border border-border rounded-md overflow-hidden max-w-2xl">
//             <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
//               <LandmarkIcon size={16} strokeWidth={2} className=" shrink-0" />
//               <h2 className="text-sm font-semibold text-foreground">
//                 Financial Summary
//               </h2>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2">
//               {/* Left column */}
//               <div className="text-sm divide-y divide-border sm:border-r sm:border-border">
//                 <div className="flex items-center h-14 justify-between px-4 py-2.5">
//                   <span className="text-foreground">Project Expenses</span>
//                   <span className="font-semibold text-destructive">
//                     {fmtAmount(summary.projectExpenses)}
//                   </span>
//                 </div>
//                 <div className="flex items-center h-14 justify-between px-4 py-2.5">
//                   <span className="text-muted-foreground">Worker Cost</span>
//                   <span className="text-muted-foreground">
//                     {fmtAmount(summary.workerCost)}
//                   </span>
//                 </div>
//                 <div className="flex items-center h-14 justify-between px-4 py-2.5 bg-accent">
//                   <span className="font-medium text-accent-foreground">
//                     Build Expenses
//                   </span>
//                   <span className="font-semibold text-accent-foreground">
//                     {fmtAmount(summary.buildExpenses)}
//                   </span>
//                 </div>
//               </div>

//               {/* Right column */}
//               <div className="text-sm divide-y divide-border">
//                 <div className="px-4 h-14 py-2.5">
//                   <div className="flex flex-row  items-center  justify-between">
//                     <span className="text-foreground">
//                       Builder Margin{" "}
//                       <span className="text-primary font-semibold">
//                         {MARGIN_PERCENT}%
//                       </span>
//                     </span>
//                     <span className="font-semibold text-foreground">
//                       {fmtAmount(summary.builderMargin)}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between mt-0.5">
//                     <span className="text-xs text-muted-foreground">+ GST</span>
//                     <span className="text-xs text-muted-foreground">
//                       {fmtAmount(summary.gst)}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex items-center  h-14 justify-between px-4 py-2.5">
//                   <span className="font-medium text-foreground">
//                     Total Builder Margin
//                   </span>
//                   <span className="font-semibold text-foreground">
//                     {fmtAmount(summary.totalBuilderMargin)}
//                   </span>
//                 </div>
//                 <div className="flex items-center  h-14 justify-between px-4 py-2.5 bg-accent">
//                   <span className="font-medium text-accent-foreground">
//                     Final Project Expenses
//                   </span>
//                   <span className="font-semibold text-accent-foreground">
//                     {fmtAmount(summary.finalProjectExpenses)}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="border-t border-border min-h-14 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//               <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
//                 <div>
//                   <span className="text-muted-foreground">
//                     Collection/Received:{" "}
//                   </span>
//                   <strong className="text-[#10B981]">
//                     {fmtAmount(summary.collectionReceived)}
//                   </strong>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Customer Paid: </span>
//                   <strong className="text-[#10B981]">
//                     {fmtAmount(summary.customerPaid)}
//                   </strong>
//                 </div>
//               </div>
//               <div
//                 className={`flex items-center justify-between sm:justify-end gap-3 px-4 py-2 rounded-md font-bold text-sm ${
//                   summary.balance >= 0
//                     ? "bg-[#10B981]/10 text-[#10B981]"
//                     : "bg-destructive/10 text-destructive"
//                 }`}
//               >
//                 <span>Balance</span>
//                 <span>
//                   {summary.balance >= 0 ? "+" : ""}
//                   {fmtAmount(summary.balance)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Tab Bar ──────────────────────────────────────────────── */}
//         <div className="flex flex-wrap items-center gap-4 mb-6">
//           <div className="inline-flex items-center gap-1 bg-secondary rounded-md p-1">
//             <button
//               onClick={() => setActiveTab("byContractor")}
//               className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
//                 activeTab === "byContractor"
//                   ? "bg-card text-foreground shadow-sm"
//                   : "text-muted-foreground hover:text-foreground"
//               }`}
//             >
//               Group by Contractor
//               <span
//                 className={`text-xs px-1.5 py-0.5 rounded-full ${
//                   activeTab === "byContractor"
//                     ? "bg-accent text-accent-foreground"
//                     : "bg-muted text-muted-foreground"
//                 }`}
//               >
//                 {contractorGroups.length}
//               </span>
//             </button>

//             <button
//               onClick={() => setActiveTab("transactions")}
//               className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
//                 activeTab === "transactions"
//                   ? "bg-card text-foreground shadow-sm"
//                   : "text-muted-foreground hover:text-foreground"
//               }`}
//             >
//               Transactions
//               <span
//                 className={`text-xs px-1.5 py-0.5 rounded-full ${
//                   activeTab === "transactions"
//                     ? "bg-accent text-accent-foreground"
//                     : "bg-muted text-muted-foreground"
//                 }`}
//               >
//                 {rows.length}
//               </span>
//             </button>
//           </div>

//           {activeTab === "byContractor" && workerLogs.length > 0 && (
//             <button
//               onClick={scrollToWorkerSection}
//               className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-accent px-2.5 py-1 rounded-full transition-colors"
//             >
//               Jump to Worker
//               <MoveDownIcon size={12} />
//             </button>
//           )}
//         </div>

//         {/* ── Transactions Tab (TanStack Table) ───────────────────── */}
//         {activeTab === "transactions" && (
//           <div className="border border-border rounded-md overflow-hidden">
//             <div className="overflow-x-auto">
//               <Table className="min-w-[1200px] ">
//                 <TableHeader>
//                   {table.getHeaderGroups().map((group) => (
//                     <TableRow
//                       key={group.id}
//                       className="border-b border-border bg-muted/30"
//                     >
//                       {group.headers.map((header) => (
//                         <TableHead key={header.id} className="px-4 py-3">
//                           {header.isPlaceholder
//                             ? null
//                             : flexRender(
//                                 header.column.columnDef.header,
//                                 header.getContext(),
//                               )}
//                         </TableHead>
//                       ))}
//                     </TableRow>
//                   ))}
//                 </TableHeader>
//                 <TableBody>
//                   {isLoading ? (
//                     <TableRow>
//                       <TableCell
//                         colSpan={columns.length}
//                         className="text-center py-12 text-muted-foreground"
//                       >
//                         <Loader2
//                           className="inline animate-spin mr-2"
//                           size={14}
//                         />
//                         Loading...
//                       </TableCell>
//                     </TableRow>
//                   ) : table.getRowModel().rows.length === 0 ? (
//                     <TableRow>
//                       <TableCell
//                         colSpan={columns.length}
//                         className="text-center py-12 text-muted-foreground"
//                       >
//                         No approved transactions for this project.
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     table.getRowModel().rows.map((row, idx) => {
//                       const rowKey = `t-${row.original.TXN_ID}`;
//                       const isSelected = selectedRowKey === rowKey;
//                       return (
//                         <TableRow
//                           key={row.id}
//                           tabIndex={0}
//                           aria-selected={isSelected}
//                           onClick={handleRowClick(rowKey)}
//                           onKeyDown={handleRowKeyDown(rowKey)}
//                           className={`cursor-pointer border-b border-border last:border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
//                             isSelected
//                               ? "bg-selected hover:bg-selected"
//                               : `hover:bg-accent ${
//                                   idx % 2 === 1 ? "bg-muted/60" : "bg-card"
//                                 }`
//                           }`}
//                         >
//                           {row.getVisibleCells().map((cell, cellIndex) => (
//                             <TableCell
//                               key={cell.id}
//                               className={`px-4 py-2.5 align-middle ${
//                                 cellIndex === 0 ? firstCellClass(isSelected) : ""
//                               }`}
//                             >
//                               {flexRender(
//                                 cell.column.columnDef.cell,
//                                 cell.getContext(),
//                               )}
//                             </TableCell>
//                           ))}
//                         </TableRow>
//                       );
//                     })
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//             {!isLoading && rows.length > 0 && (
//               <div className="border-t border-border px-2">
//                 <DataTablePaginationTwo
//                   table={table}
//                   tableKey="project-report-transactions"
//                 />
//               </div>
//             )}
//           </div>
//         )}

//         {/* ── Group by Contractor Tab ─────────────────────────────── */}
//         {activeTab === "byContractor" && (
//           <div className="space-y-4">
//             {isLoading ? (
//               <div className="text-center py-12 text-muted-foreground">
//                 <Loader2 className="inline animate-spin mr-2" size={16} />
//                 Loading...
//               </div>
//             ) : contractorGroups.length === 0 &&
//               workerLogs.length === 0 &&
//               linesWithoutContractor.length === 0 ? (
//               <div className="text-center py-12 text-muted-foreground border border-border rounded-md">
//                 No approved transactions for this project.
//               </div>
//             ) : (
//               <>
//                 {contractorGroups.map((group) => {
//                   const key = group.contractorId ?? "none";
//                   const visibleRows = group.rows;

//                   const cLines =
//                     group.contractorId != null
//                       ? budgetByContractor.get(Number(group.contractorId)) || []
//                       : [];
//                   // only sole-contractor lines add to Budget (shared lines would be double counted)
//                   const budget = cLines
//                     .filter((l) => (l.contractorIds || []).length === 1)
//                     .reduce((s, l) => s + (Number(l.cost) || 0), 0);
//                   const remaining = budget - group.totalPayment;
//                   const usedPct =
//                     budget > 0
//                       ? Math.round((group.totalPayment / budget) * 100)
//                       : null;

//                   return (
//                     <div
//                       key={key}
//                       id={`contractor-${key}`}
//                       className={`scroll-mt-16 border border-border rounded-md overflow-hidden transition-shadow ${
//                         activeJumpKey === key ? "ring-2 ring-selected-border" : ""
//                       }`}
//                     >
//                       {/* Contractor header */}
//                       <div
//                         className={`px-4 py-3 border-b border-border transition-colors ${
//                           activeJumpKey === key ? "bg-selected" : "bg-muted/40"
//                         }`}
//                       >
//                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                           <div className="min-w-0">
//                             <WrappedName
//                               name={group.contractorName}
//                               size="md"
//                               showAvatar
//                               maxLines={1}
//                             />
//                           </div>
//                           <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
//                             {budget > 0 && (
//                               <div>
//                                 <span className="text-muted-foreground">
//                                   Budget:{" "}
//                                 </span>
//                                 <strong>{fmtAmount(budget)}</strong>
//                               </div>
//                             )}
//                             <div>
//                               <span className="text-muted-foreground">
//                                 Received:{" "}
//                               </span>
//                               <strong className="text-[#10B981]">
//                                 {fmtAmount(group.totalReceived)}
//                               </strong>
//                             </div>
//                             <div>
//                               <span className="text-muted-foreground">
//                                 Payment:{" "}
//                               </span>
//                               <strong className="text-destructive">
//                                 {fmtAmount(group.totalPayment)}
//                               </strong>
//                             </div>
//                             <div>
//                               <span className="text-muted-foreground">
//                                 Net:{" "}
//                               </span>
//                               <strong
//                                 className={
//                                   group.net >= 0
//                                     ? "text-[#10B981]"
//                                     : "text-destructive"
//                                 }
//                               >
//                                 {fmtAmount(group.net)}
//                               </strong>
//                             </div>
//                             {budget > 0 && (
//                               <div>
//                                 <span className="text-muted-foreground">
//                                   Remaining:{" "}
//                                 </span>
//                                 <strong
//                                   className={
//                                     remaining < 0
//                                       ? "text-destructive"
//                                       : "text-[#10B981]"
//                                   }
//                                 >
//                                   {fmtAmount(remaining)}
//                                 </strong>
//                                 {usedPct != null && (
//                                   <span className="text-muted-foreground">
//                                     {" "}
//                                     ({usedPct}%)
//                                   </span>
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         {cLines.length > 0 && (
//                           <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
//                             {cLines.map((l) => (
//                               <div
//                                 key={l.lineId}
//                                 className="flex flex-wrap items-center gap-1.5 text-xs"
//                               >
//                                 <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
//                                   {l.typeName || "—"}
//                                 </span>
//                                 <span className="text-muted-foreground">
//                                   {fmtAmount(l.cost)}
//                                   {(l.contractorIds || []).length > 1
//                                     ? " (shared)"
//                                     : ""}
//                                 </span>
//                                 <StatusSelect
//                                   value={l.status}
//                                   onChange={(v) => handleStatusChange(l, v)}
//                                   disabled={statusMutation.isPending}
//                                 />
//                                 <LineFiles
//                                   line={l}
//                                   onUpload={handleUploadFiles}
//                                   onDelete={handleDeleteFile}
//                                   busy={fileBusy}
//                                 />
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>

//                       {/* Contractor's transactions */}
//                       {visibleRows.length === 0 ? (
//                         <div className="px-4 py-4 text-xs italic text-muted-foreground">
//                           No payments yet.
//                         </div>
//                       ) : (
//                         <div className="overflow-x-auto">
//                           <table className="w-full text-sm min-w-[900px]">
//                             <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
//                               <tr>
//                                 <th className="px-4 py-2.5 text-left font-semibold">
//                                   Date
//                                 </th>
//                                 <th className="px-4 py-2.5 text-right font-semibold">
//                                   Received
//                                 </th>
//                                 <th className="px-4 py-2.5 text-right font-semibold">
//                                   Payment
//                                 </th>
//                                 <th className="px-4 py-2.5 text-left font-semibold">
//                                   Description
//                                 </th>
//                                 <th className="px-4 py-2.5 text-left font-semibold">
//                                   Source
//                                 </th>
//                                 <th className="px-4 py-2.5 text-left font-semibold">
//                                   Remarks
//                                 </th>
//                                 <th className="px-4 py-2.5 text-left font-semibold">
//                                   Approved
//                                 </th>
//                                 <th className="px-4 py-2.5 text-left font-semibold">
//                                   Invoice
//                                 </th>
//                                 <th className="px-4 py-2.5"></th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {visibleRows.map((r, idx) => {
//                                 const rowKey = `c-${r.TXN_ID}`;
//                                 const isSelected = selectedRowKey === rowKey;
//                                 return (
//                                   <tr
//                                     key={r.TXN_ID}
//                                     tabIndex={0}
//                                     aria-selected={isSelected}
//                                     onClick={handleRowClick(rowKey)}
//                                     onKeyDown={handleRowKeyDown(rowKey)}
//                                     className={rowStateClass(isSelected, idx)}
//                                   >
//                                     <td
//                                       className={`px-4 py-2.5 whitespace-nowrap font-medium text-foreground text-sm ${firstCellClass(
//                                         isSelected,
//                                       )}`}
//                                     >
//                                       {fmtDate(r.TXN_DATE)}
//                                     </td>
//                                     <td className="px-4 py-2.5 text-right font-semibold text-[#10B981] whitespace-nowrap text-sm">
//                                       {r.DEBIT != null ? fmtAmount(r.DEBIT) : "—"}
//                                     </td>
//                                     <td className="px-4 py-2.5 text-right font-semibold text-destructive whitespace-nowrap text-sm">
//                                       {r.CREDIT != null
//                                         ? fmtAmount(r.CREDIT)
//                                         : "—"}
//                                     </td>
//                                     <td className="px-4 py-2.5 max-w-[220px] text-foreground text-sm break-words">
//                                       {r.DESCRIPTION}
//                                     </td>
//                                     <td className="px-4 py-2.5">
//                                       <SourceBadge row={r} />
//                                     </td>
//                                     <td className="px-4 py-2.5 text-foreground text-sm">
//                                       {r.REMARKS || (
//                                         <span className="text-muted-foreground italic">
//                                           —
//                                         </span>
//                                       )}
//                                     </td>
//                                     <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground text-sm">
//                                       {fmtDate(r.APPROVED_DATE)}
//                                     </td>
//                                     <td className="px-4 py-2.5 min-w-[160px]">
//                                       <InvoiceCell
//                                         parentType="main"
//                                         parentId={r.TXN_ID}
//                                         readOnly
//                                       />
//                                     </td>
//                                     <td className="px-4 py-2.5">
//                                       {r.SOURCE_TYPE === "NON_BANKING" &&
//                                         canEdit && (
//                                           <Tooltip>
//                                             <TooltipTrigger asChild>
//                                               <Button
//                                                 size="icon"
//                                                 variant="ghost"
//                                                 disabled={!canEdit}
//                                                 onClick={() =>
//                                                   handleEditNonBanking(r.TXN_ID)
//                                                 }
//                                                 aria-label="Edit"
//                                                 className="h-7 w-7 rounded-full"
//                                               >
//                                                 <Pencil size={13} />
//                                               </Button>
//                                             </TooltipTrigger>
//                                             <TooltipContent>Edit</TooltipContent>
//                                           </Tooltip>
//                                         )}
//                                     </td>
//                                   </tr>
//                                 );
//                               })}
//                             </tbody>
//                           </table>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}

//                 {/* Budget lines without contractor */}
//                 {linesWithoutContractor.length > 0 && (
//                   <div className="border border-border rounded-md overflow-hidden">
//                     <div className="px-4 py-3 bg-muted/40 border-b border-border">
//                       <h3 className="text-sm font-semibold text-foreground">
//                         Budget lines without contractor
//                       </h3>
//                     </div>
//                     <table className="w-full text-sm">
//                       <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
//                         <tr>
//                           <th className="px-4 py-2.5 text-left font-semibold">
//                             Type
//                           </th>
//                           <th className="px-4 py-2.5 text-right font-semibold">
//                             Budget
//                           </th>
//                           <th className="px-4 py-2.5 text-left font-semibold">
//                             Status
//                           </th>
//                           <th className="px-4 py-2.5 text-left font-semibold">
//                             Files
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {linesWithoutContractor.map((l) => (
//                           <tr
//                             key={l.lineId}
//                             className="border-b border-border last:border-0"
//                           >
//                             <td className="px-4 py-2.5 text-sm font-medium">
//                               {l.typeName || "—"}
//                             </td>
//                             <td className="px-4 py-2.5 text-right text-sm">
//                               {fmtAmount(l.cost)}
//                             </td>
//                             <td className="px-4 py-2.5">
//                               <StatusSelect
//                                 value={l.status}
//                                 onChange={(v) => handleStatusChange(l, v)}
//                                 disabled={statusMutation.isPending}
//                               />
//                             </td>
//                             <td className="px-4 py-2.5">
//                               <LineFiles
//                                 line={l}
//                                 onUpload={handleUploadFiles}
//                                 onDelete={handleDeleteFile}
//                                 busy={fileBusy}
//                               />
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}

//                 {/* Worker Hours & Costing */}
//                 {workerLogs.length > 0 && (
//                   <div
//                     ref={workerSectionRef}
//                     className={`scroll-mt-16 border border-border rounded-md overflow-hidden transition-shadow ${
//                       activeJumpKey === "worker"
//                         ? "ring-2 ring-selected-border"
//                         : ""
//                     }`}
//                   >
//                     <div
//                       className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-border transition-colors ${
//                         activeJumpKey === "worker" ? "bg-selected" : "bg-muted/40"
//                       }`}
//                     >
//                       <div className="flex items-center gap-2">
//                         <Users size={16} />
//                         <h3 className="text-sm font-semibold text-foreground">
//                           Worker Hours & Costing
//                         </h3>
//                       </div>
//                       <div className="flex items-center gap-5 text-xs">
//                         <div>
//                           <span className="text-muted-foreground">
//                             Total Hours:{" "}
//                           </span>
//                           <strong className="text-foreground">
//                             {fmtHours(workerTotals.totalHours)}
//                           </strong>
//                         </div>
//                         <div>
//                           <span className="text-muted-foreground">
//                             Total Cost:{" "}
//                           </span>
//                           <strong className="text-destructive">
//                             {fmtAmount(workerTotals.totalAmount)}
//                           </strong>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="overflow-x-auto">
//                       <table className="w-full text-sm min-w-[800px]">
//                         <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
//                           <tr>
//                             <th className="px-4 py-2.5 text-left font-semibold">
//                               Worker
//                             </th>
//                             <th className="px-4 py-2.5 text-left font-semibold">
//                               Date
//                             </th>
//                             <th className="px-4 py-2.5 text-left font-semibold">
//                               Basis
//                             </th>
//                             <th className="px-4 py-2.5 text-left font-semibold">
//                               Remarks
//                             </th>
//                             <th className="px-4 py-2.5 text-right font-semibold">
//                               Hours
//                             </th>
//                             <th className="px-4 py-2.5 text-right font-semibold">
//                               Days
//                             </th>
//                             <th className="px-4 py-2.5 text-right font-semibold">
//                               Rate
//                             </th>
//                             <th className="px-4 py-2.5 text-right font-semibold">
//                               Amount
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {workerLogs.map((w, idx) => {
//                             const rowKey = `w-${w.ATTENDANCE_ID}`;
//                             const isSelected = selectedRowKey === rowKey;
//                             return (
//                               <tr
//                                 key={w.ATTENDANCE_ID}
//                                 tabIndex={0}
//                                 aria-selected={isSelected}
//                                 onClick={handleRowClick(rowKey)}
//                                 onKeyDown={handleRowKeyDown(rowKey)}
//                                 className={rowStateClass(isSelected, idx)}
//                               >
//                                 <td
//                                   className={`px-4 py-2.5 ${firstCellClass(
//                                     isSelected,
//                                   )}`}
//                                 >
//                                   <WrappedName
//                                     name={w.WORKER_NAME}
//                                     showAvatar
//                                     maxLines={1}
//                                   />
//                                 </td>
//                                 <td className="px-4 py-2.5 whitespace-nowrap text-sm">
//                                   {fmtDate(w.ATTENDANCE_DATE)}
//                                 </td>
//                                 <td className="px-4 py-2.5">
//                                   <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
//                                     {w.CALC_BASIS}
//                                   </span>
//                                 </td>
//                                 <td className="px-4 py-2.5 text-foreground text-sm">
//                                   {w.REMARKS || (
//                                     <span className="text-muted-foreground italic">
//                                       —
//                                     </span>
//                                   )}
//                                 </td>
//                                 <td className="px-4 py-2.5 text-right text-sm">
//                                   {fmtHours(w.HOURS_WORKED)}
//                                 </td>
//                                 <td className="px-4 py-2.5 text-right text-sm">
//                                   {w.DAYS_WORKED ?? "—"}
//                                 </td>
//                                 <td className="px-4 py-2.5 text-right text-sm">
//                                   {fmtAmount(
//                                     w.CALC_BASIS === "HOUR"
//                                       ? w.RATE_PER_HOUR
//                                       : w.RATE_PER_DAY,
//                                   )}
//                                 </td>
//                                 <td className="px-4 py-2.5 text-right text-sm font-semibold">
//                                   {w.AMOUNT != null ? (
//                                     fmtAmount(w.AMOUNT)
//                                   ) : (
//                                     <span className="text-destructive italic">
//                                       rate missing
//                                     </span>
//                                   )}
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         )}
//       </div>
//       <InvoiceSheet />
//       {activeTab === "byContractor" && contractorGroups.length > 1 && (
//         <Popover
//           open={jumpOpen}
//           onOpenChange={(open) => {
//             setJumpOpen(open);
//             if (!open) setJumpSearch("");
//           }}
//         >
//           <PopoverTrigger asChild>
//             <Button
//               aria-label="Jump to contractor"
//               className="fixed bottom-16 right-6 z-[60] h-9 rounded-full shadow-lg px-3 gap-1.5"
//             >
//               <List size={16} />
//               <span className="hidden sm:inline text-xs">Contractors</span>
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent
//             side="top"
//             align="end"
//             sideOffset={8}
//             className="w-72 p-2"
//           >
//             {contractorGroups.length > 8 && (
//               <input
//                 type="text"
//                 value={jumpSearch}
//                 onChange={(e) => setJumpSearch(e.target.value)}
//                 placeholder="Search contractor..."
//                 className="mb-2 h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             )}
//             <div className="max-h-96 overflow-y-auto flex flex-col">
//               {jumpContractors.map((group) => {
//                 const key = group.contractorId ?? "none";
//                 const name = group.contractorName.trim();
//                 return (
//                   <button
//                     key={key}
//                     type="button"
//                     title={name}
//                     aria-current={activeJumpKey === key ? "true" : undefined}
//                     onClick={() => {
//                       setActiveJumpKey(key);
//                       document
//                         .getElementById(`contractor-${key}`)
//                         ?.scrollIntoView({ behavior: "smooth", block: "start" });
//                       setJumpOpen(false);
//                     }}
//                     className={`flex items-center gap-2 rounded-sm border-l-4 px-2 py-2.5 text-sm text-left text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
//                       activeJumpKey === key
//                         ? "bg-selected border-selected-border"
//                         : "border-transparent"
//                     }`}
//                   >
//                     <span
//                       aria-hidden="true"
//                       className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
//                       style={{ backgroundColor: getAvatarColor(name) }}
//                     >
//                       {getInitials(name)}
//                     </span>
//                     <span
//                       className={`flex-1 truncate ${
//                         activeJumpKey === key ? "font-semibold" : ""
//                       }`}
//                     >
//                       {name}
//                     </span>
//                     <span className="shrink-0 text-muted-foreground">
//                       {group.rows.length}
//                     </span>
//                     {activeJumpKey === key && (
//                       <Check size={16} className="shrink-0 text-primary" />
//                     )}
//                   </button>
//                 );
//               })}
//               {workerLogs.length > 0 && (
//                 <>
//                   <div
//                     aria-hidden="true"
//                     className="mt-1 border-t border-border"
//                   />
//                   <button
//                     type="button"
//                     aria-current={
//                       activeJumpKey === "worker" ? "true" : undefined
//                     }
//                     onClick={() => {
//                       setActiveJumpKey("worker");
//                       workerSectionRef.current?.scrollIntoView({
//                         behavior: "smooth",
//                         block: "start",
//                       });
//                       setJumpOpen(false);
//                     }}
//                     className={`flex items-center gap-2 rounded-sm border-l-4 px-2 py-2.5 text-sm text-left text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
//                       activeJumpKey === "worker"
//                         ? "bg-selected border-selected-border"
//                         : "border-transparent"
//                     }`}
//                   >
//                     <Users
//                       size={16}
//                       className="shrink-0 text-muted-foreground"
//                     />
//                     <span
//                       className={`flex-1 truncate ${
//                         activeJumpKey === "worker" ? "font-semibold" : ""
//                       }`}
//                     >
//                       Worker Hours
//                     </span>
//                     {activeJumpKey === "worker" && (
//                       <Check size={16} className="shrink-0 text-primary" />
//                     )}
//                   </button>
//                 </>
//               )}
//             </div>
//           </PopoverContent>
//         </Popover>
//       )}
//       {showScrollTop && (
//         <Button
//           onClick={scrollToTop}
//           aria-label="Scroll to top"
//           size="icon"
//           className="fixed bottom-6 right-6 z-[60] h-9 w-9 rounded-full shadow-lg hover:-translate-y-0.5 transition-all"
//         >
//           <MoveUpIcon size={16} />
//         </Button>
//       )}
//     </SectionContainer>
//   );
// }

// src\features\project-two\project-report-page-two.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Check,
  Download,
  Loader2,
  FileText,
  ArrowUpDown,
  Users,
  LandmarkIcon,
  MoveDownIcon,
  MoveUpIcon,
  List,
  Pencil,
  Paperclip,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionContainer } from "@/components/SectionContainer";
import { DataTablePaginationTwo } from "@/components/DataTablePaginationTwo";
import InvoiceCell from "@/features/setting/pages/statement-upload-three/invoice/InvoiceCell";
import InvoiceSheet from "@/features/setting/pages/statement-upload-three/invoice/InvoiceSheet";
import WrappedName from "@/components/shared/WrappedName";
import { getAvatarColor, getInitials } from "@/lib/avatar-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHasPermission } from "@/hooks/use-permission";
import { useRowSelectionStore } from "@/hooks/use-row-selection-store";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ── Status helpers (construction process line status) ────────────────────────
const STATUS_META = {
  PENDING:     { label: "Pending",     cls: "bg-secondary text-secondary-foreground" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-amber-100 text-amber-700" },
  COMPLETED:   { label: "Completed",   cls: "bg-[#10B981]/10 text-[#10B981]" },
};

const needsStatusConfirm = (current, next) =>
  next === "COMPLETED" || current === "COMPLETED";

function StatusSelect({ value, onChange, disabled }) {
  const v = STATUS_META[value] ? value : "PENDING";
  return (
    <select
      value={v}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`cursor-pointer rounded-full border-0 px-2 py-0.5 text-[10px] font-semibold outline-none disabled:opacity-60 ${STATUS_META[v].cls}`}
    >
      {Object.entries(STATUS_META).map(([k, m]) => (
        <option key={k} value={k}>{m.label}</option>
      ))}
    </select>
  );
}

// ── Files attached to a construction process line (contractor type row) ─────
function LineFiles({ line, onUpload, onDelete, busy }) {
  const inputRef = useRef(null);
  const files = line.files || [];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {files.map((f) => (
        <span
          key={f.fileId}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background py-0.5 pl-1.5 pr-1 text-[10px]"
        >
          <a
            href={`${url}/api/construction-process/file/${f.fileId}`}
            target="_blank"
            rel="noreferrer"
            title={f.fileName}
            className="max-w-[140px] truncate font-medium text-primary hover:underline"
          >
            {f.fileName}
          </a>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(f)}
            aria-label={`Delete ${f.fileName}`}
            className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-destructive disabled:opacity-50"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const picked = Array.from(e.target.files || []);
          e.target.value = "";
          if (picked.length) onUpload(line, picked);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
      >
        <Paperclip size={10} />
        Attach
      </button>
    </div>
  );
}

// ── formatters ────────────────────────────────────────────────────────────────
const fmtDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const fmtAmount = (amt) => {
  if (amt == null) return "—";
  const n = Number(amt) || 0;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtHours = (val) => {
  if (val == null) return "—";
  const n = Number(val) || 0;
  return (Math.round(n * 100) / 100).toString();
};

function SourceBadge({ row }) {
  const isNonBanking = row.SOURCE_TYPE === "NON_BANKING";
  return (
    <div className="flex flex-col items-start">
      <div className="flex flex-col items-center gap-0.5">
        <span
          className={`w-fit whitespace-nowrap text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isNonBanking
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {isNonBanking ? "Non-Banking" : "Banking"}
        </span>
        {isNonBanking && row.PAYMENT_BY === "CUSTOMER" && (
          <span className="whitespace-nowrap text-[9px] font-medium text-amber-600 dark:text-amber-400">
            Customer Paid
          </span>
        )}
      </div>
    </div>
  );
}

function SortableHeader({ column, children, align = "left" }) {
  return (
    <button
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className={`flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-[11px] font-semibold uppercase tracking-wider ${
        align === "right" ? "ml-auto" : ""
      }`}
    >
      {children} <ArrowUpDown className="h-3 w-3" />
    </button>
  );
}

export function ProjectReportPageTwo() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const canEdit = useHasPermission("PROJECT_STATEMENT_EDIT");
  const handleEditNonBanking = (txnId) =>
    navigate(
      `/dashboard/projects/${projectId}/report/non-banking/${txnId}/edit`,
    );

  const [activeTab, setActiveTab] = useState("byContractor"); // "transactions" | "byContractor"
  const [sorting, setSorting] = useState([{ id: "TXN_DATE", desc: true }]);
  const workerSectionRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpSearch, setJumpSearch] = useState("");
  const [activeJumpKey, setActiveJumpKey] = useState(null);
  // confirm modal: { title, description, confirmLabel, destructive, onConfirm }
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToWorkerSection = () => {
    workerSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ── Row selection (one row at a time across the page) ───────────────
  const SELECTION_SCOPE = "project-report";
  const selectedRowKey = useRowSelectionStore(
    (s) => s.selected[SELECTION_SCOPE] ?? null,
  );
  const toggleRow = useRowSelectionStore((s) => s.toggle);

  // Clicks inside interactive children (Edit, Invoice, Status select ...) must not select.
  const isInteractiveTarget = (e) =>
    !!e.target.closest?.(
      "button, a, input, textarea, select, [role='button']",
    );

  const handleRowClick = (rowKey) => (e) => {
    if (isInteractiveTarget(e)) return;
    toggleRow(SELECTION_SCOPE, rowKey);
  };

  const handleRowKeyDown = (rowKey) => (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (isInteractiveTarget(e)) return;
    e.preventDefault();
    toggleRow(SELECTION_SCOPE, rowKey);
  };

  // Shared row classes for the contractor and worker tables.
  const rowStateClass = (isSelected, idx) =>
    `cursor-pointer border-b border-border last:border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
      isSelected
        ? "bg-selected hover:bg-selected"
        : `hover:bg-accent ${idx % 2 === 1 ? "bg-muted/60" : "bg-transparent"}`
    }`;

  const firstCellClass = (isSelected) =>
    `border-l-4 ${isSelected ? "border-selected-border" : "border-transparent"}`;

  // ── data ──────────────────────────────────────────────────────────────────
  const { data: report, isLoading } = useQuery({
    queryKey: ["projectReport", projectId],
    queryFn: async () =>
      (await axios.get(`${url}/api/statement/project-report/${projectId}`)).data
        ?.data || {
        transactions: [],
        workerLogs: [],
        workerTotals: {},
        marginPercent: null,
        budgetLines: [],
      },
    enabled: !!projectId,
  });

  const { data: contractorList = [] } = useQuery({
    queryKey: ["contractorNames"],
    queryFn: async () =>
      (await axios.get(`${url}/api/contractor`)).data?.data || [],
  });

  const rows = useMemo(() => report?.transactions || [], [report]);
  const workerLogs = useMemo(() => report?.workerLogs || [], [report]);
  const workerTotals = useMemo(
    () =>
      report?.workerTotals || { totalHours: 0, totalDays: 0, totalAmount: 0 },
    [report],
  );
  const budgetLines = useMemo(() => report?.budgetLines || [], [report]);

  const MARGIN_PERCENT =
    report?.marginPercent != null ? Number(report.marginPercent) : 10;

  const projectName =
    rows.length > 0 ? rows[0].P_NAME : `Project #${projectId}`;

  const totals = useMemo(() => {
    const debit = rows.reduce((s, r) => s + (Number(r.DEBIT) || 0), 0);
    const credit = rows.reduce((s, r) => s + (Number(r.CREDIT) || 0), 0);
    const workerCost = Number(workerTotals.totalAmount) || 0;
    return { debit, credit, workerCost, net: debit - credit - workerCost };
  }, [rows, workerTotals]);

  const summary = useMemo(() => {
    const projectExpenses = totals.credit;
    const workerCost = totals.workerCost;
    const buildExpenses = projectExpenses + workerCost;

    const marginableCredit = rows.reduce((s, r) => {
      if (r.EXCLUDE_MARGIN === "Y") return s;
      return s + (Number(r.CREDIT) || 0);
    }, 0);
    const marginBase = marginableCredit + workerCost;

    const builderMargin = marginBase * (MARGIN_PERCENT / 100);
    const gst = builderMargin * 0.1;
    const totalBuilderMargin = builderMargin + gst;

    const finalProjectExpenses = buildExpenses + totalBuilderMargin;

    const customerPaid = rows.reduce((s, r) => {
      if (
        r.SOURCE_TYPE === "NON_BANKING" &&
        r.PAYMENT_BY === "CUSTOMER" &&
        r.CREDIT != null
      ) {
        return s + Number(r.CREDIT);
      }
      return s;
    }, 0);

    const collectionReceived = totals.debit;
    const balance = collectionReceived + customerPaid - finalProjectExpenses;

    return {
      projectExpenses,
      workerCost,
      buildExpenses,
      builderMargin,
      gst,
      totalBuilderMargin,
      finalProjectExpenses,
      collectionReceived,
      customerPaid,
      balance,
    };
  }, [totals, rows, MARGIN_PERCENT]);

  const groupedByContractor = useMemo(() => {
    const map = new Map();

    for (const r of rows) {
      const key = r.CONTRACTOR_ID != null ? r.CONTRACTOR_ID : "none";
      if (!map.has(key)) {
        map.set(key, {
          contractorId: r.CONTRACTOR_ID ?? null,
          contractorName: r.CONTRACTOR_NAME || "No Contractor",
          rows: [],
        });
      }
      map.get(key).rows.push(r);
    }

    return Array.from(map.values()).map((group) => {
      const sortedRows = [...group.rows].sort(
        (a, b) => new Date(a.TXN_DATE) - new Date(b.TXN_DATE),
      );
      const totalReceived = sortedRows.reduce(
        (s, r) => s + (Number(r.DEBIT) || 0),
        0,
      );
      const totalPayment = sortedRows.reduce(
        (s, r) => s + (Number(r.CREDIT) || 0),
        0,
      );
      return {
        ...group,
        rows: sortedRows,
        totalReceived,
        totalPayment,
        net: totalReceived - totalPayment,
      };
    });
  }, [rows]);

  // ── budget / status linking ───────────────────────────────────────────────
  const contractorNameMap = useMemo(
    () =>
      new Map(
        contractorList.map((c) => [Number(c.CONTRATOR_ID), c.CONTRATOR_NAME]),
      ),
    [contractorList],
  );

  // contractorId -> [budget lines]
  const budgetByContractor = useMemo(() => {
    const m = new Map();
    for (const l of budgetLines) {
      for (const cid of l.contractorIds || []) {
        const k = Number(cid);
        if (!m.has(k)) m.set(k, []);
        m.get(k).push(l);
      }
    }
    return m;
  }, [budgetLines]);

  // contractors with payments + contractors that have a budget line but no payment yet
  const contractorGroups = useMemo(() => {
    const have = new Set(
      groupedByContractor
        .filter((g) => g.contractorId != null)
        .map((g) => Number(g.contractorId)),
    );
    const extra = [];
    for (const cid of budgetByContractor.keys()) {
      if (!have.has(cid)) {
        extra.push({
          contractorId: cid,
          contractorName: contractorNameMap.get(cid) || `Contractor #${cid}`,
          rows: [],
          totalReceived: 0,
          totalPayment: 0,
          net: 0,
        });
      }
    }
    return [...groupedByContractor, ...extra];
  }, [groupedByContractor, budgetByContractor, contractorNameMap]);

  const linesWithoutContractor = useMemo(
    () => budgetLines.filter((l) => !(l.contractorIds || []).length),
    [budgetLines],
  );

  const jumpContractors = useMemo(() => {
    const q = jumpSearch.trim().toLowerCase();
    if (!q) return contractorGroups;
    return contractorGroups.filter((group) =>
      group.contractorName.trim().toLowerCase().includes(q),
    );
  }, [contractorGroups, jumpSearch]);

  const statusMutation = useMutation({
    mutationFn: ({ ID, STATUS }) =>
      axios.put(`${url}/api/construction-process?action=update_status`, {
        ID,
        STATUS,
        UPDATED_BY: 105,
      }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["projectReport", projectId] });
      queryClient.invalidateQueries({ queryKey: ["constructionProcess"] });
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Status update failed"),
  });

  const handleStatusChange = (line, next) => {
    const current = line.status || "PENDING";
    if (next === current) return;
    const run = () => statusMutation.mutate({ ID: line.lineId, STATUS: next });
    if (!needsStatusConfirm(current, next)) {
      run();
      return;
    }
    setConfirm({
      title: "Change status?",
      description: `${line.typeName || "This line"}: ${
        STATUS_META[current]?.label || current
      } → ${STATUS_META[next]?.label || next}`,
      confirmLabel: "Change status",
      onConfirm: run,
    });
  };

  // ── files per construction process line ───────────────────────────────────
  const uploadFileMutation = useMutation({
    mutationFn: async ({ lineId, files }) => {
      for (const f of files) {
        const fd = new FormData();
        fd.append("CP_ID", lineId);
        fd.append("UPLOADED_BY", 105);
        fd.append("file", f);
        await axios.post(`${url}/api/construction-process/file`, fd);
      }
    },
    onSuccess: () => {
      toast.success("File uploaded");
      queryClient.invalidateQueries({ queryKey: ["projectReport", projectId] });
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "File upload failed"),
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId) =>
      axios.delete(`${url}/api/construction-process/file/${fileId}`),
    onSuccess: () => {
      toast.success("File deleted");
      queryClient.invalidateQueries({ queryKey: ["projectReport", projectId] });
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "File delete failed"),
  });

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

  const handleUploadFiles = (line, files) => {
    const tooBig = files.filter((f) => f.size > MAX_FILE_SIZE);
    const ok = files.filter((f) => f.size <= MAX_FILE_SIZE);
    if (tooBig.length) {
      toast.error(
        `${tooBig.map((f) => f.name).join(", ")} exceeds the 2 MB limit.`,
      );
    }
    if (ok.length) uploadFileMutation.mutate({ lineId: line.lineId, files: ok });
  };

  const handleDeleteFile = (f) =>
    setConfirm({
      title: "Delete file?",
      description: `"${f.fileName}" will be permanently deleted.`,
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: () => deleteFileMutation.mutate(f.fileId),
    });

  const fileBusy = uploadFileMutation.isPending || deleteFileMutation.isPending;

  // ── CSV export helpers ──────────────────────────────────────────────
  const buildSummaryCsvRows = () => [
    "Summary",
    `Project Expenses,${summary.projectExpenses}`,
    `Worker Cost,${summary.workerCost}`,
    `Build Expenses,${summary.buildExpenses}`,
    `Builder Margin (${MARGIN_PERCENT}%),${summary.builderMargin}`,
    `GST,${summary.gst}`,
    `Total Builder Margin,${summary.totalBuilderMargin}`,
    `Final Project Expenses,${summary.finalProjectExpenses}`,
    `Collection/Received,${summary.collectionReceived}`,
    `Customer Paid,${summary.customerPaid}`,
    `Balance,${summary.balance}`,
    "",
  ];

  const buildWorkerCsvRows = () => {
    if (workerLogs.length === 0) return [];
    const workerHeaders = [
      "Worker",
      "Date",
      "Basis",
      "Hours",
      "Days",
      "Rate",
      "Amount",
    ];
    const workerRows = workerLogs.map((w) => [
      `"${(w.WORKER_NAME || "").replace(/"/g, '""')}"`,
      fmtDate(w.ATTENDANCE_DATE),
      w.CALC_BASIS || "",
      w.HOURS_WORKED ?? "",
      w.DAYS_WORKED ?? "",
      w.CALC_BASIS === "HOUR"
        ? (w.RATE_PER_HOUR ?? "")
        : (w.RATE_PER_DAY ?? ""),
      w.AMOUNT ?? "MISSING_RATE",
    ]);
    return [
      "",
      "Worker Hours & Costing",
      workerHeaders.join(","),
      ...workerRows.map((r) => r.join(",")),
      `Total Hours,${workerTotals.totalHours}`,
      `Total Days,${workerTotals.totalDays}`,
      `Total Worker Cost,${workerTotals.totalAmount}`,
    ];
  };

  const downloadCsvFile = (csvParts, suffix) => {
    const csv = csvParts.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${(projectName || "project").replace(/[^a-z0-9]/gi, "_").replace(/^_+|_+$/g, "")}_${suffix}.csv`;
    link.click();
  };

  const handleDownloadAllCsv = () => {
    if (rows.length === 0 && workerLogs.length === 0) {
      toast.error("No data to download.");
      return;
    }
    const csvParts = [...buildSummaryCsvRows()];

    if (rows.length > 0) {
      const headers = [
        "Contractor",
        "Date",
        "Received",
        "Payment",
        "Description",
        "Category",
        "Matched Address",
        "Invoice No",
        "Source",
        "Remarks",
        "Approved Date",
      ];
      const csvRows = rows.map((r) => [
        `"${(r.CONTRACTOR_NAME || "").replace(/"/g, '""')}"`,
        fmtDate(r.TXN_DATE),
        r.DEBIT ?? "",
        r.CREDIT ?? "",
        `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
        r.CATEGORY || "",
        `"${(r.MATCHED_ADDRESS || "").replace(/"/g, '""')}"`,
        `"${(r.INVOICE_NO || "").replace(/"/g, '""')}"`,
        r.SOURCE_TYPE || "",
        `"${(r.REMARKS || "").replace(/"/g, '""')}"`,
        fmtDate(r.APPROVED_DATE),
      ]);
      csvParts.push(
        "Transactions",
        headers.join(","),
        ...csvRows.map((r) => r.join(",")),
        `Total Received,${totals.debit}`,
        `Total Payment,${totals.credit}`,
        "",
      );
    }

    csvParts.push(...buildWorkerCsvRows());
    downloadCsvFile(csvParts, "report_all");
  };

  const handleDownloadByContractorCsv = () => {
    if (contractorGroups.length === 0 && workerLogs.length === 0) {
      toast.error("No data to download.");
      return;
    }
    const csvParts = [...buildSummaryCsvRows()];

    contractorGroups.forEach((group) => {
      const cLines =
        group.contractorId != null
          ? budgetByContractor.get(Number(group.contractorId)) || []
          : [];
      const headers = [
        "Date",
        "Received",
        "Payment",
        "Description",
        "Source",
        "Remarks",
        "Approved Date",
      ];
      const csvRows = group.rows.map((r) => [
        fmtDate(r.TXN_DATE),
        r.DEBIT ?? "",
        r.CREDIT ?? "",
        `"${(r.DESCRIPTION || "").replace(/"/g, '""')}"`,
        r.SOURCE_TYPE || "",
        `"${(r.REMARKS || "").replace(/"/g, '""')}"`,
        fmtDate(r.APPROVED_DATE),
      ]);
      csvParts.push(
        `Contractor: ${group.contractorName}`,
        ...cLines.map(
          (l) =>
            `Budget line: ${l.typeName || ""} | ${l.cost} | ${STATUS_META[l.status]?.label || l.status}`,
        ),
        headers.join(","),
        ...csvRows.map((r) => r.join(",")),
        `Total Received,${group.totalReceived}`,
        `Total Payment,${group.totalPayment}`,
        `Net,${group.net}`,
        "",
      );
    });

    csvParts.push(...buildWorkerCsvRows());
    downloadCsvFile(csvParts, "report_by_contractor");
  };

  // ── TanStack Table — Transactions tab ───────────────────────────────
  const columns = useMemo(
    () => [
      {
        accessorKey: "P_NAME",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Project
          </span>
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-col gap-0.5 max-w-[180px]">
              {r.P_ID != null && (
                <span className="w-fit text-[10px] font-semibold text-muted-foreground">
                  ID: {r.P_ID}
                </span>
              )}
              <WrappedName name={r.P_NAME} maxChars={70} />
            </div>
          );
        },
      },
      {
        accessorKey: "CONTRACTOR_NAME",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Contractor
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">
            {getValue() || (
              <span className="text-muted-foreground italic">—</span>
            )}
          </span>
        ),
      },
      {
        accessorKey: "TXN_DATE",
        header: ({ column }) => (
          <SortableHeader column={column}>Date</SortableHeader>
        ),
        sortingFn: (a, b) =>
          new Date(a.original.TXN_DATE || 0) -
          new Date(b.original.TXN_DATE || 0),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap font-medium text-foreground text-sm">
            {fmtDate(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "DEBIT",
        header: ({ column }) => (
          <div className="text-right">
            <SortableHeader column={column} align="right">
              Received
            </SortableHeader>
          </div>
        ),
        cell: ({ getValue }) => {
          const v = getValue();
          return (
            <div className="text-right font-semibold text-[#10B981] whitespace-nowrap text-sm">
              {v != null ? fmtAmount(v) : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "CREDIT",
        header: ({ column }) => (
          <div className="text-right">
            <SortableHeader column={column} align="right">
              Payment
            </SortableHeader>
          </div>
        ),
        cell: ({ getValue }) => {
          const v = getValue();
          return (
            <div className="text-right font-semibold text-destructive whitespace-nowrap text-sm">
              {v != null ? fmtAmount(v) : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "DESCRIPTION",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </span>
        ),
        cell: ({ getValue }) => (
          <div
            title={getValue() || ""}
            className="max-w-[220px] text-foreground text-sm truncate"
          >
            {getValue()}
          </div>
        ),
      },
      {
        accessorKey: "MATCHED_ADDRESS",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Matched Address
          </span>
        ),
        cell: ({ getValue }) => (
          <div className="max-w-[150px]">
            <WrappedName name={getValue()} className="text-primary" />
          </div>
        ),
      },
      {
        accessorKey: "SOURCE_TYPE",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Source
          </span>
        ),
        cell: ({ row }) => <SourceBadge row={row.original} />,
      },
      {
        accessorKey: "REMARKS",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Remarks
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="text-foreground text-sm">
            {getValue() || (
              <span className="text-muted-foreground italic">—</span>
            )}
          </span>
        ),
      },
      {
        accessorKey: "APPROVED_DATE",
        header: ({ column }) => (
          <SortableHeader column={column}>Approved</SortableHeader>
        ),
        sortingFn: (a, b) =>
          new Date(a.original.APPROVED_DATE || 0) -
          new Date(b.original.APPROVED_DATE || 0),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-muted-foreground text-sm">
            {fmtDate(getValue())}
          </span>
        ),
      },
      {
        id: "invoice",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Invoice
          </span>
        ),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-[160px]">
            <InvoiceCell
              parentType="main"
              parentId={row.original.TXN_ID}
              readOnly
            />
          </div>
        ),
      },
      {
        id: "action",
        header: () => null,
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          if (r.SOURCE_TYPE !== "NON_BANKING" || !canEdit) return null;
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={!canEdit}
                  onClick={() => handleEditNonBanking(r.TXN_ID)}
                  aria-label="Edit"
                  className="h-7 w-7 rounded-full"
                >
                  <Pencil size={13} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          );
        },
      },
    ],
    [canEdit],
  );

  const table = useReactTable({
    data: rows,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    state: { sorting },
  });

  const hasData = rows.length > 0 || workerLogs.length > 0;

  return (
    <SectionContainer variant="dashboard">
      <div className="bg-card border border-border rounded-md p-4 md:p-6 shadow-sm">
        {/* ── Page Header ───────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={18} strokeWidth={2} className=" shrink-0" />
                <h1 className="text-base font-semibold text-foreground truncate">
                  {projectName} — Statement Report
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>
                    Showing {rows.length} transaction
                    {rows.length !== 1 ? "s" : ""} across{" "}
                    {contractorGroups.length} contractor
                    {contractorGroups.length !== 1 ? "s" : ""}
                    {" · "}
                    As of{" "}
                    {new Date().toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </>
                )}
              </p>
            </div>
            <Button
              onClick={
                activeTab === "transactions"
                  ? handleDownloadAllCsv
                  : handleDownloadByContractorCsv
              }
              size="sm"
              className="text-xs shrink-0"
              disabled={rows.length === 0 && workerLogs.length === 0}
            >
              <Download size={14} className="mr-2" />
              {activeTab === "transactions"
                ? "Download All CSV"
                : "Download by Contractor CSV"}
            </Button>
          </div>
          <div className="w-full h-px bg-border mt-4" />
        </div>

        {/* ── Financial Summary Card ───────────────────────────────── */}
        {!isLoading && hasData && (
          <div className="mb-6 border border-border rounded-md overflow-hidden max-w-2xl">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <LandmarkIcon size={16} strokeWidth={2} className=" shrink-0" />
              <h2 className="text-sm font-semibold text-foreground">
                Financial Summary
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Left column */}
              <div className="text-sm divide-y divide-border sm:border-r sm:border-border">
                <div className="flex items-center h-14 justify-between px-4 py-2.5">
                  <span className="text-foreground">Project Expenses</span>
                  <span className="font-semibold text-destructive">
                    {fmtAmount(summary.projectExpenses)}
                  </span>
                </div>
                <div className="flex items-center h-14 justify-between px-4 py-2.5">
                  <span className="text-muted-foreground">Worker Cost</span>
                  <span className="text-muted-foreground">
                    {fmtAmount(summary.workerCost)}
                  </span>
                </div>
                <div className="flex items-center h-14 justify-between px-4 py-2.5 bg-accent">
                  <span className="font-medium text-accent-foreground">
                    Build Expenses
                  </span>
                  <span className="font-semibold text-accent-foreground">
                    {fmtAmount(summary.buildExpenses)}
                  </span>
                </div>
              </div>

              {/* Right column */}
              <div className="text-sm divide-y divide-border">
                <div className="px-4 h-14 py-2.5">
                  <div className="flex flex-row  items-center  justify-between">
                    <span className="text-foreground">
                      Builder Margin{" "}
                      <span className="text-primary font-semibold">
                        {MARGIN_PERCENT}%
                      </span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {fmtAmount(summary.builderMargin)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground">+ GST</span>
                    <span className="text-xs text-muted-foreground">
                      {fmtAmount(summary.gst)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center  h-14 justify-between px-4 py-2.5">
                  <span className="font-medium text-foreground">
                    Total Builder Margin
                  </span>
                  <span className="font-semibold text-foreground">
                    {fmtAmount(summary.totalBuilderMargin)}
                  </span>
                </div>
                <div className="flex items-center  h-14 justify-between px-4 py-2.5 bg-accent">
                  <span className="font-medium text-accent-foreground">
                    Final Project Expenses
                  </span>
                  <span className="font-semibold text-accent-foreground">
                    {fmtAmount(summary.finalProjectExpenses)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border min-h-14 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Collection/Received:{" "}
                  </span>
                  <strong className="text-[#10B981]">
                    {fmtAmount(summary.collectionReceived)}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer Paid: </span>
                  <strong className="text-[#10B981]">
                    {fmtAmount(summary.customerPaid)}
                  </strong>
                </div>
              </div>
              <div
                className={`flex items-center justify-between sm:justify-end gap-3 px-4 py-2 rounded-md font-bold text-sm ${
                  summary.balance >= 0
                    ? "bg-[#10B981]/10 text-[#10B981]"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                <span>Balance</span>
                <span>
                  {summary.balance >= 0 ? "+" : ""}
                  {fmtAmount(summary.balance)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Bar ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="inline-flex items-center gap-1 bg-secondary rounded-md p-1">
            <button
              onClick={() => setActiveTab("byContractor")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                activeTab === "byContractor"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Group by Contractor
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === "byContractor"
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {contractorGroups.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                activeTab === "transactions"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Transactions
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === "transactions"
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {rows.length}
              </span>
            </button>
          </div>

          {activeTab === "byContractor" && workerLogs.length > 0 && (
            <button
              onClick={scrollToWorkerSection}
              className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-accent px-2.5 py-1 rounded-full transition-colors"
            >
              Jump to Worker
              <MoveDownIcon size={12} />
            </button>
          )}
        </div>

        {/* ── Transactions Tab (TanStack Table) ───────────────────── */}
        {activeTab === "transactions" && (
          <div className="border border-border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[1200px] ">
                <TableHeader>
                  {table.getHeaderGroups().map((group) => (
                    <TableRow
                      key={group.id}
                      className="border-b border-border bg-muted/30"
                    >
                      {group.headers.map((header) => (
                        <TableHead key={header.id} className="px-4 py-3">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <Loader2
                          className="inline animate-spin mr-2"
                          size={14}
                        />
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No approved transactions for this project.
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row, idx) => {
                      const rowKey = `t-${row.original.TXN_ID}`;
                      const isSelected = selectedRowKey === rowKey;
                      return (
                        <TableRow
                          key={row.id}
                          tabIndex={0}
                          aria-selected={isSelected}
                          onClick={handleRowClick(rowKey)}
                          onKeyDown={handleRowKeyDown(rowKey)}
                          className={`cursor-pointer border-b border-border last:border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                            isSelected
                              ? "bg-selected hover:bg-selected"
                              : `hover:bg-accent ${
                                  idx % 2 === 1 ? "bg-muted/60" : "bg-card"
                                }`
                          }`}
                        >
                          {row.getVisibleCells().map((cell, cellIndex) => (
                            <TableCell
                              key={cell.id}
                              className={`px-4 py-2.5 align-middle ${
                                cellIndex === 0 ? firstCellClass(isSelected) : ""
                              }`}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            {!isLoading && rows.length > 0 && (
              <div className="border-t border-border px-2">
                <DataTablePaginationTwo
                  table={table}
                  tableKey="project-report-transactions"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Group by Contractor Tab ─────────────────────────────── */}
        {activeTab === "byContractor" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="inline animate-spin mr-2" size={16} />
                Loading...
              </div>
            ) : contractorGroups.length === 0 &&
              workerLogs.length === 0 &&
              linesWithoutContractor.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-border rounded-md">
                No approved transactions for this project.
              </div>
            ) : (
              <>
                {contractorGroups.map((group) => {
                  const key = group.contractorId ?? "none";
                  const visibleRows = group.rows;

                  const cLines =
                    group.contractorId != null
                      ? budgetByContractor.get(Number(group.contractorId)) || []
                      : [];
                  // only sole-contractor lines add to Budget (shared lines would be double counted)
                  const budget = cLines
                    .filter((l) => (l.contractorIds || []).length === 1)
                    .reduce((s, l) => s + (Number(l.cost) || 0), 0);
                  const remaining = budget - group.totalPayment;
                  const usedPct =
                    budget > 0
                      ? Math.round((group.totalPayment / budget) * 100)
                      : null;

                  return (
                    <div
                      key={key}
                      id={`contractor-${key}`}
                      className={`scroll-mt-16 border border-border rounded-md overflow-hidden transition-shadow ${
                        activeJumpKey === key ? "ring-2 ring-selected-border" : ""
                      }`}
                    >
                      {/* Contractor header */}
                      <div
                        className={`px-4 py-3 border-b border-border transition-colors ${
                          activeJumpKey === key ? "bg-selected" : "bg-muted/40"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <WrappedName
                              name={group.contractorName}
                              size="md"
                              showAvatar
                              maxLines={1}
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                            {budget > 0 && (
                              <div>
                                <span className="text-muted-foreground">
                                  Budget:{" "}
                                </span>
                                <strong>{fmtAmount(budget)}</strong>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">
                                Received:{" "}
                              </span>
                              <strong className="text-[#10B981]">
                                {fmtAmount(group.totalReceived)}
                              </strong>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Payment:{" "}
                              </span>
                              <strong className="text-destructive">
                                {fmtAmount(group.totalPayment)}
                              </strong>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Net:{" "}
                              </span>
                              <strong
                                className={
                                  group.net >= 0
                                    ? "text-[#10B981]"
                                    : "text-destructive"
                                }
                              >
                                {fmtAmount(group.net)}
                              </strong>
                            </div>
                            {budget > 0 && (
                              <div>
                                <span className="text-muted-foreground">
                                  Remaining:{" "}
                                </span>
                                <strong
                                  className={
                                    remaining < 0
                                      ? "text-destructive"
                                      : "text-[#10B981]"
                                  }
                                >
                                  {fmtAmount(remaining)}
                                </strong>
                                {usedPct != null && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    ({usedPct}%)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {cLines.length > 0 && (
                          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                            {cLines.map((l) => (
                              <div
                                key={l.lineId}
                                className="flex flex-wrap items-center gap-1.5 text-xs"
                              >
                                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
                                  {l.typeName || "—"}
                                </span>
                                <span className="text-muted-foreground">
                                  {fmtAmount(l.cost)}
                                  {(l.contractorIds || []).length > 1
                                    ? " (shared)"
                                    : ""}
                                </span>
                                <StatusSelect
                                  value={l.status}
                                  onChange={(v) => handleStatusChange(l, v)}
                                  disabled={statusMutation.isPending}
                                />
                                <LineFiles
                                  line={l}
                                  onUpload={handleUploadFiles}
                                  onDelete={handleDeleteFile}
                                  busy={fileBusy}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Contractor's transactions */}
                      {visibleRows.length === 0 ? (
                        <div className="px-4 py-4 text-xs italic text-muted-foreground">
                          No payments yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm min-w-[900px]">
                            <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
                              <tr>
                                <th className="px-4 py-2.5 text-left font-semibold">
                                  Date
                                </th>
                                <th className="px-4 py-2.5 text-right font-semibold">
                                  Received
                                </th>
                                <th className="px-4 py-2.5 text-right font-semibold">
                                  Payment
                                </th>
                                <th className="px-4 py-2.5 text-left font-semibold">
                                  Description
                                </th>
                                <th className="px-4 py-2.5 text-left font-semibold">
                                  Source
                                </th>
                                <th className="px-4 py-2.5 text-left font-semibold">
                                  Remarks
                                </th>
                                <th className="px-4 py-2.5 text-left font-semibold">
                                  Approved
                                </th>
                                <th className="px-4 py-2.5 text-left font-semibold">
                                  Invoice
                                </th>
                                <th className="px-4 py-2.5"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {visibleRows.map((r, idx) => {
                                const rowKey = `c-${r.TXN_ID}`;
                                const isSelected = selectedRowKey === rowKey;
                                return (
                                  <tr
                                    key={r.TXN_ID}
                                    tabIndex={0}
                                    aria-selected={isSelected}
                                    onClick={handleRowClick(rowKey)}
                                    onKeyDown={handleRowKeyDown(rowKey)}
                                    className={rowStateClass(isSelected, idx)}
                                  >
                                    <td
                                      className={`px-4 py-2.5 whitespace-nowrap font-medium text-foreground text-sm ${firstCellClass(
                                        isSelected,
                                      )}`}
                                    >
                                      {fmtDate(r.TXN_DATE)}
                                    </td>
                                    <td className="px-4 py-2.5 text-right font-semibold text-[#10B981] whitespace-nowrap text-sm">
                                      {r.DEBIT != null ? fmtAmount(r.DEBIT) : "—"}
                                    </td>
                                    <td className="px-4 py-2.5 text-right font-semibold text-destructive whitespace-nowrap text-sm">
                                      {r.CREDIT != null
                                        ? fmtAmount(r.CREDIT)
                                        : "—"}
                                    </td>
                                    <td className="px-4 py-2.5 max-w-[220px] text-foreground text-sm break-words">
                                      {r.DESCRIPTION}
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <SourceBadge row={r} />
                                    </td>
                                    <td className="px-4 py-2.5 text-foreground text-sm">
                                      {r.REMARKS || (
                                        <span className="text-muted-foreground italic">
                                          —
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground text-sm">
                                      {fmtDate(r.APPROVED_DATE)}
                                    </td>
                                    <td className="px-4 py-2.5 min-w-[160px]">
                                      <InvoiceCell
                                        parentType="main"
                                        parentId={r.TXN_ID}
                                        readOnly
                                      />
                                    </td>
                                    <td className="px-4 py-2.5">
                                      {r.SOURCE_TYPE === "NON_BANKING" &&
                                        canEdit && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                disabled={!canEdit}
                                                onClick={() =>
                                                  handleEditNonBanking(r.TXN_ID)
                                                }
                                                aria-label="Edit"
                                                className="h-7 w-7 rounded-full"
                                              >
                                                <Pencil size={13} />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit</TooltipContent>
                                          </Tooltip>
                                        )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Budget lines without contractor */}
                {linesWithoutContractor.length > 0 && (
                  <div className="border border-border rounded-md overflow-hidden">
                    <div className="px-4 py-3 bg-muted/40 border-b border-border">
                      <h3 className="text-sm font-semibold text-foreground">
                        Budget lines without contractor
                      </h3>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-semibold">
                            Type
                          </th>
                          <th className="px-4 py-2.5 text-right font-semibold">
                            Budget
                          </th>
                          <th className="px-4 py-2.5 text-left font-semibold">
                            Status
                          </th>
                          <th className="px-4 py-2.5 text-left font-semibold">
                            Files
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {linesWithoutContractor.map((l) => (
                          <tr
                            key={l.lineId}
                            className="border-b border-border last:border-0"
                          >
                            <td className="px-4 py-2.5 text-sm font-medium">
                              {l.typeName || "—"}
                            </td>
                            <td className="px-4 py-2.5 text-right text-sm">
                              {fmtAmount(l.cost)}
                            </td>
                            <td className="px-4 py-2.5">
                              <StatusSelect
                                value={l.status}
                                onChange={(v) => handleStatusChange(l, v)}
                                disabled={statusMutation.isPending}
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <LineFiles
                                line={l}
                                onUpload={handleUploadFiles}
                                onDelete={handleDeleteFile}
                                busy={fileBusy}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Worker Hours & Costing */}
                {workerLogs.length > 0 && (
                  <div
                    ref={workerSectionRef}
                    className={`scroll-mt-16 border border-border rounded-md overflow-hidden transition-shadow ${
                      activeJumpKey === "worker"
                        ? "ring-2 ring-selected-border"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-border transition-colors ${
                        activeJumpKey === "worker" ? "bg-selected" : "bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <h3 className="text-sm font-semibold text-foreground">
                          Worker Hours & Costing
                        </h3>
                      </div>
                      <div className="flex items-center gap-5 text-xs">
                        <div>
                          <span className="text-muted-foreground">
                            Total Hours:{" "}
                          </span>
                          <strong className="text-foreground">
                            {fmtHours(workerTotals.totalHours)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Total Cost:{" "}
                          </span>
                          <strong className="text-destructive">
                            {fmtAmount(workerTotals.totalAmount)}
                          </strong>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[800px]">
                        <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-semibold">
                              Worker
                            </th>
                            <th className="px-4 py-2.5 text-left font-semibold">
                              Date
                            </th>
                            <th className="px-4 py-2.5 text-left font-semibold">
                              Basis
                            </th>
                            <th className="px-4 py-2.5 text-left font-semibold">
                              Remarks
                            </th>
                            <th className="px-4 py-2.5 text-right font-semibold">
                              Hours
                            </th>
                            <th className="px-4 py-2.5 text-right font-semibold">
                              Days
                            </th>
                            <th className="px-4 py-2.5 text-right font-semibold">
                              Rate
                            </th>
                            <th className="px-4 py-2.5 text-right font-semibold">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {workerLogs.map((w, idx) => {
                            const rowKey = `w-${w.ATTENDANCE_ID}`;
                            const isSelected = selectedRowKey === rowKey;
                            return (
                              <tr
                                key={w.ATTENDANCE_ID}
                                tabIndex={0}
                                aria-selected={isSelected}
                                onClick={handleRowClick(rowKey)}
                                onKeyDown={handleRowKeyDown(rowKey)}
                                className={rowStateClass(isSelected, idx)}
                              >
                                <td
                                  className={`px-4 py-2.5 ${firstCellClass(
                                    isSelected,
                                  )}`}
                                >
                                  <WrappedName
                                    name={w.WORKER_NAME}
                                    showAvatar
                                    maxLines={1}
                                  />
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                                  {fmtDate(w.ATTENDANCE_DATE)}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                    {w.CALC_BASIS}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-foreground text-sm">
                                  {w.REMARKS || (
                                    <span className="text-muted-foreground italic">
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-right text-sm">
                                  {fmtHours(w.HOURS_WORKED)}
                                </td>
                                <td className="px-4 py-2.5 text-right text-sm">
                                  {w.DAYS_WORKED ?? "—"}
                                </td>
                                <td className="px-4 py-2.5 text-right text-sm">
                                  {fmtAmount(
                                    w.CALC_BASIS === "HOUR"
                                      ? w.RATE_PER_HOUR
                                      : w.RATE_PER_DAY,
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-right text-sm font-semibold">
                                  {w.AMOUNT != null ? (
                                    fmtAmount(w.AMOUNT)
                                  ) : (
                                    <span className="text-destructive italic">
                                      rate missing
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <InvoiceSheet />

      {/* ── Confirm modal ── */}
      <Dialog
        open={!!confirm}
        onOpenChange={(o) => {
          if (!o) setConfirm(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{confirm?.title}</DialogTitle>
            <DialogDescription>{confirm?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant={confirm?.destructive ? "destructive" : "default"}
              onClick={() => {
                const fn = confirm?.onConfirm;
                setConfirm(null);
                fn?.();
              }}
            >
              {confirm?.confirmLabel || "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {activeTab === "byContractor" && contractorGroups.length > 1 && (
        <Popover
          open={jumpOpen}
          onOpenChange={(open) => {
            setJumpOpen(open);
            if (!open) setJumpSearch("");
          }}
        >
          <PopoverTrigger asChild>
            <Button
              aria-label="Jump to contractor"
              className="fixed bottom-16 right-6 z-[60] h-9 rounded-full shadow-lg px-3 gap-1.5"
            >
              <List size={16} />
              <span className="hidden sm:inline text-xs">Contractors</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            sideOffset={8}
            className="w-72 p-2"
          >
            {contractorGroups.length > 8 && (
              <input
                type="text"
                value={jumpSearch}
                onChange={(e) => setJumpSearch(e.target.value)}
                placeholder="Search contractor..."
                className="mb-2 h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
            <div className="max-h-96 overflow-y-auto flex flex-col">
              {jumpContractors.map((group) => {
                const key = group.contractorId ?? "none";
                const name = group.contractorName.trim();
                return (
                  <button
                    key={key}
                    type="button"
                    title={name}
                    aria-current={activeJumpKey === key ? "true" : undefined}
                    onClick={() => {
                      setActiveJumpKey(key);
                      document
                        .getElementById(`contractor-${key}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      setJumpOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-sm border-l-4 px-2 py-2.5 text-sm text-left text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      activeJumpKey === key
                        ? "bg-selected border-selected-border"
                        : "border-transparent"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                      style={{ backgroundColor: getAvatarColor(name) }}
                    >
                      {getInitials(name)}
                    </span>
                    <span
                      className={`flex-1 truncate ${
                        activeJumpKey === key ? "font-semibold" : ""
                      }`}
                    >
                      {name}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {group.rows.length}
                    </span>
                    {activeJumpKey === key && (
                      <Check size={16} className="shrink-0 text-primary" />
                    )}
                  </button>
                );
              })}
              {workerLogs.length > 0 && (
                <>
                  <div
                    aria-hidden="true"
                    className="mt-1 border-t border-border"
                  />
                  <button
                    type="button"
                    aria-current={
                      activeJumpKey === "worker" ? "true" : undefined
                    }
                    onClick={() => {
                      setActiveJumpKey("worker");
                      workerSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      setJumpOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-sm border-l-4 px-2 py-2.5 text-sm text-left text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      activeJumpKey === "worker"
                        ? "bg-selected border-selected-border"
                        : "border-transparent"
                    }`}
                  >
                    <Users
                      size={16}
                      className="shrink-0 text-muted-foreground"
                    />
                    <span
                      className={`flex-1 truncate ${
                        activeJumpKey === "worker" ? "font-semibold" : ""
                      }`}
                    >
                      Worker Hours
                    </span>
                    {activeJumpKey === "worker" && (
                      <Check size={16} className="shrink-0 text-primary" />
                    )}
                  </button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          size="icon"
          className="fixed bottom-6 right-6 z-[60] h-9 w-9 rounded-full shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <MoveUpIcon size={16} />
        </Button>
      )}
    </SectionContainer>
  );
}