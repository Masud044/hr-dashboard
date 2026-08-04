// src\features\users\permission\update-permission-page.jsx
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useNavigate, useParams, Link } from "react-router-dom";

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
import {
  useCreatePermission,
  useDeletePermission,
  useModules,
} from "@/features/user-management/queries";
import { usePermissions } from "./queries";
import EntityCombobox from "@/components/shared/entity-combobox";
import { ACTION_OPTIONS, buildPermissionCode, buildPermissionName, toModulePrefix } from "@/config/permission-actions";
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

export default function UpdatePermissionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const deletePermissionMutation = useDeletePermission();
  const createPermissionMutation = useCreatePermission();
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();
  
  const { data: modules = [], isLoading: isLoadingModules } = useModules();
  const { data: permissions = [], isLoading: isLoadingPermissions } = usePermissions();
  
  const permission = permissions.find((p) => String(p.ID) === String(id));

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

  const nameEditedByUser = useRef(false);
  const initializedFor = useRef(null);

  useEffect(() => {
    if (!permission) return;
    if (initializedFor.current === permission.ID && modules.length === 0) return;

    const mod = modules.find((m) => m.ID === permission.MODULE_ID);
    const modPrefix = mod ? `${toModulePrefix(mod.MODULE_NAME)}_` : "";
    const code = permission.PERMISSION_CODE || "";
    const suffix = code.startsWith(modPrefix) ? code.slice(modPrefix.length) : "";
    const derivedAction = ACTION_OPTIONS.some((a) => a.value === suffix) ? suffix : "";

    form.reset({
      moduleId: permission.MODULE_ID ? String(permission.MODULE_ID) : "",
      action: derivedAction,
      permissionName: permission.PERMISSION_NAME || "",
      description: permission.DESCRIPTION || "",
    });
    initializedFor.current = permission.ID;
    nameEditedByUser.current = false;
  }, [permission, modules, form]);

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
    if (!permission?.ID) {
      toast.error("Permission ID is missing");
      return;
    }

    try {
      // Delete old, create new (API has no PUT for permissions)
      await deletePermissionMutation.mutateAsync(permission.ID);
      await createPermissionMutation.mutateAsync({
        MODULE_ID: parseInt(data.moduleId),
        PERMISSION_CODE: buildPermissionCode(selectedModule?.MODULE_NAME, data.action),
        PERMISSION_NAME: data.permissionName,
        DESCRIPTION: data.description || null,
      });

      toast.success("Permission updated successfully!");
      navigate("/dashboard/permission");
    } catch (error) {
      toast.error(error?.message || "Failed to update permission. Please try again.");
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

  const isSubmitting = deletePermissionMutation.isPending || createPermissionMutation.isPending;

  if (isLoadingPermissions || !permission) {
    return (
      <div className="flex items-center justify-center p-8 bg-card rounded-md shadow-sm">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Loading permission details...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-card rounded-md shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-lg md:text-2xl font-semibold tracking-tight">Update Permission</h1>
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
                  <BreadcrumbPage>Update Permission</BreadcrumbPage>
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
              <h2 className="text-lg font-semibold">Update Permission</h2>
              <p className="text-sm text-muted-foreground">
                Edit permission details for "{permission?.PERMISSION_NAME}"
              </p>
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
                        disabled={isLoadingModules || isSubmitting}
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!moduleId || isSubmitting}
                    >
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
                    {permissionCode || permission?.PERMISSION_CODE || "Select module & action"}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" /> Updating...
                    </>
                  ) : (
                    "Update Permission"
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