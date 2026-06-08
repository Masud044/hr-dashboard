import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ownerSchema = z.object({
  oName:     z.string().min(1, "Owner name is required"),
  address:   z.string().min(1, "Address is required"),
  suburb:    z.string().min(1, "Suburb is required"),
  postcode:  z.string().min(1, "Postcode is required"),
  state:     z.string().min(1, "State is required"),
  email:     z.string().email("Invalid email").min(1, "Email is required"),
  phone:     z.string().min(1, "Phone is required"),
  projectId: z.coerce.number().min(1, "Project is required"),
  updatedBy: z.coerce.number().default(500),
});

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function EditOwnerInfoSheet({ isOpen, onClose, ownerId }) {
  const queryClient = useQueryClient();

  // Fetch projects dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ["projectsDropdown"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/owner-info/projects`);
      return res.data?.data || [];
    },
    enabled: isOpen,
  });

  const form = useForm({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      oName: "",
      address: "",
      suburb: "",
      postcode: "",
      state: "",
      email: "",
      phone: "",
      projectId: "",
      updatedBy: 500,
    },
  });

  // Fetch owner data
  const { data, isLoading } = useQuery({
    queryKey: ["ownerInfo", ownerId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/owner-info/${ownerId}`);
      return res.data?.data || res.data;
    },
    enabled: !!ownerId && isOpen,
  });

  // Prefill form
  useEffect(() => {
    if (data) {
      form.reset({
        oName:     data.O_NAME     || "",
        address:   data.ADDRESS    || "",
        suburb:    data.SUBURB     || "",
        postcode:  data.POSTCODE   || "",
        state:     data.STATE      || "",
        email:     data.EMAIL      || "",
        phone:     data.PHONE      || "",
        projectId: data.PROJECT_ID || "",
        updatedBy: 500,
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      return await axios.put(`${url}/api/owner-info/${ownerId}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ownerInfoList"]);
      queryClient.invalidateQueries(["ownerInfo", ownerId]);
      toast.success("Owner updated successfully!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update owner.");
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-lg overflow-y-auto z-104">
        <SheetHeader>
          <SheetTitle>Edit Owner</SheetTitle>
          <hr className="mt-3" />
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
              {/* Owner Name */}
              <FormField
                control={form.control}
                name="oName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="opacity-70" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger className="opacity-70">
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-105">
                        {projects.map((p) => (
                          <SelectItem key={p.ID} value={String(p.ID)}>
                            {p.NAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} className="opacity-70" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Suburb */}
                <FormField
                  control={form.control}
                  name="suburb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suburb</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-sm opacity-70" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Postcode */}
                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-sm opacity-70" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* State */}
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-sm opacity-70" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-sm opacity-70" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} className="opacity-70" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SheetFooter className="flex flex-row items-center justify-between">
                <SheetClose asChild>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Updating..." : "Update Owner"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}