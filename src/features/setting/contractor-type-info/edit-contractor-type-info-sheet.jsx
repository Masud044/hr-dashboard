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

const schema = z.object({
  contructorId:   z.coerce.number().min(1, "Contractor is required"),
  contructorType: z.coerce.number().min(1, "Contractor type is required"),
  updateBy:       z.coerce.number().default(500),
});

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function EditContractorTypeInfoSheet({ isOpen, onClose, typeId }) {
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
      updateBy:       500,
    },
  });

  // Fetch existing record
  const { data, isLoading } = useQuery({
    queryKey: ["contractorTypeInfo", typeId],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/contractor-type-info/${typeId}`);
      return res.data?.data || res.data;
    },
    enabled: !!typeId && isOpen,
  });

  // Prefill form
  useEffect(() => {
    if (data) {
      form.reset({
        contructorId:   data.CONTRUCTOR_ID   || "",
        contructorType: data.CONTRUCTOR_TYPE  || "",
        updateBy:       500,
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      return await axios.put(`${url}/api/contractor-type-info/${typeId}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contractorTypeInfoList"]);
      queryClient.invalidateQueries(["contractorTypeInfo", typeId]);
      toast.success("Record updated successfully!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update record.");
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
          <SheetTitle>Edit Contractor Type Info</SheetTitle>
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
                        <SelectTrigger className="opacity-70">
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
                        <SelectTrigger className="opacity-70">
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

              <SheetFooter className="flex flex-row items-center justify-between">
                <SheetClose asChild>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Updating..." : "Update Record"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}