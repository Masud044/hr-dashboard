import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import api from "../../../api/Api";
import ContractionProcessList from "./ContractionProcessList";

const ContractionProcess = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  // 🔹 Form State
  const [formData, setFormData] = useState({
    PROCESS_ID: "",
    SUB_CONTRACT_ID: "",
    DEPENDENT_ID: "",
    SORT_ID: "",
    CREATION_BY: 700,
    COST: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // 🔹 Fetch existing record when editing
  const { data } = useQuery({
    queryKey: ["process", id],
    queryFn: async () => {
      const res = await api.get(`/construction_process.php?id=${id}`);
      const record = res.data?.data;
      if (Array.isArray(record)) return record.find((r) => r.ID == id);
      return record;
    },
    enabled: !!id,
  });

  // 🔹 Preload existing data for editing
  useEffect(() => {
    if (data) {
      setFormData({
        PROCESS_ID: data.PROCESS_ID || "",
        SUB_CONTRACT_ID: data.SUB_CONTRACT_ID || "",
        DEPENDENT_ID: data.DEPENDENT_ID || "",
        SORT_ID: data.SORT_ID || "",
        CREATION_BY: data.CREATION_BY || 700,
        COST: data.COST || "",
      });
    }
  }, [data]);

  // 🔹 Mutation (Add / Update)
  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEditing) {
        return await api.put("/construction_process.php", {
          ...formData,
          ID: id,
          UPDATE_BY: 700,
        });
      } else {
        return await api.post("/construction_process.php", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["processes"]);
      setMessage({
        type: "success",
        text: isEditing
          ? "✅ Process updated successfully!"
          : "✅ Process added successfully!",
      });
      if (!isEditing) resetForm();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    },
    onError: () => {
      setMessage({
        type: "error",
        text: "❌ Failed to save data. Please try again.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    },
  });

  // 🔹 Input Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  // 🔹 Reset Form
  const resetForm = () => {
    setFormData({
      PROCESS_ID: "",
      SUB_CONTRACT_ID: "",
      DEPENDENT_ID: "",
      SORT_ID: "",
      CREATION_BY: 700,
      COST: "",
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="p-6 bg-white shadow rounded-lg mt-8">
        <h2 className="font-semibold mb-6 text-sm text-gray-800 border-b pb-2">
          {isEditing ? "Edit Contraction Process" : "Add New Contraction Process"}
        </h2>

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
            label="Process ID"
            name="PROCESS_ID"
            value={formData.PROCESS_ID}
            onChange={handleChange}
          />
          <Input
            label="Sub Contract ID"
            name="SUB_CONTRACT_ID"
            value={formData.SUB_CONTRACT_ID}
            onChange={handleChange}
          />
          <Input
            label="Dependent ID"
            name="DEPENDENT_ID"
            value={formData.DEPENDENT_ID}
            onChange={handleChange}
          />
          <Input
            label="Sort ID"
            name="SORT_ID"
            value={formData.SORT_ID}
            onChange={handleChange}
          />
          <Input
            label="Cost"
            name="COST"
            value={formData.COST}
            onChange={handleChange}
          />
          <Input
            label="Created By"
            name="CREATION_BY"
            value={formData.CREATION_BY}
            onChange={handleChange}
          />

          <div className="col-span-3 flex justify-end gap-3 mt-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-green-600 text-sm text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-500"
            >
              <Save size={16} />
              {mutation.isPending
                ? "Saving..."
                : isEditing
                ? "Update Process"
                : "Save Process"}
            </button>
          </div>
        </form>
      </div>

      {/* 🔹 Show List Below */}
      <ContractionProcessList />
    </div>
  );
};

// 🔹 Reusable Input Component
const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div className="flex flex-col">
    <label className="text-gray-700 text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="border border-gray-300 text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
    />
  </div>
);

export default ContractionProcess;
