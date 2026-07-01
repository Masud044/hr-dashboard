// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Save, Upload, X, Clock } from "lucide-react";
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
// // import { ContractorMultiSelect } from "./ContractorMultiSelect";

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

// const DEFAULT_VALUES = {
//   P_NAME: "", P_TYPE: "", P_ADDRESS: "", SUBWRB: "", POSTCODE: "",
//   STATE: "", USER_ID: 105, USER_BY: 105, UPDATED_BY: 105,
//   LOT: "", DP: "", INSURANCE_NO: "",
//   P_ENTATIVE_START_DATE: "", P_TENTATIVE_END_DATE: "",
//   P_CODE: "", DESCRIPTION: "",
// };

// export function CreateProjectSheet({ isOpen, onClose }) {
//   const navigate    = useNavigate();
//   const queryClient = useQueryClient();

//   const [selectedContractorTypes, setSelectedContractorTypes] = useState([]);
//   const [mandatoryFiles, setMandatoryFiles]                   = useState([]);
//   const [dragOver, setDragOver]                               = useState(false);

//   const form = useForm({
//     resolver: zodResolver(projectSchema),
//     defaultValues: DEFAULT_VALUES,
//   });

//   // Reset on open
//   useEffect(() => {
//     if (isOpen) {
//       form.reset(DEFAULT_VALUES);
//       setSelectedContractorTypes([]);
//       setMandatoryFiles([]);
//     }
//   }, [isOpen]);

//   const { data: projectTypes = [] } = useQuery({
//     queryKey: ["projectTypes"],
//     queryFn: async () => (await axios.get(`${url}/api/project-type`)).data?.data || [],
//   });

//   const { data: contractorTypes = [] } = useQuery({
//     queryKey: ["contractorTypes"],
//     queryFn: async () => (await axios.get(`${url}/api/contractor-type`)).data?.data || [],
//   });

//   const addFiles = (fileList) => {
//     const valid = Array.from(fileList).filter((f) => {
//       if (!ALLOWED_MIME.includes(f.type)) { toast.error(`"${f.name}" — unsupported type.`); return false; }
//       if (f.size > 20 * 1024 * 1024)      { toast.error(`"${f.name}" exceeds 20 MB.`);      return false; }
//       return true;
//     });
//     setMandatoryFiles((prev) => {
//       const existing = new Set(prev.map((f) => f.name + f.size));
//       return [...prev, ...valid.filter((f) => !existing.has(f.name + f.size))];
//     });
//   };

//   const removeFile = (idx) => setMandatoryFiles((prev) => prev.filter((_, i) => i !== idx));

//   const mutation = useMutation({
//     mutationFn: async (formData) => {
//       const fd = new FormData();
//       Object.entries(formData).forEach(([k, v]) => {
//         if (v !== null && v !== undefined && v !== "") fd.append(k, v);
//       });
//       fd.append("CONTRACTOR_TYPE_IDS", JSON.stringify(selectedContractorTypes));
//       mandatoryFiles.forEach((f) => fd.append("MANDATORY_FILES", f));
//       return axios.post(`${url}/api/project`, fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//     },
//     onSuccess: (res) => {
//       queryClient.invalidateQueries(["projects"]);
//       queryClient.invalidateQueries(["customers"]);
//       const newProjectId = res.data?.P_ID;
//       onClose();
//       if (newProjectId) {
//         toast.success("Project created! Redirecting to process page...");
//         setTimeout(() => navigate(`/dashboard/process/${newProjectId}`), 800);
//       } else {
//         toast.success("Project created!");
//       }
//     },
//     onError: () => toast.error("Failed to save project. Please try again."),
//   });

//   const onSubmit = (values) => mutation.mutate(values);

//   const fileIcon  = (mime) => mime?.startsWith("image/") ? "🖼️" : mime === "application/pdf" ? "📄" : "📎";
//   const fmtBytes  = (b) => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

//   return (
//     <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
//       <SheetContent className="!w-screen !h-screen !max-w-none overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-[104]">
//         <SheetHeader className="mb-6">
//           <SheetTitle>Add New Project</SheetTitle>
//           <SheetDescription>Fill in the details to create a new project.</SheetDescription>
//         </SheetHeader>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

//             {/* ── Basic Information ────────────────────────────────────── */}
//             <SectionLabel label="Basic Information" />
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <FormField control={form.control} name="P_NAME" render={({ field }) => (
//                 <FormItem className="sm:col-span-2">
//                   <FormLabel>Project Name <Req /></FormLabel>
//                   <FormControl><Input {...field} placeholder="Enter project name" /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />

//               <FormField control={form.control} name="P_CODE" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Project Code</FormLabel>
//                   <FormControl><Input {...field} placeholder="e.g. PRJ-001" /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />

//               <FormField control={form.control} name="P_TYPE" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Project Type <Req /></FormLabel>
//                   <FormControl>
//                     <Select value={field.value || ""} onValueChange={field.onChange}>
//                       <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
//                       <SelectContent>
//                         {projectTypes.map((pt) => (
//                           <SelectItem key={pt.ID} value={pt.ID.toString()}>{pt.NAME}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />

//               <FormField control={form.control} name="INSURANCE_NO" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Insurance No</FormLabel>
//                   <FormControl><Input {...field} placeholder="Enter insurance number" /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />

//               <FormField control={form.control} name="P_ENTATIVE_START_DATE" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Tentative Start Date</FormLabel>
//                   <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />

//               <FormField control={form.control} name="P_TENTATIVE_END_DATE" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Tentative End Date</FormLabel>
//                   <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />
//             </div>

//             {/* ── Land Details ─────────────────────────────────────────── */}
//             <SectionLabel label="Land Details" />
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <FormField control={form.control} name="LOT" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Lot</FormLabel>
//                   <FormControl><Input {...field} placeholder="e.g. 5" /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />

//               <FormField control={form.control} name="DP" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>DP (Deposited Plan)</FormLabel>
//                   <FormControl><Input {...field} placeholder="e.g. 123456" /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />

//               <FormField control={form.control} name="SUBWRB" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Suburb <Req /></FormLabel>
//                   <FormControl><Input {...field} placeholder="Enter suburb" /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />

//               <FormField control={form.control} name="POSTCODE" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Postcode <Req /></FormLabel>
//                   <FormControl><Input {...field} placeholder="Enter postcode" /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />

//               <FormField control={form.control} name="STATE" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>State <Req /></FormLabel>
//                   <FormControl><Input {...field} placeholder="e.g. NSW" /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />

//               <FormField control={form.control} name="P_ADDRESS" render={({ field }) => (
//                 <FormItem className="sm:col-span-2">
//                   <FormLabel>Project Address <Req /></FormLabel>
//                   <FormControl><Textarea rows={3} {...field} placeholder="Enter full address" /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />

//               <FormField control={form.control} name="DESCRIPTION" render={({ field }) => (
//                 <FormItem className="sm:col-span-2">
//                   <FormLabel>Description</FormLabel>
//                   <FormControl><Textarea rows={2} {...field} placeholder="Enter project description" /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />
//             </div>

//             {/* ── Mandatory Documents ──────────────────────────────────── */}
//             <SectionLabel label="Mandatory Documents" />
//             <div
//               onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
//               onDragLeave={() => setDragOver(false)}
//               onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
//               className={`relative border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer
//                 ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}`}
//               onClick={() => document.getElementById("create-mandatory-file-input").click()}
//             >
//               <Upload className="mx-auto mb-2 text-gray-400" size={22} />
//               <p className="text-sm text-gray-600 font-medium">
//                 Drop files here or <span className="text-blue-600 underline">browse</span>
//               </p>
//               <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, DOC, DOCX — max 20 MB each</p>
//               <input
//                 id="create-mandatory-file-input"
//                 type="file" multiple
//                 accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
//                 className="hidden"
//                 onChange={(e) => addFiles(e.target.files)}
//               />
//             </div>

//             {mandatoryFiles.length > 0 && (
//               <ul className="space-y-2">
//                 {mandatoryFiles.map((file, idx) => (
//                   <li key={idx}
//                     className="flex items-center justify-between bg-gray-50 border rounded-md px-3 py-2 text-sm">
//                     <div className="flex items-center gap-2 min-w-0">
//                       <span className="text-base">{fileIcon(file.type)}</span>
//                       <span className="truncate font-medium text-gray-700">{file.name}</span>
//                       <span className="text-gray-400 text-xs shrink-0">{fmtBytes(file.size)}</span>
//                     </div>
//                     <button type="button" onClick={() => removeFile(idx)}
//                       className="ml-3 text-gray-400 hover:text-red-500 transition-colors shrink-0">
//                       <X size={15} />
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             )}

//             {/* ── Contractor Types ─────────────────────────────────────── */}
//             <SectionLabel label="Contractor Types" />
//             <ContractorMultiSelect
//               contractors={contractorTypes.map((ct) => ({ id: ct.ID, title: ct.NAME }))}
//               value={selectedContractorTypes}
//               onChange={setSelectedContractorTypes}
//             />

//             {/* Pending preview */}
//             {selectedContractorTypes.length > 0 && (
//               <>
//                 <SectionLabel label="Certificate Status" />
//                 <p className="text-xs text-gray-500 -mt-2">
//                   These certificates will be created as <strong>PENDING</strong> upon project creation.
//                 </p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                   {selectedContractorTypes.map((ctId) => {
//                     const ct = contractorTypes.find((c) => c.ID === ctId);
//                     return (
//                       <div key={ctId}
//                         className="flex items-center gap-2 border border-amber-200 bg-amber-50 rounded-md px-3 py-2">
//                         <Clock size={13} className="text-amber-500 shrink-0" />
//                         <div className="min-w-0">
//                           <p className="text-sm font-medium text-gray-700 truncate">{ct?.NAME}</p>
//                           <p className="text-xs text-amber-600 font-medium">PENDING</p>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </>
//             )}

//             {/* ── Submit ───────────────────────────────────────────────── */}
//             <div className="flex justify-end gap-2 pt-4 border-t">
//               <Button type="button" variant="outline" onClick={onClose}>
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={mutation.isPending}>
//                 <Save size={15} className="mr-2" />
//                 {mutation.isPending ? "Saving..." : "Submit Project"}
//               </Button>
//             </div>
//           </form>
//         </Form>
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
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Upload, X, Clock } from "lucide-react";
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
import { OwnerRepeater , EMPTY_OWNER} from "./owner-preter";

// import { ContractorMultiSelect } from "./ContractorMultiSelect";

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

const DEFAULT_VALUES = {
  P_NAME: "", P_TYPE: "", P_ADDRESS: "", SUBWRB: "", POSTCODE: "",
  STATE: "", USER_ID: 105, USER_BY: 105, UPDATED_BY: 105,
  LOT: "", DP: "", INSURANCE_NO: "",
  P_ENTATIVE_START_DATE: "", P_TENTATIVE_END_DATE: "",
  P_CODE: "", DESCRIPTION: "",
};

export function CreateProjectSheet({ isOpen, onClose }) {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [selectedContractorTypes, setSelectedContractorTypes] = useState([]);
  const [mandatoryFiles, setMandatoryFiles]                   = useState([]);
  const [dragOver, setDragOver]                               = useState(false);
  const [owners, setOwners]                                   = useState([{ ...EMPTY_OWNER }]);

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      form.reset(DEFAULT_VALUES);
      setSelectedContractorTypes([]);
      setMandatoryFiles([]);
      setOwners([{ ...EMPTY_OWNER }]);
    }
  }, [isOpen]);

  const { data: projectTypes = [] } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => (await axios.get(`${url}/api/project-type`)).data?.data || [],
  });

  const { data: contractorTypes = [] } = useQuery({
    queryKey: ["contractorTypes"],
    queryFn: async () => (await axios.get(`${url}/api/contractor-type`)).data?.data || [],
  });

  const addFiles = (fileList) => {
    const valid = Array.from(fileList).filter((f) => {
      if (!ALLOWED_MIME.includes(f.type)) { toast.error(`"${f.name}" — unsupported type.`); return false; }
      if (f.size > 20 * 1024 * 1024)      { toast.error(`"${f.name}" exceeds 20 MB.`);      return false; }
      return true;
    });
    setMandatoryFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...valid.filter((f) => !existing.has(f.name + f.size))];
    });
  };

  const removeFile = (idx) => setMandatoryFiles((prev) => prev.filter((_, i) => i !== idx));

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") fd.append(k, v);
      });
      fd.append("CONTRACTOR_TYPE_IDS", JSON.stringify(selectedContractorTypes));
      mandatoryFiles.forEach((f) => fd.append("MANDATORY_FILES", f));
      return axios.post(`${url}/api/project`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: async (res) => {
      queryClient.invalidateQueries(["projects"]);
      queryClient.invalidateQueries(["customers"]);
      const newProjectId = res.data?.P_ID;

      // ── create owner rows for the new project ─────────────────────────
      const validOwners = owners.filter((o) => o.O_NAME.trim() !== "");
      if (newProjectId && validOwners.length > 0) {
        try {
          await Promise.all(
            validOwners.map((owner) =>
              axios.post(`${url}/api/owner-info`, {
                oName:     owner.O_NAME,
                address:   owner.ADDRESS,
                suburb:    owner.SUBURB,
                postcode:  owner.POSTCODE,
                state:     owner.STATE,
                email:     owner.EMAIL,
                phone:     owner.PHONE,
                projectId: newProjectId,
                createdBy: 105,
                updatedBy: 105,
              })
            )
          );
        } catch (err) {
          toast.error("Project created, but saving owners failed. You can add them from Edit Project.");
        }
      }

      onClose();
      if (newProjectId) {
        toast.success("Project created! Redirecting to process page...");
        setTimeout(() => navigate(`/dashboard/process/${newProjectId}`), 800);
      } else {
        toast.success("Project created!");
      }
    },
    onError: () => toast.error("Failed to save project. Please try again."),
  });

  const onSubmit = (values) => mutation.mutate(values);

  const fileIcon  = (mime) => mime?.startsWith("image/") ? "🖼️" : mime === "application/pdf" ? "📄" : "📎";
  const fmtBytes  = (b) => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="!w-screen !h-screen !max-w-none overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-[104]">
        <SheetHeader className="mb-6">
          <SheetTitle>Add New Project</SheetTitle>
          <SheetDescription>Fill in the details to create a new project.</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* ── Basic Information ────────────────────────────────────── */}
            <SectionLabel label="Basic Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="P_NAME" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Project Name <Req /></FormLabel>
                  <FormControl><Input {...field} placeholder="Enter project name" /></FormControl>
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

            {/* ── Land Details ─────────────────────────────────────────── */}
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
                <FormItem className="sm:col-span-2">
                  <FormLabel>Project Address <Req /></FormLabel>
                  <FormControl><Textarea rows={3} {...field} placeholder="Enter full address" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="DESCRIPTION" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={2} {...field} placeholder="Enter project description" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* ── Owners ───────────────────────────────────────────────── */}
            <SectionLabel label="Owner Information" />
            <OwnerRepeater owners={owners} onChange={setOwners} />

            <div className="flex justify-between gap-2"></div>

            {/* ── Mandatory Documents ──────────────────────────────────── */}
            <SectionLabel label="Mandatory Documents" />
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              className={`relative border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer
                ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}`}
              onClick={() => document.getElementById("create-mandatory-file-input").click()}
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={22} />
              <p className="text-sm text-gray-600 font-medium">
                Drop files here or <span className="text-blue-600 underline">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, DOC, DOCX — max 20 MB each</p>
              <input
                id="create-mandatory-file-input"
                type="file" multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {mandatoryFiles.length > 0 && (
              <ul className="space-y-2">
                {mandatoryFiles.map((file, idx) => (
                  <li key={idx}
                    className="flex items-center justify-between bg-gray-50 border rounded-md px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{fileIcon(file.type)}</span>
                      <span className="truncate font-medium text-gray-700">{file.name}</span>
                      <span className="text-gray-400 text-xs shrink-0">{fmtBytes(file.size)}</span>
                    </div>
                    <button type="button" onClick={() => removeFile(idx)}
                      className="ml-3 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                      <X size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* ── Contractor Types ─────────────────────────────────────── */}
            <SectionLabel label="Contractor Types" />
            <ContractorMultiSelect
              contractors={contractorTypes.map((ct) => ({ id: ct.ID, title: ct.NAME }))}
              value={selectedContractorTypes}
              onChange={setSelectedContractorTypes}
            />

            {/* Pending preview */}
            {selectedContractorTypes.length > 0 && (
              <>
                <SectionLabel label="Certificate Status" />
                <p className="text-xs text-gray-500 -mt-2">
                  These certificates will be created as <strong>PENDING</strong> upon project creation.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedContractorTypes.map((ctId) => {
                    const ct = contractorTypes.find((c) => c.ID === ctId);
                    return (
                      <div key={ctId}
                        className="flex items-center gap-2 border border-amber-200 bg-amber-50 rounded-md px-3 py-2">
                        <Clock size={13} className="text-amber-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{ct?.NAME}</p>
                          <p className="text-xs text-amber-600 font-medium">PENDING</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── Submit ───────────────────────────────────────────────── */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                <Save size={15} className="mr-2" />
                {mutation.isPending ? "Saving..." : "Submit Project"}
              </Button>
            </div>
          </form>
        </Form>
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