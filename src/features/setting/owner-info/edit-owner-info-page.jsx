// src\features\setting\owner-info\edit-owner-info-page.jsx
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const ownerSchema = z.object({
  oName:     z.string().min(1, "Owner name is required"),
  address:   z.string().min(1, "Address is required"),
  suburb:    z.string().min(1, "Suburb is required"),
  postcode:  z.string().min(1, "Postcode is required"),
  state:     z.string().min(1, "State is required"),
  email:     z.string().email("Invalid email").min(1, "Email is required"),
  phone:     z.string().min(1, "Phone is required"),
  projectId: z.coerce.number().min(1, "Project is required"),
  updatedBy: z.coerce.number().default(500),
});

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function EditOwnerInfoPage() {
  const navigate = useNavigate();
  const { id: ownerId } = useParams();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
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
      updatedBy: 500,
    },
  });

 const { data, isLoading: ownerLoading } = useQuery({
  queryKey: ["ownerInfo", ownerId],
  queryFn: async () => {
    const res = await axios.get(`${url}/api/owner-info/${ownerId}`);
    return res.data?.data || res.data;
  },
  enabled: !!ownerId,
});

const isLoading = ownerLoading || projectsLoading;

  useEffect(() => {
    if (data) {
      form.reset({
        oName:     data.O_NAME     || "",
        address:   data.ADDRESS    || "",
        suburb:    data.SUBURB     || "",
        postcode:  data.POSTCODE   || "",
        state:     data.STATE      || "",
        email:     data.EMAIL      || "",
        phone:     data.PHONE      || "",
        // projectId: data.PROJECT_ID || "",
        projectId: data.PROJECT_ID ? Number(data.PROJECT_ID) : "",
        updatedBy: 500,
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      return await axios.put(`${url}/api/owner-info/${ownerId}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ownerInfoList"]);
      queryClient.invalidateQueries(["ownerInfo", ownerId]);
      toast.success("Owner updated successfully!");
      navigate("/dashboard/owner-info");
    },
    onError: () => {
      toast.error("Failed to update owner.");
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
          <h1 className="text-foreground">Edit Owner</h1>
          <p className="text-sm text-muted-foreground">Update owner record</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Loading...
          </div>
        ) : (
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
                          <Input {...field} />
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                          <Input {...field} />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input type="email" {...field} />
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
                          <Input {...field} />
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
                    {mutation.isPending ? "Updating..." : "Update Owner"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}