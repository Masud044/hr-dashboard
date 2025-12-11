"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Save } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

import api from "@/api/Api";

// Zod schema
const adminSchema = z.object({
  USERNAME: z.string().min(1, "Username is required"),
  PASSWORD: z.string().optional(),
  FIRSTNAME: z.string().min(1, "First name is required"),
  LASTNAME: z.string().min(1, "Last name is required"),
  SUPERADMIN: z.string(),
  DEPT: z.string().min(1, "Department is required"),
  POSITION: z.string().min(1, "Position is required"),
  ADDRESS: z.string().min(1, "Address is required"),
});

export const EditAdminSheet = ({ open, onOpenChange, adminId } ) => {
  const queryClient = useQueryClient();
  const isEditing = !!adminId;
  console.log(isEditing);


  const form = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      USERNAME: "",
      PASSWORD: "",
      FIRSTNAME: "",
      LASTNAME: "",
      SUPERADMIN: "0",
      DEPT: "",
      POSITION: "",
      ADDRESS: "",
    },
  });

  // Fetch admin data if editing
  const { data } = useQuery({
    queryKey: ["admin_user", adminId],
    queryFn: async () => {
      const res = await api.get(`/admin_user.php?id=${adminId}`);
      const userData = res.data?.data;
      if (Array.isArray(userData)) return userData.find(u => Number(u.ID) === Number(adminId));
      return userData;
    },
    enabled: !!adminId
  });

  useEffect(() => {
    if (data) {
      form.reset({
        USERNAME: data.USERNAME || "",
        PASSWORD: "",
        FIRSTNAME: data.FIRSTNAME || "",
        LASTNAME: data.LASTNAME || "",
        SUPERADMIN: String(data.SUPERADMIN ?? "0"),
        DEPT: data.DEPT || "",
        POSITION: data.POSITION || "",
        ADDRESS: data.ADDRESS || "",
      });
    } else if (!adminId) {
      form.reset({
        USERNAME: "",
        PASSWORD: "",
        FIRSTNAME: "",
        LASTNAME: "",
        SUPERADMIN: "0",
        DEPT: "",
        POSITION: "",
        ADDRESS: "",
      });
    }
  }, [data, adminId, form]);

  // Mutation for create/update
  const mutation = useMutation({
    mutationFn: async (values) => {
      if (isEditing) {
        return await api.put("/admin_user.php", { ...values, ID: adminId });
      } else {
        return await api.post("/admin_user.php", values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin_user"]);
      toast.success(isEditing ? "Admin updated!" : "Admin added!");
      form.reset();
     onOpenChange(false);
    },
    onError: () => toast.error("Failed to save admin data."),
  });

  const onSubmit = (values) => mutation.mutate(values);



  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Admin User" : "Add New Admin User"}</SheetTitle>
          <hr className="my-2" />
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 px-3">
            
            {/* Username */}
            <FormField
              control={form.control}
              name="USERNAME"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Username *</FormLabel>
                  <FormControl><Input placeholder="Enter username" {...field} /></FormControl>
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
                  <FormLabel>Address *</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password (only for new user) */}
            {!isEditing && (
              <FormField
                control={form.control}
                name="PASSWORD"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Password *</FormLabel>
                    <FormControl><Input type="password" placeholder="Enter password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* First Name */}
            <FormField
              control={form.control}
              name="FIRSTNAME"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl><Input placeholder="Enter first name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="LASTNAME"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl><Input placeholder="Enter last name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Department */}
            <FormField
              control={form.control}
              name="DEPT"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department *</FormLabel>
                  <FormControl><Input placeholder="Enter department" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Position */}
            <FormField
              control={form.control}
              name="POSITION"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position *</FormLabel>
                  <FormControl><Input placeholder="Enter position" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

           

            {/* Super Admin */}
            <FormField
              control={form.control}
              name="SUPERADMIN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Super Admin</FormLabel>
                  <FormControl>
                    <select {...field} className="border rounded p-2 w-full">
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="md:col-span-2 flex justify-between gap-4 mt-4">
              <SheetClose asChild>
                <Button variant="outline" type="button"  onClick={() => onOpenChange(false)}>
                    Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : isEditing ? "Update Admin" : "Save Admin"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
