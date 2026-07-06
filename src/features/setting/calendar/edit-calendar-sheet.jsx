// src\features\setting\calendar\edit-calendar-sheet.jsx
import { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ── Constants ─────────────────────────────────────────────────────────────────
const WORKING_STATUS_OPTIONS = [
  { value: "WORKING", label: "Working" },
  { value: "HOLIDAY", label: "Holiday" },
  { value: "WEEKEND", label: "Weekend" },
  { value: "HALFDAY", label: "Half Day" },
];

const DAY_NAME_OPTIONS = [
  "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
];

const MONTH_OPTIONS = [
  { value: 1,  label: "January" },
  { value: 2,  label: "February" },
  { value: 3,  label: "March" },
  { value: 4,  label: "April" },
  { value: 5,  label: "May" },
  { value: 6,  label: "June" },
  { value: 7,  label: "July" },
  { value: 8,  label: "August" },
  { value: 9,  label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

// ── Zod schema ────────────────────────────────────────────────────────────────
const calendarSchema = z.object({
  day:                z.string().min(1, "Date is required"),
  dayName:            z.string().min(1, "Day name is required"),
  monthId:            z.coerce.number().min(1, "Month is required"),
  workingStatus:      z.string().min(1, "Working status is required"),
  holidayDescription: z.string().optional(),
  lastUpdatedBy:      z.coerce.number().default(500),
});

const emptyDefaults = {
  day:                "",
  dayName:            "",
  monthId:            "",
  workingStatus:      "",
  holidayDescription: "",
  lastUpdatedBy:      500,
};

// ── Section heading helper ────────────────────────────────────────────────────
function SectionHeading({ label }) {
  return (
    <div className="flex items-center gap-2 mt-2 mb-3">
      <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function EditCalendarSheet({ isOpen, onClose, dayId }) {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(calendarSchema),
    defaultValues: emptyDefaults,
  });

  // ── Auto-fill dayName when date changes ──────────────────────────────────
  const handleDateChange = (value, field) => {
    field.onChange(value);
    if (value) {
      const date = new Date(value);
      if (!isNaN(date)) {
        const names = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        form.setValue("dayName", names[date.getDay()]);
        form.setValue("monthId", date.getMonth() + 1);
      }
    }
  };

  // ── Fetch calendar day detail ─────────────────────────────────────────────
  const { data, isLoading: detailLoading } = useQuery({
    queryKey: ["calendar-day-detail", dayId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/calendar/${dayId}`);
      return res.data?.data || null;
    },
    enabled: !!dayId && isOpen,
  });

  // ── Pre-fill form when data arrives ──────────────────────────────────────
  useEffect(() => {
    if (!data) return;
    form.reset({
      day:                data.DAY                ?? "",
      dayName:            data.DAY_NAME           ?? "",
      monthId:            data.MONTH_ID           ?? "",
      workingStatus:      data.WORKING_STATUS     ?? "",
      holidayDescription: data.HOLIDAY_DESCRIPTION ?? "",
      lastUpdatedBy:      data.LAST_UPDATED_BY    ?? 500,
    });
  }, [data, form]);

  // ── Mutation ────────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (formData) => axios.put(`${url}/api/calendar/${dayId}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["calendar-days"]);
      queryClient.invalidateQueries(["calendar-day-detail", dayId]);
      toast.success("Calendar day updated successfully!");
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update calendar day.");
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  const handleClose = () => {
    form.reset(emptyDefaults);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="!w-screen !h-screen !max-w-none overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-[104]">
        <SheetHeader className="mb-4 px-6 pt-6">
          <SheetTitle className="text-lg font-semibold">Edit Calendar Day</SheetTitle>
          <hr />
        </SheetHeader>

        {detailLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-8">

              {/* ── DAY INFO ─────────────────────────────────────────── */}
              <SectionHeading label="Day Information" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">

                {/* Date */}
                <FormField
                  control={form.control}
                  name="day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          onChange={(e) => handleDateChange(e.target.value, field)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Day Name */}
                <FormField
                  control={form.control}
                  name="dayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day Name <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day name" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[200]">
                          {DAY_NAME_OPTIONS.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Month */}
                <FormField
                  control={form.control}
                  name="monthId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month <span className="text-red-500">*</span></FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[200]">
                          {MONTH_OPTIONS.map((m) => (
                            <SelectItem key={m.value} value={String(m.value)}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Working Status */}
                <FormField
                  control={form.control}
                  name="workingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Working Status <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[200]">
                          {WORKING_STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Holiday Description */}
                <FormField
                  control={form.control}
                  name="holidayDescription"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Holiday Description</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Eid ul-Adha (optional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ── FOOTER ───────────────────────────────────────────── */}
              <div className="flex justify-between gap-3 mt-8 pt-4 border-t">
                <SheetClose asChild>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Updating..." : "Update Day"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}