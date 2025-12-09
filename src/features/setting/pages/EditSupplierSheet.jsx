import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import api from "@/api/Api";

// Zod validation schema
const supplierSchema = z.object({
  SUPPLIER_NAME: z.string().min(1, "Supplier Name is required"),
  ADDRESS: z.string().min(1, "Address is required"),
  CONTACT_PERSON: z.string().min(1, "Contact Person is required"),
  PHONE: z.string().min(1, "Phone is required"),
  MOBILE: z.string().min(1, "Mobile is required"),
  EMAIL: z.string().email("Invalid email"),
  ORG_ID: z.string().min(1, "Organization ID is required"),
  DUE: z.string().min(1, "Due is required"),
  REMARKS: z.string().optional(),
  FAX: z.string().optional(),
  STATUS: z.string().min(1),
  ENTRY_BY: z.string().min(1),
});

export const EditSupplierSheet = ({ isOpen, onClose, supplierId }) => {
  const queryClient = useQueryClient();
  const isEditing = !!supplierId;

  const form = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      SUPPLIER_NAME: "",
      ENTRY_BY: "101",
      ORG_ID: "",
      ADDRESS: "",
      CONTACT_PERSON: "",
      PHONE: "",
      EMAIL: "",
      MOBILE: "",
      DUE: "",
      REMARKS: "",
      FAX: "",
      STATUS: "0",
    },
  });

  // Fetch supplier data for editing
  const { data } = useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: async () => {
      const res = await api.get(`/supplier_info.php?id=${supplierId}`);
      return res.data?.data || res.data;
    },
    enabled: !!supplierId && isOpen,
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    } else if (!supplierId) {
      form.reset({
        SUPPLIER_NAME: "",
        ENTRY_BY: "101",
        ORG_ID: "",
        ADDRESS: "",
        CONTACT_PERSON: "",
        PHONE: "",
        EMAIL: "",
        MOBILE: "",
        DUE: "",
        REMARKS: "",
        FAX: "",
        STATUS: "0",
      });
    }
  }, [data, supplierId, form]);

  // Mutation for create/update
  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEditing) {
        return await api.put("/supplier_info.php", {
          ...formData,
          SUPPLIER_ID: supplierId,
          UPDATE_BY: 101,
        });
      } else {
        return await api.post("/supplier_info.php", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["supplierList"]);
      queryClient.invalidateQueries(["supplier", supplierId]);
      form.reset();
      toast.success(isEditing ? "Supplier updated!" : "Supplier added!");
      onClose();
    },
    onError: () => toast.error("Failed to save supplier data."),
  });

  const onSubmit = (values) => mutation.mutate(values);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent  className=" sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            Edit Supplier Information
          </SheetTitle>
          <hr ></hr>
          {/* <SheetDescription>
            {isEditing
              ? "Update the supplier details below."
              : "Fill in the details to add a new supplier."}
          </SheetDescription> */}
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 px-3 gap-4">
            
            {/* Supplier Name */}
            <FormField
              control={form.control}
              name="SUPPLIER_NAME"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Supplier Name <span className="text-red-700">*</span></FormLabel>
                  <FormControl><Input placeholder="Enter Supplier Name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organization ID */}
            <FormField
              control={form.control}
              name="ORG_ID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization ID</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Person */}
            <FormField
              control={form.control}
              name="CONTACT_PERSON"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person <span className="text-red-700">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mobile */}
            <FormField
              control={form.control}
              name="MOBILE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="PHONE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="EMAIL"
              render={({ field }) => (
                <FormItem >
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fax */}
            <FormField
              control={form.control}
              name="FAX"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fax</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due */}
            <FormField
              control={form.control}
              name="DUE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {/* Remarks */}
            <FormField
              control={form.control}
              name="REMARKS"
              render={({ field }) => (
                <FormItem >
                  <FormLabel>Remarks</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="ADDRESS"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address <span className="text-red-700">*</span></FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

           

            {/* Submit Buttons */}
            <SheetFooter className=" md:col-span-2 flex flex-row gap-6  justify-between mt-4">
                <SheetClose asChild>
                    <Button type="button" variant="outline" onClick={handleClose}>
              
                Cancel
              </Button>
                </SheetClose>
              
              <Button type="submit" disabled={mutation.isPending}>
               
                {mutation.isPending ? "Saving..." : isEditing ? "Update Supplier" : "Save Supplier"}
              </Button>
            </SheetFooter>

          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};