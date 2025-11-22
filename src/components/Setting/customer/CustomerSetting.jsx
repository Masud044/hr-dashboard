import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, RefreshCw } from "lucide-react";


import api from "../../../api/Api";
import { CustomerListTwo } from "./CustomerListTwo";
import { SectionContainer } from "@/components/SectionContainer";
import { toast } from "react-toastify";


const CustomerPage = () => {
  const { id } = useParams();
  useEffect(() => {
  window.scrollTo({
    top: 80,
    behavior: "smooth",
  });
}, [id]);

  const queryClient = useQueryClient();
  const isEditing = !!id;

  console.log(isEditing)

  // 🔹 Local form state
  const [formData, setFormData] = useState({
    CUSTOMER_NAME: "",
    ENTRY_BY: "101",
    PASSWORD: "",
    ORG_ID: "",
    ADDRESS: "",
    CONTACT_PERSON: "",
    // PHONE: "",
    EMAIL: "",
    MOBILE: "",
    // DUE: "",
    // REMARKS: "",
    // FAX: "",
    STATUS: "1",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // 🔹 Fetch customer by ID
  const { data } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const res = await api.get(`/customer_info.php?customer_id=${id}`);
      const customerData = res.data?.data;
      if (Array.isArray(customerData)) {
        return customerData.find((c) => c.CUSTOMER_ID === id);
      }
      return customerData;
    },
    enabled: !!id,
  });

  // 🔹 Load customer data into form when editing
  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  // 🔹 Save or Update mutation
 const mutation = useMutation({
  mutationFn: async (formData) => {
    if (isEditing) {
      // 🟢 UPDATE existing customer
      return await api.put("/customer_info.php", {
        ...formData,
        CUSTOMER_ID: id,
        UPDATE_BY: 202, // you can make this dynamic if needed
      });
    } else {
      // 🟢 CREATE new customer
      return await api.post("/customer_info.php", formData);
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries(["customers"]);
    queryClient.invalidateQueries(["customer", id]);
   toast.success(
           isEditing
             ? "Customer updated successfully!"
             : "Customer added successfully!"
         );
    if (!isEditing) resetForm();
    
   
  },
  onError: () => {
    toast.error("Failed to save customer data. Please try again")
    
   
  },
});


  // 🔹 Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
     const required = [
     "CUSTOMER_NAME",
    "ENTRY_BY",
    "PASSWORD",
    "ORG_ID",
    "ADDRESS",
    "CONTACT_PERSON",
    "EMAIL",
    "MOBILE",
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

  // 🔹 Reset
  const resetForm = () => {
    setFormData({
      CUSTOMER_NAME: "",
      ENTRY_BY: "101",
      PASSWORD: "",
      ORG_ID: "",
      ADDRESS: "",
      CONTACT_PERSON: "",
      PHONE: "",
      EMAIL: "",
      MOBILE: "",
      DUE: "",
      REMARKS: "",
      FAX: "",
      STATUS: "1",
    });
  };

  // if (isLoading)
  //   return (
  //     <div className="text-center mt-10 text-gray-600 animate-pulse">
  //       Loading customer data...
  //     </div>
  //   );

  return (
    <SectionContainer>
       <div className="">
    <div className=" p-6 bg-white shadow rounded-lg mt-8">
      <h2 className=" font-semibold mb-6 text-sm text-gray-800 border-b pb-2">
        {isEditing ? "Edit Customer" : "Add New Customer"}
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
          label="Customer Name"
          name="CUSTOMER_NAME"
          value={formData.CUSTOMER_NAME}
          onChange={handleChange}
          className=""
        />
        <Input
          label="Organization ID"
          name="ORG_ID"
          value={formData.ORG_ID}
          onChange={handleChange}
          inputWidth="w-30"
          labelWidth="28"
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
        {/* <Input
          label="Phone"
          name="PHONE"
          value={formData.PHONE}
          onChange={handleChange}
        /> */}
        <Input
          label="Mobile"
          name="MOBILE"
          value={formData.MOBILE}
          onChange={handleChange}
        />
        <Input
          label="Email"
          name="EMAIL"
          value={formData.EMAIL}
          onChange={handleChange}
        />
        {/* <Input
          label="Due"
          name="DUE"
          value={formData.DUE}
          onChange={handleChange}
        /> */}
        {/* <Input
          label="Remarks"
          name="REMARKS"
          value={formData.REMARKS}
          onChange={handleChange}
        /> */}
        {/* <Input
          label="Fax"
          name="FAX"
          value={formData.FAX}
          onChange={handleChange}
        /> */}
        {!isEditing && (
          <Input
            label="Password"
            type="password"
            name="PASSWORD"
            value={formData.PASSWORD}
            onChange={handleChange}
          />
        )}

        {/* Buttons */}
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
              ? "Update Customer"
              : "Save Customer"}
          </button>

          {/* <button
            type="button"
            onClick={resetForm}
            className="bg-gray-500 text-sm text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-600"
          >
            <RefreshCw size={16} /> Reset
          </button> */}
        </div>
      </form>
    </div>
    {/* <CustomerList></CustomerList> */}
    <CustomerListTwo></CustomerListTwo>
    </div>
    </SectionContainer>
    
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
      className={`border border-gray-600 opacity-60 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all flex-1 ${inputWidth}`}
    />
  </div>
);

export default CustomerPage;
