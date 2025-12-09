import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import moment from "moment";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import api from "@/api/Api";

export function EditDashboardHeaderSheet({ isOpen, onClose, scheduleId }) {
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm({
    defaultValues: {
      H_ID: "",
      DESCRIPTION: "",
      PROJECT_START_PLAN: "",
      PROJECT_END_PLAN: "",
    },
  });

  // Fetch schedule header data
  const { data, isLoading } = useQuery({
    queryKey: ["schedule-header", scheduleId],
    queryFn: async () => {
      const res = await api.get(`/shedule_header.php?hid=${scheduleId}`);
      return res.data?.data || {};
    },
    enabled: !!scheduleId && isOpen,
  });

  // Fill form when data arrives
  useEffect(() => {
    if (!data) return;

    form.setValue("H_ID", data.H_ID || "");
    form.setValue("DESCRIPTION", data.DESCRIPTION || "");

    form.setValue(
      "PROJECT_START_PLAN",
      data.PROJECT_START_PLAN
        ? moment(data.PROJECT_START_PLAN, "DD-MMM-YY").format("YYYY-MM-DD")
        : ""
    );

    form.setValue(
      "PROJECT_END_PLAN",
      data.PROJECT_END_PLAN
        ? moment(data.PROJECT_END_PLAN, "DD-MMM-YY").format("YYYY-MM-DD")
        : ""
    );
  }, [data, form]);

  // Update mutation
  const mutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        h_id: Number(values.H_ID),
        description: values.DESCRIPTION,
        project_start_plan: moment(values.PROJECT_START_PLAN).format("DD-MMM-YY"),
        project_end_plan: moment(values.PROJECT_END_PLAN).format("DD-MMM-YY"),
      };

      const res = await api.put("/shedule_header.php", payload);

      if (res.data?.success) return res.data;
      throw new Error("Failed");
    },
    onSuccess: () => {
      toast.success("Schedule header updated successfully!");
      queryClient.invalidateQueries(["schedule-header", scheduleId]);
      queryClient.invalidateQueries(["schedules"]);
      onClose();
    },
    onError: () => {
      toast.error("Failed to update schedule header.");
    },
  });

  // Submit handler
  const onSubmit = (values) => {
    mutation.mutate(values);
  };

  // Reset form when sheet closes
  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent  className=" sm:max-w-sm overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Set Dashboard Header</SheetTitle>
           <hr></hr>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <div className="mt-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 px-3"
              >
                {/* Description */}
                <FormField
                  control={form.control}
                  name="DESCRIPTION"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project Start Plan */}
                <FormField
                  control={form.control}
                  name="PROJECT_START_PLAN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Start Plan</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project End Plan */}
                <FormField
                  control={form.control}
                  name="PROJECT_END_PLAN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project End Plan</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Buttons */}
                <div className=" col-span-2 flex justify-between gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={handleClose}>
                   
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                  
                    {mutation.isPending ? "Saving..." : "Submit Header"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}