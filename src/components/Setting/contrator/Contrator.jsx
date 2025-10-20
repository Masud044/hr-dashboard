import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import api from "../../../api/Api";
import ContratorList from "./ContratorList";

const Contrator = () => {
  const { id } = useParams();
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
    <div className="max-w-5xl mx-auto">
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Input
            label="Contrator Name"
            name="CONTRATOR_NAME"
            value={formData.CONTRATOR_NAME}
            onChange={handleChange}
          />
          <Input
            label="ABN"
            name="ABN"
            value={formData.ABN}
            onChange={handleChange}
          />
          <Input
            label="License No"
            name="LIEC_NO"
            value={formData.LIEC_NO}
            onChange={handleChange}
          />
          <Input
            label="Suburb"
            name="SUBURB"
            value={formData.SUBURB}
            onChange={handleChange}
          />
          <Input
            label="Postcode"
            name="POSTCODE"
            value={formData.POSTCODE}
            onChange={handleChange}
          />
          <Input
            label="State"
            name="STATE"
            value={formData.STATE}
            onChange={handleChange}
          />
          <Input
            label="Address"
            name="ADDRESS"
            value={formData.ADDRESS}
            onChange={handleChange}
          />
          <Input
            label="Contact Person"
            name="CONTACT_PERSON"
            value={formData.CONTACT_PERSON}
            onChange={handleChange}
          />
          <Input
            label="Phone"
            name="PHONE"
            value={formData.PHONE}
            onChange={handleChange}
          />
          <Input
            label="Email"
            name="EMAIL"
            value={formData.EMAIL}
            onChange={handleChange}
          />
          <Input
            label="Mobile"
            name="MOBILE"
            value={formData.MOBILE}
            onChange={handleChange}
          />

          {/* Buttons */}
          <div className="col-span-3 flex justify-end gap-3 mt-4">
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
      <ContratorList></ContratorList>
    </div>
  );
};

// 🔹 Reusable Input
const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  labelWidth = "w-32",   // Tailwind width for label (default 8rem)
  inputWidth = "flex-1", // Tailwind width for input (default full)
}) => (
  <div className="flex items-center gap-2">
    <label
      className={`text-gray-700 text-sm font-medium text-right ${labelWidth}`}
    >
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`border border-gray-500 text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${inputWidth}`}
    />
  </div>
);

export default Contrator;
