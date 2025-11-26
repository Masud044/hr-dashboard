import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Database } from "lucide-react";
import api from "../../../api/Api";

import { SectionContainer } from "../../SectionContainer";
import ContractionProcessListTwo from "./ContractionProcessListTwo";
import { toast } from "react-toastify";


const ContractionProcess = () => {
  const { id } = useParams();
  useEffect(() => {
  window.scrollTo({
    top: 80,
    behavior: "smooth",
  });
}, [id]);

  const queryClient = useQueryClient();
  const isEditing = !!id;
  console.log(id)

  const [formData, setFormData] = useState({
    PROCESS_ID: "",
    SUB_CONTRACT_ID: "",
    DEPENDENT_ID: "",
    SORT_ID: "",
    CREATION_BY: 700,
    COST: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });

  // ✅ Fetch Contractor LOV (used for both SUB_CONTRACT_ID & DEPENDENT_ID)
  const { data: contractorList } = useQuery({
    queryKey: ["contractors"],
    queryFn: async () => {
      const res = await api.get("/contractor_api.php");
      return res.data?.data || [];
    },
  });

  // ✅ Fetch process data for editing
 // ✅ Fetch process data for editing
const { data } = useQuery({
  queryKey: ["process", id],
  queryFn: async () => {
    const res = await api.get(`/construction_process.php?action=read`);
    const records = res.data?.data || [];

    // URL থেকে পাওয়া ID দিয়ে match করুন
    const found = records.find((r) => r.ID === id);
    
    console.log("Found record for edit:", found);
    return found || {};
  },
  enabled: !!id,
});

// ✅ Data populate করার সময় SUB_CONTRACT_ID correctly map করুন
useEffect(() => {
  if (data && data.ID) {
    setFormData({
      PROCESS_ID: data.PROCESS_ID || "",
      SUB_CONTRACT_ID: data.SUB_CONTRACT_ID || "", // এটা GET API থেকে আসবে
      DEPENDENT_ID: data.DEPENDENT_ID || "",
      SORT_ID: data.SORT_ID || "",
      CREATION_BY: data.CREATION_BY || 700,
      COST: data.COST || "",
    });
  }
}, [data]);

// ✅ Mutation এ সঠিক payload পাঠান
const mutation = useMutation({
  mutationFn: async (formData) => {
    if (isEditing) {
      // PUT করার সময় backend যা expect করে তা পাঠান
      return await api.put("/construction_process.php?action=update", {
        ID: id,
        PROCESS_ID: formData.PROCESS_ID,
        SUB_CONTRACT_ID: formData.SUB_CONTRACT_ID, // এটা সরাসরি পাঠান
        DEPENDENT_ID: formData.DEPENDENT_ID,
        SORT_ID: formData.SORT_ID,
        COST: formData.COST,
        UPDATE_BY: 700,
      });
    }
    // else {
    //   return await api.post("/construction_process.php?action=create", {
    //     ...formData,
    //   });
    // }
  },
  onSuccess: (res) => {
    queryClient.invalidateQueries(["contraction_process"]);
    
    if (res.data?.success || res.data?.status === "success") {
      toast.success(isEditing ? "Process updated successfully!" : "Process created successfully!");
    }
  },
  onError: (error) => {
    console.error("Mutation error:", error);
    toast.error("Failed to save data. Please try again");
  },
});

  // ✅ Contractor fetch POST call (optional)
  // const fetchContractorData = async () => {
  //   try {
  //     await api.post("/process_contractor.php", {
  //       process_id: formData.PROCESS_ID,
  //     });
  //     setMessage({ text: "Contractor data fetched successfully!", type: "success" });
  //     setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  //   } catch (err) {
  //     console.error(err);
  //     setMessage({ text: "Failed to load contractor data.", type: "error" });
  //     setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  //   }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = ["PROCESS_ID", "SUB_CONTRACT_ID", "DEPENDENT_ID", "SORT_ID", "COST"];
    const empty = required.find(
      (f) => !formData[f] || formData[f].toString().trim() === ""
    );
    if (empty) {
      toast.error("Please fill all required fields")
      
      return;
    }
    mutation.mutate(formData);
  };

  

  return (
   <SectionContainer>
     <div className=" mt-10">
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
          <Input label="Process ID" name="PROCESS_ID" value={formData.PROCESS_ID} onChange={handleChange} />
          
          {/* ✅ Sub Contract LOV Dropdown */}
          <Select
            label="Sub Contract"
            name="SUB_CONTRACT_ID"
            value={formData.SUB_CONTRACT_ID}
            onChange={handleChange}
            options={contractorList}
          />

          {/* ✅ Dependent ID LOV Dropdown */}
          <Select
            label="Dependent"
            name="DEPENDENT_ID"
            value={formData.DEPENDENT_ID}
            onChange={handleChange}
            options={contractorList}
          />

          <Input label="Sort ID" name="SORT_ID" value={formData.SORT_ID} onChange={handleChange} />
          <Input label="Cost" name="COST" value={formData.COST} onChange={handleChange} />
          <Input label="Created By" name="CREATION_BY" value={formData.CREATION_BY} onChange={handleChange} />

          <div className="col-span-full flex justify-end mt-6 gap-4">
            {/* <button
              type="button"
              onClick={fetchContractorData}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md"
            >
              <Database size={16} />
              Get Contractor Data
            </button> */}

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
        {/* <ContractionProcessList /> */}
        <ContractionProcessListTwo />
      </div>
    </div>
   </SectionContainer>
  );
};

// ✅ Reusable Input Field
const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div className="flex flex-row items-center gap-4">
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

// ✅ Reusable Select Field for LOV
const Select = ({ label, name, value, onChange, options = [] }) => (
  <div className="flex flex-row items-center gap-4">
    <label className="text-gray-700 text-sm font-medium text-right w-32">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="border border-gray-600 opacity-60 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all flex-1"
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt.ID} value={opt.ID}>
          {opt.NAME}
        </option>
      ))}
    </select>
  </div>
);

export default ContractionProcess;
