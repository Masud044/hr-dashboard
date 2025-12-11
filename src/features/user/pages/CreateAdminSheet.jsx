"use client";

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
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Zod schema for validation
const createAdminSchema = z.object({
  USERNAME: z.string().min(1, "Username is required"),
  PASSWORD: z.string().min(6, "Password must be at least 6 characters"),
  FIRSTNAME: z.string().min(1, "First name is required"),
  LASTNAME: z.string().min(1, "Last name is required"),
  SUPERADMIN: z.string(),
  DEPT: z.string().min(1, "Department is required"),
  POSITION: z.string().min(1, "Position is required"),
  ADDRESS: z.string().min(1, "Address is required"),
});

const CreateAdminSheet = ({ open, onOpenChange }) => {
//   const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(createAdminSchema),
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

  const mutation = useMutation({
    mutationFn: async (values) => await api.post("/admin_user.php", values),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminUsers"]);
      toast.success("Admin created successfully!");
      form.reset();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create admin.");
    },
  });

  const onSubmit = (values) => mutation.mutate(values);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
     
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Add New Admin User</SheetTitle>
          <hr />
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4 px-3"
          >
            <FormField
              control={form.control}
              name="USERNAME"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Username <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="ADDRESS"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter address" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="PASSWORD"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password (min 6 characters)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="FIRSTNAME"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="LASTNAME"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="DEPT"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter department" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="POSITION"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter position" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="SUPERADMIN"
              render={({ field }) => (
                <FormItem className= "w-[40%]">
                  <FormLabel>Super Admin</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="border border-gray-300 rounded p-2 w-full focus:outline-none "
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

           

            <div className=" col-span-2 flex justify-between mt-3 gap-3">
              <Button
                type="button"
                variant="outline"
               onClick={() => onOpenChange(false)}
              >
                cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                <Save size={16} className="mr-2" />
                {mutation.isPending ? "Saving..." : "Create Admin"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateAdminSheet;
