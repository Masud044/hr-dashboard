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
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ── Zod schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  NAME:        z.string().min(1, "Name is required"),
  DESCRIPTION: z.string().optional(),
});

const emptyDefaults = { NAME: "", DESCRIPTION: "" };

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
export function EditProjectTypeSheet({ isOpen, onClose, projectTypeId }) {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });

  // ── Fetch detail ──────────────────────────────────────────────────────────
  // The existing route uses GET / (list) — filter client-side by ID
  // If a GET /:id endpoint exists, swap the queryFn below
  const { data: listData, isLoading: detailLoading } = useQuery({
    queryKey: ["project-types"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project-type`);
      return res.data?.data || res.data || [];
    },
    enabled: !!projectTypeId && isOpen,
  });

  const data = Array.isArray(listData)
    ? listData.find((r) => r.ID === projectTypeId) ?? null
    : null;

  // ── Pre-fill form ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!data) return;
    form.reset({
      NAME:        data.NAME        ?? "",
      DESCRIPTION: data.DESCRIPTION ?? "",
    });
  }, [data, form]);

  // ── Mutation ────────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (formData) =>
      axios.put(`${url}/api/project-type`, { ...formData, ID: projectTypeId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["project-types"]);
      toast.success("Project type updated successfully!");
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update project type.");
    },
  });

  const onSubmit = (formData) => mutation.mutate(formData);

  const handleClose = () => {
    form.reset(emptyDefaults);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-xl overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-[104]">
        <SheetHeader className="mb-4 px-6 pt-6">
          <SheetTitle className="text-lg font-semibold">Edit Project Type</SheetTitle>
          <hr />
        </SheetHeader>

        {detailLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-8">
              <SectionHeading label="Project Type Information" />

              <div className="grid grid-cols-1 gap-y-4 max-w-xl">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="NAME"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </div>

              {/* ── Footer ──────────────────────────────────────────────── */}
              <div className="flex justify-between gap-3 mt-8 pt-4 border-t max-w-xl">
                <SheetClose asChild>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Updating..." : "Update Project Type"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}