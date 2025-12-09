import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Cog, Upload } from "lucide-react";
import { toast } from "react-toastify";

import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ProjectTable } from "../components/ProjectTable";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import api from "@/api/Api";

const projectSchema = z.object({
  P_NAME: z.string().min(1, "Project name is required"),
  P_TYPE: z.string().min(1, "Project type is required"),
  P_ADDRESS: z.string().min(1, "Address is required"),
  SUBWRB: z.string().min(1, "Suburb is required"),
  POSTCODE: z.string().min(1, "Postcode is required"),
  STATE: z.string().min(1, "State is required"),
  USER_ID: z.coerce.number().default(105),
  USER_BY: z.coerce.number().default(105),
  UPDATED_BY: z.coerce.number().default(105),
});

const Project = () => {

  const navigate = useNavigate();

  const goToDashboard = () => {
   
    navigate("/dashboard/dashboard-schedule");
  };

  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      P_NAME: "",
      P_TYPE: "",
      P_ADDRESS: "",
      SUBWRB: "",
      POSTCODE: "",
      STATE: "",
      USER_ID: 105,
      USER_BY: 105,
      UPDATED_BY: 105,
    },
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [savedProjectId, setSavedProjectId] = useState(null);
  const [editableLines, setEditableLines] = useState([]);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [dashboardDate, setDashboardDate] = useState("");
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 80, behavior: "smooth" });
  }, [id]);

  // Fetch Project Types
  const { data: projectTypes = [] } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => {
      const res = await api.get("/project_type_api.php");
      return res.data?.data || [];
    },
  });

  // Fetch Contractor Types
  const { data: contractorTypes = [] } = useQuery({
    queryKey: ["contractorTypes"],
    queryFn: async () => {
      const res = await api.get("/contractor_api.php");
      return res.data?.data || [];
    },
  });

  // Fetch Contractor Names
  const { data: contractorNames = [] } = useQuery({
    queryKey: ["contractorNames"],
    queryFn: async () => {
      const res = await api.get("/contrator.php");
      return res.data?.data || [];
    },
  });

  // Fetch Existing Project for Edit
  const { data: existingProject } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await api.get(`/project.php?project_id=${id}`);
      const projectData = res.data?.data;
      if (Array.isArray(projectData)) return projectData.find(p => p.P_ID === id);
      return projectData;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (existingProject) form.reset(existingProject);
  }, [existingProject]);

  // Save / Update Project
  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEditing) return api.put("/project.php", { ...formData, P_ID: id });
      return api.post("/project.php", formData);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["projects"]);
      const newId = res.data?.P_ID || id;
      setSavedProjectId(newId);
      toast.success(isEditing ? "Project updated successfully!" : "Project added successfully!");
    },
    onError: () => toast.error("❌ Failed to save project data. Please try again."),
  });

  // Fetch Construction Process Lines
  const { data: processLines = [], refetch: refetchProcess } = useQuery({
    queryKey: ["constructionProcess", id || savedProjectId],
    queryFn: async () => {
      const processId = id || savedProjectId;
      if (!processId) return [];
      const res = await api.get(`/construction_process.php?action=read&PROCESS_ID=${processId}`);
      return res.data?.data || [];
    },
    enabled: !!(id || savedProjectId),
  });

  useEffect(() => {
    if ((processLines || []).length > 0 && (contractorNames || []).length > 0) {
      const updatedLines = processLines.map(line => {
        const contractor = contractorNames.find(c => Number(c.CONTRATOR_ID) === Number(line.CONTRACTOR_ID));
        return { ...line, CONTRACTOR_NAME: contractor?.CONTRATOR_NAME || "" };
      });
      setEditableLines(prev => {
        const changed = JSON.stringify(prev.map(p => p.ID)) !== JSON.stringify(updatedLines.map(p => p.ID));
        return changed ? updatedLines : prev;
      });
    }
  }, [processLines, contractorNames]);

  // Create 21 Process Lines
  const processMutation = useMutation({
    mutationFn: async (process_id) => api.post("/process_contractor.php", { process_id }),
    onSuccess: () => {
      toast.success("Process lines created successfully!");
      refetchProcess();
    },
    onError: () => toast.error("Failed to create process lines."),
  });

  const handleProcess = () => {
    const pid = id || savedProjectId;
    if (!pid) {
      setMessage({ type: "error", text: "❌ Save the project first before creating process." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }
    processMutation.mutate(pid);
  };

  const handleLineChange = (index, field, value) => {
    setEditableLines(prev => {
      const updated = [...prev];
      const current = updated[index];
      let newValue = value;

      if (["SORT_ID","COST","SUB_CONTRACT_ID","DEPENDENT_ID","CONTRACTOR_ID"].includes(field)) {
        newValue = value === "" ? "" : Number(value);
      }

      const newLine = { ...current, [field]: newValue };

      if (field === "DEPENDENT_ID") {
        const selected = contractorTypes.find(c => c.ID === newValue);
        newLine.DEPENDENT_NAME = selected?.NAME || "";
      }

      if (field === "CONTRACTOR_ID") {
        const selected = contractorNames.find(c => Number(c.CONTRATOR_ID) === Number(newValue));
        newLine.CONTRACTOR_NAME = selected?.CONTRATOR_NAME || "";
      }

      updated[index] = newLine;
      return updated;
    });
  };

  const updateProcessMutation = useMutation({
    mutationFn: async (lines) => Promise.all(
      (lines || []).map(line => {
        const payload = {
          ID: line.ID,
          PROCESS_ID: line.PROCESS_ID,
          SUB_CONTRACT_NAME: line.SUB_CONTRACT_NAME || "",
          SUB_CONTRACT_ID: line.SUB_CONTRACT_ID ? Number(line.SUB_CONTRACT_ID) : null,
          DEPENDENT_ID: line.DEPENDENT_ID ? Number(line.DEPENDENT_ID) : null,
          SORT_ID: line.SORT_ID ? Number(line.SORT_ID) : 0,
          CONTRACTOR_ID: line.CONTRACTOR_ID || "",
          SUPPLIER_ID: line.SUPPLIER_ID ? Number(line.SUPPLIER_ID) : null,
          ...(line.COST !== undefined && line.COST !== "" ? { COST: Number(line.COST) } : {})
        };
        return api.put("/construction_process.php?action=update", payload);
      })
    ),
    onSuccess: () => {
      refetchProcess();
      toast.success("Process lines updated successfully!");
    },
    onError: (err) => toast.error("Update failed. Check required fields."),
  });



  // 🔹 Create Dashboard Function
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
      console.log("🚀 Redirecting to:", `/dashboard/timeline/${H_ID}`);
      window.location.href = `/dashboard/timeline/${H_ID}`;
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


    const onSubmit = (values) => mutation.mutate(values);

  return (
    <SectionContainer>
      <div className="p-6 bg-white shadow rounded-lg mt-8">
        <h2 className="font-semibold mb-6 text-sm text-gray-800 border-b pb-2">
          {isEditing ? "Edit Project" : "Add New Project"}
        </h2>

        {message.text && (
          <div className={`mb-4 p-3 rounded text-white ${message.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
            {message.text}
          </div>
        )}

        {/* 🔹 Project Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Project Name */}
            <FormField control={form.control} name="P_NAME" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Project Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

             {/* Suburb */}
            <FormField control={form.control} name="SUBWRB" render={({ field }) => (
              <FormItem>
                <FormLabel>Suburb</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

{/* 
            Project Type */}
            <FormField control={form.control} name="P_TYPE" render={({ field }) => (
              <FormItem>
                <FormLabel>Project Type</FormLabel>
                <FormControl>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {(projectTypes || []).map(pt => ( 
                        <SelectItem key={pt.ID} value={pt.ID.toString()}>{pt.NAME}</SelectItem>
                       
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

           
           
            {/* Postcode */}
            <FormField control={form.control} name="POSTCODE" render={({ field }) => (
              <FormItem>
                <FormLabel>Postcode</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* State */}
            <FormField control={form.control} name="STATE" render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

             {/* Address */}
            <FormField control={form.control} name="P_ADDRESS" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Project Address</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />


            {/* Buttons */}
            <div className="col-span-3 flex justify-end gap-2 mt-4">
              <Button type="submit" disabled={mutation.isPending}>
                <Save size={16} className="mr-2" />
                {mutation.isPending ? "Saving..." : "Save Project"}
              </Button>

              {(id || savedProjectId) && (
                <Button type="button" onClick={handleProcess} disabled={processMutation.isPending}>
                  <Cog size={16} className={processMutation.isPending ? "animate-spin" : ""} />
                  {processMutation.isPending ? "Processing..." : "Make Process"}
                </Button>
              )}

              <Button type="button" onClick={() => setShowDashboardModal(true)}>
                Create Dashboard
              </Button>

               <Button type="button" onClick={goToDashboard} >
                Go to Dashboard
              </Button>
            </div>
          </form>
        </Form>

        {/* 🔹 Process Table */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="px-3 py-2 border">Project ID</th>
                <th className="px-3 py-2 border">Contract type</th>
                <th className="px-3 py-2 border">Contractor</th>
                <th className="px-3 py-2 border">Dependent</th>
                <th className="px-3 py-2 border text-center">Sort</th>
                <th className="px-3 py-2 border text-center">Cost</th>
              </tr>
            </thead>
            <tbody>
              {(editableLines || []).length > 0 ? (
                (editableLines || []).map((line, index) => (
                  <tr key={line.ID || index} className="hover:bg-gray-50">
                    <td className="px-3 py-2 w-[5%] border">{line.PROCESS_ID}</td>
                    <td className="px-3 py-2 w-[30%] border">{(contractorTypes || []).find(c => c.ID === line.SUB_CONTRACT_ID)?.NAME || ""}</td>
                    <td className="py-2 border w-[20%]">
                      <select
                        value={line.CONTRACTOR_ID || ""}
                        onChange={(e) => handleLineChange(index, "CONTRACTOR_ID", e.target.value)}
                        className="rounded text-sm px-2 py-1 w-[90%] focus:outline-none"
                      >
                        <option value="">Select Contractor</option>
                        {(contractorNames || []).map(c => (
                          <option key={c.CONTRATOR_ID} value={c.CONTRATOR_ID}>{c.CONTRATOR_NAME}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 border w-[15%]">
                      <select
                        value={line.DEPENDENT_ID || ""}
                        onChange={(e) => handleLineChange(index, "DEPENDENT_ID", e.target.value)}
                        className="rounded text-sm px-2 py-1 w-[90%] focus:outline-none"
                      >
                        <option value="">Select Dependent</option>
                        {(contractorTypes || []).map(c => (
                          <option key={c.ID} value={c.ID}>{c.NAME}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 w-[5%] text-center border">
                      <input
                        type="number"
                        value={line.SORT_ID || ""}
                        onChange={(e) => handleLineChange(index, "SORT_ID", e.target.value)}
                        className="w-full border-none outline-none bg-transparent text-center"
                      />
                    </td>
                    <td className="px-3 py-2 w-[10%] text-center border">
                      <input
                        type="number"
                        value={line.COST || ""}
                        onChange={(e) => handleLineChange(index, "COST", e.target.value)}
                        className="w-full border-none outline-none bg-transparent text-center"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-3 text-gray-500">No process lines found for this project.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editableLines.length > 0 && (
          <div className="flex justify-end mt-3">
            <Button onClick={() => updateProcessMutation.mutate(editableLines)}>
              <Upload size={16} />
              {updateProcessMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        )}

        {/* 🔹 Dashboard Modal */}
        {showDashboardModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Select Project Start Date</h3>
              <Input type="date" value={dashboardDate} onChange={e => setDashboardDate(e.target.value)} />
              <div className="flex justify-end gap-3 mt-4">
                <Button onClick={() => setShowDashboardModal(false)}>Cancel</Button>
                <Button onClick={ handleCreateDashboard}>Create</Button>
              </div>
            </div>
          </div>
        )}

        {/* Project Table */}
        <ProjectTable />
      </div>
    </SectionContainer>
  );
};

export default Project;
