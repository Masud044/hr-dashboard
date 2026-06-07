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

const schema = z.object({
  contructorId:   z.coerce.number().min(1, "Contractor is required"),
  contructorType: z.coerce.number().min(1, "Contractor type is required"),
  createdBy:      z.coerce.number().default(500),
  updateBy:       z.coerce.number().default(500),
});

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function CreateContractorTypeInfoSheet({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  // Fetch contractors dropdown
  const { data: contractors = [] } = useQuery({
    queryKey: ["contractorsDropdown"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/contractor-type-info/contractors`);
      return res.data?.data || [];
    },
    enabled: isOpen,
  });

  // Fetch contractor types dropdown
  const { data: contractorTypes = [] } = useQuery({
    queryKey: ["contractorTypesDropdown"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/contractor-type-info/types`);
      return res.data?.data || [];
    },
    enabled: isOpen,
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      contructorId:   "",
      contructorType: "",
      createdBy:      500,
      updateBy:       500,
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData) => {
      return await axios.post(`${url}/api/contractor-type-info`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contractorTypeInfoList"]);
      toast.success("Record added successfully!");
      form.reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to add record.");
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
          <SheetTitle>Add Contractor Type Info</SheetTitle>
          <hr />
        </SheetHeader>

        <div className="mt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 px-3"
            >
              {/* Contractor dropdown */}
              <FormField
                control={form.control}
                name="contructorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contractor</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a contractor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-105">
                        {contractors.map((c) => (
                          <SelectItem key={c.ID} value={String(c.ID)}>
                            {c.NAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contractor Type dropdown */}
              <FormField
                control={form.control}
                name="contructorType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contractor Type</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-105">
                        {contractorTypes.map((t) => (
                          <SelectItem key={t.ID} value={String(t.ID)}>
                            {t.NAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buttons */}
              <div className="flex justify-between gap-3 mt-4">
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