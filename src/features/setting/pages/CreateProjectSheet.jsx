import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, X, Cog } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import api from "@/api/Api";

const projectSchema = z.object({
  P_NAME: z.string().min(1, "Project name is required"),
  P_TYPE: z.string().min(1, "Project type is required"),
  P_ADDRESS: z.string().min(1, "Address is required"),
  SUBWRB: z.string().min(1, "Suburb is required"),
  POSTCODE: z.string().min(1, "Postcode is required"),
  STATE: z.string().min(1, "State is required"),
  USER_ID: z.coerce.number().default(105),
  USER_BY: z.coerce.number().default(105),
  UPDATED_BY: z.coerce.number().default(105),
});

export function CreateProjectSheet({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [savedProjectId, setSavedProjectId] = useState(null);
  const [creatingProcess, setCreatingProcess] = useState(false);
  const makeProcessRef = useRef(null); // Ref to Make Process button

  // Form setup
  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      P_NAME: "",
      P_TYPE: "",
      P_ADDRESS: "",
      SUBWRB: "",
      POSTCODE: "",
      STATE: "",
      USER_ID: 105,
      USER_BY: 105,
      UPDATED_BY: 105,
    },
  });

  // Fetch Project Types
  const { data: projectTypes = [] } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => {
      const res = await api.get("/project_type_api.php");
      return res.data?.data || [];
    },
  });

  // Save Project Mutation
  const mutation = useMutation({
    mutationFn: async (formData) => api.post("/project.php", formData),
    onSuccess: (res) => {
      const newId = res.data?.data?.P_ID;
      setSavedProjectId(newId);
      queryClient.invalidateQueries(["customers"]);
      toast.success("Project added successfully!");
    },
    onError: () => {
      toast.error("Failed to save project data.");
    },
  });

  // Auto-scroll Make Process button into view when savedProjectId changes
  useEffect(() => {
    if (savedProjectId && makeProcessRef.current) {
      makeProcessRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [savedProjectId]);

  // Submit handler
  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  // Reset form when sheet closes
  const handleClose = () => {
    form.reset();
    setSavedProjectId(null);
    onClose();
  };

  // Handle Make Process button click
  const handleMakeProcess = async () => {
    if (!savedProjectId) return;
    setCreatingProcess(true);

    try {
      const res = await api.post("/process_contractor.php", {
        P_ID: savedProjectId,
        CREATION_BY: 105,
      });

      const processId = res.data?.data?.PROCESS_ID;

      if (!processId) throw new Error("Process creation failed");

      toast.success("Process created successfully!");
      onClose();
      navigate(`/dashboard/process/${processId}`);
    } catch (error) {
      console.error(error);
      toast.error("Error creating process!");
    } finally {
      setCreatingProcess(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Project</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Name */}
              <FormField
                control={form.control}
                name="P_NAME"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Project Name</FormLabel>
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
                name="SUBWRB"
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

              {/* Project Type */}
              <FormField
                control={form.control}
                name="P_TYPE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map((pt) => (
                          <SelectItem key={pt.ID} value={pt.ID.toString()}>
                            {pt.NAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

              {/* Address */}
              <FormField
                control={form.control}
                name="P_ADDRESS"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Project Address</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  <Save size={16} className="mr-2" />
                  {mutation.isPending ? "Saving..." : "Save Project"}
                </Button>
              </div>

              {/* Make Process Button */}
              {savedProjectId && (
                <div
                  ref={makeProcessRef}
                  className="col-span-2 flex justify-center mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <Button
                    type="button"
                    onClick={handleMakeProcess}
                    className="w-full"
                    disabled={creatingProcess}
                  >
                    <Cog size={16} className="mr-2" />
                    {creatingProcess ? "Creating..." : "Make Process"}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
