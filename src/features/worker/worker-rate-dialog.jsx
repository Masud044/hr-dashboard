// src/features/worker/worker-rate-dialog.jsx
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const rateSchema = z.object({
  EFFECTIVE_FROM: z.string().min(1, "Effective date is required"),
  RATE_PER_HOUR: z.any().optional().nullable(),
  RATE_PER_DAY: z.any().optional().nullable(),
  REMARKS: z.string().optional().nullable(),
});

const getTodayString = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const defaultValues = {
  EFFECTIVE_FROM: getTodayString(),
  RATE_PER_HOUR: "",
  RATE_PER_DAY: "",
  REMARKS: "",
};

export function WorkerRateDialog({ isOpen, onClose, workerId }) {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(rateSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ ...defaultValues, EFFECTIVE_FROM: getTodayString() });
      form.clearErrors();
    }
  }, [isOpen, form]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        WORKER_ID: workerId,
        EFFECTIVE_FROM: formData.EFFECTIVE_FROM,
        RATE_PER_HOUR: formData.RATE_PER_HOUR !== "" ? Number(formData.RATE_PER_HOUR) : null,
        RATE_PER_DAY: formData.RATE_PER_DAY !== "" ? Number(formData.RATE_PER_DAY) : null,
        REMARKS: formData.REMARKS || null,
        CREATED_BY: 500,
      };
      return axios.post(`${url}/api/worker-rate`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["worker-rate-history", workerId]);
      queryClient.invalidateQueries(["worker-rate-current", workerId]);
      toast.success("Worker rate updated successfully!");
      handleClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to set worker rate.");
    },
  });

  const onSubmit = (data) => {
    const hasHour = data.RATE_PER_HOUR !== "" && data.RATE_PER_HOUR != null;
    const hasDay = data.RATE_PER_DAY !== "" && data.RATE_PER_DAY != null;
    
    if (!hasHour && !hasDay) {
      form.setError("RATE_PER_HOUR", { 
        type: "manual", 
        message: "At least one rate is required." 
      });
      return;
    }
    
    mutation.mutate(data);
  };

  const handleClose = () => {
    form.reset(defaultValues);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set New Rate</DialogTitle>
         <DialogDescription>
  Set a new rate for this worker. The previous active rate will automatically end the day before this new rate's start date.
</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="EFFECTIVE_FROM"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective From <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="RATE_PER_HOUR"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate / Hour</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                        value={field.value ?? ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="RATE_PER_DAY"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate / Day</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                        value={field.value ?? ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="REMARKS"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any remarks for this rate change" 
                      {...field} 
                      className="resize-none" 
                      value={field.value ?? ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Set Rate"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}