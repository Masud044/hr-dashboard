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
import DateInput from "@/components/shared/DateInput";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";

import { useLookups, useCreateTicket } from "./queries";
import {
  useProjects,
  useContractors,
  useOwnerInfoList,
  useOwnerInfoByProjectId,
} from "./lookup-queries";

const TICKET_TYPE_OPTIONS = [
  { value: "CHANGE_REQUEST", label: "Change Request" },
  { value: "VARIATION", label: "Variation" },
  { value: "SPECIAL_NOTE", label: "Special Note" },
];

const formSchema = z
  .object({
    SUBJECT: z.string().min(1, "Subject is required").max(200, "Subject cannot exceed 200 characters"),
    TICKET_TYPE: z.string().min(1, "Ticket type is required"),
    PROJECT_ID: z.string().optional(),
    CONTRACTOR_ID: z.string().optional(),
    OWNER_ID: z.string().optional(),
    CATEGORY_ID: z.string().optional(),
    PRIORITY_ID: z.string().min(1, "Priority is required"),
    DESCRIPTION: z.string().max(4000, "Description too long").optional(),
    DUE_DATE: z.string().optional(),
    CHANGE_AMOUNT: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.TICKET_TYPE === "VARIATION") {
      if (!val.CHANGE_AMOUNT || Number(val.CHANGE_AMOUNT) <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["CHANGE_AMOUNT"],
          message: "Change amount is required for variations",
        });
      }
    }
  });

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  const { data: lookups, isLoading: isLoadingLookups } = useLookups();
  const { data: projects = [] } = useProjects();
  const { data: contractors = [] } = useContractors();
  const { data: ownerInfoList = [] } = useOwnerInfoList();
  const createTicket = useCreateTicket();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      SUBJECT: "",
      TICKET_TYPE: "",
      PROJECT_ID: "",
      CONTRACTOR_ID: "",
      OWNER_ID: "",
      CATEGORY_ID: "",
      PRIORITY_ID: "",
      DESCRIPTION: "",
      DUE_DATE: "",
      CHANGE_AMOUNT: "",
    },
  });

  const projectId = form.watch("PROJECT_ID");
  const ticketType = form.watch("TICKET_TYPE");
  const isVariation = ticketType === "VARIATION";
  const hasProject = !!projectId;

  const { data: projectOwners = [] } = useOwnerInfoByProjectId(projectId);

  // Project selected → owners derived from the project, falling back to the
  // full list if none come back; no project selected → full list.
  const ownerPool = hasProject && projectOwners.length > 0 ? projectOwners : ownerInfoList;

  const projectOpts = useMemo(
    () => projects.map((p) => ({ value: String(p.P_ID), label: p.P_NAME })),
    [projects]
  );
  const contractorOpts = useMemo(
    () => contractors.map((c) => ({ value: String(c.CONTRATOR_ID), label: c.CONTRATOR_NAME })),
    [contractors]
  );
  const ownerOpts = useMemo(
    () => ownerPool.map((o) => ({ value: String(o.ID), label: o.O_NAME })),
    [ownerPool]
  );
  const categoryOpts = useMemo(
    () => (lookups?.categories || []).map((c) => ({ value: String(c.CATEGORY_ID), label: c.CATEGORY_NAME })),
    [lookups]
  );
  const priorityOpts = useMemo(
    () => (lookups?.priorities || []).map((p) => ({ value: String(p.PRIORITY_ID), label: p.PRIORITY_NAME })),
    [lookups]
  );

  const onSubmit = async (data) => {
    try {
      const res = await createTicket.mutateAsync({
        SUBJECT: data.SUBJECT,
        TICKET_TYPE: data.TICKET_TYPE,
        PROJECT_ID: data.PROJECT_ID ? parseInt(data.PROJECT_ID, 10) : null,
        CONTRACTOR_ID: data.CONTRACTOR_ID ? parseInt(data.CONTRACTOR_ID, 10) : null,
        OWNER_ID: data.OWNER_ID ? parseInt(data.OWNER_ID, 10) : null,
        CATEGORY_ID: data.CATEGORY_ID ? parseInt(data.CATEGORY_ID, 10) : null,
        PRIORITY_ID: parseInt(data.PRIORITY_ID, 10),
        DESCRIPTION: data.DESCRIPTION || null,
        DUE_DATE: data.DUE_DATE || null,
        CHANGE_AMOUNT: isVariation && data.CHANGE_AMOUNT ? Number(data.CHANGE_AMOUNT) : null,
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
                  name="TICKET_TYPE"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ticket Type <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TICKET_TYPE_OPTIONS.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

              {isVariation && (
                <FormField
                  control={form.control}
                  name="CHANGE_AMOUNT"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Change Amount <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="PROJECT_ID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <FormControl>
                        <EntityCombobox
                          items={projectOpts}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select a project"
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
                  name="CONTRACTOR_ID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contractor</FormLabel>
                      <FormControl>
                        <EntityCombobox
                          items={contractorOpts}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select a contractor"
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
                name="OWNER_ID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <FormControl>
                      <EntityCombobox
                        items={ownerOpts}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select an owner"
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
                name="CATEGORY_ID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
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
