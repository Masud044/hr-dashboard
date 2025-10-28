import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../../api/Api";
import SupplierList from "./supplierlist";

// 🔹 Zod validation schema
const supplierSchema = z.object({
  SUPPLIER_NAME: z.string().min(1, "Supplier Name is required"),
  PASSWORD: z.string().optional(), // conditional handled later
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
  const queryClient = useQueryClient();
  const isEditing = !!id;

  // 🔹 React Hook Form with Zod
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      SUPPLIER_NAME: "",
      ENTRY_BY: "101",
      PASSWORD: "",
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
      if (!isEditing && !formData.PASSWORD) {
        throw new Error("Password is required for new supplier");
      }

      if (isEditing) {
        return await api.put("/supplier_info.php", { ...formData, SUPPLIER_ID: id, UPDATE_BY: 101 });
      } else {
        return await api.post("/supplier_info.php", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["supplier", id]);
      reset();
      alert(isEditing ? "Supplier updated!" : "Supplier added!");
    },
    onError: (err) => {
      alert(err.message || "Failed to save supplier data.");
    },
  });

  const onSubmit = (formData) => mutation.mutate(formData);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white p-6 shadow rounded-lg mt-8">
        <h2 className="text-sm font-semibold mb-6 text-gray-800 border-b pb-2">
          {isEditing ? "Edit Supplier Information" : "Add New Supplier"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="flex flex-row items-center justify-center">
            <label className="text-gray-700 text-sm font-medium">Supplier Name</label>
            <input type="text" {...register("SUPPLIER_NAME")} className="border rounded px-2 py-1" />
            {errors.SUPPLIER_NAME && <span className="text-red-600 text-xs">{errors.SUPPLIER_NAME.message}</span>}
          </div>

          {!isEditing && (
            <div className="flex flex-row items-center justify-center">
              <label className="text-gray-700 text-sm font-medium">Password</label>
              <input type="password" {...register("PASSWORD")} className="border w-40 rounded px-2 py-1" />
              {errors.PASSWORD && <span className="text-red-600 text-xs">{errors.PASSWORD.message}</span>}
            </div>
          )}

          <div className="flex flex-row items-center justify-center text-right">
            <label className="text-gray-700 text-sm font-medium">Address</label>
            <input type="text" {...register("ADDRESS")} className="border w-200 rounded px-2 py-1" />
            {errors.ADDRESS && <span className="text-red-600 text-xs">{errors.ADDRESS.message}</span>}
          </div>
 
          <div className="flex flex-row items-center justify-center">
            <label className="text-gray-700 text-sm font-medium">Contact Person</label>
            <input type="text" {...register("CONTACT_PERSON")} className="border w-40 rounded px-2 py-1" />
            {errors.CONTACT_PERSON && <span className="text-red-600 text-xs">{errors.CONTACT_PERSON.message}</span>}
          </div>

          <div className="flex flex-row items-center justify-center">
            <label className="text-gray-700 text-sm font-medium">Phone</label>
            <input type="text" {...register("PHONE")} className="border rounded px-2 py-1" />
            {errors.PHONE && <span className="text-red-600 text-xs">{errors.PHONE.message}</span>}
          </div>

          <div className="flex flex-row items-center justify-center">
            <label className="text-gray-700 text-sm font-medium">Mobile</label>
            <input type="text" {...register("MOBILE")} className="border rounded px-2 py-1" />
            {errors.MOBILE && <span className="text-red-600 text-xs">{errors.MOBILE.message}</span>}
          </div>

          <div className="flex flex-row items-center justify-center">
            <label className="text-gray-700 text-sm font-medium text-right">Email</label>
            <input type="text" {...register("EMAIL")} className="border rounded px-2 py-1" />
            {errors.EMAIL && <span className="text-red-600 text-xs">{errors.EMAIL.message}</span>}
          </div>

          <div className="flex flex-row items-center justify-center">
            <label className="text-gray-700 text-sm font-medium text-right">Due</label>
            <input type="text" {...register("DUE")} className="border w-30 rounded px-2 py-1" />
            {errors.DUE && <span className="text-red-600 text-xs">{errors.DUE.message}</span>}
          </div>

          <div className="flex flex-row items-center justify-center">
            <label className="text-gray-700 text-sm font-medium text-right">Remarks</label>
            <input type="text" {...register("REMARKS")} className="border w-30 rounded px-2 py-1" />
          </div>

          <div className="flex flex-row items-center justify-center">
            <label className="text-gray-700 text-sm font-medium text-right">Fax</label>
            <input type="text" {...register("FAX")} className="border w-30 rounded px-2 py-1" />
          </div>

          <div className="flex flex-row items-center justify-center">
            <label className="text-gray-700 text-sm font-medium text-right">Organization ID</label>
            <input type="text" {...register("ORG_ID")} className="border w-30 rounded px-2 py-1" />
            {errors.ORG_ID && <span className="text-red-600 text-xs">{errors.ORG_ID.message}</span>}
          </div>

          <div className="col-span-3 flex justify-end gap-3 mt-4">
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="bg-green-600 text-white px-4 py-2 text-sm rounded flex items-center gap-2 hover:bg-green-500"
            >
              <Save size={16} />
              {mutation.isPending ? "Saving..." : isEditing ? "Update Supplier" : "Save Supplier"}
            </button>
          </div>
        </form>
      </div>
      <SupplierList />
    </div>
  );
};

export default SupplierPage;
