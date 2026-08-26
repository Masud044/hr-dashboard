// src/features/ticketing/edit-ticket-page.jsx
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Pencil } from "lucide-react";

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
import DateInput from "@/components/shared/DateInput";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";

import { useLookups, useTicket, useUpdateTicket } from "./queries";

const LOCKED_STATUSES = ["CLOSED", "CANCELLED"];

const formSchema = z.object({
  SUBJECT: z.string().min(1, "Subject is required").max(200, "Subject cannot exceed 200 characters"),
  PRIORITY_ID: z.string().min(1, "Priority is required"),
  DESCRIPTION: z.string().max(4000, "Description too long").optional(),
  DUE_DATE: z.string().optional(),
});

export default function EditTicketPage() {
  const { id } = useParams();
  const ticketId = id;
  const navigate = useNavigate();
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  const { data: lookups, isLoading: isLoadingLookups } = useLookups();
  const { data, isLoading } = useTicket(ticketId);
  const updateTicket = useUpdateTicket();

  const ticket = data?.ticket;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      SUBJECT: "",
      PRIORITY_ID: "",
      DESCRIPTION: "",
      DUE_DATE: "",
    },
  });

  const priorityOpts = useMemo(
    () => (lookups?.priorities || []).map((p) => ({ value: String(p.PRIORITY_ID), label: p.PRIORITY_NAME })),
    [lookups]
  );

  // Populate defaults once the ticket arrives (useForm can't know async
  // defaults upfront). Guarded so polling refetches don't clobber edits.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!ticket || hydrated) return;
    form.reset({
      SUBJECT: ticket.SUBJECT || "",
      PRIORITY_ID: ticket.PRIORITY_ID != null ? String(ticket.PRIORITY_ID) : "",
      DESCRIPTION: ticket.DESCRIPTION || "",
      DUE_DATE: ticket.DUE_DATE ? String(ticket.DUE_DATE).slice(0, 10) : "",
    });
    setHydrated(true);
  }, [ticket, hydrated, form]);

  const isLocked = !!ticket && LOCKED_STATUSES.includes(ticket.STATUS_NAME);

  const onSubmit = async (values) => {
    try {
      await updateTicket.mutateAsync({
        ticketId,
        SUBJECT: values.SUBJECT,
        DESCRIPTION: values.DESCRIPTION || null,
        PRIORITY_ID: parseInt(values.PRIORITY_ID, 10),
        DUE_DATE: values.DUE_DATE || null,
      });

      toast.success(`Ticket ${ticket?.TICKET_NUMBER || ""} updated.`);

      navigate(`/dashboard/tickets/${ticketId}`);
    } catch (error) {
      toast.error(error?.message || "Failed to update ticket. Please try again.");
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
    navigate(`/dashboard/tickets/${ticketId}`);
  };

  return (
    <SectionContainer variant="dashboard">
      <Breadcrumb className="mb-4">
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
            <BreadcrumbLink asChild>
              <Link to={`/dashboard/tickets/${ticketId}`}>
                {ticket?.TICKET_NUMBER || "Ticket"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {isLoading && (
        <div className="bg-card border border-border rounded-md p-8 text-center text-sm text-muted-foreground">
          Loading ticket...
        </div>
      )}

      {!isLoading && !ticket && (
        <div className="bg-card border border-border rounded-md p-8 text-center text-sm text-muted-foreground">
          Ticket not found.
        </div>
      )}

      {!isLoading && ticket && isLocked && (
        <div className="bg-card border border-border rounded-md p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            This ticket cannot be edited because it is {ticket.STATUS_NAME}.
          </p>
          <Button variant="outline" onClick={() => navigate(`/dashboard/tickets/${ticketId}`)}>
            Back to Ticket
          </Button>
        </div>
      )}

      {!isLoading && ticket && !isLocked && (
        <div className="bg-card border border-border rounded-md p-4">
          <div className="max-w-3xl mx-auto p-5 border border-border rounded-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-11 w-11 rounded-md border border-border flex items-center justify-center shrink-0">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Edit Ticket</h1>
                <p className="text-sm text-muted-foreground">Update the details of {ticket.TICKET_NUMBER}.</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
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

                  <FormField
                    control={form.control}
                    name="DUE_DATE"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <DateInput value={field.value} onChange={field.onChange} />
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

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={updateTicket.isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateTicket.isPending}>
                    {updateTicket.isPending ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" /> Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}

      <ConfirmationDialog />
    </SectionContainer>
  );
}
