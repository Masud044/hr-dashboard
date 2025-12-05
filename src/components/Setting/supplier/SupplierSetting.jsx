import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../../api/Api";

import { SectionContainer } from "../../SectionContainer";
import { SupplierListTwo } from "./SupplierListTwo";
import { toast } from "react-toastify";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"



// 🔹 Zod validation schema
const supplierSchema = z.object({
  SUPPLIER_NAME: z.string().min(1, "Supplier Name is required"),
  
  ADDRESS: z.string().min(1, "Address is required"),
  CONTACT_PERSON: z.string().min(1, "Contact Person is required"),
  PHONE: z.string().min(1, "Phone is required"),
  MOBILE: z.string().min(1, "Mobile is required"),
  EMAIL: z.string().email("Invalid email"),
  ORG_ID: z.string().min(1, "Organization ID is required"),
  DUE: z.string().min(1, "Due is required"),
  REMARKS: z.string().optional(),
  FAX: z.string().optional(),
  STATUS: z.string().min(1),
  ENTRY_BY: z.string().min(1),
});

const SupplierPage = () => {
  const { id } = useParams();

  useEffect(() => {
  window.scrollTo({
    top: 80,
    behavior: "smooth",
  });
}, [id]);

  const queryClient = useQueryClient();
  const isEditing = !!id;

  // 🔹 React Hook Form with Zod
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      SUPPLIER_NAME: "",
      ENTRY_BY: "101",
     
      ORG_ID: "",
      ADDRESS: "",
      CONTACT_PERSON: "",
      PHONE: "",
      EMAIL: "",
      MOBILE: "",
      DUE: "",
      REMARKS: "",
      FAX: "",
      STATUS: "0",
    },
  });

  // 🔹 Fetch supplier data for editing
  const { data } = useQuery({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const res = await api.get(`/supplier_info.php?id=${id}`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      Object.keys(data).forEach((key) => setValue(key, data[key]));
    }
  }, [data, setValue]);

  // 🔹 Mutation for create/update
  const mutation = useMutation({
    mutationFn: async (formData) => {
    

      if (isEditing) {
        return await api.put("/supplier_info.php", {
          ...formData,
          SUPPLIER_ID: id,
          UPDATE_BY: 101,
        });
      } else {
        return await api.post("/supplier_info.php", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["supplier", id]);
      reset();
      toast.success(isEditing ? "Supplier updated!" : "Supplier added!");
    },
    onError: () => {
      
      toast.error("Failed to save supplier data.")
    },
  });

  const onSubmit = (formData) => mutation.mutate(formData);

  return (
    <SectionContainer> 
      <div className="bg-white p-6 shadow rounded-lg mt-8">
        <h2 className="text-sm font-semibold mb-6 text-gray-800 border-b pb-2">
          {isEditing ? "Edit Supplier Information" : "Add New Supplier"}
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
        {/* Supplier Name */}
<div className="flex flex-col w-[60%]">
  <Label className="text-sm text-gray-900">
    Supplier Name <span className="text-red-700">*</span>
  </Label>
  <Input
    placeholder="Enter Supplier Name"
    {...register("SUPPLIER_NAME")}
    className="bg-gray-50"
  />
</div>

{/* Org ID */}
<div className="flex w-[40%] flex-col">
  <Label className="text-sm text-gray-900">Organization ID</Label>
  <Input
    type="number"
    {...register("ORG_ID")}
    className="bg-gray-50 "
  />
</div>

{/* Contact Person */}
<div className="flex w-[60%] flex-col">
  <Label className="text-sm text-gray-900">
    Contact Person <span className="text-red-700">*</span>
  </Label>
  <Input
    {...register("CONTACT_PERSON")}
    className="bg-gray-50"
  />
</div>

{/* Mobile */}
<div className="flex w-[50%] flex-col">
  <Label className="text-sm text-gray-900">Mobile</Label>
  <Input
    type="number"
    {...register("MOBILE")}
    className="bg-gray-50 "
  />
</div>

{/* Phone */}
<div className="flex w-[50%] flex-col">
  <Label className="text-sm text-gray-900">Phone</Label>
  <Input
    type="number"
    {...register("PHONE")}
    className="bg-gray-50 "
  />
</div>

{/* Email */}
<div className="flex w-[70%] flex-col">
  <Label className="text-sm text-gray-900">Email</Label>
  <Input
    type="email"
    {...register("EMAIL")}
    className="bg-gray-50 "
  />
</div>

{/* Fax */}
<div className="flex w-[60%] flex-col">
  <Label className="text-sm text-gray-900">Fax</Label>
  <Input
    type="text"
    {...register("FAX")}
    className="bg-gray-50 "
  />
</div>

{/* Due (Select) */}
<div className="flex w-[40%] flex-col">
  <Label className="text-sm text-gray-900">Due</Label>
 <Input
    type="text"
    {...register("DUE")}
    className="bg-gray-50 "
  />
 
</div>

{/* Address */}
<div className="flex flex-col md:col-span-2">
  <Label className="text-sm text-gray-900">
    Address <span className="text-red-700">*</span>
  </Label>
  <Textarea
    rows={3}
    {...register("ADDRESS")}
    className="bg-gray-50"
  />
</div>

{/* Remarks */}
<div className="flex flex-col md:col-span-1">
  <Label className="text-sm text-gray-900">Remarks</Label>
  <Textarea
    rows={2}
    {...register("REMARKS")}
    className="bg-gray-50"
  />
</div>






          {/* ✅ Button Section */}
          <div className="col-span-4 flex justify-end gap-3 mt-4">
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="bg-green-600 text-white px-4 py-2 text-sm rounded flex items-center gap-2 hover:bg-green-500"
            >
              <Save size={16} />
              {mutation.isPending
                ? "Saving..."
                : isEditing
                ? "Update Supplier"
                : "Save Supplier"}
            </button>
          </div>
        </form>
      </div>
      {/* <SupplierList /> */}
      <SupplierListTwo></SupplierListTwo>
    </SectionContainer>
   
  );
};

export default SupplierPage;
