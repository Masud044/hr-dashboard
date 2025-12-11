import React, { useEffect } from "react";
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

export function EditUserSheet({ open, onOpenChange, userData = null }) {
  const queryClient = useQueryClient();
  const isEditing = !!userData;

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

  // Prefill form when editing
  useEffect(() => {
    form.reset(
      userData
        ? {
            USER_NAME: userData.USER_NAME || "",
            USER_TYPE: userData.TYPE_ID || "",
            EMP_NO: userData.EMP_NO || "",
            FACTORY_ID: String(userData.FACTORY_ID || ""),
            ATT_STATUS: userData.ATT_STATUS || "0",
            DOB: userData.DOB || "",
            DRIVING_LIEC: userData.DRIVING_LIEC || "",
            ADRESS: userData.ADRESS || "",
            SUBRUB: userData.SUBRUB || "",
            STATE: userData.STATE || "",
            EMAIL: userData.EMAIL || "",
            PHONE: userData.PHONE || "",
            ACCESS_CODE: userData.ACCESS_CODE || "",
            ABN: userData.ABN || "",
            LICENSE: userData.LICENSE || "",
            STATUS: userData.STATUS || "1",
          }
        : form.defaultValues
    );
  }, [userData, form]);

  // Format and send correct payload
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        USER_NAME: formData.USER_NAME,
        TYPE_ID: formData.USER_TYPE, // FIXED
        EMP_NO: formData.EMP_NO,
        FACTORY_ID: Number(formData.FACTORY_ID), // FIXED
        ATT_STATUS: formData.ATT_STATUS,
        DOB: formData.DOB || "",
        DRIVING_LIEC: formData.DRIVING_LIEC || "",
        ADRESS: formData.ADRESS,
        SUBRUB: formData.SUBRUB,
        STATE: formData.STATE,
        EMAIL: formData.EMAIL,
        PHONE: formData.PHONE,
        ACCESS_CODE: formData.ACCESS_CODE || "",
        ABN: formData.ABN || "",
        LICENSE: formData.LICENSE || "",
        STATUS: formData.STATUS,
      };

      if (isEditing) {
        payload.ID = userData.ID;
        payload.UPDATE_BY = 500;
        return api.put("/user.php", payload);
      }

      return api.post("/user.php", payload);
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast.success(isEditing ? "User updated successfully!" : "User created successfully!");
      onOpenChange(false);
    },

    onError: (error) => {
      console.error(error);
      toast.error("Failed to save user.");
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit User" : "Add New User"}</SheetTitle>
           <hr />
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(mutation.mutate)} className="grid px-3 md:grid-cols-2 gap-6">

            {/* USER NAME */}
            <FormField
              control={form.control}
              name="USER_NAME"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>User Name *</FormLabel>
                  <FormControl >
                    <Input  placeholder="Enter user name" {...field} />
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
                    <Textarea placeholder="Enter address"  rows={3} {...field} />
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
                    <Input placeholder="1 = Active, 0 = Inactive" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SUBMIT */}
            <div className="flex md:col-span-2 justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                <Save size={16} className="mr-2" />
                {mutation.isPending
                  ? "Saving..."
                  : isEditing
                  ? "Update User"
                  : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
