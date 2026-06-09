// src\features\setting\pages\Project.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  FolderPlus,
  FolderOpen,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";

import { SectionContainer } from "@/components/SectionContainer";
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
import { ProjectTable } from "../components/ProjectTable";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

const projectSchema = z.object({
  P_NAME: z.string().min(1, "Project name is required"),
  P_TYPE: z.string().min(1, "Project type is required"),
  P_ADDRESS: z.string().min(1, "Address is required"),
  SUBWRB: z.string().min(1, "Suburb is required"),
  POSTCODE: z.string().min(1, "Postcode is required"),
  STATE: z.string().min(1, "State is required"),
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

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Format date helper
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const Project = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      P_NAME: "",
      P_TYPE: "",
      P_ADDRESS: "",
      SUBWRB: "",
      POSTCODE: "",
      STATE: "",
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
    },
  });

  useEffect(() => {
    window.scrollTo({ top: 80, behavior: "smooth" });
  }, []);

  const { data: projectTypes = [] } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project-type`);
      return res.data?.data || [];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project`);
      return res.data?.data || [];
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData) => axios.post(`${url}/api/project`, formData),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["projects"]);
      queryClient.invalidateQueries(["customers"]);
      const newProjectId = res.data?.P_ID;
      if (newProjectId) {
        toast.success(
          "Project added successfully! Redirecting to edit page...",
        );
        setTimeout(() => navigate(`/dashboard/process/${newProjectId}`), 1000);
      } else {
        toast.success("Project added successfully!");
      }
    },
    onError: () =>
      toast.error("❌ Failed to save project data. Please try again."),
  });

  const onSubmit = (values) => mutation.mutate(values);

  // ── Derived stats from existing project data ──
  const thisMonth = projects.filter((p) => {
    const d = new Date(p.CREATION_DATE);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const stateCounts = projects.reduce((acc, p) => {
    const s = p.STATE || "Unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const topStates = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.CREATION_DATE) - new Date(a.CREATION_DATE))
    .slice(0, 4);

  return (
    <SectionContainer className="">
      {/* ── Two-column layout ── */}
      <div className="bg-card border border-border rounded-lg flex flex-col md:flex-row min-h-[600px]">
        {/* ══════════════════════════════════════
            Left Panel
        ══════════════════════════════════════ */}
        <div className="w-full md:w-2/5 shrink-0 border-b md:border-b-0 md:border-r border-border flex flex-col">
          {/* Panel header */}
          <div className="px-5 py-4 border-b border-border">
            <p className="text-overline text-muted-foreground">
              Project Overview
            </p>
          </div>

          <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto">
            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total */}
              <div className="bg-muted rounded-sm p-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-xs bg-accent mb-2">
                  <FolderOpen size={13} className="text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground leading-none mb-0.5">
                  {projects.length}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>

              {/* This month */}
              <div className="bg-muted rounded-sm p-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-xs bg-accent mb-2">
                  <Calendar size={13} className="text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground leading-none mb-0.5">
                  {thisMonth}
                </p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </div>

            {/* ── By state ── */}
            {topStates.length > 0 && (
              <div>
                <p className="text-overline text-muted-foreground mb-3">
                  By State
                </p>
                <div className="space-y-2.5">
                  {topStates.map(([state, count]) => (
                    <div key={state} className="flex items-center gap-3">
                      <span className="text-xs text-foreground w-10 shrink-0 truncate">
                        {state}
                      </span>
                      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{
                            width: `${(count / projects.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-4 text-right shrink-0">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Recent projects ── */}
            <div>
              <p className="text-overline text-muted-foreground mb-2">Recent</p>
              <div className="space-y-0.5">
                {recentProjects.map((p) => (
                  <div
                    key={p.P_ID}
                    onClick={() => navigate(`/dashboard/process/${p.P_ID}`)}
                    className="group flex flex-col gap-0.5 px-3 py-2 rounded-sm hover:bg-muted transition-colors duration-150 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors duration-150">
                        {p.P_NAME}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                        #{p.P_ID}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin size={9} />
                        {p.SUBWRB}, {p.STATE}
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <Clock size={9} />
                        {formatDate(p.CREATION_DATE)}
                      </span>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-xs text-muted-foreground px-3 py-2">
                    No projects yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        

        {/* ══════════════════════════════════════
            Right Panel: Create Form
        ══════════════════════════════════════ */}
        <div className="flex-1 flex flex-col">
          {/* Form header */}
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FolderPlus size={15} className="text-primary" />
              Create New Project
            </h2>
          </div>

          {/* Form body */}
          <div className="flex-1 px-6 py-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* ── Basic Information ── */}
                <div className="space-y-4">
                  <p className="text-overline text-muted-foreground">
                    Basic Information
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <FormField
                      control={form.control}
                      name="P_NAME"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>
                            Project Name{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Alpha Tower Renovation"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="P_CODE"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. PRJ-2024-001" />
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
                          <FormLabel>
                            Project Type{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {projectTypes.map((pt) => (
                                  <SelectItem
                                    key={pt.ID}
                                    value={pt.ID.toString()}
                                  >
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

                    <FormField
                      control={form.control}
                      name="INSURANCE_NO"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Policy ID" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div />

                    <FormField
                      control={form.control}
                      name="P_ENTATIVE_START_DATE"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tentative Start Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ""}
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
                        <FormItem>
                          <FormLabel>Tentative End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ── Land Details ── */}
                <div className="space-y-4 border-t border-border pt-5">
                  <p className="text-overline text-muted-foreground">
                    Land Details
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <FormField
                      control={form.control}
                      name="LOT"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lot</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Lot No." />
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
                          <FormLabel>DP (Deposited Plan)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="DP No." />
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
                          <FormLabel>
                            Suburb <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter suburb" />
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
                          <FormLabel>
                            Postcode <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter postcode" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="STATE"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            State <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. NSW" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div />

                    <FormField
                      control={form.control}
                      name="P_ADDRESS"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>
                            Project Address{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              {...field}
                              placeholder="Full street address..."
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
                        <FormItem className="md:col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              {...field}
                              placeholder="Additional project details..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ── Action Buttons ── */}
                <div className="flex justify-end gap-2 border-t border-border pt-4 pb-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard/dashboard-schedule")}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="gap-2"
                  >
                    <Save size={15} />
                    {mutation.isPending ? "Saving..." : "Submit Project"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Project Table */}
      <div className="mt-6">
        <ProjectTable />
      </div>
    </SectionContainer>
  );
};

export default Project;
