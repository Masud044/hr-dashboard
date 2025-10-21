import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import api from "../../../api/Api";
import ProjectList from "./ProjectList";

const Project = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    P_NAME: "",
    P_TYPE: "",
    P_ADDRESS: "",
    SUBWRB: "",
    POSTCODE: "",
    STATE: "",
    USER_ID: 105,
    USER_BY: 105,
    UPDATED_BY: 105,
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // 🔹 Fetch Project Type LOV
  const { data: projectTypes, isLoading: loadingTypes } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => {
      const res = await api.get("/project_type_api.php");
      return res.data?.data || [];
    },
  });

  // 🔹 Fetch project data if editing
  const { data } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await api.get(`/project.php?project_id=${id}`);
      const projectData = res.data?.data;
      if (Array.isArray(projectData)) {
        return projectData.find((p) => p.P_ID === id);
      }
      return projectData;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEditing) {
        return await api.put("/project.php", { ...formData, P_ID: id });
      } else {
        return await api.post("/project.php", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      setMessage({
        type: "success",
        text: isEditing
          ? "✅ Project updated successfully!"
          : "✅ Project added successfully!",
      });
      if (!isEditing) resetForm();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    },
    onError: () => {
      setMessage({
        type: "error",
        text: "❌ Failed to save project data. Please try again.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = [
      "P_NAME",
      "P_TYPE",
      "P_ADDRESS",
      "SUBWRB",
      "POSTCODE",
      "STATE",
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
      P_NAME: "",
      P_TYPE: "",
      P_ADDRESS: "",
      SUBWRB: "",
      POSTCODE: "",
      STATE: "",
      USER_ID: 105,
      USER_BY: 105,
      UPDATED_BY: 105,
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="p-6 bg-white shadow rounded-lg mt-8">
        <h2 className="font-semibold mb-6 text-sm text-gray-800 border-b pb-2">
          {isEditing ? "Edit Project" : "Add New Project"}
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
            label="Project Name"
            name="P_NAME"
            value={formData.P_NAME}
            onChange={handleChange}
          />

          {/* 🔹 Project Type LOV Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-gray-700 text-sm font-medium text-right w-32">
              Project Type
            </label>
            <select
              name="P_TYPE"
              value={formData.P_TYPE}
              onChange={handleChange}
              disabled={loadingTypes}
              className="border border-gray-600 opacity-60 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all flex-1"
            >
              <option value="">Select Project Type</option>
              {projectTypes?.map((type) => (
                <option key={type.ID} value={type.ID}>
                  {type.NAME}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Address"
            name="P_ADDRESS"
            value={formData.P_ADDRESS}
            onChange={handleChange}
          />
          <Input
            label="Subwrb"
            name="SUBWRB"
            value={formData.SUBWRB}
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
                ? "Update Project"
                : "Save Project"}
            </button>
          </div>
        </form>
      </div>

      <ProjectList />
    </div>
  );
};

// 🔹 Reusable Input
const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div className="flex items-center gap-2">
    <label className="text-gray-700 text-sm font-medium text-right w-32">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="border border-gray-600 opacity-60 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all flex-1"
    />
  </div>
);

export default Project;
