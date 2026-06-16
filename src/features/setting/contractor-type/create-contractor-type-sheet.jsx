import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ── Zod schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  NAME: z.string().min(1, "Name is required"),
});

const defaultValues = { NAME: "" };

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
export function CreateContractorTypeSheet({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (formData) =>
      axios.post(`${url}/api/contractor-type`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["contractor-types"]);
      toast.success("Contractor type created successfully!");
      form.reset(defaultValues);
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to create contractor type.");
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  const handleClose = () => {
    form.reset(defaultValues);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
       <SheetContent className="sm:max-w-xl overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-[104]">
        <SheetHeader className="mb-4 px-6 pt-6">
          <SheetTitle className="text-lg font-semibold">Add Contractor Type</SheetTitle>
          <hr />
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-8">
            <SectionHeading label="Contractor Type Information" />

            <div className="grid grid-cols-1 gap-y-4 max-w-xl">
              <FormField
                control={form.control}
                name="NAME"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter contractor type name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <div className="flex justify-between gap-3 mt-8 pt-4 border-t max-w-xl">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Contractor Type"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}