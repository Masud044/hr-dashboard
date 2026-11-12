// // import React, { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// // import { Cog, CheckCircle } from "lucide-react";
// // import { toast } from "react-toastify";
// // import axios from "axios";

// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Textarea } from "@/components/ui/textarea";
// // import {
// //   Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
// // } from "@/components/ui/sheet";
// // import {
// //   Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
// // } from "@/components/ui/dialog";

// // const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// // // ── Standalone Dashboard Dialog ───────────────────────────────────────────────
// // function DashboardDialog({ open, onClose, onConfirm, isCreating }) {
// //   const [date, setDate] = useState("");
// //   useEffect(() => { if (!open) setDate(""); }, [open]);

// //   return (
// //     <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
// //       <DialogContent className="sm:max-w-sm z-[200]">
// //         <DialogHeader>
// //           <DialogTitle>Select Project Start Date</DialogTitle>
// //         </DialogHeader>
// //         <Input
// //           type="date"
// //           value={date}
// //           onChange={(e) => setDate(e.target.value)}
// //         />
// //         <DialogFooter className="mt-2">
// //           <Button variant="outline" onClick={onClose}>Cancel</Button>
// //           <Button onClick={() => onConfirm(date)} disabled={isCreating}>
// //             {isCreating ? "Creating..." : "Create"}
// //           </Button>
// //         </DialogFooter>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // }




// // // ── Main ProcessSheet ─────────────────────────────────────────────────────────
// // export function ProcessSheet({ isOpen, onClose, projectId }) {
// //   const navigate    = useNavigate();
// //   const queryClient = useQueryClient();
// //   const id          = projectId;

// //   const [editableLines,       setEditableLines]       = useState([]);
// //   const [showDashboardModal,  setShowDashboardModal]  = useState(false);
// //   const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);
 

// //   // ── queries ──────────────────────────────────────────────────────────────
// //   const { data: contractorTypes = [] } = useQuery({
// //     queryKey: ["contractorTypes"],
// //     queryFn: async () => (await axios.get(`${url}/api/contractor-type`)).data?.data || [],
// //     enabled: isOpen,
// //   });

// //   const { data: contractorTypeMap = [] } = useQuery({
// //     queryKey: ["contractorTypeMap"],
// //     queryFn: async () =>
// //       (await axios.get(`${url}/api/contractor/contractor-type-info`)).data?.data || [],
// //     enabled: isOpen,
// //   });

// //   const { data: contractorNames = [] } = useQuery({
// //     queryKey: ["contractorNames"],
// //     queryFn: async () => (await axios.get(`${url}/api/contractor`)).data?.data || [],
// //     enabled: isOpen,
// //   });

// //   const { data: existingProject } = useQuery({
// //     queryKey: ["project", id],
// //     queryFn: async () => {
// //       const res = await axios.get(`${url}/api/project?p_id=${id}`);
// //       const d   = res.data?.data;
// //       return Array.isArray(d) ? d.find((p) => Number(p.P_ID) === Number(id)) : d;
// //     },
// //     enabled: !!id && isOpen,
// //   });

// //   const { data: allSchedules = [] } = useQuery({
// //     queryKey: ["allSchedules"],
// //     queryFn: async () => {
// //       const res = await axios.get(`${url}/api/shedule`);
// //       if (Array.isArray(res.data?.data)) return res.data.data;
// //       if (Array.isArray(res.data)) return res.data;
// //       return [];
// //     },
// //     enabled: !!id && isOpen,
// //   });

// //   const { data: processLines = [], refetch: refetchProcess } = useQuery({
// //     queryKey: ["constructionProcess", id],
// //     queryFn: async () => {
// //       if (!id) return [];
// //       return (
// //         await axios.get(`${url}/api/construction-process?action=read&PROCESS_ID=${id}`)
// //       ).data?.data || [];
// //     },
// //     enabled: !!id && isOpen,
// //   });

// //   // ── derived ──────────────────────────────────────────────────────────────
// //   const dashboardAlreadyCreated = allSchedules.some((s) => String(s.P_ID) === String(id));
// //   const processAlreadyCreated   = processLines.length > 0;

  
// //   // ── sync editable lines ───────────────────────────────────────────────────
// // //   useEffect(() => {
// // //     if (processLines.length > 0) {
// // //       setEditableLines(
// // //         processLines.map((line) => ({
// // //           ...line,
// // //           CONTRACTOR_NAME:
// // //             contractorNames.find(
// // //               (c) => Number(c.CONTRATOR_ID) === Number(line.CONTRACTOR_ID)
// // //             )?.CONTRATOR_NAME || "",
// // //         }))
// // //       );
// // //     } else {
// // //       setEditableLines([]);
// // //     }
// // //   }, [processLines, contractorNames]);

// // // ── sync editable lines ───────────────────────────────────────────────────
// //   useEffect(() => {
// //     if (processLines.length > 0) {
// //       const next = processLines.map((line) => ({
// //         ...line,
// //         CONTRACTOR_NAME:
// //           contractorNames.find(
// //             (c) => Number(c.CONTRATOR_ID) === Number(line.CONTRACTOR_ID)
// //           )?.CONTRATOR_NAME || "",
// //       }));
// //       setEditableLines((prev) => {
// //         const sameLength = prev.length === next.length;
// //         const sameContent =
// //           sameLength &&
// //           prev.every(
// //             (p, i) => p.ID === next[i].ID && p.CONTRACTOR_NAME === next[i].CONTRACTOR_NAME
// //           );
// //         return sameContent ? prev : next; // bail out if nothing actually changed
// //       });
// //     } else {
// //       setEditableLines((prev) => (prev.length === 0 ? prev : []));
// //     }
// //   }, [processLines, contractorNames]);

// //   // reset when sheet closes
// //   useEffect(() => {
// //     if (!isOpen) {
// //       setShowDashboardModal(false);
      
// //     }
// //   }, [isOpen]);

// //   // ── mutations ─────────────────────────────────────────────────────────────
// //   const processMutation = useMutation({
// //     mutationFn: async (process_id) =>
// //       axios.post(`${url}/api/process-contractor`, { process_id }),
// //     onSuccess: async () => {
// //       toast.success("Process lines created!");
// //       await queryClient.invalidateQueries(["constructionProcess", id]);
// //       refetchProcess();
// //     },
// //     onError: () => toast.error("Failed to create process lines."),
// //   });

// //   const handleProcess = () => {
// //     if (!id) { toast.error("Project ID not found."); return; }
// //     if (processAlreadyCreated) { toast.warning("Process lines already exist."); return; }
// //     processMutation.mutate(id);
// //   };

// //   const handleLineChange = (index, field, value) => {
// //     setEditableLines((prev) => {
// //       const updated = [...prev];
// //       let newValue  = value;
// //       if (["SORT_ID","COST","SUB_CONTRACT_ID","DEPENDENT_ID","CONTRACTOR_ID"].includes(field)) {
// //         newValue = value === "" ? "" : Number(value);
// //       }
// //       const newLine = { ...updated[index], [field]: newValue };
// //       if (field === "DEPENDENT_ID") {
// //         newLine.DEPENDENT_NAME = contractorTypes.find((c) => c.ID === newValue)?.NAME || "";
// //       }
// //       if (field === "CONTRACTOR_ID") {
// //         newLine.CONTRACTOR_NAME =
// //           contractorNames.find((c) => Number(c.CONTRATOR_ID) === Number(newValue))
// //             ?.CONTRATOR_NAME || "";
// //       }
// //       updated[index] = newLine;
// //       return updated;
// //     });
// //   };

// //   const updateProcessMutation = useMutation({
// //     mutationFn: async (lines) =>
// //       Promise.all(
// //         lines.map((line) =>
// //           axios.put(`${url}/api/construction-process?action=update`, {
// //             ID:            line.ID,
// //             DEPENDENT_ID:  line.DEPENDENT_ID ? Number(line.DEPENDENT_ID) : null,
// //             SORT_ID:       line.SORT_ID ? Number(line.SORT_ID) : 0,
// //             COST:          line.COST !== undefined && line.COST !== "" ? Number(line.COST) : null,
// //             CONTRACTOR_ID: line.CONTRACTOR_ID ? Number(line.CONTRACTOR_ID) : null,
// //             UPDATED_BY:    105,
// //           })
// //         )
// //       ),
// //     onSuccess: () => { refetchProcess(); toast.success("Process lines updated!"); },
// //     onError:   () => toast.error("Update failed."),
// //   });

 
// //   // ── dashboard ─────────────────────────────────────────────────────────────
// //   const handleCreateDashboard = async (dashboardDate) => {
// //     if (!dashboardDate) { toast.error("Please select a start date!"); return; }
// //     if (dashboardAlreadyCreated) {
// //       toast.warning("A dashboard already exists for this project.");
// //       setShowDashboardModal(false);
// //       return;
// //     }
// //     setIsCreatingDashboard(true);
// //     try {
// //       const createRes = await axios.post(
// //         `${url}/api/shedule_api`,
// //         { p_pid: Number(id), p_s_date: dashboardDate },
// //         { headers: { "Content-Type": "application/json" } }
// //       );
// //       if (!createRes.data?.success) {
// //         toast.error(createRes.data?.message || "Failed to create dashboard");
// //         setIsCreatingDashboard(false);
// //         return;
// //       }
// //       toast.success("Dashboard created!");
// //       await new Promise((r) => setTimeout(r, 500));

// //       const fetchRes   = await axios.get(`${url}/api/shedule`);
// //       const schedules  = fetchRes.data?.data || fetchRes.data || [];
// //       const projectSch = schedules.filter((s) => String(s.P_ID) === String(id));
// //       if (!projectSch.length) { toast.error("No schedule found."); setIsCreatingDashboard(false); return; }

// //       const H_ID = projectSch.sort((a, b) => Number(b.H_ID) - Number(a.H_ID))[0]?.H_ID;
// //       if (!H_ID) { toast.error("H_ID not found"); setIsCreatingDashboard(false); return; }

// //       queryClient.invalidateQueries(["allSchedules"]);
// //       toast.success(`Dashboard ready (H_ID: ${H_ID})`);
// //       setShowDashboardModal(false);
// //       onClose();
// //       setTimeout(
// //         () => navigate(`/dashboard/timeline/${H_ID}`, { state: { projectStartDate: dashboardDate } }),
// //         500
// //       );
// //     } catch (err) {
// //       toast.error(err.response?.data?.message || "Failed to create dashboard");
// //       setIsCreatingDashboard(false);
// //     }
// //   };

  
// //   // ── render ────────────────────────────────────────────────────────────────
// //   return (
// //     <>
// //       <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
// //         <SheetContent className="!w-screen !h-screen !max-w-none overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-[104]">
// //           <SheetHeader className="mb-6">
// //             <SheetTitle>
// //               {existingProject?.P_NAME || `Project #${id}`}
// //             </SheetTitle>
// //             <SheetDescription>Process &amp; Dashboard Management</SheetDescription>
// //           </SheetHeader>

// //           {/* ── Action Buttons ────────────────────────────────────────────── */}
// //           <div className="flex flex-wrap gap-3 mb-8">
// //             <div className="relative group">
// //               <Button
// //                 onClick={handleProcess}
// //                 disabled={processMutation.isPending || processAlreadyCreated}
// //                 variant={processAlreadyCreated ? "outline" : "default"}
// //                 className={processAlreadyCreated ? "opacity-70 cursor-not-allowed" : ""}
// //               >
// //                 {processAlreadyCreated ? (
// //                   <><CheckCircle size={15} className="mr-2 text-green-500" />Process Created</>
// //                 ) : (
// //                   <><Cog size={15} className={processMutation.isPending ? "animate-spin mr-2" : "mr-2"} />
// //                     {processMutation.isPending ? "Processing..." : "Create Process"}</>
// //                 )}
// //               </Button>
// //               {processAlreadyCreated && (
// //                 <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap
// //                   bg-gray-800 text-white text-xs rounded px-2 py-1
// //                   opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
// //                   Process lines already created for this project
// //                 </div>
// //               )}
// //             </div>

// //             <div className="relative group">
// //               <Button
// //                 onClick={() => {
// //                   if (dashboardAlreadyCreated) { toast.warning("Dashboard already exists."); return; }
// //                   setShowDashboardModal(true);
// //                 }}
// //                 disabled={dashboardAlreadyCreated}
// //                 variant={dashboardAlreadyCreated ? "outline" : "default"}
// //                 className={dashboardAlreadyCreated ? "opacity-70 cursor-not-allowed" : ""}
// //               >
// //                 {dashboardAlreadyCreated ? (
// //                   <><CheckCircle size={15} className="mr-2 text-green-500" />Dashboard Created</>
// //                 ) : "Create Dashboard"}
// //               </Button>
// //               {dashboardAlreadyCreated && (
// //                 <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap
// //                   bg-gray-800 text-white text-xs rounded px-2 py-1
// //                   opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
// //                   Dashboard already created for this project
// //                 </div>
// //               )}
// //             </div>
// //           </div>

// //           {/* ── Construction Process Table ────────────────────────────────── */}
// //           <SectionLabel label="Construction Process Lines" />
// //           <div className="overflow-x-auto mt-3">
// //             <table className="w-full border-collapse text-sm">
// //               <thead>
// //                 <tr className="bg-gray-100 text-gray-700 text-left">
// //                   {["Sort", "Contract Type", "Contractor", "Dependent", "Cost"].map((h) => (
// //                     <th key={h} className="px-3 py-2 border text-xs font-semibold uppercase tracking-wide">{h}</th>
// //                   ))}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {editableLines.length > 0 ? (
// //                   editableLines.map((line, index) => (
// //                     <tr key={line.ID || index} className="hover:bg-gray-50">
// //                       {/* <td className="px-3 py-2 border w-[6%] text-gray-500">{line.PROCESS_ID}</td> */}

// //                        <td className="px-3 py-2 border w-[7%] text-center">
// //                         <input
// //                           type="number"
// //                           value={line.SORT_ID || ""}
// //                           onChange={(e) => handleLineChange(index, "SORT_ID", e.target.value)}
// //                           className="w-full border-none outline-none bg-transparent  text-sm"
// //                         />
// //                       </td>
// //                       <td className="px-3 py-2 border w-[20%]">
// //                         {contractorTypes.find((c) => c.ID === line.SUB_CONTRACT_ID)?.NAME || ""}
// //                       </td>
// //                       <td className="py-2 border w-[20%]">
// //                         <select
// //                           value={line.CONTRACTOR_ID || ""}
// //                           onChange={(e) => handleLineChange(index, "CONTRACTOR_ID", e.target.value)}
// //                           className="rounded text-sm px-2 py-1 w-[90%] focus:outline-none bg-transparent"
// //                         >
// //                           <option value="">Select Contractor</option>
// //                           {contractorNames
// //                             .filter((c) =>
// //                               !line.SUB_CONTRACT_ID ||
// //                               contractorTypeMap.some(
// //                                 (m) =>
// //                                   Number(m.CONTRUCTOR_ID) === Number(c.CONTRATOR_ID) &&
// //                                   Number(m.CONTRUCTOR_TYPE) === Number(line.SUB_CONTRACT_ID)
// //                               )
// //                             )
// //                             .map((c) => (
// //                               <option key={c.CONTRATOR_ID} value={c.CONTRATOR_ID}>
// //                                 {c.CONTRATOR_NAME}
// //                               </option>
// //                             ))}
// //                         </select>
// //                       </td>
// //                       <td className="py-2 border w-[20%]">
// //                         <select
// //                           value={line.DEPENDENT_ID || ""}
// //                           onChange={(e) => handleLineChange(index, "DEPENDENT_ID", e.target.value)}
// //                           className="rounded text-sm px-2 py-1 w-[90%] focus:outline-none bg-transparent"
// //                         >
// //                           <option value="">Select Dependent</option>
// //                           {contractorTypes.map((c) => (
// //                             <option key={c.ID} value={c.ID}>{c.NAME}</option>
// //                           ))}
// //                         </select>
// //                       </td>
                     
// //                       <td className="px-3 py-2 border w-[10%] text-center">
// //                         <input
// //                           type="number"
// //                           value={line.COST || ""}
// //                           onChange={(e) => handleLineChange(index, "COST", e.target.value)}
// //                           className="w-full border-none outline-none bg-transparent  text-sm"
// //                         />
// //                       </td>
// //                     </tr>
// //                   ))
// //                 ) : (
// //                   <tr>
// //                     <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
// //                       No process lines found. Click <strong>"Create Process"</strong> above to generate them.
// //                     </td>
// //                   </tr>
// //                 )}
// //               </tbody>
// //             </table>

// //             {editableLines.length > 0 && (
// //               <div className="flex justify-end mt-3">
// //                 <Button
// //                   onClick={() => updateProcessMutation.mutate(editableLines)}
// //                   disabled={updateProcessMutation.isPending}
// //                 >
// //                   {updateProcessMutation.isPending ? "Updating..." : "Update Process"}
// //                 </Button>
// //               </div>
// //             )}
// //           </div>
// //         </SheetContent>
// //       </Sheet>

    
// //       <DashboardDialog
// //         open={showDashboardModal}
// //         onClose={() => setShowDashboardModal(false)}
// //         onConfirm={handleCreateDashboard}
// //         isCreating={isCreatingDashboard}
// //       />

     
// //     </>
// //   );
// // }

// // const SectionLabel = ({ label }) => (
// //   <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
// //     <span className="flex-1 h-px bg-gray-200" />
// //     {label}
// //     <span className="flex-1 h-px bg-gray-200" />
// //   </p>
// // );

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Cog, CheckCircle, Check, ChevronDown, Search, X } from "lucide-react";
// import { toast } from "react-toastify";
// import axios from "axios";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
// } from "@/components/ui/sheet";
// import {
//   Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
// } from "@/components/ui/dialog";

// const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// // ── helpers ───────────────────────────────────────────────────────────────────
// // Server value can be: null, a single id, an array, or "1,2,3". Always return number[].
// const toIdArray = (v) => {
//   if (v === null || v === undefined || v === "") return [];
//   if (Array.isArray(v)) return v.map(Number).filter((n) => !Number.isNaN(n));
//   return String(v)
//     .split(",")
//     .map((s) => s.trim())
//     .filter((s) => s !== "")
//     .map(Number)
//     .filter((n) => !Number.isNaN(n));
// };

// // ── MultiSelect ───────────────────────────────────────────────────────────────
// // options: [{ value, label }]   value: array of selected values
// // The panel uses position: fixed (no portal) so it is not clipped by the table's
// // overflow-x-auto, and clicks inside it stay inside the Sheet (Radix would treat a
// // portal outside the Sheet as an outside click and close the Sheet).
// const MAX_CHIPS = 3;

// function MultiSelect({ options, value = [], onChange, placeholder = "Select..." }) {
//   const [open, setOpen]     = useState(false);
//   const [search, setSearch] = useState("");
//   const [active, setActive] = useState(0);
//   const [pos, setPos]       = useState({ left: 0, width: 260, maxHeight: 320 });
//   const triggerRef = useRef(null);
//   const panelRef   = useRef(null);
//   const listRef    = useRef(null);

//   const selectedSet = useMemo(() => new Set(value.map(Number)), [value]);
//   const selected    = useMemo(
//     () => options.filter((o) => selectedSet.has(Number(o.value))),
//     [options, selectedSet]
//   );
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return q ? options.filter((o) => String(o.label).toLowerCase().includes(q)) : options;
//   }, [options, search]);

//   // place the panel under (or above, if no room) the trigger
//   const place = () => {
//     const r = triggerRef.current?.getBoundingClientRect();
//     if (!r) return;
//     if (r.bottom < 0 || r.top > window.innerHeight) { setOpen(false); return; } // trigger scrolled out of view
//     const below = window.innerHeight - r.bottom - 8;
//     const above = r.top - 8;
//     const up    = below < 240 && above > below;
//     const width = Math.max(r.width, 260);
//     setPos({
//       left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)),
//       width,
//       top:    up ? undefined : r.bottom + 4,
//       bottom: up ? window.innerHeight - r.top + 4 : undefined,
//       maxHeight: Math.max(160, Math.min(340, up ? above : below)),
//     });
//   };

//   const openPanel  = () => { place(); setOpen(true); };
//   const closePanel = () => { setOpen(false); triggerRef.current?.focus(); };

//   useEffect(() => {
//     if (!open) { setSearch(""); return; }
//     const onDown = (e) => {
//       if (triggerRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
//       setOpen(false);
//     };
//     // Scrolling INSIDE the panel must not close it. Scrolling anything else just
//     // re-positions the panel so it follows the trigger.
//     const onScroll = (e) => {
//       if (panelRef.current?.contains(e.target)) return;
//       place();
//     };
//     document.addEventListener("mousedown", onDown);
//     window.addEventListener("resize", place);
//     window.addEventListener("scroll", onScroll, true);
//     return () => {
//       document.removeEventListener("mousedown", onDown);
//       window.removeEventListener("resize", place);
//       window.removeEventListener("scroll", onScroll, true);
//     };
//   }, [open]);

//   useEffect(() => { setActive(0); }, [search]);

//   // keep the keyboard-highlighted row visible
//   useEffect(() => {
//     if (!open) return;
//     listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
//   }, [active, open]);

//   const toggle = (val) => {
//     const n = Number(val);
//     onChange(selectedSet.has(n) ? value.filter((v) => Number(v) !== n) : [...value, n]);
//   };

//   const remove = (e, val) => {
//     e.stopPropagation();
//     onChange(value.filter((v) => Number(v) !== Number(val)));
//   };

//   const onSearchKey = (e) => {
//     if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, filtered.length - 1)); }
//     else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
//     else if (e.key === "Enter") { e.preventDefault(); if (filtered[active]) toggle(filtered[active].value); }
//     else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closePanel(); }
//   };

//   return (
//     <>
//       <div
//         ref={triggerRef}
//         role="combobox"
//         aria-expanded={open}
//         tabIndex={0}
//         onClick={() => (open ? setOpen(false) : openPanel())}
//         onKeyDown={(e) => {
//           if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") { e.preventDefault(); if (!open) openPanel(); }
//         }}
//         className={`flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-md border bg-white px-2 py-1 text-sm transition
//           ${open ? "border-gray-400 ring-2 ring-gray-200" : "border-gray-200 hover:border-gray-300"}
//           focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300`}
//       >
//         <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
//           {selected.length === 0 && <span className="px-1 text-gray-400">{placeholder}</span>}
//           {selected.slice(0, MAX_CHIPS).map((o) => (
//             <span
//               key={o.value}
//               className="inline-flex max-w-[160px] items-center gap-1 rounded-md border border-gray-200 bg-gray-50 py-0.5 pl-2 pr-1 text-xs font-medium text-gray-700"
//             >
//               <span className="truncate">{o.label}</span>
//               <button
//                 type="button"
//                 onClick={(e) => remove(e, o.value)}
//                 className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
//                 aria-label={`Remove ${o.label}`}
//               >
//                 <X size={12} />
//               </button>
//             </span>
//           ))}
//           {selected.length > MAX_CHIPS && (
//             <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
//               +{selected.length - MAX_CHIPS}
//             </span>
//           )}
//         </div>
//         <ChevronDown
//           size={15}
//           className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
//         />
//       </div>

//       {open && (
//         <div
//           ref={panelRef}
//           style={{
//             position: "fixed",
//             left: pos.left,
//             width: pos.width,
//             top: pos.top,
//             bottom: pos.bottom,
//             maxHeight: pos.maxHeight,
//           }}
//           className="z-[300] flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
//         >
//           <div className="relative border-b border-gray-100 p-2">
//             <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input
//               autoFocus
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               onKeyDown={onSearchKey}
//               placeholder="Search..."
//               className="h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-2 text-sm outline-none focus:border-gray-400"
//             />
//           </div>

//           <ul ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
//             {filtered.length === 0 && (
//               <li className="px-3 py-6 text-center text-sm text-gray-400">No results found</li>
//             )}
//             {filtered.map((o, i) => {
//               const checked = selectedSet.has(Number(o.value));
//               return (
//                 <li
//                   key={o.value}
//                   data-idx={i}
//                   onClick={() => toggle(o.value)}
//                   onMouseEnter={() => setActive(i)}
//                   className={`mx-1 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm
//                     ${i === active ? "bg-gray-100" : ""}`}
//                 >
//                   <span
//                     className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition
//                       ${checked ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 bg-white"}`}
//                   >
//                     {checked && <Check size={12} strokeWidth={3} />}
//                   </span>
//                   <span className={`truncate ${checked ? "font-medium text-gray-900" : "text-gray-700"}`}>
//                     {o.label}
//                   </span>
//                 </li>
//               );
//             })}
//           </ul>

//           <div className="flex items-center justify-between border-t border-gray-100 px-3 py-1.5 text-xs text-gray-500">
//             <span>{selected.length} selected</span>
//             {selected.length > 0 && (
//               <button type="button" onClick={() => onChange([])} className="font-medium text-gray-600 hover:text-gray-900">
//                 Clear all
//               </button>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// // ── Standalone Dashboard Dialog ───────────────────────────────────────────────
// function DashboardDialog({ open, onClose, onConfirm, isCreating }) {
//   const [date, setDate] = useState("");
//   useEffect(() => { if (!open) setDate(""); }, [open]);

//   return (
//     <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
//       <DialogContent className="sm:max-w-sm z-[200]">
//         <DialogHeader>
//           <DialogTitle>Select Project Start Date</DialogTitle>
//         </DialogHeader>
//         <Input
//           type="date"
//           value={date}
//           onChange={(e) => setDate(e.target.value)}
//         />
//         <DialogFooter className="mt-2">
//           <Button variant="outline" onClick={onClose}>Cancel</Button>
//           <Button onClick={() => onConfirm(date)} disabled={isCreating}>
//             {isCreating ? "Creating..." : "Create"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// // ── Main ProcessSheet ─────────────────────────────────────────────────────────
// export function ProcessSheet({ isOpen, onClose, projectId }) {
//   const navigate    = useNavigate();
//   const queryClient = useQueryClient();
//   const id          = projectId;

//   const [editableLines,       setEditableLines]       = useState([]);
//   const [showDashboardModal,  setShowDashboardModal]  = useState(false);
//   const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);

//   // ── queries ──────────────────────────────────────────────────────────────
//   const { data: contractorTypes = [] } = useQuery({
//     queryKey: ["contractorTypes"],
//     queryFn: async () => (await axios.get(`${url}/api/contractor-type`)).data?.data || [],
//     enabled: isOpen,
//   });

//   const { data: contractorNames = [] } = useQuery({
//     queryKey: ["contractorNames"],
//     queryFn: async () => (await axios.get(`${url}/api/contractor`)).data?.data || [],
//     enabled: isOpen,
//   });

//   const { data: existingProject } = useQuery({
//     queryKey: ["project", id],
//     queryFn: async () => {
//       const res = await axios.get(`${url}/api/project?p_id=${id}`);
//       const d   = res.data?.data;
//       return Array.isArray(d) ? d.find((p) => Number(p.P_ID) === Number(id)) : d;
//     },
//     enabled: !!id && isOpen,
//   });

//   const { data: allSchedules = [] } = useQuery({
//     queryKey: ["allSchedules"],
//     queryFn: async () => {
//       const res = await axios.get(`${url}/api/shedule`);
//       if (Array.isArray(res.data?.data)) return res.data.data;
//       if (Array.isArray(res.data)) return res.data;
//       return [];
//     },
//     enabled: !!id && isOpen,
//   });

//   const { data: processLines = [], refetch: refetchProcess } = useQuery({
//     queryKey: ["constructionProcess", id],
//     queryFn: async () => {
//       if (!id) return [];
//       return (
//         await axios.get(`${url}/api/construction-process?action=read&PROCESS_ID=${id}`)
//       ).data?.data || [];
//     },
//     enabled: !!id && isOpen,
//   });

//   // ── derived ──────────────────────────────────────────────────────────────
//   const dashboardAlreadyCreated = allSchedules.some((s) => String(s.P_ID) === String(id));
//   const processAlreadyCreated   = processLines.length > 0;

//   const dependentOptions = useMemo(
//     () => contractorTypes.map((c) => ({ value: Number(c.ID), label: c.NAME })),
//     [contractorTypes]
//   );

//   // Contractor LOV: full list from /api/contractor (id -> name)
//   const contractorOptions = useMemo(
//     () => contractorNames.map((c) => ({ value: Number(c.CONTRATOR_ID), label: c.CONTRATOR_NAME })),
//     [contractorNames]
//   );

//   // ── sync editable lines ───────────────────────────────────────────────────
//   useEffect(() => {
//     if (processLines.length > 0) {
//       const next = processLines.map((line) => ({
//         ...line,
//         DEPENDENT_IDS:  toIdArray(line.DEPENDENT_IDS ?? line.DEPENDENT_ID),
//         CONTRACTOR_IDS: toIdArray(line.CONTRACTOR_IDS ?? line.CONTRACTOR_ID),
//       }));
//       setEditableLines((prev) => {
//         const sameContent =
//           prev.length === next.length &&
//           prev.every(
//             (p, i) =>
//               p.ID === next[i].ID &&
//               JSON.stringify(p.DEPENDENT_IDS)  === JSON.stringify(next[i].DEPENDENT_IDS) &&
//               JSON.stringify(p.CONTRACTOR_IDS) === JSON.stringify(next[i].CONTRACTOR_IDS)
//           );
//         return sameContent ? prev : next; // bail out if nothing actually changed
//       });
//     } else {
//       setEditableLines((prev) => (prev.length === 0 ? prev : []));
//     }
//   }, [processLines]);

//   // reset when sheet closes
//   useEffect(() => {
//     if (!isOpen) {
//       setShowDashboardModal(false);
//     }
//   }, [isOpen]);

//   // ── mutations ─────────────────────────────────────────────────────────────
//   const processMutation = useMutation({
//     mutationFn: async (process_id) =>
//       axios.post(`${url}/api/process-contractor`, { process_id }),
//     onSuccess: async () => {
//       toast.success("Process lines created!");
//       await queryClient.invalidateQueries(["constructionProcess", id]);
//       refetchProcess();
//     },
//     onError: () => toast.error("Failed to create process lines."),
//   });

//   const handleProcess = () => {
//     if (!id) { toast.error("Project ID not found."); return; }
//     if (processAlreadyCreated) { toast.warning("Process lines already exist."); return; }
//     processMutation.mutate(id);
//   };

//   // single-value fields (SORT_ID, COST)
//   const handleLineChange = (index, field, value) => {
//     setEditableLines((prev) => {
//       const updated = [...prev];
//       let newValue  = value;
//       if (["SORT_ID", "COST", "SUB_CONTRACT_ID"].includes(field)) {
//         newValue = value === "" ? "" : Number(value);
//       }
//       updated[index] = { ...updated[index], [field]: newValue };
//       return updated;
//     });
//   };

//   // multiselect fields (DEPENDENT_IDS, CONTRACTOR_IDS) — value is number[]
//   const handleMultiChange = (index, field, values) => {
//     setEditableLines((prev) => {
//       const updated = [...prev];
//       updated[index] = { ...updated[index], [field]: values };
//       return updated;
//     });
//   };

//   // Arrays go under DEPENDENT_IDS / CONTRACTOR_IDS (backend saves them in junction tables).
//   const buildPayload = (line) => ({
//     ID:             line.ID,
//     DEPENDENT_IDS:  line.DEPENDENT_IDS || [],
//     SORT_ID:        line.SORT_ID ? Number(line.SORT_ID) : 0,
//     COST:           line.COST !== undefined && line.COST !== "" ? Number(line.COST) : null,
//     CONTRACTOR_IDS: line.CONTRACTOR_IDS || [],
//     UPDATED_BY:     105,
//   });

//   const updateProcessMutation = useMutation({
//     mutationFn: async (lines) =>
//       Promise.all(
//         lines.map((line) =>
//           axios.put(`${url}/api/construction-process?action=update`, buildPayload(line))
//         )
//       ),
//     onSuccess: () => { refetchProcess(); toast.success("Process lines updated!"); },
//     onError:   () => toast.error("Update failed."),
//   });

//   // ── dashboard ─────────────────────────────────────────────────────────────
//   const handleCreateDashboard = async (dashboardDate) => {
//     if (!dashboardDate) { toast.error("Please select a start date!"); return; }
//     if (dashboardAlreadyCreated) {
//       toast.warning("A dashboard already exists for this project.");
//       setShowDashboardModal(false);
//       return;
//     }
//     setIsCreatingDashboard(true);
//     try {
//       const createRes = await axios.post(
//         `${url}/api/shedule_api`,
//         { p_pid: Number(id), p_s_date: dashboardDate },
//         { headers: { "Content-Type": "application/json" } }
//       );
//       if (!createRes.data?.success) {
//         toast.error(createRes.data?.message || "Failed to create dashboard");
//         setIsCreatingDashboard(false);
//         return;
//       }
//       toast.success("Dashboard created!");
//       await new Promise((r) => setTimeout(r, 500));

//       const fetchRes   = await axios.get(`${url}/api/shedule`);
//       const schedules  = fetchRes.data?.data || fetchRes.data || [];
//       const projectSch = schedules.filter((s) => String(s.P_ID) === String(id));
//       if (!projectSch.length) { toast.error("No schedule found."); setIsCreatingDashboard(false); return; }

//       const H_ID = projectSch.sort((a, b) => Number(b.H_ID) - Number(a.H_ID))[0]?.H_ID;
//       if (!H_ID) { toast.error("H_ID not found"); setIsCreatingDashboard(false); return; }

//       queryClient.invalidateQueries(["allSchedules"]);
//       toast.success(`Dashboard ready (H_ID: ${H_ID})`);
//       setShowDashboardModal(false);
//       onClose();
//       setTimeout(
//         () => navigate(`/dashboard/timeline/${H_ID}`, { state: { projectStartDate: dashboardDate } }),
//         500
//       );
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to create dashboard");
//       setIsCreatingDashboard(false);
//     }
//   };

//   // ── render ────────────────────────────────────────────────────────────────
//   return (
//     <>
//       <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
//         <SheetContent className="!w-screen !h-screen !max-w-none overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-[104]">
//           <SheetHeader className="mb-0 border-b px-6 pb-4 pt-6">
//             <SheetTitle>
//               {existingProject?.P_NAME || `Project #${id}`}
//             </SheetTitle>
//             <SheetDescription>Process &amp; Dashboard Management</SheetDescription>
//           </SheetHeader>

//           <div className="px-6 py-6">
//           {/* ── Action Buttons ────────────────────────────────────────────── */}
//           <div className="mb-8 flex flex-wrap gap-3">
//             <div className="relative group">
//               <Button
//                 onClick={handleProcess}
//                 disabled={processMutation.isPending || processAlreadyCreated}
//                 variant={processAlreadyCreated ? "outline" : "default"}
//                 className={processAlreadyCreated ? "opacity-70 cursor-not-allowed" : ""}
//               >
//                 {processAlreadyCreated ? (
//                   <><CheckCircle size={15} className="mr-2 text-green-500" />Process Created</>
//                 ) : (
//                   <><Cog size={15} className={processMutation.isPending ? "animate-spin mr-2" : "mr-2"} />
//                     {processMutation.isPending ? "Processing..." : "Create Process"}</>
//                 )}
//               </Button>
//               {processAlreadyCreated && (
//                 <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap
//                   bg-gray-800 text-white text-xs rounded px-2 py-1
//                   opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
//                   Process lines already created for this project
//                 </div>
//               )}
//             </div>

//             <div className="relative group">
//               <Button
//                 onClick={() => {
//                   if (dashboardAlreadyCreated) { toast.warning("Dashboard already exists."); return; }
//                   setShowDashboardModal(true);
//                 }}
//                 disabled={dashboardAlreadyCreated}
//                 variant={dashboardAlreadyCreated ? "outline" : "default"}
//                 className={dashboardAlreadyCreated ? "opacity-70 cursor-not-allowed" : ""}
//               >
//                 {dashboardAlreadyCreated ? (
//                   <><CheckCircle size={15} className="mr-2 text-green-500" />Dashboard Created</>
//                 ) : "Create Dashboard"}
//               </Button>
//               {dashboardAlreadyCreated && (
//                 <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap
//                   bg-gray-800 text-white text-xs rounded px-2 py-1
//                   opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
//                   Dashboard already created for this project
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* ── Construction Process Table ────────────────────────────────── */}
//           <div className="mb-3 flex items-baseline justify-between">
//             <h3 className="text-sm font-semibold text-gray-900">Construction process lines</h3>
//             {editableLines.length > 0 && (
//               <span className="text-xs text-gray-500">{editableLines.length} lines</span>
//             )}
//           </div>

//           <div className="overflow-x-auto rounded-lg border border-gray-200">
//             <table className="w-full min-w-[920px] border-collapse text-sm">
//               <thead>
//                 <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600">
//                   <th className="w-[90px] px-4 py-3 text-center">Sort</th>
//                   <th className="w-[20%] px-4 py-3">Contract type</th>
//                   <th className="w-[28%] px-4 py-3">Contractor</th>
//                   <th className="w-[28%] px-4 py-3">Dependent</th>
//                   <th className="w-[130px] px-4 py-3 text-right">Budget Cost</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {editableLines.length > 0 ? (
//                   editableLines.map((line, index) => (
//                     <tr key={line.ID || index} className="align-top transition-colors hover:bg-gray-50/60">
//                       <td className="px-4 py-3">
//                         <input
//                           type="number"
//                           value={line.SORT_ID || ""}
//                           onChange={(e) => handleLineChange(index, "SORT_ID", e.target.value)}
//                           className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-center text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
//                         />
//                       </td>
//                       <td className="px-4 py-3 pt-[18px] font-medium text-gray-800">
//                         {contractorTypes.find((c) => c.ID === line.SUB_CONTRACT_ID)?.NAME || (
//                           <span className="font-normal text-gray-400">-</span>
//                         )}
//                       </td>
//                       <td className="px-4 py-3">
//                         <MultiSelect
//                           options={contractorOptions}
//                           value={line.CONTRACTOR_IDS || []}
//                           onChange={(vals) => handleMultiChange(index, "CONTRACTOR_IDS", vals)}
//                           placeholder="Select contractors"
//                         />
//                       </td>
//                       <td className="px-4 py-3">
//                         <MultiSelect
//                           options={dependentOptions}
//                           value={line.DEPENDENT_IDS || []}
//                           onChange={(vals) => handleMultiChange(index, "DEPENDENT_IDS", vals)}
//                           placeholder="Select dependents"
//                         />
//                       </td>
//                       <td className="px-4 py-3">
//                         <input
//                           type="number"
//                           value={line.COST || ""}
//                           onChange={(e) => handleLineChange(index, "COST", e.target.value)}
//                           className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-right text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
//                         />
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
//                       No process lines found. Click <strong className="text-gray-600">Create Process</strong> above to generate them.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {editableLines.length > 0 && (
//             <div className="mt-4 flex justify-end">
//               <Button
//                 onClick={() => updateProcessMutation.mutate(editableLines)}
//                 disabled={updateProcessMutation.isPending}
//               >
//                 {updateProcessMutation.isPending ? "Updating..." : "Update Process"}
//               </Button>
//             </div>
//           )}
//           </div>
//         </SheetContent>
//       </Sheet>

//       <DashboardDialog
//         open={showDashboardModal}
//         onClose={() => setShowDashboardModal(false)}
//         onConfirm={handleCreateDashboard}
//         isCreating={isCreatingDashboard}
//       />
//     </>
//   );
// }

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Cog,
  CheckCircle,
  Check,
  ChevronDown,
  Search,
  X,
  FileBarChart,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_META = {
  PENDING:     { label: "Pending",     cls: "bg-gray-100 text-gray-700" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-amber-100 text-amber-700" },
  COMPLETED:   { label: "Completed",   cls: "bg-emerald-100 text-emerald-700" },
};

const confirmStatusChange = (current, next) => {
  if (next === current) return false;
  if (next === "COMPLETED" || current === "COMPLETED") {
    return window.confirm(`Change status to "${STATUS_META[next].label}"?`);
  }
  return true;
};

function StatusSelect({ value, onChange, disabled }) {
  const v = STATUS_META[value] ? value : "PENDING";
  return (
    <select
      value={v}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none disabled:opacity-60 ${STATUS_META[v].cls}`}
    >
      {Object.entries(STATUS_META).map(([k, m]) => (
        <option key={k} value={k}>{m.label}</option>
      ))}
    </select>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────
// Server value can be: null, a single id, an array, or "1,2,3". Always return number[].
const toIdArray = (v) => {
  if (v === null || v === undefined || v === "") return [];
  if (Array.isArray(v)) return v.map(Number).filter((n) => !Number.isNaN(n));
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !Number.isNaN(n));
};

// ── MultiSelect ───────────────────────────────────────────────────────────────
// options: [{ value, label }]   value: array of selected values
// Panel uses position: fixed (no portal) so it is not clipped by the table's
// overflow-x-auto, and clicks inside it stay inside the Sheet.
const MAX_CHIPS = 3;

function MultiSelect({ options, value = [], onChange, placeholder = "Select..." }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [pos, setPos]       = useState({ left: 0, width: 260, maxHeight: 320 });
  const triggerRef = useRef(null);
  const panelRef   = useRef(null);
  const listRef    = useRef(null);

  const selectedSet = useMemo(() => new Set(value.map(Number)), [value]);
  const selected    = useMemo(
    () => options.filter((o) => selectedSet.has(Number(o.value))),
    [options, selectedSet]
  );
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? options.filter((o) => String(o.label).toLowerCase().includes(q)) : options;
  }, [options, search]);

  const place = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    if (r.bottom < 0 || r.top > window.innerHeight) { setOpen(false); return; }
    const below = window.innerHeight - r.bottom - 8;
    const above = r.top - 8;
    const up    = below < 240 && above > below;
    const width = Math.max(r.width, 260);
    setPos({
      left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)),
      width,
      top:    up ? undefined : r.bottom + 4,
      bottom: up ? window.innerHeight - r.top + 4 : undefined,
      maxHeight: Math.max(160, Math.min(340, up ? above : below)),
    });
  };

  const openPanel  = () => { place(); setOpen(true); };
  const closePanel = () => { setOpen(false); triggerRef.current?.focus(); };

  useEffect(() => {
    if (!open) { setSearch(""); return; }
    const onDown = (e) => {
      if (triggerRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onScroll = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      place();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  useEffect(() => { setActive(0); }, [search]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const toggle = (val) => {
    const n = Number(val);
    onChange(selectedSet.has(n) ? value.filter((v) => Number(v) !== n) : [...value, n]);
  };

  const remove = (e, val) => {
    e.stopPropagation();
    onChange(value.filter((v) => Number(v) !== Number(val)));
  };

  const onSearchKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[active]) toggle(filtered[active].value); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closePanel(); }
  };

  return (
    <>
      <div
        ref={triggerRef}
        role="combobox"
        aria-expanded={open}
        tabIndex={0}
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") { e.preventDefault(); if (!open) openPanel(); }
        }}
        className={`flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-md border bg-white px-2 py-1 text-sm transition
          ${open ? "border-gray-400 ring-2 ring-gray-200" : "border-gray-200 hover:border-gray-300"}
          focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300`}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {selected.length === 0 && <span className="px-1 text-gray-400">{placeholder}</span>}
          {selected.slice(0, MAX_CHIPS).map((o) => (
            <span
              key={o.value}
              className="inline-flex max-w-[160px] items-center gap-1 rounded-md border border-gray-200 bg-gray-50 py-0.5 pl-2 pr-1 text-xs font-medium text-gray-700"
            >
              <span className="truncate">{o.label}</span>
              <button
                type="button"
                onClick={(e) => remove(e, o.value)}
                className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                aria-label={`Remove ${o.label}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {selected.length > MAX_CHIPS && (
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
              +{selected.length - MAX_CHIPS}
            </span>
          )}
        </div>
        <ChevronDown
          size={15}
          className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            left: pos.left,
            width: pos.width,
            top: pos.top,
            bottom: pos.bottom,
            maxHeight: pos.maxHeight,
          }}
          className="z-[300] flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          <div className="relative border-b border-gray-100 p-2">
            <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onSearchKey}
              placeholder="Search..."
              className="h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-2 text-sm outline-none focus:border-gray-400"
            />
          </div>

          <ul ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-gray-400">No results found</li>
            )}
            {filtered.map((o, i) => {
              const checked = selectedSet.has(Number(o.value));
              return (
                <li
                  key={o.value}
                  data-idx={i}
                  onClick={() => toggle(o.value)}
                  onMouseEnter={() => setActive(i)}
                  className={`mx-1 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm
                    ${i === active ? "bg-gray-100" : ""}`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition
                      ${checked ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 bg-white"}`}
                  >
                    {checked && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className={`truncate ${checked ? "font-medium text-gray-900" : "text-gray-700"}`}>
                    {o.label}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-1.5 text-xs text-gray-500">
            <span>{selected.length} selected</span>
            {selected.length > 0 && (
              <button type="button" onClick={() => onChange([])} className="font-medium text-gray-600 hover:text-gray-900">
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Standalone Dashboard Dialog ───────────────────────────────────────────────
function DashboardDialog({ open, onClose, onConfirm, isCreating }) {
  const [date, setDate] = useState("");
  useEffect(() => { if (!open) setDate(""); }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-sm z-[200]">
        <DialogHeader>
          <DialogTitle>Select Project Start Date</DialogTitle>
        </DialogHeader>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm(date)} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main ProcessSheet ─────────────────────────────────────────────────────────
export function ProcessSheet({ isOpen, onClose, projectId }) {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const id          = projectId;

  const [editableLines,       setEditableLines]       = useState([]);
  const [showDashboardModal,  setShowDashboardModal]  = useState(false);
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);

  // ── queries ──────────────────────────────────────────────────────────────
  const { data: contractorTypes = [] } = useQuery({
    queryKey: ["contractorTypes"],
    queryFn: async () => (await axios.get(`${url}/api/contractor-type`)).data?.data || [],
    enabled: isOpen,
  });

  const { data: contractorNames = [] } = useQuery({
    queryKey: ["contractorNames"],
    queryFn: async () => (await axios.get(`${url}/api/contractor`)).data?.data || [],
    enabled: isOpen,
  });

  const { data: existingProject } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project?p_id=${id}`);
      const d   = res.data?.data;
      return Array.isArray(d) ? d.find((p) => Number(p.P_ID) === Number(id)) : d;
    },
    enabled: !!id && isOpen,
  });

  const { data: allSchedules = [] } = useQuery({
    queryKey: ["allSchedules"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/shedule`);
      if (Array.isArray(res.data?.data)) return res.data.data;
      if (Array.isArray(res.data)) return res.data;
      return [];
    },
    enabled: !!id && isOpen,
  });

  const { data: processLines = [], refetch: refetchProcess } = useQuery({
    queryKey: ["constructionProcess", id],
    queryFn: async () => {
      if (!id) return [];
      return (
        await axios.get(`${url}/api/construction-process?action=read&PROCESS_ID=${id}`)
      ).data?.data || [];
    },
    enabled: !!id && isOpen,
  });

  // ── derived ──────────────────────────────────────────────────────────────
  const dashboardAlreadyCreated = allSchedules.some((s) => String(s.P_ID) === String(id));
  const processAlreadyCreated   = processLines.length > 0;

  const dependentOptions = useMemo(
    () => contractorTypes.map((c) => ({ value: Number(c.ID), label: c.NAME })),
    [contractorTypes]
  );

  const contractorOptions = useMemo(
    () => contractorNames.map((c) => ({ value: Number(c.CONTRATOR_ID), label: c.CONTRATOR_NAME })),
    [contractorNames]
  );

  // ── sync editable lines ───────────────────────────────────────────────────
  useEffect(() => {
    if (processLines.length > 0) {
      const next = processLines.map((line) => ({
        ...line,
        STATUS:         line.STATUS || "PENDING",
        DEPENDENT_IDS:  toIdArray(line.DEPENDENT_IDS ?? line.DEPENDENT_ID),
        CONTRACTOR_IDS: toIdArray(line.CONTRACTOR_IDS ?? line.CONTRACTOR_ID),
      }));
      setEditableLines((prev) => {
        const sameShape =
          prev.length === next.length &&
          prev.every(
            (p, i) =>
              p.ID === next[i].ID &&
              JSON.stringify(p.DEPENDENT_IDS)  === JSON.stringify(next[i].DEPENDENT_IDS) &&
              JSON.stringify(p.CONTRACTOR_IDS) === JSON.stringify(next[i].CONTRACTOR_IDS)
          );
        if (!sameShape) return next;
        // same lines: only pick up status changes (keeps unsaved edits of other fields)
        const statusDiff = prev.some((p, i) => p.STATUS !== next[i].STATUS);
        return statusDiff
          ? prev.map((p, i) => ({ ...p, STATUS: next[i].STATUS }))
          : prev;
      });
    } else {
      setEditableLines((prev) => (prev.length === 0 ? prev : []));
    }
  }, [processLines]);

  // reset when sheet closes
  useEffect(() => {
    if (!isOpen) setShowDashboardModal(false);
  }, [isOpen]);

  // ── mutations ─────────────────────────────────────────────────────────────
  const processMutation = useMutation({
    mutationFn: async (process_id) =>
      axios.post(`${url}/api/process-contractor`, { process_id }),
    onSuccess: async () => {
      toast.success("Process lines created!");
      await queryClient.invalidateQueries(["constructionProcess", id]);
      refetchProcess();
    },
    onError: () => toast.error("Failed to create process lines."),
  });

  const handleProcess = () => {
    if (!id) { toast.error("Project ID not found."); return; }
    if (processAlreadyCreated) { toast.warning("Process lines already exist."); return; }
    processMutation.mutate(id);
  };

  // single-value fields (SORT_ID, COST)
  const handleLineChange = (index, field, value) => {
    setEditableLines((prev) => {
      const updated = [...prev];
      let newValue  = value;
      if (["SORT_ID", "COST", "SUB_CONTRACT_ID"].includes(field)) {
        newValue = value === "" ? "" : Number(value);
      }
      updated[index] = { ...updated[index], [field]: newValue };
      return updated;
    });
  };

  // multiselect fields (DEPENDENT_IDS, CONTRACTOR_IDS) — value is number[]
  const handleMultiChange = (index, field, values) => {
    setEditableLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: values };
      return updated;
    });
  };

  // STATUS is intentionally NOT part of this payload (it has its own endpoint).
  const buildPayload = (line) => ({
    ID:             line.ID,
    DEPENDENT_IDS:  line.DEPENDENT_IDS || [],
    SORT_ID:        line.SORT_ID ? Number(line.SORT_ID) : 0,
    COST:           line.COST !== undefined && line.COST !== "" ? Number(line.COST) : null,
    CONTRACTOR_IDS: line.CONTRACTOR_IDS || [],
    UPDATED_BY:     105,
  });

  const updateProcessMutation = useMutation({
    mutationFn: async (lines) =>
      Promise.all(
        lines.map((line) =>
          axios.put(`${url}/api/construction-process?action=update`, buildPayload(line))
        )
      ),
    onSuccess: () => {
      refetchProcess();
      queryClient.invalidateQueries({ queryKey: ["projectReport"] });
      toast.success("Process lines updated!");
    },
    onError: () => toast.error("Update failed."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ ID, STATUS }) =>
      axios.put(`${url}/api/construction-process?action=update_status`, {
        ID,
        STATUS,
        UPDATED_BY: 105,
      }),
    onSuccess: (_res, vars) => {
      setEditableLines((prev) =>
        prev.map((l) => (l.ID === vars.ID ? { ...l, STATUS: vars.STATUS } : l))
      );
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["constructionProcess", id] });
      queryClient.invalidateQueries({ queryKey: ["projectReport"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Status update failed"),
  });

  const handleStatusChange = (line, next) => {
    if (!confirmStatusChange(line.STATUS || "PENDING", next)) return;
    statusMutation.mutate({ ID: line.ID, STATUS: next });
  };

  // ── go to this project's report ───────────────────────────────────────────
  const handleGoToReport = () => {
    if (!id) { toast.error("Project ID not found."); return; }
    onClose();
    navigate(`/dashboard/projects/${id}/report`);
  };

  // ── dashboard ─────────────────────────────────────────────────────────────
  const handleCreateDashboard = async (dashboardDate) => {
    if (!dashboardDate) { toast.error("Please select a start date!"); return; }
    if (dashboardAlreadyCreated) {
      toast.warning("A dashboard already exists for this project.");
      setShowDashboardModal(false);
      return;
    }
    setIsCreatingDashboard(true);
    try {
      const createRes = await axios.post(
        `${url}/api/shedule_api`,
        { p_pid: Number(id), p_s_date: dashboardDate },
        { headers: { "Content-Type": "application/json" } }
      );
      if (!createRes.data?.success) {
        toast.error(createRes.data?.message || "Failed to create dashboard");
        setIsCreatingDashboard(false);
        return;
      }
      toast.success("Dashboard created!");
      await new Promise((r) => setTimeout(r, 500));

      const fetchRes   = await axios.get(`${url}/api/shedule`);
      const schedules  = fetchRes.data?.data || fetchRes.data || [];
      const projectSch = schedules.filter((s) => String(s.P_ID) === String(id));
      if (!projectSch.length) { toast.error("No schedule found."); setIsCreatingDashboard(false); return; }

      const H_ID = projectSch.sort((a, b) => Number(b.H_ID) - Number(a.H_ID))[0]?.H_ID;
      if (!H_ID) { toast.error("H_ID not found"); setIsCreatingDashboard(false); return; }

      queryClient.invalidateQueries(["allSchedules"]);
      toast.success(`Dashboard ready (H_ID: ${H_ID})`);
      setShowDashboardModal(false);
      onClose();
      setTimeout(
        () => navigate(`/dashboard/timeline/${H_ID}`, { state: { projectStartDate: dashboardDate } }),
        500
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create dashboard");
      setIsCreatingDashboard(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent className="!w-screen !h-screen !max-w-none overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-[104]">
          <SheetHeader className="mb-0 border-b px-6 pb-4 pt-6">
            <SheetTitle>
              {existingProject?.P_NAME || `Project #${id}`}
            </SheetTitle>
            <SheetDescription>Process &amp; Dashboard Management</SheetDescription>
          </SheetHeader>

          <div className="px-6 py-6">
            {/* ── Action Buttons ──────────────────────────────────────────── */}
            <div className="mb-8 flex flex-wrap gap-3">
              <div className="relative group">
                <Button
                  onClick={handleProcess}
                  disabled={processMutation.isPending || processAlreadyCreated}
                  variant={processAlreadyCreated ? "outline" : "default"}
                  className={processAlreadyCreated ? "opacity-70 cursor-not-allowed" : ""}
                >
                  {processAlreadyCreated ? (
                    <><CheckCircle size={15} className="mr-2 text-green-500" />Process Created</>
                  ) : (
                    <><Cog size={15} className={processMutation.isPending ? "animate-spin mr-2" : "mr-2"} />
                      {processMutation.isPending ? "Processing..." : "Create Process"}</>
                  )}
                </Button>
                {processAlreadyCreated && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap
                    bg-gray-800 text-white text-xs rounded px-2 py-1
                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Process lines already created for this project
                  </div>
                )}
              </div>

              <div className="relative group">
                <Button
                  onClick={() => {
                    if (dashboardAlreadyCreated) { toast.warning("Dashboard already exists."); return; }
                    setShowDashboardModal(true);
                  }}
                  disabled={dashboardAlreadyCreated}
                  variant={dashboardAlreadyCreated ? "outline" : "default"}
                  className={dashboardAlreadyCreated ? "opacity-70 cursor-not-allowed" : ""}
                >
                  {dashboardAlreadyCreated ? (
                    <><CheckCircle size={15} className="mr-2 text-green-500" />Dashboard Created</>
                  ) : "Create Dashboard"}
                </Button>
                {dashboardAlreadyCreated && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap
                    bg-gray-800 text-white text-xs rounded px-2 py-1
                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Dashboard already created for this project
                  </div>
                )}
              </div>

              <Button variant="outline" onClick={handleGoToReport} disabled={!id}>
                <FileBarChart size={15} className="mr-2" />
                Project Report
              </Button>
            </div>

            {/* ── Construction Process Table ──────────────────────────────── */}
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Construction process lines</h3>
              {editableLines.length > 0 && (
                <span className="text-xs text-gray-500">{editableLines.length} lines</span>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[1060px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600">
                    <th className="w-[90px] px-4 py-3 text-center">Sort</th>
                    <th className="w-[18%] px-4 py-3">Contract type</th>
                    <th className="w-[26%] px-4 py-3">Contractor</th>
                    <th className="w-[26%] px-4 py-3">Dependent</th>
                    <th className="w-[130px] px-4 py-3 text-right">Budget Cost</th>
                    <th className="w-[140px] px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {editableLines.length > 0 ? (
                    editableLines.map((line, index) => (
                      <tr key={line.ID || index} className="align-top transition-colors hover:bg-gray-50/60">
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={line.SORT_ID || ""}
                            onChange={(e) => handleLineChange(index, "SORT_ID", e.target.value)}
                            className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-center text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                          />
                        </td>
                        <td className="px-4 py-3 pt-[18px] font-medium text-gray-800">
                          {contractorTypes.find((c) => c.ID === line.SUB_CONTRACT_ID)?.NAME || (
                            <span className="font-normal text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <MultiSelect
                            options={contractorOptions}
                            value={line.CONTRACTOR_IDS || []}
                            onChange={(vals) => handleMultiChange(index, "CONTRACTOR_IDS", vals)}
                            placeholder="Select contractors"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <MultiSelect
                            options={dependentOptions}
                            value={line.DEPENDENT_IDS || []}
                            onChange={(vals) => handleMultiChange(index, "DEPENDENT_IDS", vals)}
                            placeholder="Select dependents"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={line.COST || ""}
                            onChange={(e) => handleLineChange(index, "COST", e.target.value)}
                            className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-right text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                          />
                        </td>
                        <td className="px-4 py-3 pt-[14px]">
                          <StatusSelect
                            value={line.STATUS || "PENDING"}
                            onChange={(v) => handleStatusChange(line, v)}
                            disabled={statusMutation.isPending}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                        No process lines found. Click <strong className="text-gray-600">Create Process</strong> above to generate them.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {editableLines.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => updateProcessMutation.mutate(editableLines)}
                  disabled={updateProcessMutation.isPending}
                >
                  {updateProcessMutation.isPending ? "Updating..." : "Update Process"}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <DashboardDialog
        open={showDashboardModal}
        onClose={() => setShowDashboardModal(false)}
        onConfirm={handleCreateDashboard}
        isCreating={isCreatingDashboard}
      />
    </>
  );
}