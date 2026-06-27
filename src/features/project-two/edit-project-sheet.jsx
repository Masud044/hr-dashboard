// import React, { useEffect, useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   Save, Upload, X, CheckCircle2, Clock, ExternalLink,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import axios from "axios";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
// } from "@/components/ui/select";
// import {
//   Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
// } from "@/components/ui/form";
// import {
//   Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
// } from "@/components/ui/sheet";
// import { ContractorMultiSelect } from "../setting/pages/ContractorMultiSelect";

// const projectSchema = z.object({
//   P_NAME:                z.string().min(1, "Project name is required"),
//   P_TYPE:                z.string().min(1, "Project type is required"),
//   P_ADDRESS:             z.string().min(1, "Address is required"),
//   SUBWRB:                z.string().min(1, "Suburb is required"),
//   POSTCODE:              z.string().min(1, "Postcode is required"),
//   STATE:                 z.string().min(1, "State is required"),
//   USER_ID:               z.coerce.number().default(105),
//   USER_BY:               z.coerce.number().default(105),
//   UPDATED_BY:            z.coerce.number().default(105),
//   LOT:                   z.string().optional().nullable(),
//   DP:                    z.string().optional().nullable(),
//   INSURANCE_NO:          z.string().optional().nullable(),
//   P_ENTATIVE_START_DATE: z.string().optional().nullable(),
//   P_TENTATIVE_END_DATE:  z.string().optional().nullable(),
//   P_CODE:                z.string().optional().nullable(),
//   DESCRIPTION:           z.string().optional().nullable(),
// });

// const ALLOWED_MIME = [
//   "application/pdf", "image/jpeg", "image/png",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
// ];

// const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// export function EditProjectSheet({ isOpen, onClose, projectId }) {
//   const queryClient = useQueryClient();

//   const [selectedContractorTypes, setSelectedContractorTypes] = useState([]);
//   const [newMandatoryFiles,       setNewMandatoryFiles]       = useState([]);
//   const [dragOver,                setDragOver]                = useState(false);

//   const form = useForm({
//     resolver: zodResolver(projectSchema),
//     defaultValues: {
//       P_NAME: "", P_TYPE: "", P_ADDRESS: "", SUBWRB: "", POSTCODE: "",
//       STATE: "", USER_ID: 105, USER_BY: 105, UPDATED_BY: 105,
//       LOT: "", DP: "", INSURANCE_NO: "",
//       P_ENTATIVE_START_DATE: "", P_TENTATIVE_END_DATE: "",
//       P_CODE: "", DESCRIPTION: "",
//     },
//   });

//   // ── queries ──────────────────────────────────────────────────────────────
//   const { data: projectTypes = [] } = useQuery({
//     queryKey: ["projectTypes"],
//     queryFn: async () => (await axios.get(`${url}/api/project-type`)).data?.data || [],
//   });

//   const { data: contractorTypes = [] } = useQuery({
//     queryKey: ["contractorTypes"],
//     queryFn: async () => (await axios.get(`${url}/api/contractor-type`)).data?.data || [],
//   });

//   const { data: existingProject, isLoading } = useQuery({
//     queryKey: ["project", projectId],
//     queryFn: async () => {
//       const res = await axios.get(`${url}/api/project?p_id=${projectId}`);
//       const d   = res.data?.data;
//       return Array.isArray(d)
//         ? d.find((p) => Number(p.P_ID) === Number(projectId))
//         : d;
//     },
//     enabled: !!projectId && isOpen,
//   });

//   // ── docs split ───────────────────────────────────────────────────────────
//   const existingMandatoryDocs = (existingProject?.DOCS || []).filter(
//     (d) => !d.CONTRACTOR_TYPE_ID && d.UPLOAD_STATUS === "UPLOADED"
//   );
//   const certDocs = (existingProject?.DOCS || []).filter(
//     (d) => d.DOC_FILE_LABEL === "CERTIFICATE" || !!d.CONTRACTOR_TYPE_ID
//   );

//   // ── populate form ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (existingProject && projectTypes.length > 0) {
//       form.reset({
//         P_NAME:                existingProject.P_NAME || "",
//         P_TYPE:                existingProject.P_TYPE?.toString() || "",
//         P_ADDRESS:             existingProject.P_ADDRESS || "",
//         SUBWRB:                existingProject.SUBWRB || "",
//         POSTCODE:              existingProject.POSTCODE || "",
//         STATE:                 existingProject.STATE || "",
//         USER_ID:               existingProject.USER_ID || 105,
//         USER_BY:               existingProject.USER_BY || 105,
//         UPDATED_BY:            existingProject.UPDATED_BY || 105,
//         LOT:                   existingProject.LOT || "",
//         DP:                    existingProject.DP || "",
//         INSURANCE_NO:          existingProject.INSURANCE_NO || "",
//         P_ENTATIVE_START_DATE: existingProject.P_ENTATIVE_START_DATE || "",
//         P_TENTATIVE_END_DATE:  existingProject.P_TENTATIVE_END_DATE || "",
//         P_CODE:                existingProject.P_CODE || "",
//         DESCRIPTION:           existingProject.DESCRIPTION || "",
//       });
//       const savedCtIds = (existingProject.CONTRACTOR_TYPES || []).map(
//         (c) => c.CONTRACTOR_TYPE_ID
//       );
//       setSelectedContractorTypes(savedCtIds);
//       setNewMandatoryFiles([]);
//     }
//   }, [existingProject, projectTypes]);

//   // ── file helpers ──────────────────────────────────────────────────────────
//   const addFiles = (fileList) => {
//     const valid = Array.from(fileList).filter((f) => {
//       if (!ALLOWED_MIME.includes(f.type)) { toast.error(`"${f.name}" — unsupported type.`); return false; }
//       if (f.size > 20 * 1024 * 1024)      { toast.error(`"${f.name}" exceeds 20 MB.`);      return false; }
//       return true;
//     });
//     setNewMandatoryFiles((prev) => {
//       const existing = new Set(prev.map((f) => f.name + f.size));
//       return [...prev, ...valid.filter((f) => !existing.has(f.name + f.size))];
//     });
//   };
//   const removeNewFile = (idx) =>
//     setNewMandatoryFiles((prev) => prev.filter((_, i) => i !== idx));

//   const fileIcon = (mime) => mime?.startsWith("image/") ? "🖼️" : mime === "application/pdf" ? "📄" : "📎";
//   const fmtBytes = (b) => !b ? "" : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

//   // ── certificate upload ────────────────────────────────────────────────────
//   const certUploadMutation = useMutation({
//     mutationFn: async ({ docId, file }) => {
//       const fd = new FormData();
//       fd.append("CERTIFICATE_FILE", file);
//       fd.append("UPDATED_BY", 105);
//       return axios.put(`${url}/api/project/doc/${docId}/upload`, fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["project", projectId]);
//       toast.success("Certificate uploaded!");
//     },
//     onError: (err) => toast.error(err.response?.data?.message || "Upload failed."),
//   });

//   const handleCertFileSelect = (docId, fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     if (!ALLOWED_MIME.includes(file.type)) { toast.error(`"${file.name}" — unsupported type.`); return; }
//     if (file.size > 20 * 1024 * 1024)      { toast.error(`"${file.name}" exceeds 20 MB.`);      return; }
//     certUploadMutation.mutate({ docId, file });
//   };

//   // ── update project ────────────────────────────────────────────────────────
//   const updateMutation = useMutation({
//     mutationFn: async (formData) => {
//       const fd = new FormData();
//       Object.entries(formData).forEach(([k, v]) => {
//         if (v !== null && v !== undefined && v !== "") fd.append(k, v);
//       });
//       fd.append("P_ID", projectId);
//       fd.append("CONTRACTOR_TYPE_IDS", JSON.stringify(selectedContractorTypes));
//       newMandatoryFiles.forEach((f) => fd.append("MANDATORY_FILES", f));
//       return axios.put(`${url}/api/project`, fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["projects"]);
//       queryClient.invalidateQueries(["project", projectId]);
//       setNewMandatoryFiles([]);
//       toast.success("Project updated successfully!");
//       onClose();
//     },
//     onError: () => toast.error("Failed to update project."),
//   });

//   const onSubmit = (values) => updateMutation.mutate(values);

//   return (
//     <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
//        <SheetContent className="!w-screen !h-screen !max-w-none overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-[104]">
//         <SheetHeader className="mb-6">
//           <SheetTitle>Edit Project</SheetTitle>
//           <SheetDescription>Update the project details below.</SheetDescription>
//         </SheetHeader>

//         {isLoading ? (
//           <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
//             Loading project...
//           </div>
//         ) : (
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

//               {/* ══ Basic Information ══════════════════════════════════════ */}
//               <SectionLabel label="Basic Information" />
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <FormField control={form.control} name="P_NAME" render={({ field }) => (
//                   <FormItem className="sm:col-span-2">
//                     <FormLabel>Project Name <Req /></FormLabel>
//                     <FormControl><Input {...field} /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )} />

//                 <FormField control={form.control} name="P_CODE" render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Project Code</FormLabel>
//                     <FormControl><Input {...field} placeholder="e.g. PRJ-001" /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )} />

//                 <FormField control={form.control} name="P_TYPE" render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Project Type <Req /></FormLabel>
//                     <Select key={field.value} value={field.value} onValueChange={field.onChange}>
//                       <FormControl>
//                         <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {projectTypes.map((pt) => (
//                           <SelectItem key={pt.ID} value={pt.ID.toString()}>{pt.NAME}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )} />

//                 <FormField control={form.control} name="INSURANCE_NO" render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Insurance No</FormLabel>
//                     <FormControl><Input {...field} placeholder="Enter insurance number" /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )} />

//                 <FormField control={form.control} name="P_ENTATIVE_START_DATE" render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Tentative Start Date</FormLabel>
//                     <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )} />

//                 <FormField control={form.control} name="P_TENTATIVE_END_DATE" render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Tentative End Date</FormLabel>
//                     <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )} />
//               </div>

//               {/* ══ Land Details ═══════════════════════════════════════════ */}
//               <SectionLabel label="Land Details" />
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <FormField control={form.control} name="LOT" render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Lot</FormLabel>
//                     <FormControl><Input {...field} placeholder="e.g. 5" /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )} />

//                 <FormField control={form.control} name="DP" render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>DP (Deposited Plan)</FormLabel>
//                     <FormControl><Input {...field} placeholder="e.g. 123456" /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )} />

//                 <FormField control={form.control} name="SUBWRB" render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Suburb <Req /></FormLabel>
//                     <FormControl><Input {...field} /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )} />

//                 <FormField control={form.control} name="POSTCODE" render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Postcode <Req /></FormLabel>
//                     <FormControl><Input {...field} /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )} />

//                 <FormField control={form.control} name="STATE" render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>State <Req /></FormLabel>
//                     <FormControl><Input {...field} placeholder="e.g. NSW" /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )} />

//                 <FormField control={form.control} name="P_ADDRESS" render={({ field }) => (
//                   <FormItem className="sm:col-span-2">
//                     <FormLabel>Project Address <Req /></FormLabel>
//                     <FormControl><Textarea rows={3} {...field} /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )} />

//                 <FormField control={form.control} name="DESCRIPTION" render={({ field }) => (
//                   <FormItem className="sm:col-span-2">
//                     <FormLabel>Description</FormLabel>
//                     <FormControl><Textarea rows={2} {...field} placeholder="Enter description" /></FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )} />
//               </div>

//               {/* ══ Mandatory Documents ════════════════════════════════════ */}
//               <SectionLabel label="Mandatory Documents" />

//               {/* Previously uploaded */}
//               {existingMandatoryDocs.length > 0 && (
//                 <div>
//                   <p className="text-xs text-gray-500 mb-2 font-medium">Previously uploaded</p>
//                   <ul className="space-y-2">
//                     {existingMandatoryDocs.map((doc) => (
//                       <li key={doc.ID}
//                         className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2 text-sm">
//                         <div className="flex items-center gap-2 min-w-0">
//                           <CheckCircle2 size={13} className="text-green-500 shrink-0" />
//                           <span className="truncate font-medium text-gray-700">{doc.FILE_NAME}</span>
//                           {doc.FILE_SIZE && (
//                             <span className="text-gray-400 text-xs shrink-0">{fmtBytes(doc.FILE_SIZE)}</span>
//                           )}
//                         </div>
//                         <a href={`${url}/api/project/doc/${doc.ID}`} target="_blank" rel="noreferrer"
//                           className="ml-3 text-blue-500 hover:text-blue-700 shrink-0">
//                           <ExternalLink size={13} />
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {/* New file drop zone */}
//               <div
//                 onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
//                 onDragLeave={() => setDragOver(false)}
//                 onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
//                 className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer
//                   ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}`}
//                 onClick={() => document.getElementById("edit-sheet-mandatory-input").click()}
//               >
//                 <Upload className="mx-auto mb-2 text-gray-400" size={22} />
//                 <p className="text-sm text-gray-600 font-medium">
//                   Add more files — <span className="text-blue-600 underline">browse</span>
//                 </p>
//                 <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, DOC, DOCX — max 20 MB each</p>
//                 <input
//                   id="edit-sheet-mandatory-input"
//                   type="file" multiple
//                   accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
//                   className="hidden"
//                   onChange={(e) => addFiles(e.target.files)}
//                 />
//               </div>

//               {newMandatoryFiles.length > 0 && (
//                 <ul className="space-y-2">
//                   {newMandatoryFiles.map((file, idx) => (
//                     <li key={idx}
//                       className="flex items-center justify-between bg-gray-50 border rounded-md px-3 py-2 text-sm">
//                       <div className="flex items-center gap-2 min-w-0">
//                         <span className="text-base">{fileIcon(file.type)}</span>
//                         <span className="truncate font-medium text-gray-700">{file.name}</span>
//                         <span className="text-gray-400 text-xs shrink-0">{fmtBytes(file.size)}</span>
//                       </div>
//                       <button type="button" onClick={() => removeNewFile(idx)}
//                         className="ml-3 text-gray-400 hover:text-red-500 transition-colors shrink-0">
//                         <X size={15} />
//                       </button>
//                     </li>
//                   ))}
//                 </ul>
//               )}

//               {/* ══ Contractor Types ═══════════════════════════════════════ */}
//               <SectionLabel label="Contractor Types" />
//               <ContractorMultiSelect
//                 contractors={contractorTypes.map((ct) => ({ id: ct.ID, title: ct.NAME }))}
//                 value={selectedContractorTypes}
//                 onChange={setSelectedContractorTypes}
//               />

//               {/* ══ Certificate Status ═════════════════════════════════════ */}
//               {(certDocs.length > 0 || selectedContractorTypes.length > 0) && (
//                 <>
//                   <SectionLabel label="Certificate Status" />
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

//                     {/* Saved cert rows */}
//                     {certDocs.map((doc) => {
//                       const ct          = contractorTypes.find((c) => c.ID === doc.CONTRACTOR_TYPE_ID);
//                       const uploaded    = doc.UPLOAD_STATUS === "UPLOADED";
//                       const inputId     = `edit-cert-${doc.ID}`;
//                       const isUploading =
//                         certUploadMutation.isPending &&
//                         certUploadMutation.variables?.docId === doc.ID;
//                       return (
//                         <div key={doc.ID}
//                           className={`flex items-center gap-2 border rounded-md px-3 py-2
//                             ${uploaded ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}
//                         >
//                           {uploaded
//                             ? <CheckCircle2 size={13} className="text-green-500 shrink-0" />
//                             : <Clock size={13} className="text-amber-500 shrink-0" />
//                           }
//                           <div className="min-w-0 flex-1">
//                             <p className="text-sm font-medium text-gray-700 truncate">
//                               {ct?.NAME || `Type ${doc.CONTRACTOR_TYPE_ID}`}
//                             </p>
//                             <p className={`text-xs font-semibold ${uploaded ? "text-green-600" : "text-amber-600"}`}>
//                               {doc.UPLOAD_STATUS}
//                             </p>
//                           </div>
//                           {uploaded && doc.FILE_NAME && (
//                             <a href={`${url}/api/project/doc/${doc.ID}`} target="_blank" rel="noreferrer"
//                               className="text-blue-500 hover:text-blue-700 shrink-0" title={doc.FILE_NAME}>
//                               <ExternalLink size={13} />
//                             </a>
//                           )}
//                           {!uploaded && (
//                             <>
//                               <input id={inputId} type="file"
//                                 accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
//                                 className="hidden"
//                                 onChange={(e) => handleCertFileSelect(doc.ID, e.target.files)}
//                               />
//                               <button type="button" disabled={isUploading}
//                                 onClick={() => document.getElementById(inputId).click()}
//                                 className="ml-1 shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800
//                                   border border-blue-200 bg-white rounded px-2 py-1 disabled:opacity-50">
//                                 {isUploading ? "Uploading..." : "Upload"}
//                               </button>
//                             </>
//                           )}
//                         </div>
//                       );
//                     })}

//                     {/* Newly selected types not yet in DB */}
//                     {selectedContractorTypes
//                       .filter((ctId) => !certDocs.some((d) => d.CONTRACTOR_TYPE_ID === ctId))
//                       .map((ctId) => {
//                         const ct = contractorTypes.find((c) => c.ID === ctId);
//                         return (
//                           <div key={`new-${ctId}`}
//                             className="flex items-center gap-2 border border-dashed border-amber-300 bg-amber-50 rounded-md px-3 py-2">
//                             <Clock size={13} className="text-amber-400 shrink-0" />
//                             <div className="min-w-0 flex-1">
//                               <p className="text-sm font-medium text-gray-700 truncate">{ct?.NAME}</p>
//                               <p className="text-xs text-amber-500 font-medium">Will be created — PENDING</p>
//                             </div>
//                           </div>
//                         );
//                       })}
//                   </div>
//                 </>
//               )}

//               {/* ══ Submit ═════════════════════════════════════════════════ */}
//               <div className="flex justify-end gap-2 pt-4 border-t">
//                 <Button type="button" variant="outline" onClick={onClose}>
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={updateMutation.isPending}>
//                   <Save size={15} className="mr-2" />
//                   {updateMutation.isPending ? "Updating..." : "Update Project"}
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         )}
//       </SheetContent>
//     </Sheet>
//   );
// }

// const Req = () => <span className="text-red-500">*</span>;

// const SectionLabel = ({ label }) => (
//   <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
//     <span className="flex-1 h-px bg-gray-200" />
//     {label}
//     <span className="flex-1 h-px bg-gray-200" />
//   </p>
// );


import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save, Upload, X, CheckCircle2, Clock, ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { ContractorMultiSelect } from "../setting/pages/ContractorMultiSelect";
import { OwnerRepeater, EMPTY_OWNER } from "./owner-preter";

const projectSchema = z.object({
  P_NAME:                z.string().min(1, "Project name is required"),
  P_TYPE:                z.string().min(1, "Project type is required"),
  P_ADDRESS:             z.string().min(1, "Address is required"),
  SUBWRB:                z.string().min(1, "Suburb is required"),
  POSTCODE:              z.string().min(1, "Postcode is required"),
  STATE:                 z.string().min(1, "State is required"),
  USER_ID:               z.coerce.number().default(105),
  USER_BY:               z.coerce.number().default(105),
  UPDATED_BY:            z.coerce.number().default(105),
  LOT:                   z.string().optional().nullable(),
  DP:                    z.string().optional().nullable(),
  INSURANCE_NO:          z.string().optional().nullable(),
  P_ENTATIVE_START_DATE: z.string().optional().nullable(),
  P_TENTATIVE_END_DATE:  z.string().optional().nullable(),
  P_CODE:                z.string().optional().nullable(),
  DESCRIPTION:           z.string().optional().nullable(),
});

const ALLOWED_MIME = [
  "application/pdf", "image/jpeg", "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Stable reference — using `= []` as a query default creates a NEW array
// every render, which breaks effects that depend on it (infinite loop risk).
const EMPTY_ARRAY = [];

export function EditProjectSheet({ isOpen, onClose, projectId }) {
  const queryClient = useQueryClient();

  const [selectedContractorTypes, setSelectedContractorTypes] = useState([]);
  const [newMandatoryFiles,       setNewMandatoryFiles]       = useState([]);
  const [dragOver,                setDragOver]                = useState(false);
  const [owners,                  setOwners]                  = useState([{ ...EMPTY_OWNER }]);
  const [removedOwnerIds,         setRemovedOwnerIds]         = useState([]);

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      P_NAME: "", P_TYPE: "", P_ADDRESS: "", SUBWRB: "", POSTCODE: "",
      STATE: "", USER_ID: 105, USER_BY: 105, UPDATED_BY: 105,
      LOT: "", DP: "", INSURANCE_NO: "",
      P_ENTATIVE_START_DATE: "", P_TENTATIVE_END_DATE: "",
      P_CODE: "", DESCRIPTION: "",
    },
  });

  // ── queries ──────────────────────────────────────────────────────────────
  const { data: projectTypes = EMPTY_ARRAY } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => (await axios.get(`${url}/api/project-type`)).data?.data || [],
  });

  const { data: contractorTypes = EMPTY_ARRAY } = useQuery({
    queryKey: ["contractorTypes"],
    queryFn: async () => (await axios.get(`${url}/api/contractor-type`)).data?.data || [],
  });

  const { data: existingProject, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project?p_id=${projectId}`);
      const d   = res.data?.data;
      return Array.isArray(d)
        ? d.find((p) => Number(p.P_ID) === Number(projectId))
        : d;
    },
    enabled: !!projectId && isOpen,
  });

  // Owners are stored in their own table — fetch separately
  const { data: existingOwners = EMPTY_ARRAY, isLoading: ownersLoading } = useQuery({
    queryKey: ["owners", projectId],
    queryFn: async () =>
      (await axios.get(`${url}/api/owner-info/by-project/${projectId}`)).data?.data || [],
    enabled: !!projectId && isOpen,
  });

  // ── docs split ───────────────────────────────────────────────────────────
  const existingMandatoryDocs = (existingProject?.DOCS || []).filter(
    (d) => !d.CONTRACTOR_TYPE_ID && d.UPLOAD_STATUS === "UPLOADED"
  );
  const certDocs = (existingProject?.DOCS || []).filter(
    (d) => d.DOC_FILE_LABEL === "CERTIFICATE" || !!d.CONTRACTOR_TYPE_ID
  );

  // ── populate form ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (existingProject && projectTypes.length > 0) {
      form.reset({
        P_NAME:                existingProject.P_NAME || "",
        P_TYPE:                existingProject.P_TYPE?.toString() || "",
        P_ADDRESS:             existingProject.P_ADDRESS || "",
        SUBWRB:                existingProject.SUBWRB || "",
        POSTCODE:              existingProject.POSTCODE || "",
        STATE:                 existingProject.STATE || "",
        USER_ID:               existingProject.USER_ID || 105,
        USER_BY:               existingProject.USER_BY || 105,
        UPDATED_BY:            existingProject.UPDATED_BY || 105,
        LOT:                   existingProject.LOT || "",
        DP:                    existingProject.DP || "",
        INSURANCE_NO:          existingProject.INSURANCE_NO || "",
        P_ENTATIVE_START_DATE: existingProject.P_ENTATIVE_START_DATE || "",
        P_TENTATIVE_END_DATE:  existingProject.P_TENTATIVE_END_DATE || "",
        P_CODE:                existingProject.P_CODE || "",
        DESCRIPTION:           existingProject.DESCRIPTION || "",
      });
      const savedCtIds = (existingProject.CONTRACTOR_TYPES || []).map(
        (c) => c.CONTRACTOR_TYPE_ID
      );
      setSelectedContractorTypes(savedCtIds);
      setNewMandatoryFiles([]);
    }
  }, [existingProject, projectTypes]);

  // ── populate owners ──────────────────────────────────────────────────────
  // Reset deletion-tracking only on the open transition itself — not on
  // every owners refetch — otherwise this combined with the array identity
  // above can cascade into a render loop.
  useEffect(() => {
    if (isOpen) setRemovedOwnerIds([]);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (existingOwners.length > 0) {
      setOwners(
        existingOwners.map((o) => ({
          ID:       o.ID,
          O_NAME:   o.O_NAME   || "",
          ADDRESS:  o.ADDRESS  || "",
          SUBURB:   o.SUBURB   || "",
          POSTCODE: o.POSTCODE || "",
          STATE:    o.STATE    || "",
          EMAIL:    o.EMAIL    || "",
          PHONE:    o.PHONE    || "",
        }))
      );
    } else if (!ownersLoading) {
      setOwners([{ ...EMPTY_OWNER }]);
    }
  }, [existingOwners, ownersLoading, isOpen]);

  // wrap setOwners so we track deletions of rows that exist in DB (have ID)
  const handleOwnersChange = (next) => {
    const nextIds = new Set(next.filter((o) => o.ID).map((o) => o.ID));
    const justRemoved = owners.filter((o) => o.ID && !nextIds.has(o.ID)).map((o) => o.ID);
    if (justRemoved.length > 0) {
      setRemovedOwnerIds((prev) => [...prev, ...justRemoved]);
    }
    setOwners(next);
  };

  // ── file helpers ──────────────────────────────────────────────────────────
  const addFiles = (fileList) => {
    const valid = Array.from(fileList).filter((f) => {
      if (!ALLOWED_MIME.includes(f.type)) { toast.error(`"${f.name}" — unsupported type.`); return false; }
      if (f.size > 20 * 1024 * 1024)      { toast.error(`"${f.name}" exceeds 20 MB.`);      return false; }
      return true;
    });
    setNewMandatoryFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...valid.filter((f) => !existing.has(f.name + f.size))];
    });
  };
  const removeNewFile = (idx) =>
    setNewMandatoryFiles((prev) => prev.filter((_, i) => i !== idx));

  const fileIcon = (mime) => mime?.startsWith("image/") ? "🖼️" : mime === "application/pdf" ? "📄" : "📎";
  const fmtBytes = (b) => !b ? "" : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  // ── certificate upload ────────────────────────────────────────────────────
  const certUploadMutation = useMutation({
    mutationFn: async ({ docId, file }) => {
      const fd = new FormData();
      fd.append("CERTIFICATE_FILE", file);
      fd.append("UPDATED_BY", 105);
      return axios.put(`${url}/api/project/doc/${docId}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["project", projectId]);
      toast.success("Certificate uploaded!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Upload failed."),
  });

  const handleCertFileSelect = (docId, fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!ALLOWED_MIME.includes(file.type)) { toast.error(`"${file.name}" — unsupported type.`); return; }
    if (file.size > 20 * 1024 * 1024)      { toast.error(`"${file.name}" exceeds 20 MB.`);      return; }
    certUploadMutation.mutate({ docId, file });
  };

  // ── sync owners (create / update / delete) ───────────────────────────────
  const syncOwners = async () => {
    const validOwners = owners.filter((o) => o.O_NAME.trim() !== "");

    const creates = validOwners
      .filter((o) => !o.ID)
      .map((o) =>
        axios.post(`${url}/api/owner-info`, {
          oName:     o.O_NAME,
          address:   o.ADDRESS,
          suburb:    o.SUBURB,
          postcode:  o.POSTCODE,
          state:     o.STATE,
          email:     o.EMAIL,
          phone:     o.PHONE,
          projectId: projectId,
          createdBy: 105,
          updatedBy: 105,
        })
      );

    const updates = validOwners
      .filter((o) => o.ID)
      .map((o) =>
        axios.put(`${url}/api/owner-info/${o.ID}`, {
          oName:     o.O_NAME,
          address:   o.ADDRESS,
          suburb:    o.SUBURB,
          postcode:  o.POSTCODE,
          state:     o.STATE,
          email:     o.EMAIL,
          phone:     o.PHONE,
          projectId: projectId,
          updatedBy: 105,
        })
      );

    const deletes = removedOwnerIds.map((id) =>
      axios.delete(`${url}/api/owner-info/${id}`)
    );

    await Promise.all([...creates, ...updates, ...deletes]);
  };

  // ── update project ────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") fd.append(k, v);
      });
      fd.append("P_ID", projectId);
      fd.append("CONTRACTOR_TYPE_IDS", JSON.stringify(selectedContractorTypes));
      newMandatoryFiles.forEach((f) => fd.append("MANDATORY_FILES", f));
      const result = await axios.put(`${url}/api/project`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await syncOwners();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      queryClient.invalidateQueries(["project", projectId]);
      queryClient.invalidateQueries(["owners", projectId]);
      setNewMandatoryFiles([]);
      setRemovedOwnerIds([]);
      toast.success("Project updated successfully!");
      onClose();
    },
    onError: () => toast.error("Failed to update project."),
  });

  const onSubmit = (values) => updateMutation.mutate(values);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
       <SheetContent className="!w-screen !h-screen !max-w-none overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-[104]">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit Project</SheetTitle>
          <SheetDescription>Update the project details below.</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            Loading project...
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* ══ Basic Information ══════════════════════════════════════ */}
              <SectionLabel label="Basic Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="P_NAME" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Project Name <Req /></FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="P_CODE" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Code</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. PRJ-001" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="P_TYPE" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type <Req /></FormLabel>
                    <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectTypes.map((pt) => (
                          <SelectItem key={pt.ID} value={pt.ID.toString()}>{pt.NAME}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="INSURANCE_NO" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance No</FormLabel>
                    <FormControl><Input {...field} placeholder="Enter insurance number" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="P_ENTATIVE_START_DATE" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tentative Start Date</FormLabel>
                    <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="P_TENTATIVE_END_DATE" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tentative End Date</FormLabel>
                    <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* ══ Land Details ═══════════════════════════════════════════ */}
              <SectionLabel label="Land Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="LOT" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lot</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. 5" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="DP" render={({ field }) => (
                  <FormItem>
                    <FormLabel>DP (Deposited Plan)</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. 123456" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="SUBWRB" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suburb <Req /></FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="POSTCODE" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode <Req /></FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="STATE" render={({ field }) => (
                  <FormItem>
                    <FormLabel>State <Req /></FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. NSW" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="P_ADDRESS" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Project Address <Req /></FormLabel>
                    <FormControl><Textarea rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="DESCRIPTION" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea rows={2} {...field} placeholder="Enter description" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* ══ Owners ═════════════════════════════════════════════════ */}
              <SectionLabel label="Owner Information" />
              {ownersLoading ? (
                <p className="text-xs text-muted-foreground">Loading owners...</p>
              ) : (
                <OwnerRepeater owners={owners} onChange={handleOwnersChange} />
              )}

              {/* ══ Mandatory Documents ════════════════════════════════════ */}
              <SectionLabel label="Mandatory Documents" />

              {/* Previously uploaded */}
              {existingMandatoryDocs.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Previously uploaded</p>
                  <ul className="space-y-2">
                    {existingMandatoryDocs.map((doc) => (
                      <li key={doc.ID}
                        className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                          <span className="truncate font-medium text-gray-700">{doc.FILE_NAME}</span>
                          {doc.FILE_SIZE && (
                            <span className="text-gray-400 text-xs shrink-0">{fmtBytes(doc.FILE_SIZE)}</span>
                          )}
                        </div>
                        <a href={`${url}/api/project/doc/${doc.ID}`} target="_blank" rel="noreferrer"
                          className="ml-3 text-blue-500 hover:text-blue-700 shrink-0">
                          <ExternalLink size={13} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* New file drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer
                  ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}`}
                onClick={() => document.getElementById("edit-sheet-mandatory-input").click()}
              >
                <Upload className="mx-auto mb-2 text-gray-400" size={22} />
                <p className="text-sm text-gray-600 font-medium">
                  Add more files — <span className="text-blue-600 underline">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, DOC, DOCX — max 20 MB each</p>
                <input
                  id="edit-sheet-mandatory-input"
                  type="file" multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>

              {newMandatoryFiles.length > 0 && (
                <ul className="space-y-2">
                  {newMandatoryFiles.map((file, idx) => (
                    <li key={idx}
                      className="flex items-center justify-between bg-gray-50 border rounded-md px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{fileIcon(file.type)}</span>
                        <span className="truncate font-medium text-gray-700">{file.name}</span>
                        <span className="text-gray-400 text-xs shrink-0">{fmtBytes(file.size)}</span>
                      </div>
                      <button type="button" onClick={() => removeNewFile(idx)}
                        className="ml-3 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                        <X size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* ══ Contractor Types ═══════════════════════════════════════ */}
              <SectionLabel label="Contractor Types" />
              <ContractorMultiSelect
                contractors={contractorTypes.map((ct) => ({ id: ct.ID, title: ct.NAME }))}
                value={selectedContractorTypes}
                onChange={setSelectedContractorTypes}
              />

              {/* ══ Certificate Status ═════════════════════════════════════ */}
              {(certDocs.length > 0 || selectedContractorTypes.length > 0) && (
                <>
                  <SectionLabel label="Certificate Status" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                    {/* Saved cert rows */}
                    {certDocs.map((doc) => {
                      const ct          = contractorTypes.find((c) => c.ID === doc.CONTRACTOR_TYPE_ID);
                      const uploaded    = doc.UPLOAD_STATUS === "UPLOADED";
                      const inputId     = `edit-cert-${doc.ID}`;
                      const isUploading =
                        certUploadMutation.isPending &&
                        certUploadMutation.variables?.docId === doc.ID;
                      return (
                        <div key={doc.ID}
                          className={`flex items-center gap-2 border rounded-md px-3 py-2
                            ${uploaded ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}
                        >
                          {uploaded
                            ? <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                            : <Clock size={13} className="text-amber-500 shrink-0" />
                          }
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {ct?.NAME || `Type ${doc.CONTRACTOR_TYPE_ID}`}
                            </p>
                            <p className={`text-xs font-semibold ${uploaded ? "text-green-600" : "text-amber-600"}`}>
                              {doc.UPLOAD_STATUS}
                            </p>
                          </div>
                          {uploaded && doc.FILE_NAME && (
                            <a href={`${url}/api/project/doc/${doc.ID}`} target="_blank" rel="noreferrer"
                              className="text-blue-500 hover:text-blue-700 shrink-0" title={doc.FILE_NAME}>
                              <ExternalLink size={13} />
                            </a>
                          )}
                          {!uploaded && (
                            <>
                              <input id={inputId} type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                className="hidden"
                                onChange={(e) => handleCertFileSelect(doc.ID, e.target.files)}
                              />
                              <button type="button" disabled={isUploading}
                                onClick={() => document.getElementById(inputId).click()}
                                className="ml-1 shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800
                                  border border-blue-200 bg-white rounded px-2 py-1 disabled:opacity-50">
                                {isUploading ? "Uploading..." : "Upload"}
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {/* Newly selected types not yet in DB */}
                    {selectedContractorTypes
                      .filter((ctId) => !certDocs.some((d) => d.CONTRACTOR_TYPE_ID === ctId))
                      .map((ctId) => {
                        const ct = contractorTypes.find((c) => c.ID === ctId);
                        return (
                          <div key={`new-${ctId}`}
                            className="flex items-center gap-2 border border-dashed border-amber-300 bg-amber-50 rounded-md px-3 py-2">
                            <Clock size={13} className="text-amber-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-700 truncate">{ct?.NAME}</p>
                              <p className="text-xs text-amber-500 font-medium">Will be created — PENDING</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}

              {/* ══ Submit ═════════════════════════════════════════════════ */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  <Save size={15} className="mr-2" />
                  {updateMutation.isPending ? "Updating..." : "Update Project"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}

const Req = () => <span className="text-red-500">*</span>;

const SectionLabel = ({ label }) => (
  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
    <span className="flex-1 h-px bg-gray-200" />
    {label}
    <span className="flex-1 h-px bg-gray-200" />
  </p>
);