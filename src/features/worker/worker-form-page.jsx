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

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const workerSchema = z.object({
  WORKER_NAME: z.string().min(1, "Worker name is required"),
  PHONE: z.string().optional().or(z.literal("")),
  ADDRESS: z.string().optional().or(z.literal("")),
  STATUS: z.coerce.number().min(0).max(1),
  REMARKS: z.string().optional().or(z.literal("")),
});

const defaultValues = {
  WORKER_NAME: "",
  PHONE: "",
  ADDRESS: "",
  STATUS: 1,
  REMARKS: "",
};

export function WorkerFormPage() {
  const navigate = useNavigate();
  const { workerId } = useParams();
  const queryClient = useQueryClient();
  const isEdit = !!workerId;

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

  const onSubmit = (data) => mutation.mutate(data);

  const handleClose = () => {
    form.reset(defaultValues);
    navigate(-1);
  };

  return (
    <div className="mx-auto w-full max-w-[500px] py-8 px-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          {isEdit ? "Edit Worker" : "Add New Worker"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isEdit ? "Update the worker's details below." : "Fill in the details to add a new worker."}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="WORKER_NAME"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Worker Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter worker name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : isEdit ? "Update Worker" : "Save Worker"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}