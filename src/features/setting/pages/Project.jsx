import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "react-toastify";

import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ProjectTable } from "../components/ProjectTable";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

const projectSchema = z.object({
  P_NAME:                 z.string().min(1, "Project name is required"),
  P_TYPE:                 z.string().min(1, "Project type is required"),
  P_ADDRESS:              z.string().min(1, "Address is required"),
  SUBWRB:                 z.string().min(1, "Suburb is required"),
  POSTCODE:               z.string().min(1, "Postcode is required"),
  STATE:                  z.string().min(1, "State is required"),
  USER_ID:                z.coerce.number().default(105),
  USER_BY:                z.coerce.number().default(105),
  UPDATED_BY:             z.coerce.number().default(105),
  // ✅ নতুন fields
  LOT:                    z.string().optional().nullable(),
  DP:                     z.string().optional().nullable(),
  INSURANCE_NO:           z.string().optional().nullable(),
  P_ENTATIVE_START_DATE: z.string().optional().nullable(),
  P_TENTATIVE_END_DATE:   z.string().optional().nullable(),
  P_CODE:                 z.string().optional().nullable(),
  DESCRIPTION:            z.string().optional().nullable(),
});

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const Project = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      P_NAME:                 "",
      P_TYPE:                 "",
      P_ADDRESS:              "",
      SUBWRB:                 "",
      POSTCODE:               "",
      STATE:                  "",
      USER_ID:                105,
      USER_BY:                105,
      UPDATED_BY:             105,
      LOT:                    "",
      DP:                     "",
      INSURANCE_NO:           "",
      P_ENTATIVE_START_DATE: "",
      P_TENTATIVE_END_DATE:   "",
      P_CODE:                 "",
      DESCRIPTION:            "",
    },
  });

  useEffect(() => {
    window.scrollTo({ top: 80, behavior: "smooth" });
  }, []);

  // Fetch Project Types
  const { data: projectTypes = [] } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project-type`);
      return res.data?.data || [];
    },
  });

  // Save New Project and Redirect to Edit Page
  const mutation = useMutation({
    mutationFn: async (formData) => {
      return await axios.post(`${url}/api/project`, formData);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["projects"]);
      queryClient.invalidateQueries(["customers"]);
      const newProjectId = res.data?.P_ID;
      if (newProjectId) {
        toast.success("Project added successfully! Redirecting to edit page...");
        setTimeout(() => navigate(`/dashboard/process/${newProjectId}`), 1000);
      } else {
        toast.success("Project added successfully!");
      }
    },
    onError: () => toast.error("❌ Failed to save project data. Please try again."),
  });

  const onSubmit = (values) => mutation.mutate(values);

  return (
    <SectionContainer>
      <div className="p-6 bg-white shadow rounded-lg mt-8">
        <h2 className="font-semibold mb-6 text-sm text-gray-800 border-b pb-2">
          Add New Project
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* ── Section: Basic Info ── */}
            <div className="md:col-span-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Basic Information
              </p>
            </div>

            {/* Project Name */}
            <FormField control={form.control} name="P_NAME" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Project Name <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} placeholder="Enter project name" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* P_CODE */}
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
                <FormLabel>Project Type <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {projectTypes.map(pt => (
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

            {/* Tentative Start Date */}
            <FormField control={form.control} name="P_ENTATIVE_START_DATE" render={({ field }) => (
              <FormItem>
                <FormLabel>Tentative Start Date</FormLabel>
                <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Tentative End Date */}
            <FormField control={form.control} name="P_TENTATIVE_END_DATE" render={({ field }) => (
              <FormItem>
                <FormLabel>Tentative End Date</FormLabel>
                <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* ── Section: Land Details ── */}
            <div className="md:col-span-3 mt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Land Details
              </p>
            </div>

            {/* LOT */}
            <FormField control={form.control} name="LOT" render={({ field }) => (
              <FormItem>
                <FormLabel>Lot</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. 5" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* DP */}
            <FormField control={form.control} name="DP" render={({ field }) => (
              <FormItem>
                <FormLabel>DP (Deposited Plan)</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. 123456" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Suburb */}
            <FormField control={form.control} name="SUBWRB" render={({ field }) => (
              <FormItem>
                <FormLabel>Suburb <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} placeholder="Enter suburb" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Postcode */}
            <FormField control={form.control} name="POSTCODE" render={({ field }) => (
              <FormItem>
                <FormLabel>Postcode <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} placeholder="Enter postcode" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* State */}
            <FormField control={form.control} name="STATE" render={({ field }) => (
              <FormItem>
                <FormLabel>State <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} placeholder="e.g. NSW" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Address */}
            <FormField control={form.control} name="P_ADDRESS" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Project Address <span className="text-red-500">*</span></FormLabel>
                <FormControl><Textarea rows={3} {...field} placeholder="Enter full address" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Description */}
            <FormField control={form.control} name="DESCRIPTION" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea rows={3} {...field} placeholder="Enter project description" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Buttons */}
            <div className="col-span-3 flex justify-end gap-2 mt-4">
              <Button type="submit" disabled={mutation.isPending}>
                <Save size={16} className="mr-2" />
                {mutation.isPending ? "Saving..." : "Submit Project"}
              </Button>
              <Button type="button" onClick={() => navigate("/dashboard/dashboard-schedule")} variant="outline">
                Go to Dashboard
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

export default Project;