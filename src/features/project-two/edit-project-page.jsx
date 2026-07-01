import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { ContractorMultiSelect } from "../setting/pages/ContractorMultiSelect";
import { OwnerRepeater, EMPTY_OWNER } from "./owner-preter";
import { SectionContainer } from "@/components/SectionContainer";

// ── Only P_NAME is required, everything else optional ──────────────────────
const projectSchema = z.object({
  P_NAME:                z.string().min(1, "Project name is required"),
  P_TYPE:                z.string().optional().nullable(),
  ADDRESS:               z.string().optional().nullable(),
  STREET:                z.string().optional().nullable(),
  P_ADDRESS:             z.string().optional().nullable(),
  SUBWRB:                z.string().optional().nullable(),
  POSTCODE:              z.string().optional().nullable(),
  STATE:                 z.string().optional().nullable(),
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

const EMPTY_ARRAY = [];

export function EditProjectPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedContractorTypes, setSelectedContractorTypes] = useState([]);
  const [newMandatoryFiles, setNewMandatoryFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [owners, setOwners] = useState([{ ...EMPTY_OWNER }]);
  const [removedOwnerIds, setRemovedOwnerIds] = useState([]);

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      P_NAME: "", P_TYPE: "", ADDRESS: "", STREET: "", P_ADDRESS: "", SUBWRB: "", POSTCODE: "",
      STATE: "NSW", USER_ID: 105, USER_BY: 105, UPDATED_BY: 105,
      LOT: "", DP: "", INSURANCE_NO: "",
      P_ENTATIVE_START_DATE: "", P_TENTATIVE_END_DATE: "",
      P_CODE: "", DESCRIPTION: "",
    },
  });

  // ── Auto-generate P_ADDRESS from Address + Street + Suburb + State + Postcode ──
  const watchedAddress = form.watch("ADDRESS");
  const watchedStreet = form.watch("STREET");
  const watchedSuburb = form.watch("SUBWRB");
  const watchedState = form.watch("STATE");
  const watchedPostcode = form.watch("POSTCODE");

  useEffect(() => {
    const combined = [
      watchedAddress,
      watchedStreet,
      watchedSuburb,
      watchedState,
      watchedPostcode,
    ]
      .filter((v) => v && v.trim() !== "")
      .join(" ")
      .trim();

    form.setValue("P_ADDRESS", combined, {
      shouldValidate: false,
      shouldDirty: true,
    });
  }, [watchedAddress, watchedStreet, watchedSuburb, watchedState, watchedPostcode]);

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
      const d = res.data?.data;
      return Array.isArray(d)
        ? d.find((p) => Number(p.P_ID) === Number(projectId))
        : d;
    },
    enabled: !!projectId,
  });

  const { data: existingOwners = EMPTY_ARRAY, isLoading: ownersLoading } = useQuery({
    queryKey: ["owners", projectId],
    queryFn: async () =>
      (await axios.get(`${url}/api/owner-info/by-project/${projectId}`)).data?.data || [],
    enabled: !!projectId,
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
        ADDRESS:               existingProject.ADDRESS || "",
        STREET:                existingProject.STREET || "",
        P_ADDRESS:             existingProject.P_ADDRESS || "",
        SUBWRB:                existingProject.SUBWRB || "",
        POSTCODE:              existingProject.POSTCODE || "",
        STATE:                 existingProject.STATE || "NSW",
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
  useEffect(() => {
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
  }, [existingOwners, ownersLoading]);

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

  // ── sync owners ───────────────────────────────────────────────────────────
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
      navigate("/dashboard/projects");
    },
    onError: () => toast.error("Failed to update project."),
  });

  const onSubmit = (values) => updateMutation.mutate(values);

  if (isLoading) {
    return (
      <SectionContainer variant="dashboard" className="py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer variant="dashboard">
      {/* Main Form Container */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground tracking-[-0.03em]">
            Edit Project
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update the project details below
          </p>
          <div className="w-full h-px bg-border mt-6" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* ══ Basic Information ══════════════════════════════════════ */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-overline text-muted-foreground tracking-[0.08em] uppercase font-semibold">
                Basic Information
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-4">
              <FormField control={form.control} name="P_NAME" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Project Name <Req />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter formal project title"
                      className="h-10 px-3 py-2 text-sm border-border focus-visible:ring-primary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="P_CODE" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">Project Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="PRJ-000"
                        className="h-10 px-3 py-2 text-sm border-border focus-visible:ring-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="P_TYPE" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Project Type
                    </FormLabel>
                    <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger size="lg" className=" w-full border-input-border" >
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent >
                        {projectTypes.map((pt) => (
                          <SelectItem key={pt.ID} value={pt.ID.toString()}>{pt.NAME}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <FormField control={form.control} name="INSURANCE_NO" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-sm font-medium text-foreground">Insurance No</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="INS-889900"
                        className="h-10 px-3 py-2 text-sm border-border focus-visible:ring-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="P_ENTATIVE_START_DATE" render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel className="text-sm font-medium text-foreground">Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""}
                        className="h-10 px-3 py-2 text-sm border-border focus-visible:ring-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="P_TENTATIVE_END_DATE" render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel className="text-sm font-medium text-foreground">End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""}
                        className="h-10 px-3 py-2 text-sm border-border focus-visible:ring-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* ══ Land Details ═══════════════════════════════════════════ */}
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-overline text-muted-foreground tracking-[0.08em] uppercase font-semibold">
                Land Details
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="LOT" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Lot Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter lot number"
                      className="h-10 px-3 py-2 text-sm border-border focus-visible:ring-primary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="DP" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">DP Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Deposited plan number"
                      className="h-10 px-3 py-2 text-sm border-border focus-visible:ring-primary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Address + Street — feed into auto-generated P_ADDRESS below */}
              <FormField control={form.control} name="ADDRESS" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 1"
                      className="h-10 px-3 py-2 text-sm border-border focus-visible:ring-primary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="STREET" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Street</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Pembroke Street"
                      className="h-10 px-3 py-2 text-sm border-border focus-visible:ring-primary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Project Address — auto-generated, read-only */}
              <FormField control={form.control} name="P_ADDRESS" render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="text-sm font-medium text-foreground">
                    Project Address
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} 
                      placeholder=" Auto generate from Address, Street, Suburb, State, postcode"
                        />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="SUBWRB" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Suburb</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Suburb"
                      className="h-10 px-3 py-2 text-sm border-border focus-visible:ring-primary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* State — plain input, default NSW */}
              <FormField control={form.control} name="STATE" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">State</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || "NSW"} placeholder="NSW"
                      className="h-10 px-3 py-2 text-sm border-border focus-visible:ring-primary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="POSTCODE" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Postcode</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0000"
                      className="h-10 px-3 py-2 text-sm border-border focus-visible:ring-primary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="DESCRIPTION" render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="text-sm font-medium text-foreground">Project Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} placeholder="Brief summary of project scope"
                      className="px-3 py-2 text-sm border-border focus-visible:ring-primary/20 resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

               {/* ══ Submit ═════════════════════════════════════════════════ */}
            <div className="flex justify-end gap-3 pt-6 mt-8  border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="h-9 px-4 text-sm font-medium border-border hover:bg-muted/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="h-9 px-4 text-sm font-medium bg-primary hover:bg-primary/90 text-white hover:shadow-lg transition-all"
              >
                <Save size={16} className="mr-2" />
                {updateMutation.isPending ? "Updating..." : "Update Project"}
              </Button>
            </div>
            </div>

            {/* ══ Owners ═════════════════════════════════════════════════ */}
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-overline text-muted-foreground tracking-[0.08em] uppercase font-semibold">
                Owner Information
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {ownersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <OwnerRepeater owners={owners} onChange={handleOwnersChange} />
            )}

            {/* ══ Mandatory Documents ════════════════════════════════════ */}
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-overline text-muted-foreground tracking-[0.08em] uppercase font-semibold">
                Mandatory Documents
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Previously uploaded */}
            {existingMandatoryDocs.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Previously uploaded</p>
                <ul className="space-y-2">
                  {existingMandatoryDocs.map((doc) => (
                    <li key={doc.ID}
                      className="flex items-center justify-between p-3 rounded-md border
                        bg-success/5 border-success/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 size={14} className="text-success shrink-0" />
                        <span className="truncate text-sm font-medium text-foreground">{doc.FILE_NAME}</span>
                        {doc.FILE_SIZE && (
                          <span className="text-xs text-muted-foreground shrink-0">{fmtBytes(doc.FILE_SIZE)}</span>
                        )}
                      </div>
                      <a href={`${url}/api/project/doc/${doc.ID}`} target="_blank" rel="noreferrer"
                        className="ml-3 text-primary hover:text-primary/80 shrink-0 p-1 rounded hover:bg-primary/5 transition-colors">
                        <ExternalLink size={14} />
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
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
              onClick={() => document.getElementById("edit-mandatory-file-input").click()}
            >
              <Upload
                className={`mx-auto mb-3 transition-colors ${dragOver ? "text-primary" : "text-muted-foreground"}`}
                size={48}
              />
              <p className="text-sm text-foreground font-medium">
                Add more files or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG up to 20MB each
              </p>
              <input
                id="edit-mandatory-file-input"
                type="file" multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {newMandatoryFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {newMandatoryFiles.map((file, idx) => (
                  <div key={idx}
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-md">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-primary shrink-0">
                        <span className="text-lg">{fileIcon(file.type)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{fmtBytes(file.size)}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeNewFile(idx)}
                      className="ml-3 text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ══ Contractor Types ═══════════════════════════════════════ */}
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-overline text-muted-foreground tracking-[0.08em] uppercase font-semibold">
                Contractor Types
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Required Trades
              </label>
              <ContractorMultiSelect
                contractors={contractorTypes.map((ct) => ({ id: ct.ID, title: ct.NAME }))}
                value={selectedContractorTypes}
                onChange={setSelectedContractorTypes}
              />
            </div>

            {/* ══ Certificate Status ═════════════════════════════════════ */}
            {(certDocs.length > 0 || selectedContractorTypes.length > 0) && (
              <>
                <div className="flex items-center gap-4 mb-6 mt-8">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-overline text-muted-foreground tracking-[0.08em] uppercase font-semibold">
                    Certificate Status
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Saved cert rows */}
                  {certDocs.map((doc) => {
                    const ct = contractorTypes.find((c) => c.ID === doc.CONTRACTOR_TYPE_ID);
                    const uploaded = doc.UPLOAD_STATUS === "UPLOADED";
                    const inputId = `edit-cert-${doc.ID}`;
                    const isUploading =
                      certUploadMutation.isPending &&
                      certUploadMutation.variables?.docId === doc.ID;
                    return (
                      <div key={doc.ID}
                        className={`flex items-center gap-4 p-5 rounded-lg border transition-all
                          ${uploaded
                            ? "bg-success/5 border-success/20"
                            : "bg-[#FFFBEB] border-[#FDE68A] dark:bg-[#2A2515] dark:border-[#4A3F1A]"
                          }`}>
                        {uploaded
                          ? <div className="w-10 h-10 rounded-full flex items-center justify-center bg-success/20 shrink-0">
                              <CheckCircle2 size={18} className="text-success" />
                            </div>
                          : <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FEF3C7] dark:bg-[#3D3618] shrink-0">
                              <Clock size={18} className="text-[#B45309] dark:text-[#D4A84F]" />
                            </div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate
                            ${uploaded ? "text-foreground" : "text-[#92400E] dark:text-[#E5C05A]"}`}>
                            {ct?.NAME || `Type ${doc.CONTRACTOR_TYPE_ID}`}
                          </p>
                          <p className={`text-xs font-semibold mt-0.5
                            ${uploaded ? "text-success" : "text-[#B45309] dark:text-[#A89A4F]"}`}>
                            {doc.UPLOAD_STATUS}
                          </p>
                        </div>
                        {uploaded && doc.FILE_NAME && (
                          <a href={`${url}/api/project/doc/${doc.ID}`} target="_blank" rel="noreferrer"
                            className="text-primary hover:text-primary/80 shrink-0 p-1 rounded hover:bg-primary/5 transition-colors"
                            title={doc.FILE_NAME}>
                            <ExternalLink size={16} />
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
                              className="ml-1 shrink-0 text-xs font-medium text-primary hover:text-primary/80
                                border border-primary/20 bg-card rounded-md px-3 py-1.5 hover:bg-primary/5
                                disabled:opacity-50 transition-all">
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
                          className="flex items-center gap-4 p-5 rounded-lg border transition-all
                            bg-[#FFFBEB] border-[#FDE68A] dark:bg-[#2A2515] dark:border-[#4A3F1A]">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FEF3C7] dark:bg-[#3D3618] shrink-0">
                            <Clock size={18} className="text-[#B45309] dark:text-[#D4A84F]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#92400E] dark:text-[#E5C05A] truncate">
                              {ct?.NAME}
                            </p>
                            <p className="text-xs text-[#B45309] dark:text-[#A89A4F] font-medium mt-0.5">
                              Will be created — PENDING
                            </p>
                          </div>
                          <span className="px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-md border
                            bg-white/70 text-[#92400E] border-[#FDE68A]
                            dark:bg-[#3D3618] dark:text-[#D4A84F] dark:border-[#4A3F1A]">
                            PENDING
                          </span>
                        </div>
                      );
                    })}
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-6   border-border">
              
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="h-9 px-4 text-sm font-medium bg-primary hover:bg-primary/90 text-white hover:shadow-lg transition-all"
              >
                <Save size={16} className="mr-2" />
                {updateMutation.isPending ? "Upload..." : "Upload"}
              </Button>
            </div>

           
          </form>
        </Form>
      </div>
    </SectionContainer>
  );
}

const Req = () => <span className="text-destructive">*</span>;