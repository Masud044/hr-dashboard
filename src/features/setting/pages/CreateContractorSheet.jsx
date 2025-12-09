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

export function CreateContractorSheet({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  // Form setup
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

  // Add mutation
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        ...formData,
        ENTRY_BY: Number(formData.ENTRY_BY) || 500,
      };
      return await api.post("/contrator.php", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contrators"]);
      toast.success("Contractor added successfully!");
      form.reset();
      onClose();
    },
    onError: (err) => {
      console.error("Error:", err);
      toast.error("Failed to add contractor data.");
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
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Contractor</SheetTitle>

          <hr></hr>
          {/* <SheetDescription>
            Fill in the contractor details below
          </SheetDescription> */}
        </SheetHeader>

        <div className="">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 px-3"
            >
              {/* Contractor Name */}
              <FormField
                control={form.control}
                name="CONTRATOR_NAME"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Contractor Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ABN */}
              <FormField
                control={form.control}
                name="ABN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ABN</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* License No */}
              <FormField
                control={form.control}
                name="LIEC_NO"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License No</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Suburb */}
              <FormField
                control={form.control}
                name="SUBURB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suburb</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Postcode */}
              <FormField
                control={form.control}
                name="POSTCODE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* State */}
              <FormField
                control={form.control}
                name="STATE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input type="email" {...field} />
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
                  {/* <Save size={16} className="mr-2" /> */}
                  {mutation.isPending ? "Saving..." : "Submit"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}