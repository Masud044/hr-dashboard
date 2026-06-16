// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Save } from "lucide-react";
// import { toast } from "react-toastify";

// import { SectionContainer } from "@/components/SectionContainer";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
// import { ProjectTable } from "../components/ProjectTable";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import axios from "axios";

// const projectSchema = z.object({
//   P_NAME:                 z.string().min(1, "Project name is required"),
//   P_TYPE:                 z.string().min(1, "Project type is required"),
//   P_ADDRESS:              z.string().min(1, "Address is required"),
//   SUBWRB:                 z.string().min(1, "Suburb is required"),
//   POSTCODE:               z.string().min(1, "Postcode is required"),
//   STATE:                  z.string().min(1, "State is required"),
//   USER_ID:                z.coerce.number().default(105),
//   USER_BY:                z.coerce.number().default(105),
//   UPDATED_BY:             z.coerce.number().default(105),
//   // ✅ নতুন fields
//   LOT:                    z.string().optional().nullable(),
//   DP:                     z.string().optional().nullable(),
//   INSURANCE_NO:           z.string().optional().nullable(),
//   P_ENTATIVE_START_DATE: z.string().optional().nullable(),
//   P_TENTATIVE_END_DATE:   z.string().optional().nullable(),
//   P_CODE:                 z.string().optional().nullable(),
//   DESCRIPTION:            z.string().optional().nullable(),
// });

// const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// const Project = () => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   const form = useForm({
//     resolver: zodResolver(projectSchema),
//     defaultValues: {
//       P_NAME:                 "",
//       P_TYPE:                 "",
//       P_ADDRESS:              "",
//       SUBWRB:                 "",
//       POSTCODE:               "",
//       STATE:                  "",
//       USER_ID:                105,
//       USER_BY:                105,
//       UPDATED_BY:             105,
//       LOT:                    "",
//       DP:                     "",
//       INSURANCE_NO:           "",
//       P_ENTATIVE_START_DATE: "",
//       P_TENTATIVE_END_DATE:   "",
//       P_CODE:                 "",
//       DESCRIPTION:            "",
//     },
//   });

//   useEffect(() => {
//     window.scrollTo({ top: 80, behavior: "smooth" });
//   }, []);

//   // Fetch Project Types
//   const { data: projectTypes = [] } = useQuery({
//     queryKey: ["projectTypes"],
//     queryFn: async () => {
//       const res = await axios.get(`${url}/api/project-type`);
//       return res.data?.data || [];
//     },
//   });

//   // Save New Project and Redirect to Edit Page
//   const mutation = useMutation({
//     mutationFn: async (formData) => {
//       return await axios.post(`${url}/api/project`, formData);
//     },
//     onSuccess: (res) => {
//       queryClient.invalidateQueries(["projects"]);
//       queryClient.invalidateQueries(["customers"]);
//       const newProjectId = res.data?.P_ID;
//       if (newProjectId) {
//         toast.success("Project added successfully! Redirecting to edit page...");
//         setTimeout(() => navigate(`/dashboard/process/${newProjectId}`), 1000);
//       } else {
//         toast.success("Project added successfully!");
//       }
//     },
//     onError: () => toast.error("❌ Failed to save project data. Please try again."),
//   });

//   const onSubmit = (values) => mutation.mutate(values);

//   return (
//     <SectionContainer>
//       <div className="p-6 bg-white shadow rounded-lg mt-8">
//         <h2 className="font-semibold mb-6 text-sm text-gray-800 border-b pb-2">
//           Add New Project
//         </h2>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">

//             {/* ── Section: Basic Info ── */}
//             <div className="md:col-span-3">
//               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
//                 Basic Information
//               </p>
//             </div>

//             {/* Project Name */}
//             <FormField control={form.control} name="P_NAME" render={({ field }) => (
//               <FormItem className="md:col-span-2">
//                 <FormLabel>Project Name <span className="text-red-500">*</span></FormLabel>
//                 <FormControl><Input {...field} placeholder="Enter project name" /></FormControl>
//                 <FormMessage />
//               </FormItem>
//             )} />

//             {/* P_CODE */}
//             <FormField control={form.control} name="P_CODE" render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Project Code</FormLabel>
//                 <FormControl><Input {...field} placeholder="e.g. PRJ-001" /></FormControl>
//                 <FormMessage />
//               </FormItem>
//             )} />

//             {/* Project Type */}
//             <FormField control={form.control} name="P_TYPE" render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Project Type <span className="text-red-500">*</span></FormLabel>
//                 <FormControl>
//                   <Select value={field.value || ""} onValueChange={field.onChange}>
//                     <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
//                     <SelectContent>
//                       {projectTypes.map(pt => (
//                         <SelectItem key={pt.ID} value={pt.ID.toString()}>{pt.NAME}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )} />

//             {/* Insurance No */}
//             <FormField control={form.control} name="INSURANCE_NO" render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Insurance No</FormLabel>
//                 <FormControl><Input {...field} placeholder="Enter insurance number" /></FormControl>
//                 <FormMessage />
//               </FormItem>
//             )} />

//             {/* Tentative Start Date */}
//             <FormField control={form.control} name="P_ENTATIVE_START_DATE" render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Tentative Start Date</FormLabel>
//                 <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
//                 <FormMessage />
//               </FormItem>
//             )} />

//             {/* Tentative End Date */}
//             <FormField control={form.control} name="P_TENTATIVE_END_DATE" render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Tentative End Date</FormLabel>
//                 <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
//                 <FormMessage />
//               </FormItem>
//             )} />

//             {/* ── Section: Land Details ── */}
//             <div className="md:col-span-3 mt-2">
//               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
//                 Land Details
//               </p>
//             </div>

//             {/* LOT */}
//             <FormField control={form.control} name="LOT" render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Lot</FormLabel>
//                 <FormControl><Input {...field} placeholder="e.g. 5" /></FormControl>
//                 <FormMessage />
//               </FormItem>
//             )} />

//             {/* DP */}
//             <FormField control={form.control} name="DP" render={({ field }) => (
//               <FormItem>
//                 <FormLabel>DP (Deposited Plan)</FormLabel>
//                 <FormControl><Input {...field} placeholder="e.g. 123456" /></FormControl>
//                 <FormMessage />
//               </FormItem>
//             )} />

//             {/* Suburb */}
//             <FormField control={form.control} name="SUBWRB" render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Suburb <span className="text-red-500">*</span></FormLabel>
//                 <FormControl><Input {...field} placeholder="Enter suburb" /></FormControl>
//                 <FormMessage />
//               </FormItem>
//             )} />

//             {/* Postcode */}
//             <FormField control={form.control} name="POSTCODE" render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Postcode <span className="text-red-500">*</span></FormLabel>
//                 <FormControl><Input {...field} placeholder="Enter postcode" /></FormControl>
//                 <FormMessage />
//               </FormItem>
//             )} />

//             {/* State */}
//             <FormField control={form.control} name="STATE" render={({ field }) => (
//               <FormItem>
//                 <FormLabel>State <span className="text-red-500">*</span></FormLabel>
//                 <FormControl><Input {...field} placeholder="e.g. NSW" /></FormControl>
//                 <FormMessage />
//               </FormItem>
//             )} />

//             {/* Address */}
//             <FormField control={form.control} name="P_ADDRESS" render={({ field }) => (
//               <FormItem className="md:col-span-2">
//                 <FormLabel>Project Address <span className="text-red-500">*</span></FormLabel>
//                 <FormControl><Textarea rows={3} {...field} placeholder="Enter full address" /></FormControl>
//                 <FormMessage />
//               </FormItem>
//             )} />

//             {/* Description */}
//             <FormField control={form.control} name="DESCRIPTION" render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Description</FormLabel>
//                 <FormControl><Textarea rows={3} {...field} placeholder="Enter project description" /></FormControl>
//                 <FormMessage />
//               </FormItem>
//             )} />

//             {/* Buttons */}
//             <div className="col-span-3 flex justify-end gap-2 mt-4">
//               <Button type="submit" disabled={mutation.isPending}>
//                 <Save size={16} className="mr-2" />
//                 {mutation.isPending ? "Saving..." : "Submit Project"}
//               </Button>
//               <Button type="button" onClick={() => navigate("/dashboard/dashboard-schedule")} variant="outline">
//                 Go to Dashboard
//               </Button>
//             </div>
//           </form>
//         </Form>

//         {/* Project Table */}
//         <ProjectTable />
//       </div>
//     </SectionContainer>
//   );
// };

// export default Project;



import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Upload, X, FileText, CheckCircle2, Clock } from "lucide-react";
import { toast } from "react-toastify";

import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { ProjectTable } from "../components/ProjectTable";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { ContractorMultiSelect } from "./ContractorMultiSelect";

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
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const Project = () => {
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();

  // ── local state ────────────────────────────────────────────────────────
  const [selectedContractorTypes, setSelectedContractorTypes] = useState([]);
  const [mandatoryFiles, setMandatoryFiles]                   = useState([]);
  const [dragOver, setDragOver]                               = useState(false);

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

  useEffect(() => { window.scrollTo({ top: 80, behavior: "smooth" }); }, []);

  // ── queries ────────────────────────────────────────────────────────────
  const { data: projectTypes = [] } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => (await axios.get(`${url}/api/project-type`)).data?.data || [],
  });

  const { data: contractorTypes = [] } = useQuery({
    queryKey: ["contractorTypes"],
    queryFn: async () => (await axios.get(`${url}/api/contractor-type`)).data?.data || [],
  });

  // ── file handlers ──────────────────────────────────────────────────────
  const addFiles = (fileList) => {
    const valid = Array.from(fileList).filter((f) => {
      if (!ALLOWED_MIME.includes(f.type)) {
        toast.error(`"${f.name}" — unsupported file type.`);
        return false;
      }
      if (f.size > 20 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds 20 MB limit.`);
        return false;
      }
      return true;
    });
    setMandatoryFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...valid.filter((f) => !existing.has(f.name + f.size))];
    });
  };

  const removeFile = (idx) =>
    setMandatoryFiles((prev) => prev.filter((_, i) => i !== idx));

  

  // ── mutation ───────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const fd = new FormData();
      // basic fields
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") fd.append(k, v);
      });
      // contractor types as JSON array
      fd.append("CONTRACTOR_TYPE_IDS", JSON.stringify(selectedContractorTypes));
      // files
      mandatoryFiles.forEach((f) => fd.append("MANDATORY_FILES", f));
      return axios.post(`${url}/api/project`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["projects"]);
      queryClient.invalidateQueries(["customers"]);
      const newProjectId = res.data?.P_ID;
      if (newProjectId) {
        toast.success("Project created! Redirecting...");
        setTimeout(() => navigate(`/dashboard/process/${newProjectId}`), 1000);
      } else {
        toast.success("Project created!");
      }
    },
    onError: () => toast.error("Failed to save project. Please try again."),
  });

  const onSubmit = (values) => mutation.mutate(values);

  // ── helpers ────────────────────────────────────────────────────────────
  const fileIcon = (mime) => {
    if (mime.startsWith("image/")) return "🖼️";
    if (mime === "application/pdf") return "📄";
    return "📎";
  };

  const formatBytes = (b) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <SectionContainer>
      <div className="p-6 bg-white shadow rounded-lg mt-8">
        <h2 className="font-semibold mb-6 text-sm text-gray-800 border-b pb-2">
          Add New Project
        </h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* ══ Section: Basic Information ══════════════════════════════ */}
            <SectionLabel label="Basic Information" />

            {/* Project Name */}
            <FormField control={form.control} name="P_NAME" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Project Name <Req /></FormLabel>
                <FormControl><Input {...field} placeholder="Enter project name" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Project Code */}
            <FormField control={form.control} name="P_CODE" render={({ field }) => (
              <FormItem>
                <FormLabel>Project Code</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. PRJ-001" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Project Type */}
            <FormField control={form.control} name="P_TYPE" render={({ field }) => (
              <FormItem>
                <FormLabel>Project Type <Req /></FormLabel>
                <FormControl>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((pt) => (
                        <SelectItem key={pt.ID} value={pt.ID.toString()}>{pt.NAME}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Insurance No */}
            <FormField control={form.control} name="INSURANCE_NO" render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance No</FormLabel>
                <FormControl><Input {...field} placeholder="Enter insurance number" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Tentative Start */}
            <FormField control={form.control} name="P_ENTATIVE_START_DATE" render={({ field }) => (
              <FormItem>
                <FormLabel>Tentative Start Date</FormLabel>
                <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Tentative End */}
            <FormField control={form.control} name="P_TENTATIVE_END_DATE" render={({ field }) => (
              <FormItem>
                <FormLabel>Tentative End Date</FormLabel>
                <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* ══ Section: Land Details ════════════════════════════════════ */}
            <SectionLabel label="Land Details" />

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
                <FormControl><Input {...field} placeholder="Enter suburb" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="POSTCODE" render={({ field }) => (
              <FormItem>
                <FormLabel>Postcode <Req /></FormLabel>
                <FormControl><Input {...field} placeholder="Enter postcode" /></FormControl>
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
              <FormItem className="md:col-span-2">
                <FormLabel>Project Address <Req /></FormLabel>
                <FormControl><Textarea rows={3} {...field} placeholder="Enter full address" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="DESCRIPTION" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea rows={3} {...field} placeholder="Enter project description" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* ══ Section: Mandatory File Upload ══════════════════════════ */}
            <SectionLabel label="Mandatory Documents" />

            <div className="md:col-span-3">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                  ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}`}
                onClick={() => document.getElementById("mandatory-file-input").click()}
              >
                <Upload className="mx-auto mb-2 text-gray-400" size={28} />
                <p className="text-sm text-gray-600 font-medium">
                  Drop files here or <span className="text-blue-600 underline">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, DOC, DOCX — max 20 MB each</p>
                <input
                  id="mandatory-file-input"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>

              {/* File list */}
              {mandatoryFiles.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {mandatoryFiles.map((file, idx) => (
                    <li key={idx}
                      className="flex items-center justify-between bg-gray-50 border rounded-md px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base leading-none">{fileIcon(file.type)}</span>
                        <span className="truncate font-medium text-gray-700">{file.name}</span>
                        <span className="text-gray-400 shrink-0">{formatBytes(file.size)}</span>
                      </div>
                      <button type="button" onClick={() => removeFile(idx)}
                        className="ml-3 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ══ Section: Contractor Types ════════════════════════════════ */}
            <SectionLabel label="Contractor Types" />

            {/* <div className="md:col-span-3">
              {contractorTypes.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Loading contractor types...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {contractorTypes.map((ct) => {
                    const selected = selectedContractorTypes.includes(ct.ID);
                    return (
                      <button
                        key={ct.ID}
                        type="button"
                        onClick={() => toggleContractorType(ct.ID)}
                        className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all
                          ${selected
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                          }`}
                      >
                        {selected && <CheckCircle2 size={13} className="inline mr-1 -mt-0.5" />}
                        {ct.NAME}
                      </button>
                    );
                  })}
                </div>
              )}
            </div> */}

            <ContractorMultiSelect
  contractors={contractorTypes.map((ct) => ({
    id: ct.ID,
    title: ct.NAME,
  }))}
  value={selectedContractorTypes}
  onChange={setSelectedContractorTypes}
/>

            {/* ══ Section: Certificate Status ══════════════════════════════ */}
            {selectedContractorTypes.length > 0 && (
              <>
                <SectionLabel label="Certificate Status" />
                <div className="md:col-span-3">
                  <p className="text-xs text-gray-500 mb-3">
                    The following certificates will be created as <strong>PENDING</strong> upon project creation.
                    You can upload them later from the project edit page.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedContractorTypes.map((ctId) => {
                      const ct = contractorTypes.find((c) => c.ID === ctId);
                      return (
                        <div key={ctId}
                          className="flex items-center gap-2 border border-amber-200 bg-amber-50 rounded-md px-3 py-2">
                          <Clock size={14} className="text-amber-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{ct?.NAME}</p>
                            <p className="text-xs text-amber-600 font-medium">PENDING</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ══ Submit ════════════════════════════════════════════════════ */}
            <div className="col-span-3 flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/dashboard-schedule")}
              >
                Go to Dashboard
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                <Save size={16} className="mr-2" />
                {mutation.isPending ? "Saving..." : "Submit Project"}
              </Button>
            </div>
          </form>
        </Form>

        {/* Project Table */}
        <ProjectTable />
      </div>
    </SectionContainer>
  );
};

// ── tiny shared helpers ────────────────────────────────────────────────────
const Req = () => <span className="text-red-500">*</span>;

const SectionLabel = ({ label }) => (
  <div className="md:col-span-3 mt-2">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
      <span className="flex-1 h-px bg-gray-200" />
      {label}
      <span className="flex-1 h-px bg-gray-200" />
    </p>
  </div>
);

export default Project;