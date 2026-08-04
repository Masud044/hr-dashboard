import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import {
  Dialog, DialogContent, DialogHeader,
  DialogFooter, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useCreateUser, useRoles } from "./queries";
import { useWorkers } from "@/features/worker/queries";
import { useOwnerInfoList } from "@/features/setting/owner-info/queries";
import EntityCombobox from "@/components/shared/entity-combobox";
import MultiSelectCombobox from "@/components/shared/multi-select-combobox";

const formSchema = z.object({
  username: z.string().min(1, "Username is required").max(100),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  userType: z.enum(["WORKER", "OWNER"]).optional(),
  refId: z.coerce.number().optional().nullable(),
  roleIds: z.array(z.string()).min(1, "At least one role is required"),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => !data.userType || (data.refId && data.refId >= 1), {
    message: "Please make a selection",
    path: ["refId"],
  });

const defaultValues = {
  username: "",
  password: "",
  confirmPassword: "",
  userType: "",
  refId: "",
  roleIds: [],
  // locationId: null,
};

export default function AddUserDialog({ open, onOpenChange, showConfirmation }) {
  const createMutation = useCreateUser();
  const { data: roles = [] } = useRoles();
  const { data: workers = [] } = useWorkers();
  const { data: owners = [] } = useOwnerInfoList();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { formState: { isDirty } } = form;
  const userType = form.watch("userType");

  useEffect(() => {
    if (open) form.reset(defaultValues);
  }, [open]);

  // Reset refId whenever the type changes
  useEffect(() => {
    form.setValue("refId", "");
  }, [userType]);

  const roleOptions = useMemo(
    () => roles.map((r) => ({ value: String(r.ID), label: r.ROLE_NAME })),
    [roles],
  );

  const refOptions = useMemo(() => {
    if (userType === "WORKER") {
      return workers.map((w) => ({ value: String(w.WORKER_ID), label: w.WORKER_NAME }));
    }
    if (userType === "OWNER") {
      return owners.map((o) => ({ value: String(o.ID), label: o.O_NAME }));
    }
    return [];
  }, [userType, workers, owners]);

  const onSubmit = async (data) => {
    try {
      await createMutation.mutateAsync({
        USERNAME: data.username,
        PASSWORD: data.password,
        USER_TYPE: data.userType,
        REF_ID: data.refId,
        roleIds: data.roleIds,
        // LOCATION_ID: data.locationId || null,
        STATUS: "ACTIVE",
      });
      toast.success("User created successfully!");
      form.reset(defaultValues);
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.message || "Failed to create user.");
    }
  };

  const handleCancel = async () => {
    if (isDirty && showConfirmation) {
      const confirmed = await showConfirmation({
        title: "Discard changes?",
        description: "You have unsaved changes. Are you sure you want to close?",
        confirmText: "Discard",
        cancelText: "Keep Editing",
        variant: "destructive",
      });
      if (!confirmed) return;
    }
    form.reset(defaultValues);
    onOpenChange(false);
  };

  const isSubmitting = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleCancel(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Create User</DialogTitle>
              <DialogDescription>Add a new system user account</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-4">
            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Username <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. john.doe" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Min. 6 characters" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Confirm Password <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Re-enter password" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* User Type */}
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="WORKER">Worker</SelectItem>
                      <SelectItem value="OWNER">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ref (Worker / Owner) */}
            {userType && (
              <FormField
                control={form.control}
                name="refId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {userType === "WORKER" ? "Worker" : "Owner"} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <EntityCombobox
                        items={refOptions}
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(v) => field.onChange(v ? Number(v) : "")}
                        placeholder={`Search ${userType === "WORKER" ? "worker" : "owner"}...`}
                        showAvatar
                        avatarInTrigger
                        size="md"
                        className="w-full"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Roles */}
            <FormField
              control={form.control}
              name="roleIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Roles <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <MultiSelectCombobox
                      items={roleOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select roles..."
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location — kept for later, currently disabled */}
            {/* <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                </FormItem>
              )}
            /> */}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}