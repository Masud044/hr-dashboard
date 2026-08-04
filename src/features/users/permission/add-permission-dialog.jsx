// src\features\users\permission\add-permission-dialog.jsx
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { KeyRound } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useCreatePermission, useModules } from "@/features/user-management/queries";
import EntityCombobox from "@/components/shared/entity-combobox";
import { ACTION_OPTIONS, buildPermissionCode, buildPermissionName } from "@/config/permission-actions";

const formSchema = z.object({
  moduleId: z.string().min(1, "Module is required"),
  action: z.string().min(1, "Action is required"),
  permissionName: z
    .string()
    .min(1, "Permission name is required")
    .max(100, "Permission name cannot exceed 100 characters"),
  description: z.string().max(255, "Description cannot exceed 255 characters").optional(),
});

export default function AddPermissionDialog({ open, onOpenChange, showConfirmation }) {
  const createPermissionMutation = useCreatePermission();
  const { data: modules = [], isLoading: isLoadingModules } = useModules();

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

  const {
    formState: { isDirty },
  } = form;

  const moduleId = form.watch("moduleId");
  const action = form.watch("action");

  const selectedModule = modules.find((m) => String(m.ID) === moduleId);
  const permissionCode = buildPermissionCode(selectedModule?.MODULE_NAME, action);
  const actionLabel = ACTION_OPTIONS.find((a) => a.value === action)?.label ?? "";

  // Tracks whether the user has manually typed into Permission Name.
  // Using this ref (instead of RHF's dirtyFields) because setValue()
  // from the auto-fill effect itself marks the field dirty, which would
  // otherwise permanently block further auto-fills after the first one.
  const nameEditedByUser = useRef(false);

  useEffect(() => {
    if (open) {
      form.reset({ moduleId: "", action: "", permissionName: "", description: "" });
      nameEditedByUser.current = false;
    }
  }, [open]);

  // Auto-suggest permission name whenever module/action change, as long
  // as the user hasn't typed a custom name themselves.
  useEffect(() => {
    if (selectedModule && action && !nameEditedByUser.current) {
      form.setValue(
        "permissionName",
        buildPermissionName(selectedModule.MODULE_NAME, actionLabel),
        { shouldValidate: true }
      );
    }
  }, [moduleId, action]);

  const onSubmit = async (data) => {
    try {
      await createPermissionMutation.mutateAsync({
        MODULE_ID: parseInt(data.moduleId),
        PERMISSION_CODE: buildPermissionCode(selectedModule?.MODULE_NAME, data.action),
        PERMISSION_NAME: data.permissionName,
        DESCRIPTION: data.description || null,
      });
      toast.success("Permission created successfully!");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error?.message || "Failed to create permission. Please try again.");
    }
  };

  const handleCancel = async () => {
    if (isDirty && showConfirmation) {
      const confirmed = await showConfirmation({
        title: "Discard changes?",
        description:
          "You have unsaved changes. Are you sure you want to close without saving?",
        confirmText: "Discard",
        cancelText: "Keep Editing",
        variant: "destructive",
      });

      if (!confirmed) return;
    }

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleCancel();
      }}
    >
      
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Add Permission</DialogTitle>
              <DialogDescription>Create a new permission in the system</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-5">
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

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={createPermissionMutation.isPending}
              >
                {createPermissionMutation.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  "Save Permission"
                )}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}