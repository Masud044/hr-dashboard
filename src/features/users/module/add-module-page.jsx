// src/features/users/module/add-module-page.jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

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
import { LayoutGrid } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

import { useCreateModule } from "./queries";
import EntityCombobox from "@/components/shared/entity-combobox";
import { MODULE_OPTIONS } from "@/config/module-options";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";

const formSchema = z.object({
  moduleName: z.string().min(1, "Module name is required"),
  description: z.string().max(255, "Description cannot exceed 255 characters").optional(),
  sequenceNo: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), { message: "Sequence must be a number" }),
});

export default function AddModulePage() {
  const navigate = useNavigate();
  const createModuleMutation = useCreateModule();
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moduleName: "",
      description: "",
      sequenceNo: "",
    },
  });

  useEffect(() => {
    form.reset({ moduleName: "", description: "", sequenceNo: "" });
  }, [form]);

  const onSubmit = async (data) => {
    try {
      await createModuleMutation.mutateAsync({
        MODULE_NAME: data.moduleName,
        DESCRIPTION: data.description || null,
        SEQUENCE_NO: data.sequenceNo ? parseInt(data.sequenceNo) : null,
      });
      toast.success("Module created successfully!");
      navigate("/dashboard/module");
    } catch (error) {
      toast.error(error?.message || "Failed to create module. Please try again.");
    }
  };

  const handleCancel = async () => {
    if (form.formState.isDirty && showConfirmation) {
      const confirmed = await showConfirmation({
        title: "Discard changes?",
        description: "You have unsaved changes. Are you sure you want to leave without saving?",
        confirmText: "Discard",
        cancelText: "Keep Editing",
        variant: "destructive",
      });
      if (!confirmed) return;
    }
    navigate("/dashboard/module");
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-card rounded-md shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-lg md:text-2xl font-semibold tracking-tight">Add Module</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>User Management</BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard/module">Modules</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Add Module</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-card rounded-md shadow-sm p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Add Module</h2>
              <p className="text-sm text-muted-foreground">Create a new module in the system</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="moduleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <EntityCombobox
                        items={MODULE_OPTIONS}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select module..."
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
                name="sequenceNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sequence No.</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this module..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createModuleMutation.isPending}>
                  {createModuleMutation.isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" /> Creating...
                    </>
                  ) : (
                    "Save Module"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      
      <ConfirmationDialog />
    </div>
  );
}