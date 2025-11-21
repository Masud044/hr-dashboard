import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Cog, Upload } from "lucide-react";
import api from "../../../api/Api";
import ProjectList from "./ProjectList";
import { toast } from "react-toastify";
import { ProjectListTwo } from "./ProjectTwo";
import { SectionContainer } from "@/components/SectionContainer";

const Project = () => {
  const { id } = useParams();
   useEffect(() => {
    window.scrollTo({
      top: 80,
      behavior: "smooth",
    });
  }, [id]);
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
const [showDashboardModal, setShowDashboardModal] = useState(false);
const [dashboardDate, setDashboardDate] = useState(""); // YYYY-MM-DD
const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);

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

  const { data: contractorNames = [] } = useQuery({
    queryKey: ["contractorNames"],
    queryFn: async () => {
      const res = await api.get("/contrator.php");
      return res.data?.data || [];
    },
  });
  console.log(contractorNames);

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
      toast.success(
        isEditing
          ? "Project updated successfully!"
          : "Project added successfully!"
      );
    },

    onError: () => {
      toast.error("❌ Failed to save project data. Please try again.");
    },
  });

  // 🔹 Fetch Construction Process Lines (21 rows)
  const { data: processLines = [], refetch: refetchProcess } = useQuery({
    queryKey: ["constructionProcess", id || savedProjectId],
    queryFn: async () => {
      const processId = id || savedProjectId;
      if (!processId) return [];
      const res = await api.get(
        `/construction_process.php?action=read&PROCESS_ID=${processId}`
      );
      return res.data?.data || [];
    },
    enabled: !!(id || savedProjectId),
  });
  console.log(data);

  useEffect(() => {
    if (processLines.length > 0 && contractorNames.length > 0) {
      const updatedLines = processLines.map((line) => {
        const contractor = contractorNames.find(
          (c) => Number(c.CONTRATOR_ID) === Number(line.CONTRACTOR_ID)
        );

        return {
          ...line,
          CONTRACTOR_NAME: contractor ? contractor.CONTRATOR_NAME : "",
        };
      });

      setEditableLines((prev) => {
        const changed =
          JSON.stringify(prev.map((p) => p.ID)) !==
          JSON.stringify(updatedLines.map((p) => p.ID));
        return changed ? updatedLines : prev;
      });
    }
  }, [processLines, contractorNames]);

  // 🔹 Create 21 Process Lines
  const processMutation = useMutation({
    mutationFn: async (process_id) => {
      return await api.post("/process_contractor.php", { process_id });
    },
    onSuccess: (res) => {
      console.log(" Process lines created:", res.data);
      toast.success("Process lines created successfully!");
      refetchProcess();
    },
    onError: () => {
      toast.error(" Failed to create process lines.");
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

  // editableLines.forEach((line) => console.log(line));

  const handleLineChange = (index, field, value) => {
    setEditableLines((prev) => {
      const updated = [...prev];
      const current = updated[index];

      let newValue = value;

      // Only convert to number if value is non-empty
      if (
        field === "SORT_ID" ||
        field === "COST" ||
        field === "SUB_CONTRACT_ID" ||
        field === "DEPENDENT_ID" ||
        field === "CONTRACTOR_ID"
      ) {
        if (value === "" || value === null) {
          newValue = ""; // Keep it empty, not 0
        } else {
          newValue = Number(value);
        }
      }

      const newLine = {
        ...current,
        [field]: newValue,
      };

      // Update DEPENDENT_NAME if DEPENDENT_ID changes
      if (field === "DEPENDENT_ID") {
        const selected = contractorTypes.find((c) => c.ID === newValue);
        newLine.DEPENDENT_NAME = selected ? selected.NAME : "";
      }

      // Update CONTRACTOR_NAME if CONTRACTOR_ID changes
      if (field === "CONTRACTOR_ID") {
        const selected = contractorNames.find(
          (c) => Number(c.CONTRATOR_ID) === Number(newValue)
        );
        newLine.CONTRACTOR_NAME = selected ? selected.CONTRATOR_NAME : "";
      }

      updated[index] = newLine;
      return updated;
    });
  };

  // 🔹 Update all process lines safely
  const updateProcessMutation = useMutation({
    mutationFn: async (lines) => {
      return Promise.all(
        lines.map((line) => {
          const payload = {
            ID: line.ID,
            PROCESS_ID: line.PROCESS_ID,
            SUB_CONTRACT_NAME: line.SUB_CONTRACT_NAME || "",
            SUB_CONTRACT_ID: line.SUB_CONTRACT_ID
              ? Number(line.SUB_CONTRACT_ID)
              : null,
            DEPENDENT_ID: line.DEPENDENT_ID ? Number(line.DEPENDENT_ID) : null,
            SORT_ID: line.SORT_ID ? Number(line.SORT_ID) : 0,
            CONTRACTOR_ID: line.CONTRACTOR_ID || "",
            SUPPLIER_ID: line.SUPPLIER_ID ? Number(line.SUPPLIER_ID) : null,
          };

          // Only include COST if it was edited (not undefined or empty)
          if (line.COST !== undefined && line.COST !== "") {
            payload.COST = Number(line.COST);
          }

          console.log("✅ Final PUT payload:", payload);
          return api.put("/construction_process.php?action=update", payload);
        })
      );
    },
    onSuccess: () => {
      refetchProcess();
      toast.success("Process lines updated successfully!");
    },
    onError: (error) => {
      console.error("❌ Update error:", error.response?.data || error.message);
      toast.error("Update failed. Check required fields and payload.");
    },
  });

  // const createDashboard = async () => {
  //   try {
  //     const pid = id || savedProjectId;

  //     if (!pid) {
  //       toast.error("Please save the project first!");
  //       return;
  //     }

  //     if (!contractorTypes || contractorTypes.length === 0) {
  //       toast.error("Contractor Types not loaded yet!");
  //       return;
  //     }

  //     // 🔥 Auto create 21 lines
  //     const autoLines = contractorTypes.map((c) => ({
  //       C_P_ID: c.ID,
  //       DESCRIPTION: "",
  //       SCHEDULE_START_DATE: "",
  //       SCHEDULE_END_DATE: "",
  //     }));

  //     const payload = {
  //       P_ID: Number(pid),
  //       CREATION_BY: 105,
  //       LINES: autoLines, // 🔥 21 LINES SENT HERE
  //     };

  //     console.log("Sending payload:", payload);

  //     const res = await api.post("/shedule.php", payload, {
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     console.log("Dashboard created:", res.data);

  //     if (res.data?.success) {
  //       toast.success("Dashboard created!");

  //       window.location.href = `/dashboard/test/${res.data.H_ID}`;
  //     } else {
  //       toast.error(res.data?.message || "Server error");
  //     }
  //   } catch (err) {
  //     console.log("❌ Dashboard Error:", err.response?.data || err);
  //     toast.error("Failed to create dashboard");
  //   }
  // };

  //  const createDashboard = async () => {
  //     try {
  //       const pid = id || savedProjectId;

  //       if (!pid) {
  //         toast.error("Please save the project first!");
  //         return;
  //       }

  //       if (!contractorTypes || contractorTypes.length === 0) {
  //         toast.error("Contractor Types not loaded yet!");
  //         return;
  //       }

  //      // 🔥 Auto create 21 lines
  //       const autoLines = contractorTypes.map((c) => ({
  //         C_P_ID: c.ID,
  //         DESCRIPTION: "",
  //         SCHEDULE_START_DATE: "",
  //         SCHEDULE_END_DATE: "",
  //       }));

  //       const payload = {
  //         P_ID: Number(pid),
  //         CREATION_BY: 105,
  //          LINES: autoLines, // 🔥 21 LINES SENT HERE
  //       };

  //       console.log("Sending payload:", payload);

  //       const res = await api.post("/shedule.php", payload, {
  //         headers: { "Content-Type": "application/json" },
  //       });

  //       console.log("Dashboard created:", res.data);

  //       if (res.data?.success) {
  //         toast.success("Dashboard created!");

  //         window.location.href = `/dashboard/test/${pid}`;
  //       } else {
  //         toast.error(res.data?.message || "Server error");
  //       }
  //     } catch (err) {
  //       console.log("❌ Dashboard Error:", err.response?.data || err);
  //       toast.error("Failed to create dashboard");
  //     }
  //   };

//  const handleCreateDashboard = async () => {
//   if (!dashboardDate) {
//     toast.error("Please select a start date!");
//     return;
//   }

//   try {
//     const pid = id || savedProjectId;

//     if (!pid) {
//       toast.error("Please save the project first!");
//       return;
//     }

//     const payload = {
//       p_pid: Number(pid),
//       p_s_date: dashboardDate, // pass selected date
//     };

//     // 🔹 Call API
//     const res = await api.post("/shedule_api.php", payload, {
//       headers: { "Content-Type": "application/json" },
//     });

//     if (res.data?.success) {
//       // 🔹 Get H_ID from response
//       const H_ID = res.data?.data?.H_ID;
//       console.log(H_ID);

//       // if (!H_ID) {
//       //   toast.error("H_ID not returned from server!");
//       //   return;
//     //  }

//       toast.success("Dashboard created successfully!");
//       setShowDashboardModal(false);

//       // 🔹 Redirect using H_ID
//       window.location.href = `/dashboard/test/${pid}`;
//     } else {
//       toast.error(res.data?.message || "Server error");
//     }
//   } catch (err) {
//     console.error("Dashboard creation error:", err.response?.data || err);
//     toast.error("Failed to create dashboard");
//   }
// };




const handleCreateDashboard = async () => {
  if (!dashboardDate) {
    toast.error("Please select a start date!");
    return;
  }

  setIsCreatingDashboard(true);

  try {
    const pid = id || savedProjectId;

    if (!pid) {
      toast.error("Please save the project first!");
      setIsCreatingDashboard(false);
      return;
    }

    const payload = {
      p_pid: Number(pid),
      p_s_date: dashboardDate,
    };

    console.log("📤 Step 1: Creating dashboard with payload:", payload);

    // Step 1: Create dashboard via shedule_api.php
    const createRes = await api.post("/shedule_api.php", payload, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("📥 Step 1 Response:", createRes.data);

    if (!createRes.data?.success) {
      toast.error(createRes.data?.message || "Failed to create dashboard");
      setIsCreatingDashboard(false);
      return;
    }

    toast.success("Dashboard created! Fetching H_ID...");

    // Step 2: Wait a bit for database to update
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log("📤 Step 2: Fetching H_ID for P_ID:", pid);

    // Step 3: Fetch all schedules
    const fetchRes = await api.get("/shedule.php");
    console.log("📥 Step 2 Full Response:", fetchRes.data);

    // Extract data from response
    let schedules = [];
    if (fetchRes.data?.data && Array.isArray(fetchRes.data.data)) {
      schedules = fetchRes.data.data;
    } else if (Array.isArray(fetchRes.data)) {
      schedules = fetchRes.data;
    }

    console.log("📊 Total schedules found:", schedules.length);
    console.log("🔍 Looking for P_ID:", pid, "Type:", typeof pid);

    // Filter schedules for this project
    const projectSchedules = schedules.filter(s => {
      const schedPid = String(s.P_ID);
      const targetPid = String(pid);
      console.log(`Comparing: ${schedPid} === ${targetPid}`, schedPid === targetPid);
      return schedPid === targetPid;
    });

    console.log("🎯 Project schedules found:", projectSchedules.length);
    console.log("📋 Project schedules:", projectSchedules);

    if (projectSchedules.length === 0) {
      toast.error("No schedule found for this project. Please try again.");
      setIsCreatingDashboard(false);
      return;
    }

    // Get the latest (highest H_ID)
    const latestSchedule = projectSchedules.sort((a, b) => {
      return Number(b.H_ID) - Number(a.H_ID);
    })[0];

    const H_ID = latestSchedule?.H_ID;
    console.log("✅ Found H_ID:", H_ID);

    if (!H_ID) {
      toast.error("H_ID not found in response");
      setIsCreatingDashboard(false);
      return;
    }

    // Success!
    toast.success(`Dashboard ready with H_ID: ${H_ID}`);
    setShowDashboardModal(false);
    setDashboardDate("");

    // Redirect
    setTimeout(() => {
      console.log("🚀 Redirecting to:", `/dashboard/test/${H_ID}`);
      window.location.href = `/dashboard/test/${H_ID}`;
    }, 1000);

  } catch (err) {
    console.error("❌ Error:", err);
    console.error("❌ Response data:", err.response?.data);
    toast.error(
      err.response?.data?.message || "Failed to create dashboard"
    );
    setIsCreatingDashboard(false);
  }
};


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
    <SectionContainer>
 <div className="">
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
            inputWidth=""
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
          <button
  type="button"
  onClick={() => setShowDashboardModal(true)}
  className="bg-blue-600 text-sm text-white px-4 py-2 rounded"
>
  Create Dashboard
</button>


            {/* <button
              type="button"
              onClick={createDashboard}
              className="bg-blue-600 text-sm text-white px-4 py-2 rounded"
            >
              Create Dashboard
            </button> */}
          </div>
        </form>

        {/* 🔹 Process Table */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="px-3 py-2 border text-center">Project ID</th>
                <th className="px-3 py-2 border text-center">Contract type</th>
                <th className="px-3 py-2 border text-center">
                  Contractor Name
                </th>

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
                      {contractorTypes.find(
                        (c) => c.ID === line.SUB_CONTRACT_ID
                      )?.NAME || ""}
                    </td>

                    <td className="px-3 py-2 border text-center">
                      <select
                        value={line.CONTRACTOR_ID || ""}
                        onChange={(e) =>
                          handleLineChange(
                            index,
                            "CONTRACTOR_ID",
                            e.target.value
                          )
                        }
                        className="rounded text-sm px-2 py-1 w-full focus:outline-none"
                      >
                        <option value="">Select Contractor</option>
                        {contractorNames.map((c) => (
                          <option key={c.CONTRATOR_ID} value={c.CONTRATOR_ID}>
                            {c.CONTRATOR_NAME}
                          </option>
                        ))}
                      </select>
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

      {showDashboardModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white rounded-lg p-6 w-96">
      <h3 className="text-lg font-semibold mb-4">Select Project Start Date</h3>

      <input
        type="date"
        value={dashboardDate}
        onChange={(e) => setDashboardDate(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowDashboardModal(false)}
          className="px-4 py-2 rounded border border-gray-400"
        >
          Cancel
        </button>

        <button
          onClick={handleCreateDashboard}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Create
        </button>
      </div>
    </div>
  </div>
)}


      {/* <ProjectList /> */}
      <ProjectListTwo></ProjectListTwo>
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
