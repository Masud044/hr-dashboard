import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, RefreshCw } from "lucide-react";
import api from "../../../api/Api";

const AdminUserPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  // 🔹 Local form state
  const [formData, setFormData] = useState({
    USERNAME: "",
    PASSWORD: "",
    FIRSTNAME: "",
    LASTNAME: "",
    SUPERADMIN: "0",
    DEPT: "",
    POSITION: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // 🔹 Fetch admin user by ID
  const { data, isLoading } = useQuery({
    queryKey: ["admin_user", id],
    queryFn: async () => {
      const res = await api.get(`/admin_user.php?user_id=${id}`);
      const userData = res.data?.data;
      if (Array.isArray(userData)) {
        return userData.find((u) => u.ID === id);
      }
      return userData;
    },
    enabled: !!id,
  });

  // 🔹 Preload form when editing
  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  // 🔹 Create or Update
  const mutation = useMutation({
    mutationFn: async (formData) => {
      // same endpoint used for both insert/update
      return await api.post("/admin_user.php", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin_user", id]);
      setMessage({
        type: "success",
        text: isEditing
          ? "✅ Admin user updated successfully!"
          : "✅ Admin user added successfully!",
      });
      if (!isEditing) resetForm();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    },
    onError: (err) => {
      console.error(err);
      setMessage({
        type: "error",
        text: "❌ Failed to save user data. Please try again.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    },
  });

  // 🔹 Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  // 🔹 Reset
  const resetForm = () => {
    setFormData({
      USERNAME: "",
      PASSWORD: "",
      FIRSTNAME: "",
      LASTNAME: "",
      SUPERADMIN: "0",
      DEPT: "",
      POSITION: "",
    });
  };

  if (isLoading)
    return (
      <div className="text-center mt-10 text-gray-600 animate-pulse">
        Loading admin user data...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-lg mt-8">
      <h2 className="text-sm font-semibold mb-6 text-gray-800 border-b pb-2">
        {isEditing ? "Edit Admin User" : "Add New Admin User"}
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
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Input
          label="Username"
          name="USERNAME"
          value={formData.USERNAME}
          onChange={handleChange}
        />
        {!isEditing && (
          <Input
            label="Password"
            name="PASSWORD"
            type="password"
            value={formData.PASSWORD}
            onChange={handleChange}
          />
        )}
        <Input
          label="First Name"
          name="FIRSTNAME"
          value={formData.FIRSTNAME}
          onChange={handleChange}
        />
        <Input
          label="Last Name"
          name="LASTNAME"
          value={formData.LASTNAME}
          onChange={handleChange}
        />
        <Input
          label="Department"
          name="DEPT"
          value={formData.DEPT}
          onChange={handleChange}
        />
        <Input
          label="Position"
          name="POSITION"
          value={formData.POSITION}
          onChange={handleChange}
        />

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Super Admin</label>
          <select
            name="SUPERADMIN"
            value={formData.SUPERADMIN}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="col-span-2 flex justify-end gap-3 mt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-green-600 text-sm text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-500"
          >
            <Save size={16} />
            {mutation.isPending
              ? "Saving..."
              : isEditing
              ? "Update User"
              : "Save User"}
          </button>

          {/* <button
            type="button"
            onClick={resetForm}
            className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-600"
          >
            <RefreshCw size={16} /> Reset
          </button> */}
        </div>
      </form>
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

export default AdminUserPage;
