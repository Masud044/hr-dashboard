// src/features/worker-attendance/attendance-form-page.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";
import DateInput from "@/components/shared/DateInput";
import { useHasPermission } from "@/hooks/use-permission";

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
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { Loader2 } from "lucide-react";
import EntityCombobox from "@/components/shared/entity-combobox";
const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const attendanceSchema = z
  .object({
    ATTENDANCE_DATE: z.string().min(1, "Date is required"),
    WORKER_ID: z.coerce.number().min(1, "Worker is required"),
    PROJECT_ID: z.coerce.number().min(1, "Project is required"),
    HOURS_INPUT: z.any().optional(),
    MINUTES_INPUT: z.any().optional(),
    REMARKS: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const h = parseInt(data.HOURS_INPUT, 10) || 0;
    const m = parseInt(data.MINUTES_INPUT, 10) || 0;
    if (h <= 0 && m <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter hours and/or minutes worked",
        path: ["HOURS_INPUT"],
      });
    }
    if (m < 0 || m > 59) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minutes must be between 0 and 59",
        path: ["MINUTES_INPUT"],
      });
    }
  });

const defaultValues = {
  ATTENDANCE_DATE: new Date().toISOString().split("T")[0],
  WORKER_ID: "",
  PROJECT_ID: "",
  HOURS_INPUT: "",
  MINUTES_INPUT: "",
  REMARKS: "",
};

function decimalToHoursMinutes(decimalHours) {
  if (decimalHours == null || isNaN(decimalHours))
    return { hours: "", minutes: "" };
  const totalMinutes = Math.round(Number(decimalHours) * 60);
  return {
    hours: String(Math.floor(totalMinutes / 60)),
    minutes: String(totalMinutes % 60),
  };
}

export function AttendanceFormPage() {
  const { user } = useAuthV2();
  const navigate = useNavigate();
  const { attendanceId } = useParams();
  const queryClient = useQueryClient();
  const isEdit = !!attendanceId;

  const canCreate = useHasPermission("ATTENDANCE_CREATE");
const canEdit = useHasPermission("ATTENDANCE_EDIT");
const hasAccess = isEdit ? canEdit : canCreate;

  const form = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues,
  });

  const { data: workers = [], isLoading: workersLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/worker`);
      return res.data?.data || [];
    },
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project`);
      return res.data?.data || [];
    },
  });

  const { data: fetchedData, isLoading: fetchedDataLoading } = useQuery({
    queryKey: ["worker-attendance", attendanceId],
    queryFn: async () => {
      const res = await axios.get(
        `${url}/api/worker-attendance/${attendanceId}`,
      );
      return res.data?.data;
    },
    enabled: isEdit,
  });

  const workerOpts = workers.map((w) => ({
  value: String(w.WORKER_ID),
  label: w.WORKER_NAME,
}));

const projectOpts = projects.map((p) => ({
  value: String(p.P_ID),
  label: p.P_NAME,
}));

  const isPageLoading =
    workersLoading || projectsLoading || (isEdit && fetchedDataLoading);

  useEffect(() => {
    if (fetchedData) {
      const { hours, minutes } = decimalToHoursMinutes(
        fetchedData.HOURS_WORKED,
      );
      form.reset({
        ...defaultValues,
        ...fetchedData,
        WORKER_ID: fetchedData.WORKER_ID ? String(fetchedData.WORKER_ID) : "",
        PROJECT_ID: fetchedData.PROJECT_ID
          ? String(fetchedData.PROJECT_ID)
          : "",
        REMARKS: fetchedData.REMARKS ?? "",
        HOURS_INPUT: hours,
        MINUTES_INPUT: minutes,
      });
    } else if (!isEdit) {
      form.reset(defaultValues);
    }
  }, [isEdit, fetchedData, form]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const h = parseInt(formData.HOURS_INPUT, 10) || 0;
      const m = parseInt(formData.MINUTES_INPUT, 10) || 0;

      const payload = {
        ATTENDANCE_DATE: formData.ATTENDANCE_DATE,
        WORKER_ID: formData.WORKER_ID,
        PROJECT_ID: formData.PROJECT_ID,
        HOURS_WORKED: Math.round((h + m / 60) * 100) / 100,
        REMARKS: formData.REMARKS,
      };

      if (!isEdit) {
        payload.CREATED_BY = user?.username;
      }

      if (isEdit) {
        payload.ATTENDANCE_ID = attendanceId;
        payload.UPDATED_BY = user?.username;
        return axios.put(`${url}/api/worker-attendance`, payload);
      } else {
        return axios.post(`${url}/api/worker-attendance`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["worker-attendance"]);
      toast.success(
        `Attendance ${isEdit ? "updated" : "created"} successfully!`,
      );
      form.reset(defaultValues);
      handleClose();
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} attendance.`,
      ),
  });

  const onSubmit = (data) => mutation.mutate(data);

  const handleClose = () => {
    form.reset(defaultValues);
    navigate(-1);
  };

  // ── Loading state ───────────────────────────
  // if (isPageLoading) {
  //   return (
  //     <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 px-4">
  //       <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card shadow-sm">
  //         <Loader2 className="h-5 w-5 animate-spin text-primary" />
  //       </div>
  //       <div className="text-center">
  //         <p className="text-sm font-semibold text-foreground">
  //           Fetching Records
  //         </p>
  //         <p className="mt-1 text-sm text-muted-foreground">
  //           Loading attendance details...
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  if (!hasAccess) {
  return (
    <div className="mx-auto w-full max-w-2xl py-16 px-4 text-center">
      <h2 className="text-lg font-semibold text-foreground">
        You don't have permission to {isEdit ? "edit" : "create"} attendance records.
      </h2>
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="mt-6"
      >
        Go Back
      </Button>
    </div>
  );
}
  return (
    <div className="mx-auto w-full max-w-2xl py-8 px-4">
      <div className="mb-4">
        <h1 className="text-lg font-semibold">
          {isEdit ? "Edit" : "Add"} Attendance
        </h1>
        <hr className="mt-4" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            {/* <FormField
              control={form.control}
              name="ATTENDANCE_DATE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Attendance Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name="ATTENDANCE_DATE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Attendance Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <DateInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="WORKER_ID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Worker <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={String(field.value)}
                    key={`worker-select-${field.value || "empty"}`}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select worker" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[200]">
                      {workers.map((w) => (
                        <SelectItem
                          key={w.WORKER_ID}
                          value={String(w.WORKER_ID)}
                        >
                          {w.WORKER_NAME}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
  control={form.control}
  name="WORKER_ID"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Worker <span className="text-red-500">*</span>
      </FormLabel>
      <FormControl>
        <EntityCombobox
          items={workerOpts}
          value={String(field.value || "")}
          onValueChange={field.onChange}
          placeholder="Select worker"
          size="md"
          className="w-full"
          showAvatar
          avatarInTrigger
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

            {/* <FormField
              control={form.control}
              name="PROJECT_ID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Project <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={String(field.value)}
                    key={`project-select-${field.value || "empty"}`}
                  >
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
            /> */}
            <FormField
  control={form.control}
  name="PROJECT_ID"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Project <span className="text-red-500">*</span>
      </FormLabel>
      <FormControl>
        <EntityCombobox
          items={projectOpts}
          value={String(field.value || "")}
          onValueChange={field.onChange}
          placeholder="Select project"
          className="w-full"
          size="md"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

            <FormField
              control={form.control}
              name="HOURS_INPUT"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Hours <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="e.g. 2"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="MINUTES_INPUT"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minutes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="59"
                      placeholder="e.g. 30"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="REMARKS"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Optional remarks..."
                        className="resize-none"
                      />
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
              {mutation.isPending
                ? "Saving..."
                : isEdit
                  ? "Update Attendance"
                  : "Save Attendance"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
