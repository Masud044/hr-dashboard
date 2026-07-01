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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ContractorMultiSelect } from "../setting/pages/ContractorMultiSelect";
import { OwnerRepeater, EMPTY_OWNER } from "./owner-preter";
import { SectionContainer } from "@/components/SectionContainer";

// ── Only P_NAME is required, everything else optional ──────────────────────
const projectSchema = z.object({
  P_NAME: z.string().min(1, "Project name is required"),
  P_TYPE: z.string().optional().nullable(),
  ADDRESS: z.string().optional().nullable(),
  STREET: z.string().optional().nullable(),
  P_ADDRESS: z.string().optional().nullable(),
  SUBWRB: z.string().optional().nullable(),
  POSTCODE: z.string().optional().nullable(),
  STATE: z.string().optional().nullable(),
  USER_ID: z.coerce.number().default(105),
  USER_BY: z.coerce.number().default(105),
  UPDATED_BY: z.coerce.number().default(105),
  LOT: z.string().optional().nullable(),
  DP: z.string().optional().nullable(),
  INSURANCE_NO: z.string().optional().nullable(),
  P_ENTATIVE_START_DATE: z.string().optional().nullable(),
  P_TENTATIVE_END_DATE: z.string().optional().nullable(),
  P_CODE: z.string().optional().nullable(),
  DESCRIPTION: z.string().optional().nullable(),
});

const ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const DEFAULT_VALUES = {
  P_NAME: "",
  P_TYPE: "",
  ADDRESS: "",
  STREET: "",
  P_ADDRESS: "",
  SUBWRB: "",
  POSTCODE: "",
  STATE: "NSW", // default value
  USER_ID: 105,
  USER_BY: 105,
  UPDATED_BY: 105,
  LOT: "",
  DP: "",
  INSURANCE_NO: "",
  P_ENTATIVE_START_DATE: "",
  P_TENTATIVE_END_DATE: "",
  P_CODE: "",
  DESCRIPTION: "",
};

export function CreateProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedContractorTypes, setSelectedContractorTypes] = useState([]);
  const [mandatoryFiles, setMandatoryFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [owners, setOwners] = useState([{ ...EMPTY_OWNER }]);

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Reset form on mount
  useEffect(() => {
    form.reset(DEFAULT_VALUES);
    setSelectedContractorTypes([]);
    setMandatoryFiles([]);
    setOwners([{ ...EMPTY_OWNER }]);
  }, []);

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

  const { data: projectTypes = [] } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () =>
      (await axios.get(`${url}/api/project-type`)).data?.data || [],
  });

  const { data: contractorTypes = [] } = useQuery({
    queryKey: ["contractorTypes"],
    queryFn: async () =>
      (await axios.get(`${url}/api/contractor-type`)).data?.data || [],
  });

  const addFiles = (fileList) => {
    const valid = Array.from(fileList).filter((f) => {
      if (!ALLOWED_MIME.includes(f.type)) {
        toast.error(`"${f.name}" — unsupported type.`);
        return false;
      }
      if (f.size > 20 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds 20 MB.`);
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

      // Create owner rows for the new project
      const validOwners = owners.filter((o) => o.O_NAME.trim() !== "");
      if (newProjectId && validOwners.length > 0) {
        try {
          await Promise.all(
            validOwners.map((owner) =>
              axios.post(`${url}/api/owner-info`, {
                oName: owner.O_NAME,
                address: owner.ADDRESS,
                suburb: owner.SUBURB,
                postcode: owner.POSTCODE,
                state: owner.STATE,
                email: owner.EMAIL,
                phone: owner.PHONE,
                projectId: newProjectId,
                createdBy: 105,
                updatedBy: 105,
              }),
            ),
          );
        } catch (err) {
          toast.error(
            "Project created, but saving owners failed. You can add them from Edit Project.",
          );
        }
      }

      toast.success("Project created successfully!");
      setTimeout(() => navigate("/dashboard/projects"), 800);
    },
    onError: () => toast.error("Failed to save project. Please try again."),
  });

  const onSubmit = (values) => mutation.mutate(values);

  const fileIcon = (mime) =>
    mime?.startsWith("image/")
      ? "🖼️"
      : mime === "application/pdf"
        ? "📄"
        : "📎";
  const fmtBytes = (b) =>
    b < 1048576
      ? `${(b / 1024).toFixed(1)} KB`
      : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <SectionContainer variant="dashboard">
      {/* Main Form Container */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground tracking-[-0.03em]">
            Create New Project
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the details to create a new project
          </p>
          <div className="w-full h-px bg-border mt-6" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Grid */}
            <div className="space-y-4">
              {/* Row 1: Project Name (Full Width) */}
              <FormField
                control={form.control}
                name="P_NAME"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Project Name <Req />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter formal project title"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Row 2: Project Code (50%) + Project Type (50%) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="P_CODE"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Project Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="PRJ-000"
                          className="h-10 "
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="P_TYPE"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Project Type
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger size="lg" className=" w-full border-input-border">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {projectTypes.map((pt) => (
                              <SelectItem key={pt.ID} value={pt.ID.toString()}>
                                {pt.NAME}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 3: Insurance No (50%) + Start Date (25%) + End Date (25%) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="INSURANCE_NO"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Insurance No
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="INS-889900"
                          className="h-10 "
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="P_ENTATIVE_START_DATE"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-1">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Start Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                          className="h-10 "
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="P_TENTATIVE_END_DATE"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-1">
                      <FormLabel className="text-sm font-medium text-foreground">
                        End Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                          className="h-10 "
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ── Land Details ─────────────────────────────────────────── */}
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-overline text-muted-foreground tracking-[0.08em] uppercase font-semibold">
                Land Details
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="LOT"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Lot Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter lot number"
                        className="h-10 "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="DP"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      DP Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Deposited plan number"
                        className="h-10 "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address + Street — feed into auto-generated P_ADDRESS below */}
              <FormField
                control={form.control}
                name="ADDRESS"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. 1"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="STREET"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Street
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Pembroke Street"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

             

              <FormField
                control={form.control}
                name="SUBWRB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Suburb
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Suburb"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* State — plain input, default NSW */}
              <FormField
                control={form.control}
                name="STATE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      State
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || "NSW"}
                        placeholder="NSW"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="POSTCODE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Postcode
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0000"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               {/* Project Address — auto-generated, read-only */}
              <FormField
                control={form.control}
                name="P_ADDRESS"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-sm font-medium text-foreground">
                      Project Address
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        {...field}
                      
                        placeholder=" Auto generate from Address, Street, Suburb, State, postcode"
                        // className="resize-none bg-muted/40 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="DESCRIPTION"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-sm font-medium text-foreground">
                      Project Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        {...field}
                        placeholder="Brief summary of project scope"
                        className=" resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                {/* ── Submit ───────────────────────────────────────────────── */}
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
                disabled={mutation.isPending}
                className="h-9 px-4 text-sm font-medium bg-primary hover:bg-primary/90 text-white  hover:shadow-lg transition-all"
              >
                <Save size={16} className="mr-2" />
                {mutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
            </div>

            {/* ── Owners ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-overline text-muted-foreground tracking-[0.08em] uppercase font-semibold">
                Owner Information
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <OwnerRepeater owners={owners} onChange={setOwners} />


            <div className="flex justify-between gap-2"></div>

            {/* ── Mandatory Documents ──────────────────────────────────── */}
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-overline text-muted-foreground tracking-[0.08em] uppercase font-semibold">
                Mandatory Documents
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                  ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
              onClick={() =>
                document.getElementById("create-mandatory-file-input").click()
              }
            >
              <Upload
                className={`mx-auto mb-3 transition-colors ${dragOver ? "text-primary" : "text-muted-foreground"}`}
                size={48}
              />
              <p className="text-sm text-foreground font-medium">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG up to 20MB each
              </p>
              <input
                id="create-mandatory-file-input"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {mandatoryFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {mandatoryFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-primary shrink-0">
                        <span className="text-lg">{fileIcon(file.type)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fmtBytes(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="ml-3 text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Contractor Types ─────────────────────────────────────── */}
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
                contractors={contractorTypes.map((ct) => ({
                  id: ct.ID,
                  title: ct.NAME,
                }))}
                value={selectedContractorTypes}
                onChange={setSelectedContractorTypes}
              />
            </div>

            {/* Pending preview */}
            {selectedContractorTypes.length > 0 && (
              <>
                <div className="flex items-center gap-4 mb-6 mt-8">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-overline text-muted-foreground tracking-[0.08em] uppercase font-semibold">
                    Certificate Status
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedContractorTypes.map((ctId) => {
                    const ct = contractorTypes.find((c) => c.ID === ctId);
                    return (
                      <div
                        key={ctId}
                        className="flex items-center gap-4 p-5 rounded-lg border transition-all
              bg-[#FFFBEB] border-[#FDE68A] 
              dark:bg-[#2A2515] dark:border-[#4A3F1A]
              hover:shadow-sm"
                      >
                        {/* Clock Icon */}
                        <div className="shrink-0">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center
                bg-[#FEF3C7] dark:bg-[#3D3618]"
                          >
                            <Clock
                              size={18}
                              className="text-[#B45309] dark:text-[#D4A84F]"
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#92400E] dark:text-[#E5C05A] truncate">
                            {ct?.NAME}
                          </p>
                          <p className="text-xs text-[#B45309] dark:text-[#A89A4F] mt-0.5">
                            Certificate Required
                          </p>
                        </div>

                        {/* PENDING Badge */}
                        <span
                          className="px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-md border
              bg-white/70 text-[#92400E] border-[#FDE68A]
              dark:bg-[#3D3618] dark:text-[#D4A84F] dark:border-[#4A3F1A]"
                        >
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
                disabled={mutation.isPending}
                className="h-9 px-4 text-sm font-medium bg-primary hover:bg-primary/90 text-white  hover:shadow-lg transition-all"
              >
                <Save size={16} className="mr-2" />
                {mutation.isPending ? "upload..." : "upload"}
              </Button>
            </div>

          
          </form>
        </Form>
      </div>
    </SectionContainer>
  );
}

const Req = () => <span className="text-destructive">*</span>;