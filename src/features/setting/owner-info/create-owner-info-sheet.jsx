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
  SheetContent,
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
import { Textarea } from "@/components/ui/textarea";

const ownerSchema = z.object({
  oName:     z.string().min(1, "Owner name is required"),
  address:   z.string().optional().default(""),
  suburb:    z.string().optional().default(""),
  postcode:  z.string().optional().default(""),
  state:     z.string().optional().default(""),
  email:     z.string().email("Invalid email").optional().or(z.literal("")).default(""),
  phone:     z.string().optional().default(""),
  projectId: z.coerce.number().min(1, "Project is required"),
  createdBy: z.coerce.number().default(500),
  updatedBy: z.coerce.number().default(500),
});

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function CreateOwnerInfoSheet({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  // Fetch projects for dropdown
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
      createdBy: 500,
      updatedBy: 500,
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData) => {
      return await axios.post(`${url}/api/owner-info`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ownerInfoList"]);
      toast.success("Owner added successfully!");
      form.reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to add owner.");
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="!w-screen !h-screen !max-w-none overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-103">
        <SheetHeader>
          <SheetTitle>Add New Owner</SheetTitle>
          <hr />
        </SheetHeader>

        <div className="mt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              // className="grid grid-cols-1 md:grid-cols-2 gap-4 px-3"
            >
              {/* Owner Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-3">
                 <FormField
                control={form.control}
                name="oName"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter owner name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                     <Textarea rows={2} {...field} placeholder="Enter address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-3">
                 {/* Project */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
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

              

              {/* Suburb */}
              <FormField
                control={form.control}
                name="suburb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suburb</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter suburb" />
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
                      <Input {...field} placeholder="Enter postcode" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* State */}
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter state" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
             

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-3"> {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="Enter email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /></div>

             

              {/* Buttons */}
              <div className="col-span-2 flex justify-between gap-3 mt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
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