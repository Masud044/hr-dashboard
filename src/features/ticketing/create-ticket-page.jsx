// src/features/ticketing/create-ticket-page.jsx
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { LifeBuoy } from "lucide-react";

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
import { Spinner } from "@/components/ui/spinner";
import { SectionContainer } from "@/components/SectionContainer";
import EntityCombobox from "@/components/shared/entity-combobox";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { useHasPermission } from "@/hooks/use-permission";
import { useUsers } from "@/features/user-management/queries";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";

import { useLookups, useCreateTicket } from "./queries";

const CHANNEL_OPTIONS = ["WEB", "EMAIL", "PHONE", "CHAT", "API"];

const formSchema = z.object({
  SUBJECT: z.string().min(1, "Subject is required").max(200, "Subject cannot exceed 200 characters"),
  CATEGORY_ID: z.string().min(1, "Category is required"),
  PRIORITY_ID: z.string().min(1, "Priority is required"),
  DESCRIPTION: z.string().max(4000, "Description too long").optional(),
  CHANNEL: z.string().default("WEB"),
  REQUESTED_FOR: z.string().optional(),
});

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuthV2();
  const canAssignOthers = useHasPermission("TICKET_VIEW_ALL");
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  const { data: lookups, isLoading: isLoadingLookups } = useLookups();
  const { data: usersData } = useUsers({ limit: 500 });
  const createTicket = useCreateTicket();

  const users = usersData?.data || [];
  const userOpts = useMemo(() => users.map((u) => ({ value: String(u.ID), label: u.USERNAME })), [users]);

  const categoryOpts = useMemo(
    () => (lookups?.categories || []).map((c) => ({ value: String(c.CATEGORY_ID), label: c.CATEGORY_NAME })),
    [lookups]
  );
  const priorityOpts = useMemo(
    () => (lookups?.priorities || []).map((p) => ({ value: String(p.PRIORITY_ID), label: p.PRIORITY_NAME })),
    [lookups]
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      SUBJECT: "",
      CATEGORY_ID: "",
      PRIORITY_ID: "",
      DESCRIPTION: "",
      CHANNEL: "WEB",
      REQUESTED_FOR: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await createTicket.mutateAsync({
        SUBJECT: data.SUBJECT,
        CATEGORY_ID: parseInt(data.CATEGORY_ID),
        PRIORITY_ID: parseInt(data.PRIORITY_ID),
        DESCRIPTION: data.DESCRIPTION || null,
        CHANNEL: data.CHANNEL,
        REQUESTED_FOR: canAssignOthers && data.REQUESTED_FOR ? parseInt(data.REQUESTED_FOR) : undefined,
      });

      toast.success(`Ticket ${res.data?.ticket_number || ""} created.`);

      // Redirect straight to the new ticket's detail page.
      navigate(`/dashboard/tickets/${res.data?.ticket_id}`);
    } catch (error) {
      toast.error(error?.message || "Failed to create ticket. Please try again.");
    }
  };

  const handleCancel = async () => {
    if (form.formState.isDirty) {
      const confirmed = await showConfirmation({
        title: "Discard ticket?",
        description: "You have unsaved changes. Are you sure you want to leave without saving?",
        confirmText: "Discard",
        cancelText: "Keep Editing",
        variant: "destructive",
      });
      if (!confirmed) return;
    }
    navigate("/dashboard/tickets");
  };

  return (
    <SectionContainer variant="dashboard">
      <div className="bg-card rounded-md shadow-sm p-4 mb-4">
        <div className="space-y-0.5">
          <h1 className="text-lg md:text-2xl font-semibold tracking-tight">New Ticket</h1>
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
                  <Link to="/dashboard/tickets">Tickets</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New Ticket</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="bg-card rounded-md shadow-sm p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <LifeBuoy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">New Ticket</h2>
              <p className="text-sm text-muted-foreground">Describe your issue and we'll route it to the right team.</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="SUBJECT"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Subject <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Briefly describe the issue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="CATEGORY_ID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Category <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <EntityCombobox
                          items={categoryOpts}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder={isLoadingLookups ? "Loading..." : "Select a category"}
                          disabled={isLoadingLookups}
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
                  name="PRIORITY_ID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Priority <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <EntityCombobox
                          items={priorityOpts}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder={isLoadingLookups ? "Loading..." : "Select a priority"}
                          disabled={isLoadingLookups}
                          size="md"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="DESCRIPTION"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any details that would help resolve this faster..."
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="CHANNEL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CHANNEL_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {canAssignOthers && (
                <FormField
                  control={form.control}
                  name="REQUESTED_FOR"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requested For</FormLabel>
                      <FormControl>
                        <EntityCombobox
                          items={userOpts}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder={`Defaults to you (${user?.username})`}
                          size="md"
                          className="w-full"
                          showAvatar
                          avatarInTrigger
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={createTicket.isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTicket.isPending}>
                  {createTicket.isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" /> Creating...
                    </>
                  ) : (
                    "Submit Ticket"
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