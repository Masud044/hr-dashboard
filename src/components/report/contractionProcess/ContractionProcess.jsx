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

  const [formData, setFormData] = useState({
    PROCESS_ID: "",
    SUB_CONTRACT_ID: "",
    DEPENDENT_ID: "",
    SORT_ID: "",
    CREATION_BY: 700,
    COST: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });

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
    onSuccess: (res) => {
      queryClient.invalidateQueries(["processes"]);

      if (res.data?.status === "success") {
        const newRecord = res.data?.data;
        queryClient.setQueryData(["processes"], (oldData) => {
          if (!oldData) return [newRecord];
          const filtered = oldData.filter(
            (item) => item.ID !== (isEditing ? Number(id) : newRecord.ID)
          );
          return [newRecord, ...filtered];
        });

        setMessage({
          text: isEditing
            ? "Process updated successfully!"
            : "Process added successfully!",
          type: "success",
        });

        if (!isEditing) resetForm();
      } else {
        setMessage({
          text: res.data?.message || "Something went wrong. Please try again.",
          type: "error",
        });
      }
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    },
    onError: () => {
      setMessage({
        text: "Failed to save data. Please try again.",
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = [
      "PROCESS_ID",
      "SUB_CONTRACT_ID",
      "DEPENDENT_ID",
      "SORT_ID",
      "COST",
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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow rounded-2xl p-6 md:p-8 transition-all">
        <h2 className="font-semibold mb-6 text-lg text-gray-800 border-b pb-3">
          {isEditing ? "Edit Construction Process" : "Add New Construction Process"}
        </h2>

        {message.text && (
          <div
            className={`text-center text-sm font-medium mb-4 ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Responsive Form Grid */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6"
        >
          <Input
            label="Process ID"
            name="PROCESS_ID"
            value={formData.PROCESS_ID}
            onChange={handleChange}
           labelWidth="w-24"
           inputWidth="w-30"
          />
          <Input
            label="Sub Contract ID"
            name="SUB_CONTRACT_ID"
            value={formData.SUB_CONTRACT_ID}
            onChange={handleChange}
             labelWidth="w-27"
           inputWidth="w-30"
          />
          <Input
            label="Dependent ID"
            name="DEPENDENT_ID"
            value={formData.DEPENDENT_ID}
            onChange={handleChange}
            labelWidth="w-24"
           inputWidth="w-30"
          />
          <Input
            label="Sort ID"
            name="SORT_ID"
            value={formData.SORT_ID}
            onChange={handleChange}
             labelWidth="w-24"
           inputWidth="w-30"
          />
          <Input
            label="Cost"
            name="COST"
            value={formData.COST}
            onChange={handleChange}
            labelWidth="w-24"
           inputWidth="w-30"
          />
          <Input
            label="Created By"
            name="CREATION_BY"
            value={formData.CREATION_BY}
            onChange={handleChange}
             labelWidth="w-24"
           inputWidth="w-30"
          />

          <div className="col-span-full flex justify-end mt-6">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md disabled:opacity-70"
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

      {/* List Section */}
      <div className="mt-10">
        <ContractionProcessList />
      </div>
    </div>
  );
};

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  labelWidth = "w-32",  // default label width
  inputWidth = "flex-1", // default input width
}) => (
  <div className="flex flex-row items-center gap-4">
    <label className={`text-gray-700 text-sm font-medium text-right ${labelWidth}`}>
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`border border-gray-600 opacity-60 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all ${inputWidth}`}
    />
  </div>
);



export default ContractionProcess;
