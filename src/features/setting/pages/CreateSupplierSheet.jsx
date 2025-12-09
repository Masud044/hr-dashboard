import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import api from "@/api/Api";
import { toast } from "react-toastify";

// Form validation schema
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

export function CreateSupplierSheet({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  // Form setup
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

  // Add mutation
  const mutation = useMutation({
    mutationFn: async (formData) => {
      return await api.post("/supplier_info.php", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["supplierList"]);
      toast.success("Supplier added successfully!");
      form.reset();
      onClose();
    },
    onError: (err) => {
      console.error("Error:", err);
      toast.error("Failed to add supplier data.");
    },
  });

  // Submit handler
  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  // Reset form when sheet closes
  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent   className=" sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Supplier</SheetTitle>
           <hr></hr>
        </SheetHeader>

        <div >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 px-3 gap-4"
            >
              {/* Supplier Name */}
              <FormField
                control={form.control}
                name="SUPPLIER_NAME"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>
                      Supplier Name <span className="text-red-700">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Supplier Name" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input type="number" {...field} placeholder=" Enter org number" />
                    </FormControl>
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
                    <FormLabel>
                      Contact Person <span className="text-red-700">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter Contact person" />
                    </FormControl>
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
                    <FormControl>
                      <Input type="number" {...field} placeholder="Enter mobile number" />
                    </FormControl>
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
                    <FormControl>
                      <Input type="number" {...field} placeholder="Enter phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="EMAIL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="Enter email " />
                    </FormControl>
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
                    <FormControl>
                      <Input {...field} placeholder="Enter fax"/>
                    </FormControl>
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
                    <FormControl>
                      <Input {...field} placeholder="Enter due"/>
                    </FormControl>
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
                    <FormControl>
                      <Textarea rows={2} {...field} placeholder="Enter remarks" />
                    </FormControl>
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
                    <FormLabel>
                      Address <span className="text-red-700">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} placeholder="Enter address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

             

              {/* Submit Buttons */}
              <div className="col-span-2 flex justify-between gap-3 mt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                 
                  {mutation.isPending ? "Saving..." : "Save Supplier"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}