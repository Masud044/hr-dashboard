import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContractorTypes } from "@/hooks/use-contractor-type";
import { SectionContainer } from "@/components/SectionContainer";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ── Zod schema ────────────────────────────────────────────────────────────────
const contractorTypeSchema = z.object({
  CONTRATOR_TYPE: z.union([z.coerce.number(), z.literal("")]).optional(),
});

const contractorSchema = z.object({
  CONTRATOR_NAME: z.string().min(1, "Contractor name is required"),
  UPDATE_BY: z.coerce.number().default(500),
  ABN: z.string().nullable().optional(),
  LIEC_NO: z.string().nullable().optional(),
  SUBURB: z.string().nullable().optional(),
  POSTCODE: z.string().nullable().optional(),
  STATE: z.string().nullable().optional(),
  ADDRESS: z.string().nullable().optional(),
  CONTACT_PERSON: z.string().nullable().optional(),
  PHONE: z.string().nullable().optional(),
  EMAIL: z.union([z.string().email("Invalid email"), z.literal(""), z.null()]).optional(),
  MOBILE: z.string().nullable().optional(),
  DUE: z.string().nullable().optional(),
  REMARKS: z.string().nullable().optional(),
  FAX: z.string().nullable().optional(),
  BANK_ACC_NAME: z.string().nullable().optional(),
  BSB: z.string().nullable().optional(),
  AC_NO: z.string().nullable().optional(),
  INSURER: z.string().nullable().optional(),
  POLICY_NUMBER: z.string().nullable().optional(),
  contractorTypes: z.array(contractorTypeSchema).optional(),
});

const emptyDefaults = {
  CONTRATOR_NAME: "",
  UPDATE_BY: 500,
  ABN: "",
  LIEC_NO: "",
  SUBURB: "",
  POSTCODE: "",
  STATE: "",
  ADDRESS: "",
  CONTACT_PERSON: "",
  PHONE: "",
  EMAIL: "",
  MOBILE: "",
  DUE: "",
  REMARKS: "",
  FAX: "",
  BANK_ACC_NAME: "",
  BSB: "",
  AC_NO: "",
  INSURER: "",
  POLICY_NUMBER: "",
  contractorTypes: [{ CONTRATOR_TYPE: "" }],
};

// ── Component ─────────────────────────────────────────────────────────────────
export function EditContractorPage() {
  const { id: contractorId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ── Fetch contractor type options from backend ────────────────────────────
  const { contractorTypeOptions, isLoading: typesLoading } = useContractorTypes();

  const form = useForm({
    resolver: zodResolver(contractorSchema),
    defaultValues: emptyDefaults,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "contractorTypes",
  });

  // ── Fetch contractor detail ───────────────────────────────────────────────
  const { data, isLoading: detailLoading } = useQuery({
    queryKey: ["contrator-detail", contractorId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/contractor/${contractorId}`);
      return res.data?.data || null;
    },
    enabled: !!contractorId,
  });

  // ── Pre-fill form when data arrives ──────────────────────────────────────
  useEffect(() => {
    if (!data) return;

    const { contractorTypes: types, ...contractorFields } = data;

    form.reset({
      ...emptyDefaults,
      ...contractorFields,
      CONTRATOR_NAME: contractorFields.CONTRATOR_NAME ?? "",
      ABN: contractorFields.ABN ?? "",
      LIEC_NO: contractorFields.LIEC_NO ?? "",
      SUBURB: contractorFields.SUBURB ?? "",
      POSTCODE: contractorFields.POSTCODE ?? "",
      STATE: contractorFields.STATE ?? "",
      ADDRESS: contractorFields.ADDRESS ?? "",
      CONTACT_PERSON: contractorFields.CONTACT_PERSON ?? "",
      PHONE: contractorFields.PHONE ?? "",
      MOBILE: contractorFields.MOBILE ?? "",
      EMAIL: contractorFields.EMAIL ?? "",
      DUE: contractorFields.DUE ?? "",
      REMARKS: contractorFields.REMARKS ?? "",
      FAX: contractorFields.FAX ?? "",
      BANK_ACC_NAME: contractorFields.BANK_ACC_NAME ?? "",
      BSB: contractorFields.BSB ?? "",
      AC_NO: contractorFields.AC_NO ?? "",
      INSURER: contractorFields.INSURER ?? "",
      POLICY_NUMBER: contractorFields.POLICY_NUMBER ?? "",
    });

    if (Array.isArray(types) && types.length > 0) {
      replace(
        types.map((t) => ({
          CONTRATOR_TYPE: t.CONTRUCTOR_TYPE ?? t.CONTRATOR_TYPE,
        }))
      );
    } else {
      replace([{ CONTRATOR_TYPE: "" }]);
    }
  }, [data, form, replace]);

  // ── Mutation ────────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const { contractorTypes, ...contractorFields } = formData;

      const validTypes = (contractorTypes || [])
        .map((t) => Number(t.CONTRATOR_TYPE))
        .filter((v) => !isNaN(v) && v > 0);

      const payload = {
        contractor: {
          ...contractorFields,
          UPDATE_BY: Number(contractorFields.UPDATE_BY) || 500,
        },
        contractorTypes: validTypes,
      };

      return axios.put(`${url}/api/contractor/${contractorId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contrators"]);
      queryClient.invalidateQueries(["contrator-detail", contractorId]);
      toast.success("Contractor updated successfully!");
      setTimeout(() => navigate("/dashboard/contractor"), 800);
    },
    onError: (err) => {
      console.error("Update contractor error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to update contractor."
      );
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  if (detailLoading) {
    return (
      <SectionContainer variant="dashboard" className="py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer variant="dashboard">
      {/* Main Form Container */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground tracking-[-0.03em]">
            Edit Contractor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update the contractor details below
          </p>
          <div className="w-full h-px bg-border mt-6" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* ── GENERAL INFO ─────────────────────────────────────────── */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px  bg-accent-foreground/50" />
              <span className="text-overline text-accent-foreground/90 tracking-[0.08em] uppercase font-semibold">
                General Information
              </span>
              <div className="flex-1 h-px  bg-accent-foreground/50" />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="CONTRATOR_NAME"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Contractor Name <Req />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="Enter contractor name" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ADDRESS"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Address
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Enter address"
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <FormField control={form.control} name="ABN" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">ABN</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="ABN number" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="LIEC_NO" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">License No</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="License number" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="SUBURB" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">Suburb</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="Suburb" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="POSTCODE" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">Postcode</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="Postcode" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="STATE" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">State</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="State" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="FAX" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">Fax</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="Fax number" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* ── CONTACT ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex-1 h-px  bg-accent-foreground/50" />
              <span className="text-overline text-accent-foreground/90 tracking-[0.08em] uppercase font-semibold">
                Contact Details
              </span>
              <div className="flex-1 h-px  bg-accent-foreground/50" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <FormField control={form.control} name="CONTACT_PERSON" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Contact Person</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Contact person name" className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="PHONE" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Phone</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Phone number" className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="MOBILE" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Mobile</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Mobile number" className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="EMAIL" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} value={field.value ?? ""} placeholder="Email address" className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* ── BANKING ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex-1 h-px  bg-accent-foreground/50" />
              <span className="text-overline text-accent-foreground/90 tracking-[0.08em] uppercase font-semibold">
                Banking & Insurance
              </span>
              <div className="flex-1 h-px  bg-accent-foreground/50" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField control={form.control} name="BANK_ACC_NAME" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Bank Account Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Account name" className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="BSB" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">BSB</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="BSB number" className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="AC_NO" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Account No</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Account number" className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField control={form.control} name="INSURER" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Insurer</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Insurer name" className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="POLICY_NUMBER" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Policy Number</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Policy number" className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="DUE" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Due</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Due amount" className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="REMARKS" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">Remarks</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Additional remarks"
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* ── CONTRACTOR TYPES (Dynamic rows) ──────────────────────── */}
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex-1 h-px bg-accent-foreground/50" />
              <span className="text-overline text-accent-foreground/90 tracking-[0.08em] uppercase font-semibold">
                Contractor Types
              </span>
              <div className="flex-1 h-px  bg-accent-foreground/50" />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-foreground">
                  Select Contractor Types
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => append({ CONTRATOR_TYPE: "" })}
                  className="gap-1 text-xs h-8 border-border hover:bg-muted/50"
                >
                  <Plus size={13} />
                  Add Type
                </Button>
              </div>

              {form.formState.errors.contractorTypes?.message && (
                <p className="text-sm text-destructive mb-2">
                  {form.formState.errors.contractorTypes.message}
                </p>
              )}

              <div className="space-y-3">
                {fields.map((fieldItem, index) => (
                  <div key={fieldItem.id} className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`contractorTypes.${index}.CONTRATOR_TYPE`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Select
                              onValueChange={(val) => field.onChange(Number(val))}
                              value={field.value ? String(field.value) : ""}
                              disabled={typesLoading}
                            >
                              <SelectTrigger size="lg" className="w-full">
                                <SelectValue
                                  placeholder={
                                    typesLoading
                                      ? "Loading types…"
                                      : "Select contractor type"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent className="z-[200]">
                                {contractorTypeOptions.map((opt) => (
                                  <SelectItem
                                    key={opt.value}
                                    value={String(opt.value)}
                                  >
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {fields.length > 1 && (
                      <button
                        type="button"
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-all mt-0.5"
                        onClick={() => remove(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── SUBMIT ───────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="h-9 px-4 text-sm font-medium border-border hover:bg-muted/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="h-9 px-4 text-sm font-medium bg-primary hover:bg-primary/90 text-white hover:shadow-lg transition-all"
              >
                <Save size={16} className="mr-2" />
                {mutation.isPending ? "Updating..." : "Update Contractor"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </SectionContainer>
  );
}

const Req = () => <span className="text-destructive">*</span>;