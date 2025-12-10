import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Cog, Upload, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

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

const EditProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

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

  const [editableLines, setEditableLines] = useState([]);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [dashboardDate, setDashboardDate] = useState("");
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 80, behavior: "smooth" });
  }, []);

  // Fetch Project Types
  const { data: projectTypes = [] } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => {
      const res = await api.get("/project_type_api.php");
      return res.data?.data || [];
    },
  });
  console.log("Project Types:", projectTypes);


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

  // Fetch Existing Project
const { data: existingProject, isLoading: projectLoading } = useQuery({
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
  if (existingProject && projectTypes.length > 0) {
    form.reset({
      ...existingProject,
      P_TYPE: existingProject.P_TYPE?.toString() || "",
    });
  }
}, [existingProject, projectTypes]);






//   useEffect(() => {
//     if (existingProject) {
//       form.reset(existingProject);
//     }
//   }, [existingProject]);

  // Update Project
  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      return api.put("/project.php", { ...formData, P_ID: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      queryClient.invalidateQueries(["project", id]);
      toast.success("Project updated successfully!");
    },
    onError: () => toast.error("❌ Failed to update project. Please try again."),
  });

  // Fetch Construction Process Lines
  const { data: processLines = [], refetch: refetchProcess } = useQuery({
    queryKey: ["constructionProcess", id],
    queryFn: async () => {
      if (!id) return [];
      const res = await api.get(`/construction_process.php?action=read&PROCESS_ID=${id}`);
      return res.data?.data || [];
    },
    enabled: !!id,
  });

  useEffect(() => {
    if ((processLines || []).length > 0 && (contractorNames || []).length > 0) {
      const updatedLines = processLines.map(line => {
        const contractor = contractorNames.find(c => Number(c.CONTRATOR_ID) === Number(line.CONTRACTOR_ID));
        return { ...line, CONTRACTOR_NAME: contractor?.CONTRATOR_NAME || "" };
      });
      setEditableLines(updatedLines);
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
    if (!id) {
      toast.error("❌ Project ID not found.");
      return;
    }
    processMutation.mutate(id);
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
    onError: () => toast.error("Update failed. Check required fields."),
  });

  // Create Dashboard Function
  const handleCreateDashboard = async () => {
    if (!dashboardDate) {
      toast.error("Please select a start date!");
      return;
    }

    setIsCreatingDashboard(true);

    try {
      const payload = {
        p_pid: Number(id),
        p_s_date: dashboardDate,
      };

      const createRes = await api.post("/shedule_api.php", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (!createRes.data?.success) {
        toast.error(createRes.data?.message || "Failed to create dashboard");
        setIsCreatingDashboard(false);
        return;
      }

      toast.success("Dashboard created! Fetching H_ID...");
      await new Promise(resolve => setTimeout(resolve, 500));

      const fetchRes = await api.get("/shedule.php");
      let schedules = [];
      if (fetchRes.data?.data && Array.isArray(fetchRes.data.data)) {
        schedules = fetchRes.data.data;
      } else if (Array.isArray(fetchRes.data)) {
        schedules = fetchRes.data;
      }

      const projectSchedules = schedules.filter(s => String(s.P_ID) === String(id));

      if (projectSchedules.length === 0) {
        toast.error("No schedule found for this project. Please try again.");
        setIsCreatingDashboard(false);
        return;
      }

      const latestSchedule = projectSchedules.sort((a, b) => Number(b.H_ID) - Number(a.H_ID))[0];
      const H_ID = latestSchedule?.H_ID;

      if (!H_ID) {
        toast.error("H_ID not found in response");
        setIsCreatingDashboard(false);
        return;
      }

      toast.success(`Dashboard ready with H_ID: ${H_ID}`);
      setShowDashboardModal(false);
      setDashboardDate("");

      setTimeout(() => {
        window.location.href = `/dashboard/timeline/${H_ID}`;
      }, 1000);

    } catch (err) {
      console.error("❌ Error:", err);
      toast.error(err.response?.data?.message || "Failed to create dashboard");
      setIsCreatingDashboard(false);
    }
  };

  const onSubmit = (values) => updateMutation.mutate(values);

  if (projectLoading) {
    return (
      <SectionContainer>
        <div className="p-6 bg-white shadow rounded-lg mt-8">
          <div className="text-center py-8">Loading project...</div>
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <div className="p-6 bg-white shadow rounded-lg mt-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b">
          <h2 className="font-semibold text-sm text-gray-800">
            Edit Project
          </h2>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </div>

        {/* Project Form */}
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
{/* Project Type */}
<FormField 
  control={form.control} 
  name="P_TYPE" 
  render={({ field }) => (
    <FormItem>
      <FormLabel>Project Type</FormLabel>
      <Select 
        value={field.value} 
        onValueChange={field.onChange}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {(projectTypes || []).map(pt => (
            <SelectItem key={pt.ID} value={pt.ID.toString()}>
              {pt.NAME}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )} 
/>

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
              <Button type="submit" disabled={updateMutation.isPending}>
                <Save size={16} className="mr-2" />
                {updateMutation.isPending ? "Updating..." : "Update Project"}
              </Button>

              <Button type="button" onClick={handleProcess} disabled={processMutation.isPending}>
                <Cog size={16} className={processMutation.isPending ? "animate-spin" : ""} />
                {processMutation.isPending ? "Processing..." : "Create Process"}
              </Button>

              <Button type="button" onClick={() => setShowDashboardModal(true)}>
                Create Dashboard
              </Button>
            </div>
          </form>
        </Form>

        {/* Process Table */}
        <div className="overflow-x-auto mt-6">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">Construction Process Lines</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="px-3 py-2 border">Project ID</th>
                <th className="px-3 py-2 border">Contract Type</th>
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
                    <td className="px-3 py-2 w-[30%] border">
                      {(contractorTypes || []).find(c => c.ID === line.SUB_CONTRACT_ID)?.NAME || ""}
                    </td>
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
                  <td colSpan="6" className="text-center py-3 text-gray-500">
                    No process lines found. Click "Create Process" to generate them.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editableLines.length > 0 && (
          <div className="flex justify-end mt-3">
            <Button onClick={() => updateProcessMutation.mutate(editableLines)} disabled={updateProcessMutation.isPending}>
             
              {updateProcessMutation.isPending ? "Updating..." : "Update Process"}
            </Button>
          </div>
        )}

        {/* Dashboard Modal */}
        {showDashboardModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Select Project Start Date</h3>
              <Input type="date" value={dashboardDate} onChange={e => setDashboardDate(e.target.value)} />
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setShowDashboardModal(false)}>Cancel</Button>
                <Button onClick={handleCreateDashboard} disabled={isCreatingDashboard}>
                  {isCreatingDashboard ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionContainer>
  );
};

export default EditProject;