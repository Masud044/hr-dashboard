import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
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
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import api from "@/api/Api";
import { toast } from "react-toastify";

// Form validation schema
const contractorSchema = z.object({
  CONTRATOR_NAME: z.string().min(1, "Contractor name is required"),
  ENTRY_BY: z.coerce.number().default(500),
  ABN: z.string().min(1, "ABN is required"),
  LIEC_NO: z.string().min(1, "License number is required"),
  SUBURB: z.string().min(1, "Suburb is required"),
  POSTCODE: z.string().min(1, "Postcode is required"),
  STATE: z.string().min(1, "State is required"),
  ADDRESS: z.string().min(1, "Address is required"),
  CONTACT_PERSON: z.string().min(1, "Contact person is required"),
  PHONE: z.string().min(1, "Phone is required"),
  EMAIL: z.string().email("Invalid email address").min(1, "Email is required"),
  MOBILE: z.string().min(1, "Mobile is required"),
});

export function EditContractorSheet({ isOpen, onClose, contractorId }) {
  const queryClient = useQueryClient();

  // Initialize form
  const form = useForm({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      CONTRATOR_NAME: "",
      ENTRY_BY: 500,
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
    },
  });

  // Fetch contractor data
  const { data, isLoading } = useQuery({
    queryKey: ["contrator", contractorId],
    queryFn: async () => {
      const res = await api.get(`/contrator.php?contrator_id=${contractorId}`);
      const result = res.data?.data || res.data;
      return Array.isArray(result) ? result[0] : result;
    },
    enabled: !!contractorId && isOpen,
  });

  // Prefill form when data loads
  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  // Update mutation
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        ...formData,
        ENTRY_BY: Number(formData.ENTRY_BY) || 500,
      };
      return await api.put("/contrator.php", {
        ...payload,
        CONTRATOR_ID: contractorId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contrators"]);
      queryClient.invalidateQueries(["contrator", contractorId]);
      toast.success("Contractor updated successfully!");
      onClose();
    },
    onError: (err) => {
      console.error("Error:", err);
      toast.error("Failed to update contractor data.");
    },
  });

  // Submit handler
  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  // Handle sheet close
  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Contractor</SheetTitle>
          <hr className="mt-3"></hr>
          {/* <SheetDescription>
            Make changes to contractor information. Click save when done.
          </SheetDescription> */}
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading...</p>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-6 px-3"
            >
              {/* Contractor Name */}
              <FormField
                control={form.control}
                name="CONTRATOR_NAME"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contractor Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="opacity-70" />
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
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} className=" opacity-70"  />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ABN & License No */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ABN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ABN</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-sm opacity-70" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="LIEC_NO"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License No</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-sm opacity-70"  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

 {/* Suburb */}
              <FormField
                control={form.control}
                name="SUBURB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suburb</FormLabel>
                    <FormControl>
                      <Input {...field} className="text-sm opacity-70"  />
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
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input {...field} className="text-sm opacity-70"  />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

             

              {/* Postcode & State */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="POSTCODE"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-sm opacity-70"  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="STATE"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-sm opacity-70"  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

             

              {/* Phone & Mobile */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="PHONE"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-sm opacity-70"  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="MOBILE"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-sm opacity-70"  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="EMAIL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} className="w-[50%] opacity-70" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

             

              {/* Sheet Footer with Buttons */}
             <SheetFooter className=" flex flex-row items-center justify-between">
             
                <SheetClose asChild>
    <Button type="button" variant="outline" onClick={handleClose}>
      Cancel
    </Button>
  </SheetClose>
             
  

       
         <Button type="submit" disabled={mutation.isPending}>
    
    {mutation.isPending ? "Updating..." : "Update Contractor"}
  </Button>
      

</SheetFooter>

            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}