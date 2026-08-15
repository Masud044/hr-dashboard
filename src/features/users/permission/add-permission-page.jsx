// src\features\users\permission\add-permission-page.jsx
import { useEffect, useMemo, useRef } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { KeyRound } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useCreatePermission, useModules } from "@/features/user-management/queries";
import EntityCombobox from "@/components/shared/entity-combobox";
import { ACTION_OPTIONS, buildPermissionCode, buildPermissionName } from "@/config/permission-actions";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";

const formSchema = z.object({
  moduleId: z.string().min(1, "Module is required"),
  action: z.string().min(1, "Action is required"),
  permissionName: z
    .string()
    .min(1, "Permission name is required")
    .max(100, "Permission name cannot exceed 100 characters"),
  description: z.string().max(255, "Description cannot exceed 255 characters").optional(),
});

export default function AddPermissionPage() {
  const navigate = useNavigate();
  const createPermissionMutation = useCreatePermission();
  const { data: modules = [], isLoading: isLoadingModules } = useModules();
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  const moduleOpts = useMemo(
    () => modules.map((m) => ({ value: String(m.ID), label: m.MODULE_NAME })),
    [modules]
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moduleId: "",
      action: "",
      permissionName: "",
      description: "",
    },
  });

  const moduleId = form.watch("moduleId");
  const action = form.watch("action");

  const selectedModule = modules.find((m) => String(m.ID) === moduleId);
  const permissionCode = buildPermissionCode(selectedModule?.MODULE_NAME, action);
  const actionLabel = ACTION_OPTIONS.find((a) => a.value === action)?.label ?? "";

  // Tracks whether the user has manually typed into Permission Name.
  const nameEditedByUser = useRef(false);

  useEffect(() => {
    form.reset({ moduleId: "", action: "", permissionName: "", description: "" });
    nameEditedByUser.current = false;
  }, [form]);

  // Auto-suggest permission name whenever module/action change
  useEffect(() => {
    if (selectedModule && action && !nameEditedByUser.current) {
      form.setValue(
        "permissionName",
        buildPermissionName(selectedModule.MODULE_NAME, actionLabel),
        { shouldValidate: true }
      );
    }
  }, [moduleId, action, selectedModule, actionLabel, form]);

  const onSubmit = async (data) => {
    try {
      await createPermissionMutation.mutateAsync({
        MODULE_ID: parseInt(data.moduleId),
        PERMISSION_CODE: buildPermissionCode(selectedModule?.MODULE_NAME, data.action),
        PERMISSION_NAME: data.permissionName,
        DESCRIPTION: data.description || null,
      });
      toast.success("Permission created successfully!");
      navigate("/dashboard/permission");
    } catch (error) {
      toast.error(error?.message || "Failed to create permission. Please try again.");
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
    navigate("/dashboard/permission");
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-card rounded-md shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-lg md:text-2xl font-semibold tracking-tight">Add Permission</h1>
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
                    <Link to="/dashboard/permission">Permissions</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Add Permission</BreadcrumbPage>
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
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Add Permission</h2>
              <p className="text-sm text-muted-foreground">Create a new permission in the system</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="moduleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Module <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <EntityCombobox
                        items={moduleOpts}
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v);
                          form.setValue("action", "", { shouldValidate: false });
                        }}
                        placeholder={isLoadingModules ? "Loading modules..." : "Select a module"}
                        disabled={isLoadingModules}
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
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Action <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!moduleId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={moduleId ? "Select an action" : "Select a module first"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTION_OPTIONS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-1.5">
                <FormLabel>Permission Code</FormLabel>
                <div className="h-9 flex items-center rounded-md border border-input bg-muted px-3">
                  <code className="text-sm font-mono text-muted-foreground">
                    {permissionCode || "Select module & action"}
                  </code>
                </div>
              </div>

              <FormField
                control={form.control}
                name="permissionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Permission Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. View Employee"
                        {...field}
                        onChange={(e) => {
                          nameEditedByUser.current = true;
                          field.onChange(e);
                        }}
                      />
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
                        placeholder="Brief description of this permission..."
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
                <Button type="submit" disabled={createPermissionMutation.isPending}>
                  {createPermissionMutation.isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" /> Creating...
                    </>
                  ) : (
                    "Save Permission"
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