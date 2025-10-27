import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Cog, Upload } from "lucide-react";
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
  const [savedProjectId, setSavedProjectId] = useState(null);
  const [editableLines, setEditableLines] = useState([]);

  // 🔹 Fetch Project Types
  const { data: projectTypes, isLoading: loadingTypes } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => {
      const res = await api.get("/project_type_api.php");
      return res.data?.data || [];
    },
  });

  // 🔹 Fetch Contractor Types (21 items)
  const { data: contractorTypes = [] } = useQuery({
    queryKey: ["contractorTypes"],
    queryFn: async () => {
      const res = await api.get("/contractor_api.php");
      return res.data?.data || [];
    },
  });

  // 🔹 Fetch Project Data (for edit mode)
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

  // 🔹 Save / Update Project
  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEditing) {
        return await api.put("/project.php", { ...formData, P_ID: id });
      } else {
        return await api.post("/project.php", formData);
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["projects"]);
      const newId = res.data?.P_ID || id;
      setSavedProjectId(newId);
      setMessage({
        type: "success",
        text: isEditing
          ? "✅ Project updated successfully!"
          : "✅ Project added successfully!",
      });
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

  // 🔹 Fetch Construction Process Lines (21 rows)
  const { data: processLines = [], refetch: refetchProcess } = useQuery({
    queryKey: ["constructionProcess", id || savedProjectId],
    queryFn: async () => {
      const processId = id || savedProjectId;
      if (!processId) return [];
      const res = await api.get(
        `/construction_process.php?PROCESS_ID=${processId}`
      );
      return res.data?.data || [];
    },
    enabled: !!(id || savedProjectId),
  });

  useEffect(() => {
    if (processLines && processLines.length > 0) {
      setEditableLines((prev) => {
        const changed =
          JSON.stringify(prev.map((p) => p.PROCESS_ID)) !==
          JSON.stringify(processLines.map((p) => p.PROCESS_ID));
        if (changed) return processLines;
        return prev;
      });
    }
  }, [processLines]);

  // 🔹 Create 21 Process Lines
  const processMutation = useMutation({
    mutationFn: async (process_id) => {
      return await api.post("/process_contractor.php", { process_id });
    },
    onSuccess: (res) => {
      console.log("✅ Process lines created:", res.data);
      setMessage({
        type: "success",
        text: "✅ 21 process lines created successfully!",
      });
      refetchProcess();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    },
    onError: () => {
      setMessage({
        type: "error",
        text: "❌ Failed to create process lines.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    },
  });

  const handleProcess = () => {
    const pid = id || savedProjectId;
    if (!pid) {
      setMessage({
        type: "error",
        text: "❌ Save the project first before creating process.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }
    processMutation.mutate(pid);
  };

  // 🔹 Editable line change
  // const handleLineChange = (index, field, value) => {
  //   setEditableLines((prev) => {
  //     const updated = [...prev];
  //     updated[index] = { ...updated[index], [field]: value };
  //     return updated;
  //   });
  // };
//   const handleLineChange = (index, field, value) => {
//   setEditableLines((prev) => {
//     const updated = [...prev];
//     const newLine = { ...updated[index], [field]: value };

//     // If changing DEPENDENT_ID, also store the name for display
//     if (field === "DEPENDENT_ID") {
//       const selected = contractorTypes.find((c) => c.ID === value);
//       newLine.DEPENDENT_NAME = selected ? selected.NAME : "";
//     }

//     updated[index] = newLine;
//     return updated;
//   });
// };





  // 🔹 Save all updated process lines
 const updateProcessMutation = useMutation({
  mutationFn: async (lines) => {
    for (const line of lines) {
      const payload = {
        ID: line.ID,
        PROCESS_ID: line.PROCESS_ID || "",
        SUB_CONTRACT_NAME: line.SUB_CONTRACT_NAME || "",
        SUB_CONTRACT_ID: line.SUB_CONTRACT_ID || "",
        DEPENDENT_ID: line.DEPENDENT_ID ?? "",
        SORT_ID: line.SORT_ID ?? "0",
        COST: line.COST ?? "",
        CONTRACTOR_NAME: line.CONTRACTOR_NAME || "",
        UPDATED_BY: 105,
      };

      console.log("🔹 PUT Payload:", payload);

      await api.put(
        "/construction_process.php",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
    }
  },

  onSuccess: () => {
    setMessage({ type: "success", text: "✅ Process lines updated successfully!" });
    refetchProcess();
  },

  onError: (error) => {
    console.error("❌ Update error:", error.response?.data || error.message);
    setMessage({ type: "error", text: "❌ Update failed — check console." });
  },
});





const handleLineChange = (index, field, value) => {
  setEditableLines((prev) => {
    const updated = [...prev];
    const current = updated[index];

    const newLine = {
      ...current,
      ID: current.ID, // ✅ keep ID for updates
      [field]: value,
    };

    // ✅ If changing dependent, update name too
    if (field === "DEPENDENT_ID") {
      const selected = contractorTypes.find((c) => c.ID === value);
      newLine.DEPENDENT_NAME = selected ? selected.NAME : "";
    }

    updated[index] = newLine;
    return updated;
  });
};



  // 🔹 Project Form Handlers
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

        {/* 🔹 Project Form */}
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

          <div className="flex items-center gap-2">
            <label className="text-gray-700 text-sm font-medium text-right w-32">
              Project Type
            </label>
            <select
              name="P_TYPE"
              value={formData.P_TYPE}
              onChange={handleChange}
              disabled={loadingTypes}
              className="border border-gray-600 opacity-60 rounded-lg text-sm px-3 py-2 flex-1"
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
            inputWidth="w-500"
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

            {(id || savedProjectId) && (
              <button
                type="button"
                onClick={handleProcess}
                disabled={processMutation.isPending}
                className="bg-blue-600 text-sm text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-500"
              >
                <Cog
                  size={16}
                  className={processMutation.isPending ? "animate-spin" : ""}
                />
                {processMutation.isPending ? "Processing..." : "Make Process"}
              </button>
            )}
          </div>
        </form>

        {/* 🔹 Process Table */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="px-3 py-2 border text-center">Project ID</th>
                <th className="px-3 py-2 border text-center">Contract type</th>
                <th className="px-3 py-2 border text-center">Dependent</th>
                <th className="px-3 py-2 border text-center">Sort</th>
                <th className="px-3 py-2 border text-center">Cost</th>
              </tr>
            </thead>
            <tbody>
              {editableLines.length > 0 ? (
                editableLines.map((line, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border text-center">
                      {line.PROCESS_ID}
                    </td>
                    <td className="px-3 py-2 border text-center">
                      {line.SUB_CONTRACT_NAME}
                    </td>
                    <td className="px-3 py-2 border text-center">
                      <select
                        value={line.DEPENDENT_ID || ""}
                        onChange={(e) =>
                          handleLineChange(
                            index,
                            "DEPENDENT_ID",
                            e.target.value
                          )
                        }
                        className="rounded text-sm px-2 py-1 w-full  focus:outline-none"
                      >
                        <option value="">Select Dependent</option>
                        {contractorTypes.map((c) => (
                          <option key={c.ID} value={c.ID}>
                            {c.NAME}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-2 border text-center">
                      <input
                        type="number"
                        value={line.SORT_ID || ""}
                        onChange={(e) =>
                          handleLineChange(index, "SORT_ID", e.target.value)
                        }
                        className="w-full border-none outline-none bg-transparent text-center"
                      />
                    </td>
                    <td className="px-3 py-2 border text-center">
                      <input
                        type="number"
                        value={line.COST || ""}
                        onChange={(e) =>
                          handleLineChange(index, "COST", e.target.value)
                        }
                        className="w-full border-none outline-none bg-transparent text-center"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-3 text-gray-500">
                    No process lines found for this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editableLines.length > 0 && (
          <div className="flex justify-end mt-3">
            <button
  onClick={() => updateProcessMutation.mutate(editableLines)}
  className="bg-purple-600 text-white text-sm px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-500"
>
  <Upload size={16} />
  {updateProcessMutation.isPending ? "Updating..." : "Save Changes"}
</button>

          </div>
        )}
      </div>

      <ProjectList />
    </div>
  );
};

// 🔹 Reusable Input Component
const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  labelWidth = "w-32", // Tailwind width for label (default 8rem)
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
      className={`border border-gray-600 opacity-60 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all flex-1 ${inputWidth}`}
    />
  </div>
);

export default Project;
