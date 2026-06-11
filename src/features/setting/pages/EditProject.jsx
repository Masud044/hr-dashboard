import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Cog, ArrowLeft, CheckCircle } from "lucide-react";
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
import axios from "axios";

const projectSchema = z.object({
  P_NAME:                 z.string().min(1, "Project name is required"),
  P_TYPE:                 z.string().min(1, "Project type is required"),
  P_ADDRESS:              z.string().min(1, "Address is required"),
  SUBWRB:                 z.string().min(1, "Suburb is required"),
  POSTCODE:               z.string().min(1, "Postcode is required"),
  STATE:                  z.string().min(1, "State is required"),
  USER_ID:                z.coerce.number().default(105),
  USER_BY:                z.coerce.number().default(105),
  UPDATED_BY:             z.coerce.number().default(105),
  LOT:                    z.string().optional().nullable(),
  DP:                     z.string().optional().nullable(),
  INSURANCE_NO:           z.string().optional().nullable(),
  P_ENTATIVE_START_DATE:  z.string().optional().nullable(),
  P_TENTATIVE_END_DATE:   z.string().optional().nullable(),
  P_CODE:                 z.string().optional().nullable(),
  DESCRIPTION:            z.string().optional().nullable(),
});

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const EditProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      P_NAME:                "",
      P_TYPE:                "",
      P_ADDRESS:             "",
      SUBWRB:                "",
      POSTCODE:              "",
      STATE:                 "",
      USER_ID:               105,
      USER_BY:               105,
      UPDATED_BY:            105,
      LOT:                   "",
      DP:                    "",
      INSURANCE_NO:          "",
      P_ENTATIVE_START_DATE: "",
      P_TENTATIVE_END_DATE:  "",
      P_CODE:                "",
      DESCRIPTION:           "",
    },
  });

  const [editableLines, setEditableLines]           = useState([]);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [dashboardDate, setDashboardDate]           = useState("");
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 80, behavior: "smooth" });
  }, []);

  // ── Fetch Project Types ──────────────────────────────────────────────────
  const { data: projectTypes = [] } = useQuery({
    queryKey: ["projectTypes"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project-type`);
      return res.data?.data || [];
    },
  });

  // ── Fetch Contractor Types ───────────────────────────────────────────────
  const { data: contractorTypes = [] } = useQuery({
    queryKey: ["contractorTypes"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/contractor-type`);
      return res.data?.data || [];
    },
  });

  // ── Fetch Contractor Names ───────────────────────────────────────────────
  const { data: contractorNames = [] } = useQuery({
    queryKey: ["contractorNames"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/contractor`);
      return res.data?.data || [];
    },
  });

  // ── Fetch Existing Project ───────────────────────────────────────────────
  const { data: existingProject, isLoading: projectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project?project_id=${id}`);
      const projectData = res.data?.data;
      if (Array.isArray(projectData)) {
        return projectData.find(p => Number(p.P_ID) === Number(id));
      }
      return projectData;
    },
    enabled: !!id,
  });

  // ── Fetch All Schedules → check if dashboard already exists ─────────────
  const { data: allSchedules = [] } = useQuery({
    queryKey: ["allSchedules"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/shedule`);
      if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
      if (Array.isArray(res.data)) return res.data;
      return [];
    },
    enabled: !!id,
  });

  // ── Derived flags ────────────────────────────────────────────────────────
  // true  → already created once → block further creation
  const dashboardAlreadyCreated = allSchedules.some(
    s => String(s.P_ID) === String(id)
  );

  // ── Populate form when data arrives ─────────────────────────────────────
  useEffect(() => {
    if (existingProject && projectTypes.length > 0) {
      form.reset({
        P_NAME:                existingProject.P_NAME || "",
        P_TYPE:                existingProject.P_TYPE?.toString() || "",
        P_ADDRESS:             existingProject.P_ADDRESS || "",
        SUBWRB:                existingProject.SUBWRB || "",
        POSTCODE:              existingProject.POSTCODE || "",
        STATE:                 existingProject.STATE || "",
        USER_ID:               existingProject.USER_ID || 105,
        USER_BY:               existingProject.USER_BY || 105,
        UPDATED_BY:            existingProject.UPDATED_BY || 105,
        LOT:                   existingProject.LOT || "",
        DP:                    existingProject.DP || "",
        INSURANCE_NO:          existingProject.INSURANCE_NO || "",
        P_ENTATIVE_START_DATE: existingProject.P_ENTATIVE_START_DATE || "",
        P_TENTATIVE_END_DATE:  existingProject.P_TENTATIVE_END_DATE || "",
        P_CODE:                existingProject.P_CODE || "",
        DESCRIPTION:           existingProject.DESCRIPTION || "",
      });
    }
  }, [existingProject, projectTypes]);

  // ── Update Project ───────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async (formData) =>
      axios.put(`${url}/api/project`, { ...formData, P_ID: id }),
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      queryClient.invalidateQueries(["project", id]);
      toast.success("Project updated successfully!");
    },
    onError: () => toast.error("❌ Failed to update project. Please try again."),
  });

  // ── Fetch Construction Process Lines ────────────────────────────────────
  const { data: processLines = [], refetch: refetchProcess } = useQuery({
    queryKey: ["constructionProcess", id],
    queryFn: async () => {
      if (!id) return [];
      const res = await axios.get(
        `${url}/api/construction-process?action=read&PROCESS_ID=${id}`
      );
      return res.data?.data || [];
    },
    enabled: !!id,
  });

  // processAlreadyCreated: true if there are existing lines for this project
  const processAlreadyCreated = processLines.length > 0;

  useEffect(() => {
    if (processLines.length > 0) {
      const updatedLines = processLines.map(line => {
        const contractor = contractorNames.find(
          c => Number(c.CONTRATOR_ID) === Number(line.CONTRACTOR_ID)
        );
        return { ...line, CONTRACTOR_NAME: contractor?.CONTRATOR_NAME || "" };
      });
      setEditableLines(updatedLines);
    }
  }, [processLines, contractorNames]);

  // ── Create Process Lines ─────────────────────────────────────────────────
  const processMutation = useMutation({
    mutationFn: async (process_id) =>
      axios.post(`${url}/api/process-contractor`, { process_id }),
    onSuccess: async () => {
      toast.success("Process lines created successfully!");
      await queryClient.invalidateQueries(["constructionProcess", id]);
      refetchProcess();
    },
    onError: () => toast.error("Failed to create process lines."),
  });

  const handleProcess = () => {
    if (!id) { toast.error("❌ Project ID not found."); return; }
    // Guard: prevent re-creation
    if (processAlreadyCreated) {
      toast.warning("Process lines already exist for this project.");
      return;
    }
    processMutation.mutate(id);
  };

  const handleLineChange = (index, field, value) => {
    setEditableLines(prev => {
      const updated = [...prev];
      const current = updated[index];
      let newValue = value;
      if (["SORT_ID", "COST", "SUB_CONTRACT_ID", "DEPENDENT_ID", "CONTRACTOR_ID"].includes(field)) {
        newValue = value === "" ? "" : Number(value);
      }
      const newLine = { ...current, [field]: newValue };
      if (field === "DEPENDENT_ID") {
        const selected = contractorTypes.find(c => c.ID === newValue);
        newLine.DEPENDENT_NAME = selected?.NAME || "";
      }
      if (field === "CONTRACTOR_ID") {
        const selected = contractorNames.find(
          c => Number(c.CONTRATOR_ID) === Number(newValue)
        );
        newLine.CONTRACTOR_NAME = selected?.CONTRATOR_NAME || "";
      }
      updated[index] = newLine;
      return updated;
    });
  };

  const updateProcessMutation = useMutation({
    mutationFn: async (lines) =>
      Promise.all(
        lines.map(line => {
          const payload = {
            ID:            line.ID,
            DEPENDENT_ID:  line.DEPENDENT_ID ? Number(line.DEPENDENT_ID) : null,
            SORT_ID:       line.SORT_ID ? Number(line.SORT_ID) : 0,
            COST:          line.COST !== undefined && line.COST !== "" ? Number(line.COST) : null,
            CONTRACTOR_ID: line.CONTRACTOR_ID ? Number(line.CONTRACTOR_ID) : null,
            UPDATED_BY:    105,
          };
          return axios.put(`${url}/api/construction-process?action=update`, payload);
        })
      ),
    onSuccess: () => {
      refetchProcess();
      toast.success("Process lines updated successfully!");
    },
    onError: () => toast.error("Update failed. Check required fields."),
  });

  // ── Create Dashboard ─────────────────────────────────────────────────────
  const handleCreateDashboard = async () => {
    if (!dashboardDate) { toast.error("Please select a start date!"); return; }
    // Guard: prevent re-creation
    if (dashboardAlreadyCreated) {
      toast.warning("A dashboard already exists for this project.");
      setShowDashboardModal(false);
      return;
    }
    setIsCreatingDashboard(true);
    try {
      const createRes = await axios.post(
        `${url}/api/shedule_api`,
        { p_pid: Number(id), p_s_date: dashboardDate },
        { headers: { "Content-Type": "application/json" } }
      );
      if (!createRes.data?.success) {
        toast.error(createRes.data?.message || "Failed to create dashboard");
        setIsCreatingDashboard(false);
        return;
      }
      toast.success("Dashboard created! Fetching H_ID...");
      await new Promise(resolve => setTimeout(resolve, 500));

      const fetchRes = await axios.get(`${url}/api/shedule`);
      let schedules = [];
      if (fetchRes.data?.data && Array.isArray(fetchRes.data.data)) schedules = fetchRes.data.data;
      else if (Array.isArray(fetchRes.data)) schedules = fetchRes.data;

      const projectSchedules = schedules.filter(s => String(s.P_ID) === String(id));
      if (!projectSchedules.length) {
        toast.error("No schedule found for this project.");
        setIsCreatingDashboard(false);
        return;
      }
      const latestSchedule = projectSchedules.sort(
        (a, b) => Number(b.H_ID) - Number(a.H_ID)
      )[0];
      const H_ID = latestSchedule?.H_ID;
      if (!H_ID) { toast.error("H_ID not found"); setIsCreatingDashboard(false); return; }

      // Invalidate so the "already created" flag updates immediately
      queryClient.invalidateQueries(["allSchedules"]);

      toast.success(`Dashboard ready with H_ID: ${H_ID}`);
      setShowDashboardModal(false);
      setDashboardDate("");
      setTimeout(() => {
        navigate(`/dashboard/timeline/${H_ID}`, {
          state: { projectStartDate: dashboardDate },
        });
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create dashboard");
      setIsCreatingDashboard(false);
    }
  };

  const onSubmit = (values) => updateMutation.mutate(values);

  if (projectLoading) {
    return (
      <SectionContainer>
        <div className="p-6 bg-white shadow rounded-lg mt-8">
          <div className="text-center py-8 text-gray-500">Loading project...</div>
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <div className="p-6 bg-white shadow rounded-lg mt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b">
          <h2 className="font-semibold text-sm text-gray-800">Edit Project</h2>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* ── Section: Basic Info ── */}
            <div className="md:col-span-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Basic Information
              </p>
            </div>

            <FormField control={form.control} name="P_NAME" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Project Name <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="P_CODE" render={({ field }) => (
              <FormItem>
                <FormLabel>Project Code</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. PRJ-001" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="P_TYPE" render={({ field }) => (
              <FormItem>
                <FormLabel>Project Type <span className="text-red-500">*</span></FormLabel>
                <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projectTypes.map(pt => (
                      <SelectItem key={pt.ID} value={pt.ID.toString()}>{pt.NAME}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="INSURANCE_NO" render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance No</FormLabel>
                <FormControl><Input {...field} placeholder="Enter insurance number" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="P_ENTATIVE_START_DATE" render={({ field }) => (
              <FormItem>
                <FormLabel>Tentative Start Date</FormLabel>
                <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="P_TENTATIVE_END_DATE" render={({ field }) => (
              <FormItem>
                <FormLabel>Tentative End Date</FormLabel>
                <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* ── Section: Land Details ── */}
            <div className="md:col-span-3 mt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Land Details
              </p>
            </div>

            <FormField control={form.control} name="LOT" render={({ field }) => (
              <FormItem>
                <FormLabel>Lot</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. 5" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="DP" render={({ field }) => (
              <FormItem>
                <FormLabel>DP (Deposited Plan)</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. 123456" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="SUBWRB" render={({ field }) => (
              <FormItem>
                <FormLabel>Suburb <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="POSTCODE" render={({ field }) => (
              <FormItem>
                <FormLabel>Postcode <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="STATE" render={({ field }) => (
              <FormItem>
                <FormLabel>State <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} placeholder="e.g. NSW" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="P_ADDRESS" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Project Address <span className="text-red-500">*</span></FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="DESCRIPTION" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} placeholder="Enter description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* ── Action Buttons ── */}
            <div className="col-span-3 flex justify-end gap-2 mt-4">

              {/* Update */}
              <Button type="submit" disabled={updateMutation.isPending}>
                <Save size={16} className="mr-2" />
                {updateMutation.isPending ? "Updating..." : "Update Project"}
              </Button>

              {/* Create Process — disabled once lines exist */}
              <div className="relative group">
                <Button
                  type="button"
                  onClick={handleProcess}
                  disabled={processMutation.isPending || processAlreadyCreated}
                  variant={processAlreadyCreated ? "outline" : "default"}
                  className={processAlreadyCreated ? "opacity-60 cursor-not-allowed" : ""}
                >
                  {processAlreadyCreated ? (
                    <>
                      <CheckCircle size={16} className="mr-2 text-green-500" />
                      Process Created
                    </>
                  ) : (
                    <>
                      <Cog
                        size={16}
                        className={processMutation.isPending ? "animate-spin mr-2" : "mr-2"}
                      />
                      {processMutation.isPending ? "Processing..." : "Create Process"}
                    </>
                  )}
                </Button>
                {/* Tooltip */}
                {processAlreadyCreated && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap
                                  bg-gray-800 text-white text-xs rounded px-2 py-1
                                  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Process lines already created for this project
                  </div>
                )}
              </div>

              {/* Create Dashboard — disabled once a schedule exists */}
              <div className="relative group">
                <Button
                  type="button"
                  onClick={() => {
                    if (dashboardAlreadyCreated) {
                      toast.warning("A dashboard already exists for this project.");
                      return;
                    }
                    setShowDashboardModal(true);
                  }}
                  disabled={dashboardAlreadyCreated}
                  variant={dashboardAlreadyCreated ? "outline" : "default"}
                  className={dashboardAlreadyCreated ? "opacity-60 cursor-not-allowed" : ""}
                >
                  {dashboardAlreadyCreated ? (
                    <>
                      <CheckCircle size={16} className="mr-2 text-green-500" />
                      Dashboard Created
                    </>
                  ) : (
                    "Create Dashboard"
                  )}
                </Button>
                {/* Tooltip */}
                {dashboardAlreadyCreated && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap
                                  bg-gray-800 text-white text-xs rounded px-2 py-1
                                  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Dashboard already created for this project
                  </div>
                )}
              </div>

            </div>
          </form>
        </Form>

        {/* ── Construction Process Table ── */}
        <div className="overflow-x-auto mt-8">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">
            Construction Process Lines
          </h3>
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
              {editableLines.length > 0 ? (
                editableLines.map((line, index) => (
                  <tr key={line.ID || index} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border w-[5%]">{line.PROCESS_ID}</td>
                    <td className="px-3 py-2 border w-[25%]">
                      {contractorTypes.find(c => c.ID === line.SUB_CONTRACT_ID)?.NAME || ""}
                    </td>
                    <td className="py-2 border w-[20%]">
                      <select
                        value={line.CONTRACTOR_ID || ""}
                        onChange={(e) => handleLineChange(index, "CONTRACTOR_ID", e.target.value)}
                        className="rounded text-sm px-2 py-1 w-[90%] focus:outline-none"
                      >
                        <option value="">Select Contractor</option>
                        {contractorNames.map(c => (
                          <option key={c.CONTRATOR_ID} value={c.CONTRATOR_ID}>
                            {c.CONTRATOR_NAME}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 border w-[20%]">
                      <select
                        value={line.DEPENDENT_ID || ""}
                        onChange={(e) => handleLineChange(index, "DEPENDENT_ID", e.target.value)}
                        className="rounded text-sm px-2 py-1 w-[90%] focus:outline-none"
                      >
                        <option value="">Select Dependent</option>
                        {contractorTypes.map(c => (
                          <option key={c.ID} value={c.ID}>{c.NAME}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 border w-[5%] text-center">
                      <input
                        type="number"
                        value={line.SORT_ID || ""}
                        onChange={(e) => handleLineChange(index, "SORT_ID", e.target.value)}
                        className="w-full border-none outline-none bg-transparent text-center"
                      />
                    </td>
                    <td className="px-3 py-2 border w-[10%] text-center">
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
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No process lines found. Click "Create Process" to generate them.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editableLines.length > 0 && (
          <div className="flex justify-end mt-3">
            <Button
              onClick={() => updateProcessMutation.mutate(editableLines)}
              disabled={updateProcessMutation.isPending}
            >
              {updateProcessMutation.isPending ? "Updating..." : "Update Process"}
            </Button>
          </div>
        )}

        {/* ── Dashboard Modal ── */}
        {showDashboardModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Select Project Start Date</h3>
              <Input
                type="date"
                value={dashboardDate}
                onChange={e => setDashboardDate(e.target.value)}
              />
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => { setShowDashboardModal(false); setDashboardDate(""); }}
                >
                  Cancel
                </Button>
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