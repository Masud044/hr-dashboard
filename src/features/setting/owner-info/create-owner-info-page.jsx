// src\features\setting\owner-info\create-owner-info-page.jsx
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import EntityCombobox from "@/components/shared/entity-combobox";
import { useMemo } from "react";

const ownerSchema = z.object({
  oName:     z.string().min(1, "Owner name is required"),
  address:   z.string().optional().default(""),
  suburb:    z.string().optional().default(""),
  postcode:  z.string().optional().default(""),
  state:     z.string().optional().default(""),
  email:     z.string().email("Invalid email").optional().or(z.literal("")).default(""),
  phone:     z.string().optional().default(""),
  projectId: z.coerce.number().min(1, "Project is required"),
  createdBy: z.coerce.number().default(500),
  updatedBy: z.coerce.number().default(500),
});

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function CreateOwnerInfoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ["projectsDropdown"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/owner-info/projects`);
      return res.data?.data || [];
    },
  });

  const projectOpts = useMemo(
  () => projects.map((p) => ({ value: String(p.ID), label: p.NAME })),
  [projects],
);

  const form = useForm({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      oName: "",
      address: "",
      suburb: "",
      postcode: "",
      state: "",
      email: "",
      phone: "",
      projectId: "",
      createdBy: 500,
      updatedBy: 500,
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData) => {
      return await axios.post(`${url}/api/owner-info`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ownerInfoList"]);
      toast.success("Owner added successfully!");
      navigate("/dashboard/owner-info");
    },
    onError: () => {
      toast.error("Failed to add owner.");
    },
  });

  const onSubmit = (data) => mutation.mutate(data);
  const handleCancel = () => navigate("/dashboard/owner-info");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-foreground">Add New Owner</h1>
          <p className="text-sm text-muted-foreground">Create a new owner record</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="oName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter owner name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} placeholder="Enter address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
               <FormField
  control={form.control}
  name="projectId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Project</FormLabel>
      <FormControl>
        <EntityCombobox
          items={projectOpts}
          value={field.value ? String(field.value) : ""}
          onValueChange={(v) => field.onChange(v ? Number(v) : "")}
          placeholder="Select a project"
          size="md"
          className="w-full"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
                <FormField
                  control={form.control}
                  name="suburb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suburb</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter suburb" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter postcode" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} placeholder="Enter email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between gap-3 mt-6 pt-6 border-t border-border">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Submit"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}