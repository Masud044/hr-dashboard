// src/features/ticketing/canned-response-form-page.jsx
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { MessageSquarePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Spinner } from "@/components/ui/spinner";
import { SectionContainer } from "@/components/SectionContainer";
import EntityCombobox from "@/components/shared/entity-combobox";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";

import { useLookups, useCreateCannedResponse } from "./queries";

const formSchema = z.object({
  TITLE: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  BODY: z.string().min(1, "Body is required"),
  CATEGORY_ID: z.string().optional(),
});

export default function CannedResponseFormPage() {
  const navigate = useNavigate();
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();
  const { data: lookups } = useLookups();
  const createCannedResponse = useCreateCannedResponse();

  const categoryOpts = useMemo(
    () => (lookups?.categories || []).map((c) => ({ value: String(c.CATEGORY_ID), label: c.CATEGORY_NAME })),
    [lookups]
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { TITLE: "", BODY: "", CATEGORY_ID: "" },
  });

  const onSubmit = async (data) => {
    try {
      await createCannedResponse.mutateAsync({
        TITLE: data.TITLE,
        BODY: data.BODY,
        CATEGORY_ID: data.CATEGORY_ID ? parseInt(data.CATEGORY_ID) : null,
      });
      toast.success("Canned response created.");
      navigate("/dashboard/tickets/canned-responses");
    } catch (error) {
      toast.error(error?.message || "Failed to create canned response.");
    }
  };

  const handleCancel = async () => {
    if (form.formState.isDirty) {
      const confirmed = await showConfirmation({
        title: "Discard changes?",
        description: "You have unsaved changes. Are you sure you want to leave without saving?",
        confirmText: "Discard",
        cancelText: "Keep Editing",
        variant: "destructive",
      });
      if (!confirmed) return;
    }
    navigate("/dashboard/tickets/canned-responses");
  };

  return (
    <SectionContainer variant="dashboard">
      <div className="bg-card rounded-md shadow-sm p-4 mb-4">
        <div className="space-y-0.5">
          <h1 className="text-lg md:text-2xl font-semibold tracking-tight">New Canned Response</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard/tickets/canned-responses">Canned Responses</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="bg-card rounded-md shadow-sm p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquarePlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">New Canned Response</h2>
              <p className="text-sm text-muted-foreground">Reusable reply agents can insert into ticket comments.</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="TITLE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Password Reset Instructions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="CATEGORY_ID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <EntityCombobox
                        items={categoryOpts}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Optional grouping"
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
                name="BODY"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Body <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write the reusable reply text..."
                        className="resize-none"
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={createCannedResponse.isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCannedResponse.isPending}>
                  {createCannedResponse.isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" /> Creating...
                    </>
                  ) : (
                    "Save Response"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <ConfirmationDialog />
    </SectionContainer>
  );
}