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
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* 🔹 Each field is its own mini grid: label col + input col */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-3">
            <label className="text-gray-700 text-sm font-medium text-right">
              Supplier Name
            </label>
            <input
              type="text"
              {...register("SUPPLIER_NAME")}
              className="border border-black rounded-lg px-2 py-1 w-[80%]"
            />
            {errors.SUPPLIER_NAME && (
              <span className="col-span-2 text-red-600 text-xs">
                {errors.SUPPLIER_NAME.message}
              </span>
            )}
          </div>

          {!isEditing && (
            <div className="grid grid-cols-[70px_1fr] items-center gap-3">
              <label className="text-gray-700 text-sm font-medium text-right">
                Password
              </label>
              <input
                type="password"
                {...register("PASSWORD")}
                className="border rounded-lg  border-black px-2 py-1 w-[80%]"
              />
              {errors.PASSWORD && (
                <span className="col-span-2 text-red-600 text-xs">
                  {errors.PASSWORD.message}
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-[45px_1fr] items-center gap-3">
            <label className="text-gray-700 text-sm font-medium text-right">
              Address
            </label>
            <input
              type="text"
              {...register("ADDRESS")}
              className="border border-black rounded-lg px-2 py-1 w-full"
            />
            {errors.ADDRESS && (
              <span className="col-span-2 text-red-600 text-xs">
                {errors.ADDRESS.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-[100px_1fr] items-center gap-3">
            <label className="text-gray-700 text-sm font-medium text-right">
              Contact Person
            </label>
            <input
              type="text"
              {...register("CONTACT_PERSON")}
              className="border rounded-lg border-black px-2 py-1 w-[80%]"
            />
          </div>

          <div className="grid grid-cols-[70px_1fr] items-center gap-3">
            <label className="text-gray-700 text-sm font-medium text-right">
              Phone
            </label>
            <input
              type="text"
              {...register("PHONE")}
              className="border border-black rounded-lg px-2 py-1 w-[70%]"
            />
          </div>

          <div className="grid grid-cols-[45px_1fr] items-center gap-3">
            <label className="text-gray-700 text-sm font-medium text-right">
              Mobile
            </label>
            <input
              type="text"
              {...register("MOBILE")}
              className="border rounded-lg border-black px-2 py-1 w-[70%]"
            />
          </div>

          <div className="grid grid-cols-[100px_1fr] items-center gap-3">
            <label className="text-gray-700 text-sm font-medium text-right">
              Email
            </label>
            <input
              type="text"
              {...register("EMAIL")}
              className="border rounded-lg border-black px-2 py-1 w-[100%]"
            />
          </div>

          <div className="grid grid-cols-[70px_1fr] items-center gap-3">
            <label className="text-gray-700 text-sm font-medium text-right">
              Due
            </label>
            <input
              type="text"
              {...register("DUE")}
              className="border border-black rounded-lg px-2 py-1 w-[60%]"
            />
          </div>

          <div className="grid grid-cols-[45px_1fr] items-center gap-3">
            <label className="text-gray-700 text-sm font-medium text-right">
              Remarks
            </label>
            <input
              type="text"
              {...register("REMARKS")}
              className="border border-black rounded-lg px-2 py-1 w-[60%]"
            />
          </div>

          <div className="grid grid-cols-[100px_1fr] items-center gap-3">
            <label className="text-gray-700 text-sm font-medium text-right">
              Fax
            </label>
            <input
              type="text"
              {...register("FAX")}
              className="border border-black rounded-lg px-2 py-1 w-[60%]"
            />
          </div>

          <div className="grid grid-cols-[75px_1fr] items-center gap-3">
            <label className="text-gray-700 text-sm font-medium text-right">
              Organization ID
            </label>
            <input
              type="text"
              {...register("ORG_ID")}
              className="border border-black rounded-lg px-2 py-1 w-[80%]"
            />
          </div>

          {/* ✅ Button Section */}
          <div className="col-span-3 flex justify-end gap-3 mt-4">
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
