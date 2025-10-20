import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Trash2 } from "lucide-react";
import api from "../../../api/Api";
import SheduleList from "./SheduleList";

const Schedule = () => {
  const { id } = useParams(); // id = H_ID
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [message, setMessage] = useState({ type: "", text: "" });

  // 🔹 Form state
  const [formData, setFormData] = useState({
    H_ID: "",
    P_ID: "",
    DESCRIPTION: "",
    CREATION_BY: "105",
    UPDATED_BY: "202",
    LINES: [
      {
        C_P_ID: "",
        DESCRIPTION: "",
        SCHEDULE_START_DATE: "",
        SCHEDULE_END_DATE: "",
      },
    ],
  });

  // 🔹 Fetch data when editing
  const { data } = useQuery({
    queryKey: ["schedule", id],
    queryFn: async () => {
      const res = await api.get(`/shedule.php?h_id=${id}`);
      // Some APIs wrap data, so normalize it here
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!data) return;

    const schedule = Array.isArray(data) ? data[0] : data; // normalize

    setFormData({
      H_ID: schedule.H_ID || "",
      P_ID: schedule.P_ID || "",
      DESCRIPTION: schedule.DESCRIPTION || "",
      CREATION_BY: schedule.CREATION_BY || "105",
      UPDATED_BY: schedule.UPDATED_BY || "202",
      LINES:
        Array.isArray(schedule.LINES) && schedule.LINES.length > 0
          ? schedule.LINES.map((line) => ({
              L_ID: line.L_ID || "",
              C_P_ID: line.C_P_ID || "",
              DESCRIPTION: line.DESCRIPTION || "",
              SCHEDULE_START_DATE: line.SCHEDULE_START_DATE || "",
              SCHEDULE_END_DATE: line.SCHEDULE_END_DATE || "",
            }))
          : [
              {
                C_P_ID: "",
                DESCRIPTION: "",
                SCHEDULE_START_DATE: "",
                SCHEDULE_END_DATE: "",
              },
            ],
    });
  }, [data]);
  console.log(data);

  // 🔹 Header field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Line field change
  const handleLineChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const lines = [...prev.LINES];
      lines[index][name] = value;
      return { ...prev, LINES: lines };
    });
  };

  // 🔹 Add new line
  const addLine = () => {
    setFormData((prev) => ({
      ...prev,
      LINES: [
        ...prev.LINES,
        {
          C_P_ID: "",
          DESCRIPTION: "",
          SCHEDULE_START_DATE: "",
          SCHEDULE_END_DATE: "",
        },
      ],
    }));
  };

  // 🔹 Remove a line
  const removeLine = (index) => {
    setFormData((prev) => ({
      ...prev,
      LINES: prev.LINES.filter((_, i) => i !== index),
    }));
  };

  // 🔹 Mutation (insert / update)

  const mutation = useMutation({
    mutationFn: async (formData) => {
      // Normalize and clean up all fields before sending
      const payload = {
        H_ID: isEditing ? Number(id) : null,
        P_ID: Number(formData.P_ID),
        DESCRIPTION: formData.DESCRIPTION,
        UPDATED_BY: Number(formData.UPDATED_BY),
        CREATION_BY: Number(formData.CREATION_BY),
        // ✅ Send all lines together (multiple allowed)
        LINES: formData.LINES.map((line) => ({
          L_ID: line.L_ID ? Number(line.L_ID) : undefined,
          C_P_ID: line.C_P_ID ? Number(line.C_P_ID) : 0,
          DESCRIPTION: line.DESCRIPTION,
          SCHEDULE_START_DATE: line.SCHEDULE_START_DATE,
          SCHEDULE_END_DATE: line.SCHEDULE_END_DATE,
        })),
      };

      console.log("🔹 Sending Payload:", payload);

      // ✅ Choose API method dynamically
      const res = isEditing
        ? await api.put("/shedule.php", payload)
        : await api.post("/shedule.php", payload);

      console.log("🔹 API Response:", res.data);

      // ✅ Handle response flexibly (PHP APIs often return weird formats)
      if (res?.data?.success === true || res?.data?.status === "success") {
        return res.data;
      }

      // Even if success is string ("true"), treat as success
      if (res?.data?.success === "true") {
        return res.data;
      }

      throw new Error(res?.data?.message || "Unknown API response");
    },

    onSuccess: (data) => {
      console.log("✅ Update success:", data);

      queryClient.invalidateQueries(["schedules"]);
      queryClient.invalidateQueries(["schedule", id]);

      setMessage({
        type: "success",
        text: isEditing
          ? "✅ Schedule updated successfully!"
          : "✅ Schedule created successfully!",
      });

      if (!isEditing) resetForm();

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    },

    onError: (err) => {
      console.error("❌ API error:", err);
      setMessage({
        type: "error",
        text: "❌ Failed to save schedule. Please try again.",
      });
    },
  });

  // 🔹 Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      H_ID: "",
      P_ID: "",
      DESCRIPTION: "",
      CREATION_BY: "105",
      UPDATED_BY: "202",
      LINES: [
        {
          C_P_ID: "",
          DESCRIPTION: "",
          SCHEDULE_START_DATE: "",
          SCHEDULE_END_DATE: "",
        },
      ],
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="p-6 bg-white shadow rounded-lg mt-8">
        <h2 className="font-semibold mb-6 text-sm text-gray-800 border-b pb-2">
          {isEditing ? "Edit Schedule" : "Add New Schedule"}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <Input
              label="Project ID"
              name="P_ID"
              value={formData.P_ID}
              onChange={handleChange}
              labelWidth="w-28"
              inputWidth="w-30"
            />
            <Input
              label="Description"
              name="DESCRIPTION"
              value={formData.DESCRIPTION}
              onChange={handleChange}
              labelWidth="w-28"
              inputWidth="flex-1"
            />
          </div>

          {/* Lines */}
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full  rounded-md">
                <thead className="">
                  <tr>
                    <th className="px-3 py-2 text-sm text-foreground font-normal">
                      Line Desc
                    </th>
                    <th className="px-3 py-2 text-sm font-normal">
                      Start Date
                    </th>
                    <th className="px-3 py-2 text-sm font-normal">End Date</th>

                    <th className="px-3 py-2 text-sm font-normal">Actions</th>
                    <th className="px-3 py-2 text-sm font-normal">
                      <button
                        type="button"
                        onClick={addLine}
                        className="text-blue-600 text-sm "
                      >
                        <Plus size={14} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(formData.LINES || []).map((line, index) => (
                    <tr key={index} className="">
                      <td className="px-3 py-2">
                        <Input
                          name="DESCRIPTION"
                          value={line.DESCRIPTION}
                          onChange={(e) => handleLineChange(index, e)}
                          inputWidth="w-full"
                          labelWidth="w-0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="date"
                          name="SCHEDULE_START_DATE"
                          value={line.SCHEDULE_START_DATE}
                          onChange={(e) => handleLineChange(index, e)}
                          inputWidth="w-full"
                          labelWidth="w-0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="date"
                          name="SCHEDULE_END_DATE"
                          value={line.SCHEDULE_END_DATE}
                          onChange={(e) => handleLineChange(index, e)}
                          inputWidth="w-full"
                          labelWidth="w-0"
                        />
                      </td>

                      <td className="px-3 py-2  text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="text-red-500 p-1 rounded hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-green-600 text-sm text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-500"
            >
              <Save size={16} />
              {mutation.isPending
                ? "Saving..."
                : isEditing
                ? "Update Schedule"
                : "Save Schedule"}
            </button>
          </div>
        </form>
      </div>

      <SheduleList />
    </div>
  );
};

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  labelWidth = "w-24 opacity-60", // Tailwind width for label (default 6rem)
  inputWidth = "flex-1", // Tailwind width for input (default full width)
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
      className={`border border-gray-500 opacity-60 text-sm rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${inputWidth}`}
    />
  </div>
);

export default Schedule;
