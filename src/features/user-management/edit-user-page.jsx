import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { useNavigate, useParams, Link } from "react-router-dom";
import { UserCog } from "lucide-react";

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionContainer } from "@/components/SectionContainer";

import { useUserById, useUpdateUser } from "./queries";
import { useWorkers } from "@/features/worker/queries";
import { useOwnerInfoList } from "@/features/setting/owner-info/queries";
import EntityCombobox from "@/components/shared/entity-combobox";

const formSchema = z.object({
  username: z.string().min(1, "Username is required").max(100),
  userType: z.enum(["WORKER", "OWNER"], { required_error: "Type is required" }),
  refId: z.coerce.number({ required_error: "Please select a " }).min(1, "Please make a selection"),
});

const defaultValues = {
  username: "",
  userType: "",
  refId: "",
};

export default function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUserById(id);
  const updateMutation = useUpdateUser();
  const { data: workers = [] } = useWorkers();
  const { data: owners = [] } = useOwnerInfoList();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const userType = form.watch("userType");

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.USERNAME || "",
        userType: user.USER_TYPE || "",
        refId: user.REF_ID || "",
      });
    }
  }, [user]);

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
      await updateMutation.mutateAsync({
        id,
        data: {
          USERNAME: data.username,
          USER_TYPE: data.userType,
          REF_ID: data.refId,
          STATUS: user?.STATUS || "ACTIVE",
        },
      });
      toast.success("User updated successfully!");
      navigate(`/dashboard/user-management/users/${id}`);
    } catch (err) {
      toast.error(err?.message || "Failed to update user.");
    }
  };

  const isSubmitting = updateMutation.isPending;

  if (isLoading) {
    return (
      <SectionContainer>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full max-w-2xl" />
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/">Dashboard</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard/user-management">Users</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/dashboard/user-management/users/${id}`}>{user?.USERNAME}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserCog className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Edit User</CardTitle>
              <CardDescription>Editing "{user?.USERNAME}"</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              {/* User Type */}
              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Type <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue("refId", "");
                      }}
                      value={field.value}
                      disabled={isSubmitting}
                    >
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

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/dashboard/user-management/users/${id}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </SectionContainer>
  );
}