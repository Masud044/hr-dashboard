import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import api from "../../../api/Api";
import AdminUserList from "./AdminUserList";
import { AdminUserListTwo } from "./AdminUserListTwo";
import { toast } from "react-toastify";
import { SectionContainer } from "@/components/SectionContainer";

const AdminUserPage = () => {
  const { id } = useParams();

  useEffect(() => {
      window.scrollTo({
        top: 80,
        behavior: "smooth",
      });
    }, [id]);
  const queryClient = useQueryClient();
  const isEditing = !!id;

  // 🔹 Form State
  const [formData, setFormData] = useState({
    USERNAME: "",
    PASSWORD: "",
    FIRSTNAME: "",
    LASTNAME: "",
    SUPERADMIN: "0",
    DEPT: "",
    POSITION: "",
    ADDRESS: "", // ✅ Added field
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // 🔹 Fetch user by ID
  const { data, isLoading } = useQuery({
    queryKey: ["admin_user", id],
    queryFn: async () => {
      const res = await api.get(`/admin_user.php?id=${id}`);
      const userData = res.data?.data;

      if (Array.isArray(userData)) {
        return userData.find((u) => Number(u.ID) === Number(id));
      }
      return userData;
    },
    enabled: !!id,
  });

  // 🔹 Preload data when editing
  useEffect(() => {
    if (data) {
      setFormData({
        USERNAME: data.USERNAME || "",
        PASSWORD: "", // keep empty for security
        FIRSTNAME: data.FIRSTNAME || "",
        LASTNAME: data.LASTNAME || "",
        SUPERADMIN: String(data.SUPERADMIN ?? "0"),
        DEPT: data.DEPT || "",
        POSITION: data.POSITION || "",
        ADDRESS: data.ADDRESS || "", // ✅ now maps correctly
      });
    }
  }, [data]);

  // 🔹 Create or Update (POST / PUT)
  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEditing) {
        // Update existing user
        return await api.put("/admin_user.php",{ ...formData,
        ID: id,
         });
      } else {
        // Add new user
        return await api.post("/admin_user.php", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin_user"]);

      toast.success(
          isEditing
           ? "✅ Admin user updated successfully!"
          : "✅ Admin user added successfully!",
      )
     
      if (!isEditing) resetForm();
      
    },
    onError: () => {
      toast.error("Failed to save user data. Please try again")
      
    },
  });

  // 🔹 Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = [
      "USERNAME",
    "PASSWORD",
    "FIRSTNAME",
    "LASTNAME",
    "SUPERADMIN",
    "DEPT",
    "POSITION",
    "ADDRESS"
    ];
    const empty = required.find(
      (f) => !formData[f] || formData[f].toString().trim() === ""
    );
    if (empty) {
      toast.warning("Please fill all required fields")
      
      return;
    }
    mutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      USERNAME: "",
      PASSWORD: "",
      FIRSTNAME: "",
      LASTNAME: "",
      SUPERADMIN: "0",
      DEPT: "",
      POSITION: "",
      ADDRESS: "",
    });
  };

  if (isLoading)
    return (
      <div className="text-center mt-10 text-gray-600 animate-pulse">
        Loading admin user data...
      </div>
    );

  return (

   <SectionContainer>
     <div className="">
      <div className="p-6 bg-white shadow rounded-lg mt-8">
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
          <Input
            label="Address"
            name="ADDRESS"
            value={formData.ADDRESS}
            onChange={handleChange}
          />

          <div className="flex flex-row gap-5 items-center">
            <label className="text-gray-700 text-sm font-medium text-right">
              Super Admin
            </label>
            <select
              name="SUPERADMIN"
              value={formData.SUPERADMIN}
              onChange={handleChange}
              className="border border-gray-500 rounded p-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div className="col-span-3 flex justify-end  mt-4">
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
          </div>
        </form>
      </div>

      {/* <AdminUserList /> */}
      <AdminUserListTwo></AdminUserListTwo>
    </div>
   </SectionContainer>
  );
};

// 🔹 Reusable Input Component
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
      className={`border border-gray-600 opacity-60 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all flex-1 ${inputWidth}`}
    />
  </div>
);
export default AdminUserPage;
