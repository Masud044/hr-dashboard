// src/features/worker/worker-form-page.jsx
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-toastify";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const workerSchema = z.object({
  WORKER_NAME: z.string().min(1, "Worker name is required"),
  PHONE: z.string().optional().or(z.literal("")),
  EMAIL: z.string().email("Invalid email").optional().or(z.literal("")),
  ADDRESS: z.string().optional().or(z.literal("")),
  STATUS: z.coerce.number().min(0).max(1),
  REMARKS: z.string().optional().or(z.literal("")),
});

const defaultValues = {
  WORKER_NAME: "",
  PHONE: "",
  EMAIL: "",
  ADDRESS: "",
  STATUS: 1,
  REMARKS: "",
};

export function WorkerFormPage() {
  const navigate = useNavigate();
  const { workerId } = useParams();
  const queryClient = useQueryClient();
  const isEdit = !!workerId;
  const { user } = useAuthV2();

  const form = useForm({
    resolver: zodResolver(workerSchema),
    defaultValues,
  });

  const { data: workerData, isLoading } = useQuery({
    queryKey: ["worker-detail", workerId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/worker`, { params: { worker_id: workerId } });
      return res.data?.data?.[0] || null;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (workerData) {
      form.reset({
        WORKER_NAME: workerData.WORKER_NAME ?? "",
        PHONE: workerData.PHONE ?? "",
        EMAIL: workerData.EMAIL ?? "",
        ADDRESS: workerData.ADDRESS ?? "",
        STATUS: workerData.STATUS ?? 1,
        REMARKS: workerData.REMARKS ?? "",
      });
    } else if (!isEdit) {
      form.reset(defaultValues);
    }
  }, [workerData, isEdit, form]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEdit) {
        return axios.put(`${url}/api/worker`, { ...formData, WORKER_ID: workerId });
      }
      return axios.post(`${url}/api/worker`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workers"]);
      toast.success(`Worker ${isEdit ? "updated" : "created"} successfully!`);
      handleClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} worker.`);
    },
  });

  const onSubmit = (data) =>
    mutation.mutate({
      ...data,
      // The worker API expects UPPERCASE keys.
      ...(isEdit
        ? { UPDATED_BY: user?.id ?? null }
        : { CREATED_BY: user?.id ?? null, UPDATED_BY: user?.id ?? null }),
    });

  const handleClose = () => {
    form.reset(defaultValues);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1>{isEdit ? "Edit Worker" : "Add New Worker"}</h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Update the worker's details below." : "Fill in the details to add a new worker."}
          </p>
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
                    name="WORKER_NAME"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Worker Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter worker name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="STATUS"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select modal={false} onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Active</SelectItem>
                            <SelectItem value="0">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="PHONE"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="EMAIL"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="ADDRESS"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter address" {...field} className="resize-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="REMARKS"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarks</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any additional remarks" {...field} className="resize-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between gap-3 mt-6 pt-6 border-t border-border">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending} className="btn-lift">
                    {mutation.isPending ? "Saving..." : isEdit ? "Update Worker" : "Save Worker"}
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