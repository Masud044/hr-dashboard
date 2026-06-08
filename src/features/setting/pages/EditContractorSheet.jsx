import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// ── Dynamic contractor types hook ─────────────────────────────────────────────
import { useContractorTypes } from "@/hooks/use-contractor-type";
// ↑ Adjust the import path to wherever you place useContractorTypes.js

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ── Zod schema ────────────────────────────────────────────────────────────────
const contractorTypeSchema = z.object({
  CONTRATOR_TYPE: z.coerce
    .number({ required_error: "Please select a type" })
    .min(1, "Please select a type"),
});

const contractorSchema = z.object({
  CONTRATOR_NAME:  z.string().min(1, "Contractor name is required"),
  UPDATE_BY:       z.coerce.number().default(500),
  ABN:             z.string().min(1, "ABN is required"),
  LIEC_NO:         z.string().min(1, "License number is required"),
  SUBURB:          z.string().min(1, "Suburb is required"),
  POSTCODE:        z.string().min(1, "Postcode is required"),
  STATE:           z.string().min(1, "State is required"),
  ADDRESS:         z.string().min(1, "Address is required"),
  CONTACT_PERSON:  z.string().min(1, "Contact person is required"),
  PHONE:           z.string().min(1, "Phone is required"),
  EMAIL:           z.string().email("Invalid email"),
  MOBILE:          z.string().min(1, "Mobile is required"),
  DUE:             z.string().optional(),
  REMARKS:         z.string().optional(),
  FAX:             z.string().optional(),
  BANK_ACC_NAME:   z.string().optional(),
  BSB:             z.string().optional(),
  AC_NO:           z.string().optional(),
  INSURER:         z.string().optional(),
  POLICY_NUMBER:   z.string().optional(),
  contractorTypes: z
    .array(contractorTypeSchema)
    .min(1, "Add at least one contractor type"),
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

function SectionHeading({ label }) {
  return (
    <div className="col-span-2 flex items-center gap-2 mt-2">
      <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function EditContractorSheet({ isOpen, onClose, contractorId }) {
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
    enabled: !!contractorId && isOpen,
  });

  // ── Pre-fill form when data arrives ──────────────────────────────────────
  useEffect(() => {
    if (!data) return;

    const { contractorTypes: types, ...contractorFields } = data;

    form.reset({
      ...emptyDefaults,
      ...contractorFields,
      DUE:           contractorFields.DUE           ?? "",
      REMARKS:       contractorFields.REMARKS       ?? "",
      FAX:           contractorFields.FAX           ?? "",
      BANK_ACC_NAME: contractorFields.BANK_ACC_NAME ?? "",
      BSB:           contractorFields.BSB           ?? "",
      AC_NO:         contractorFields.AC_NO         ?? "",
      INSURER:       contractorFields.INSURER       ?? "",
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

      const payload = {
        contractor: {
          ...contractorFields,
          UPDATE_BY: Number(contractorFields.UPDATE_BY) || 500,
        },
        contractorTypes: contractorTypes.map((t) => Number(t.CONTRATOR_TYPE)),
      };

      return axios.put(`${url}/api/contractor/${contractorId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contrators"]);
      queryClient.invalidateQueries(["contrator-detail", contractorId]);
      toast.success("Contractor updated successfully!");
      onClose();
    },
    onError: (err) => {
      console.error("Update contractor error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to update contractor."
      );
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  const handleClose = () => {
    form.reset(emptyDefaults);
    onClose();
  };

  const isLoading = detailLoading;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto z-[104]">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-lg font-semibold">
            Edit Contractor
          </SheetTitle>
          <hr />
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 px-1 pb-6"
            >
              {/* ── GENERAL INFO ─────────────────────────────────────── */}
              <SectionHeading label="General Information" />

              <FormField control={form.control} name="CONTRATOR_NAME" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Contractor Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="ADDRESS" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="ABN" render={({ field }) => (
                <FormItem>
                  <FormLabel>ABN <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="LIEC_NO" render={({ field }) => (
                <FormItem>
                  <FormLabel>License No <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="SUBURB" render={({ field }) => (
                <FormItem>
                  <FormLabel>Suburb <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="POSTCODE" render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="STATE" render={({ field }) => (
                <FormItem>
                  <FormLabel>State <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="FAX" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fax</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* ── CONTACT ───────────────────────────────────────────── */}
              <SectionHeading label="Contact Details" />

              <FormField control={form.control} name="CONTACT_PERSON" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="PHONE" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="MOBILE" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="EMAIL" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* ── BANKING ───────────────────────────────────────────── */}
              <SectionHeading label="Banking & Insurance" />

              <FormField control={form.control} name="BANK_ACC_NAME" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="BSB" render={({ field }) => (
                <FormItem>
                  <FormLabel>BSB</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="AC_NO" render={({ field }) => (
                <FormItem>
                  <FormLabel>Account No</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="INSURER" render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurer</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="POLICY_NUMBER" render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Number</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="DUE" render={({ field }) => (
                <FormItem>
                  <FormLabel>Due</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="REMARKS" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Remarks</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* ── CONTRACTOR TYPES (Dynamic rows) ─────────────────────── */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      Contractor Types
                    </span>
                    <div className="h-px bg-border w-24" />
                    <span className="text-red-500 text-xs">*</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => append({ CONTRATOR_TYPE: "" })}
                    className="gap-1 text-xs"
                  >
                    <Plus size={13} />
                    Add Type
                  </Button>
                </div>

                {form.formState.errors.contractorTypes?.message && (
                  <p className="text-sm text-red-500 mb-2">
                    {form.formState.errors.contractorTypes.message}
                  </p>
                )}

                <div className="space-y-2">
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
                                <SelectTrigger>
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 mt-0.5"
                          onClick={() => remove(index)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── FOOTER ───────────────────────────────────────────── */}
              <div className="md:col-span-2 flex justify-between gap-3 mt-4 pt-3 border-t">
                <SheetClose asChild>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Updating..." : "Update Contractor"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}