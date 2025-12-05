import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import api from "../../../api/Api";

import { ContratorListTwo } from "./ContratorListTwo";
import { SectionContainer } from "@/components/SectionContainer";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const Contrator = () => {
  const { id } = useParams();
  useEffect(() => {
  window.scrollTo({
    top: 80,
    behavior: "smooth",
  });
}, [id]);

  const queryClient = useQueryClient();
  const isEditing = !!id;

  // 🔹 Form state
  const [formData, setFormData] = useState({
    CONTRATOR_NAME: "",
    ENTRY_BY: 500,
    ABN: "",
    LIEC_NO: "",
    SUBURB: "",
    POSTCODE: "",
    STATE: "",
    ADDRESS: "",
    CONTACT_PERSON: "",
    PHONE: "",
    EMAIL: "",
    MOBILE: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // 🔹 Fetch contractor data (if editing)
const { data } = useQuery({
  queryKey: ["contrator", id],
  queryFn: async () => {
    const res = await api.get(`/contrator.php?contrator_id=${id}`);
    // Ensure the correct data structure (array or object)
    const result = res.data?.data || res.data;
    return Array.isArray(result) ? result[0] : result;
  },
  enabled: !!id,
});


  // 🔹 Prefill form when data loads
  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  // 🔹 Mutation for Add / Update
  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEditing) {
        // Update existing contractor
        return await api.put("/contrator.php", {
          ...formData,
          CONTRATOR_ID: id,
        });
      } else {
        // Create new contractor
        return await api.post("/contrator.php", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contrator", id]);
      setMessage({
        type: "success",
        text: isEditing
          ? "✅ Contractor updated successfully!"
          : "✅ Contractor added successfully!",
      });
      if (!isEditing) resetForm();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    },
    onError: (err) => {
      console.error(err);
      setMessage({
        type: "error",
        text: "❌ Failed to save contractor data. Please try again.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    },
  });

  // 🔹 Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
     const required = [
     "CONTRATOR_NAME",
    "ENTRY_BY",
    "ABN",
    "LIEC_NO",
    "SUBURB",
    "POSTCODE",
    "STATE",
    "ADDRESS",
    "CONTACT_PERSON",
    "PHONE",
    "EMAIL",
    "MOBILE",
    ];
    const empty = required.find(
      (f) => !formData[f] || formData[f].toString().trim() === ""
    );
    if (empty) {
      setMessage({ text: "Please fill all required fields.", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }
    mutation.mutate(formData);
  };

  // 🔹 Reset form
  const resetForm = () => {
    setFormData({
      CONTRATOR_NAME: "",
      ENTRY_BY: 500,
      ABN: "",
      LIEC_NO: "",
      SUBURB: "",
      POSTCODE: "",
      STATE: "",
      ADDRESS: "",
      CONTACT_PERSON: "",
      PHONE: "",
      EMAIL: "",
      MOBILE: "",
    });
  };

  return (
    <SectionContainer>
       <div className="">
      <div className="bg-white p-6 shadow rounded-lg mt-8">
        <h2 className="text-sm font-semibold mb-6 text-gray-800 border-b pb-2">
          {isEditing ? "Edit Contractor Information" : "Add New Contractor"}
        </h2>

        {/* 🔹 Message */}
        {message.text && (
          <div
            className={`mb-4 p-3 rounded text-white ${
              message.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-2"
        >
          
         {/* Contractor Name */}
  <div className="flex flex-col gap-1 w-[60%] flex-1">
    <Label className="text-sm font-medium text-gray-900">Contractor Name</Label>
    <Input
      name="CONTRATOR_NAME"
      value={formData.CONTRATOR_NAME}
      onChange={handleChange}
      className="h-10 bg-gray-50 border border-gray-300"
    />
  </div>

  {/* ABN */}
  <div className="flex flex-col gap-1 w-[40%] flex-1">
    <Label className="text-sm font-medium text-gray-900">ABN</Label>
    <Input
      name="ABN"
      value={formData.ABN}
      onChange={handleChange}
      className="h-10 bg-gray-50 border border-gray-300"
    />
  </div>

  {/* License No */}
  <div className="flex flex-col gap-1 w-[40%] flex-1">
    <Label className="text-sm font-medium text-gray-900">License No</Label>
    <Input
      name="LIEC_NO"
      value={formData.LIEC_NO}
      onChange={handleChange}
      className="h-10 bg-gray-50 border border-gray-300"
    />
  </div>

  {/* Suburb */}
  <div className="flex flex-col gap-1 w-[60%] flex-1">
    <Label className="text-sm font-medium text-gray-900">Suburb</Label>
    <Input
      name="SUBURB"
      value={formData.SUBURB}
      onChange={handleChange}
      className="h-10 bg-gray-50 border border-gray-300"
    />
  </div>

  {/* Postcode */}
  <div className="flex flex-col gap-1 w-[40%] flex-1">
    <Label className="text-sm font-medium text-gray-900">Postcode</Label>
    <Input
      name="POSTCODE"
      value={formData.POSTCODE}
      onChange={handleChange}
      className="h-10 bg-gray-50 border border-gray-300"
    />
  </div>

  {/* State */}
  <div className="flex flex-col gap-1 w-[50%] flex-1">
    <Label className="text-sm font-medium text-gray-900">State</Label>
    <Input
      name="STATE"
      value={formData.STATE}
      onChange={handleChange}
      className="h-10 bg-gray-50 border border-gray-300"
    />
  </div>

 

  {/* Contact Person */}
  <div className="flex flex-col gap-1 w-[50%] flex-1">
    <Label className="text-sm font-medium text-gray-900">Contact Person</Label>
    <Input
      name="CONTACT_PERSON"
      value={formData.CONTACT_PERSON}
      onChange={handleChange}
      className="h-10 bg-gray-50 border border-gray-300"
    />
  </div>

  {/* Phone */}
  <div className="flex flex-col gap-1 w-[50%] flex-1">
    <Label className="text-sm font-medium text-gray-900">Phone</Label>
    <Input
      name="PHONE"
      value={formData.PHONE}
      onChange={handleChange}
      className="h-10 bg-gray-50 border border-gray-300"
    />
  </div>

  {/* Email */}
  <div className="flex flex-col gap-1 w-[70%] flex-1">
    <Label className="text-sm font-medium text-gray-900">Email</Label>
    <Input
      name="EMAIL"
      type="email"
      value={formData.EMAIL}
      onChange={handleChange}
      className="h-10 bg-gray-50 border border-gray-300"
    />
  </div>

  {/* Mobile */}
  <div className="flex flex-col gap-1 w-[50%] flex-1">
    <Label className="text-sm font-medium text-gray-900">Mobile</Label>
    <Input
      name="MOBILE"
      value={formData.MOBILE}
      onChange={handleChange}
      className="h-10 bg-gray-50 border border-gray-300"
    />
  </div>
   {/* Address (textarea) */}
  <div className="flex flex-col gap-1 flex-1 md:col-span-2">
    <Label className="text-sm font-medium text-gray-900">Address</Label>
    <Textarea
      name="ADDRESS"
      value={formData.ADDRESS}
      onChange={handleChange}
      rows={3}
      className="bg-gray-50 border border-gray-300"
    />
  </div>


          {/* Buttons */}
          <div className="col-span-4 flex justify-end gap-3 mt-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-green-600 text-white px-4 py-2 text-sm rounded flex items-center gap-2 hover:bg-green-500"
            >
              <Save size={16} />
              {mutation.isPending
                ? "Saving..."
                : isEditing
                ? "Update Contractor"
                : "Save Contractor"}
            </button>
          </div>
        </form>
      </div>
      {/* <ContratorList></ContratorList> */}
      <ContratorListTwo></ContratorListTwo>
    </div>
    </SectionContainer>
   
  );
};



export default Contrator;
