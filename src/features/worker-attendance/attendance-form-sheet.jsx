// src/features/worker-attendance/attendance-form-sheet.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const attendanceSchema = z
  .object({
    ATTENDANCE_DATE: z.string().min(1, "Date is required"),
    WORKER_ID: z.coerce.number().min(1, "Worker is required"),
    PROJECT_ID: z.coerce.number().min(1, "Project is required"),
    CALC_BASIS: z.enum(["HOUR", "DAY"], { required_error: "Calc basis is required" }),
    ENTRY_MODE: z.string().optional(),
    START_TIME: z.string().optional(),
    END_TIME: z.string().optional(),
    HOURS_WORKED: z.any().optional(),
    DAYS_WORKED: z.any().optional(),
    REMARKS: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.CALC_BASIS === "DAY") {
      const days = parseFloat(data.DAYS_WORKED);
      if (isNaN(days) || days <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Days worked is required and must be > 0",
          path: ["DAYS_WORKED"],
        });
      }
    } else if (data.CALC_BASIS === "HOUR") {
      if (!data.ENTRY_MODE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Entry mode is required",
          path: ["ENTRY_MODE"],
        });
      } else if (data.ENTRY_MODE === "TIME") {
        if (!data.START_TIME)
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start time is required", path: ["START_TIME"] });
        if (!data.END_TIME)
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End time is required", path: ["END_TIME"] });
      } else if (data.ENTRY_MODE === "HOURS") {
        const hours = parseFloat(data.HOURS_WORKED);
        if (isNaN(hours) || hours <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Hours worked is required and must be > 0",
            path: ["HOURS_WORKED"],
          });
        }
      }
    }
  });

const defaultValues = {
  ATTENDANCE_DATE: new Date().toISOString().split("T")[0],
  WORKER_ID: "",
  PROJECT_ID: "",
  CALC_BASIS: "HOUR",
  ENTRY_MODE: "",
  START_TIME: "",
  END_TIME: "",
  HOURS_WORKED: "",
  DAYS_WORKED: "",
  REMARKS: "",
};

export function AttendanceFormSheet({ isOpen, onClose, attendanceId, initialData }) {
  const queryClient = useQueryClient();
  const isEdit = !!attendanceId;

  const form = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: initialData || defaultValues,
  });

  const calcBasis = form.watch("CALC_BASIS");
  const entryMode = form.watch("ENTRY_MODE");

  // Fetch workers and projects for dropdowns
  const { data: workers = [] } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/worker`);
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

  // Fallback fetch if editing without initialData passed
  const { data: fetchedData } = useQuery({
    queryKey: ["worker-attendance", attendanceId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/worker-attendance/${attendanceId}`);
      return res.data?.data;
    },
    enabled: isEdit && !initialData,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          ...defaultValues,
          ...initialData,
          WORKER_ID: initialData.WORKER_ID ? String(initialData.WORKER_ID) : "",
          PROJECT_ID: initialData.PROJECT_ID ? String(initialData.PROJECT_ID) : "",
        });
      } else if (fetchedData) {
        form.reset({
          ...defaultValues,
          ...fetchedData,
          WORKER_ID: fetchedData.WORKER_ID ? String(fetchedData.WORKER_ID) : "",
          PROJECT_ID: fetchedData.PROJECT_ID ? String(fetchedData.PROJECT_ID) : "",
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [isOpen, initialData, fetchedData, form]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = { ...formData };
      
     if (isEdit) {
  payload.ATTENDANCE_ID = attendanceId; // Ensure PK is sent for full update
  return axios.put(`${url}/api/worker-attendance`, payload);
} else {
        return axios.post(`${url}/api/worker-attendance`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["worker-attendance"]);
      toast.success(`Attendance ${isEdit ? "updated" : "created"} successfully!`);
      form.reset(defaultValues);
      onClose();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} attendance.`),
  });

  const onSubmit = (data) => mutation.mutate(data);
  
  const handleClose = () => {
    form.reset(defaultValues);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
    <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col gap-0 p-0 z-[104]">   <SheetHeader className="mb-4 px-6 pt-6">
          <SheetTitle className="text-lg font-semibold">{isEdit ? "Edit" : "Add"} Attendance</SheetTitle>
          <hr />
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <FormField
                control={form.control}
                name="ATTENDANCE_DATE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attendance Date <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="WORKER_ID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Worker <span className="text-red-500">*</span></FormLabel>
                    <Select  onValueChange={field.onChange} value={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select worker" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[200]">
                        {workers.map((w) => (
                          <SelectItem key={w.WORKER_ID} value={String(w.WORKER_ID)}>
                            {w.WORKER_NAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="PROJECT_ID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project <span className="text-red-500">*</span></FormLabel>
                    <Select  onValueChange={field.onChange} value={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[200]">
                        {projects.map((p) => (
                          <SelectItem key={p.P_ID} value={String(p.P_ID)}>
                            {p.P_NAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="CALC_BASIS"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calculation Basis <span className="text-red-500">*</span></FormLabel>
                    <Select
                    
                      onValueChange={(val) => {
                        field.onChange(val);
                        // Reset dependent fields when basis changes
                        form.setValue("ENTRY_MODE", "");
                        form.setValue("START_TIME", "");
                        form.setValue("END_TIME", "");
                        form.setValue("HOURS_WORKED", "");
                        form.setValue("DAYS_WORKED", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select basis" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[200]">
                        <SelectItem value="HOUR">Hour</SelectItem>
                        <SelectItem value="DAY">Day</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {calcBasis === "DAY" && (
                <FormField
                  control={form.control}
                  name="DAYS_WORKED"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days Worked <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {calcBasis === "HOUR" && (
                <FormField
                  control={form.control}
                  name="ENTRY_MODE"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Mode <span className="text-red-500">*</span></FormLabel>
                      <Select
                      
                        onValueChange={(val) => {
                          field.onChange(val);
                          // Reset dependent fields
                          form.setValue("START_TIME", "");
                          form.setValue("END_TIME", "");
                          form.setValue("HOURS_WORKED", "");
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[200]">
                          <SelectItem value="TIME">Time</SelectItem>
                          <SelectItem value="HOURS">Hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {calcBasis === "HOUR" && entryMode === "TIME" && (
                <>
                  <FormField
                    control={form.control}
                    name="START_TIME"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="END_TIME"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {calcBasis === "HOUR" && entryMode === "HOURS" && (
                <FormField
                  control={form.control}
                  name="HOURS_WORKED"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours Worked <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="REMARKS"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Optional remarks..." className="resize-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-8 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : isEdit ? "Update Attendance" : "Save Attendance"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}