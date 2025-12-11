import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/api/Api";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Zod Validation Schema
const schema = z.object({
  USER_NAME: z.string().min(1, "User Name is required"),
  USER_TYPE: z.string().min(1, "User Type is required"),
  EMP_NO: z.string().min(1, "Employee No is required"),
  FACTORY_ID: z.string().min(1, "Factory ID is required"),
  ATT_STATUS: z.string().min(1),
  DOB: z.string().optional(),
  DRIVING_LIEC: z.string().optional(),
  ADRESS: z.string().min(1, "Address required"),
  SUBRUB: z.string().min(1),
  STATE: z.string().min(1),
  EMAIL: z.string().email("Invalid Email"),
  PHONE: z.string().min(1),
  ACCESS_CODE: z.string().optional(),
  ABN: z.string().optional(),
  LICENSE: z.string().optional(),
  STATUS: z.string().min(1),
});

export function CreateUserSheet({ open, onOpenChange }) {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      USER_NAME: "",
      USER_TYPE: "",
      EMP_NO: "",
      FACTORY_ID: "",
      ATT_STATUS: "0",
      DOB: "",
      DRIVING_LIEC: "",
      ADRESS: "",
      SUBRUB: "",
      STATE: "",
      EMAIL: "",
      PHONE: "",
      ACCESS_CODE: "",
      ABN: "",
      LICENSE: "",
      STATUS: "1",
    },
  });

  // Mutation for Create User
   const mutation = useMutation({
    mutationFn: async (data) => {
      return await api.post("/user.php", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]); // refresh table
      toast.success("User created successfully!");
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to create user");
    },
  });

  const onSubmit = (values) => {
    mutation.mutate(values);
  };
  

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Add New User</SheetTitle>
           <hr />
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6 px-3">
            {/* USER NAME */}
            <FormField
              control={form.control}
              name="USER_NAME"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>User Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter user name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* ADDRESS */}
            <FormField
              control={form.control}
              name="ADRESS"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Textarea row={3} placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* USER TYPE */}
            <FormField
              control={form.control}
              name="USER_TYPE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Type *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter user type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* EMPLOYEE NO */}
            <FormField
              control={form.control}
              name="EMP_NO"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee No *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter employee number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* FACTORY ID */}
            <FormField
              control={form.control}
              name="FACTORY_ID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Factory ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter factory ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* EMAIL */}
            <FormField
              control={form.control}
              name="EMAIL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PHONE */}
            <FormField
              control={form.control}
              name="PHONE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

           

            {/* SUBURB */}
            <FormField
              control={form.control}
              name="SUBRUB"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suburb *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter suburb" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* STATE */}
            <FormField
              control={form.control}
              name="STATE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter state" {...field} />
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
                    <Input placeholder="Enter ABN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LICENSE */}
            <FormField
              control={form.control}
              name="LICENSE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter license" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ATTENDANCE STATUS */}
            <FormField
              control={form.control}
              name="ATT_STATUS"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attendance Status *</FormLabel>
                  <FormControl>
                    <Input placeholder="0 or 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* STATUS */}
            <FormField
              control={form.control}
              name="STATUS"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <FormControl>
                    <Input placeholder="1 for Active, 0 for Inactive" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SUBMIT BUTTON */}
            <div className="flex justify-between gap-3 col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                <Save size={16} className="mr-2" />
                {mutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}