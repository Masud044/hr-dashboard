import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import api from "../../../api/Api";
import UserList from "./UserList";
import { UserListTwo } from "./UserListTwo";

const User = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    USER_NAME: "",
    USER_TYPE: "", // e.g. "2"
    EMP_NO: "",
    LAST_LOGIN: null,
    FACTORY_ID: "",
    ATT_STATUS: "0",
    DOB: "",
    DRIVING_LIEC: "",
    ADRESS: "",
    SUBRUB: "",
    STATE: "",
    EMAIL: "",
    PHONE: "",
    ACCESS_CODE: "",
    ABN: "",
    LICENSE: "",
    STATUS: "1",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // 🔹 Fetch single user if editing
  const { data } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await api.get("/user.php");
      const users = res.data?.data || [];
      return users.find((u) => u.ID === id);
    },
    enabled: !!id,
  });

  // 🔹 Pre-fill form when editing
  useEffect(() => {
    if (data) {
      setFormData({
        USER_NAME: data.USER_NAME || "",
        USER_TYPE: data.TYPE_ID || data.TYPE_NAME || "", // flexible mapping
        EMP_NO: data.EMP_NO || "",
        FACTORY_ID: data.FACTORY_ID || "",
        ATT_STATUS: data.ATT_STATUS || "0",
        DOB: data.DOB || "",
        DRIVING_LIEC: data.DRIVING_LIEC || "",
        ADRESS: data.ADRESS || "",
        SUBRUB: data.SUBRUB || "",
        STATE: data.STATE || "",
        EMAIL: data.EMAIL || "",
        PHONE: data.PHONE || "",
        ACCESS_CODE: data.ACCESS_CODE || "",
        ABN: data.ABN || "",
        LICENSE: data.LICENSE || "",
        STATUS: data.STATUS || "1",
      });
    }
  }, [data]);

  // 🔹 Mutation: insert or update user
  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEditing) {
        return await api.put("/user.php", {
          ...formData,
          ID: id,
          UPDATE_BY: 500,
        });
      } else {
        return await api.post("/user.php", formData);
      }
    },
    onSuccess: () => {
      // Refresh user list after success
      queryClient.invalidateQueries(["users", id]); 

      setMessage({
        type: "success",
        text: isEditing
          ? "✅ User updated successfully!"
          : "✅ User added successfully!",
      });

      if (!isEditing) resetForm();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    },
    onError: (err) => {
      console.error("❌ Error saving user:", err);
      setMessage({
        type: "error",
        text: "❌ Failed to save user data. Please try again.",
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
      "USER_NAME",
        "USER_TYPE",
        "EMP_NO",
        "FACTORY_ID",
        "ATT_STATUS",
        "DOB",
        "DRIVING_LIEC",
        "ADRESS",
        "SUBRUB",
        "STATE",
        "EMAIL",
        "PHONE",
        "ACCESS_CODE",
        "ABN",
        "LICENSE",
        "STATUS"
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
      USER_NAME: "",
      USER_TYPE: "",
      EMP_NO: "",
      LAST_LOGIN: null,
      FACTORY_ID: "",
      ATT_STATUS: "0",
      DOB: "",
      DRIVING_LIEC: "",
      ADRESS: "",
      SUBRUB: "",
      STATE: "",
      EMAIL: "",
      PHONE: "",
      ACCESS_CODE: "",
      ABN: "",
      LICENSE: "",
      STATUS: "1",
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="p-6 bg-white shadow rounded-lg mt-8">
        <h2 className="font-semibold mb-6 text-sm text-gray-800 border-b pb-2">
          {isEditing ? "Edit User" : "Add New User"}
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
          <Input label="User Name" name="USER_NAME" value={formData.USER_NAME} onChange={handleChange}  />
          <Input label="User Type" name="USER_TYPE" value={formData.USER_TYPE} onChange={handleChange} />
       
          <Input label="Factory ID" name="FACTORY_ID" value={formData.FACTORY_ID} onChange={handleChange}  labelWidth="w-28"
  inputWidth="w-30" />
          <Input label="Email" name="EMAIL" value={formData.EMAIL} onChange={handleChange} />
          <Input label="Phone" name="PHONE" value={formData.PHONE} onChange={handleChange} />
           <Input label="Employee No" name="EMP_NO" value={formData.EMP_NO} onChange={handleChange}  inputWidth="w-30" labelWidth="w-28" />
          <Input label="Address" name="ADRESS" value={formData.ADRESS} onChange={handleChange} />
          <Input label="Suburb" name="SUBRUB" value={formData.SUBRUB} onChange={handleChange} />
           <Input label="State" name="STATE" value={formData.STATE} onChange={handleChange}  inputWidth="w-30" labelWidth="w-28" />
         
          <Input label="ABN" name="ABN" value={formData.ABN} onChange={handleChange} />
          <Input label="License" name="LICENSE" value={formData.LICENSE} onChange={handleChange} />
          <Input label="Attendance Status" name="ATT_STATUS" value={formData.ATT_STATUS} onChange={handleChange}  inputWidth="w-30" labelWidth="w-28" />
          
             
              

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
                ? "Update User"
                : "Save User"}
            </button>
          </div>
        </form>
      </div>

      {/* <UserList /> */}
      <UserListTwo></UserListTwo>
    </div>
  );
};

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

export default User;
