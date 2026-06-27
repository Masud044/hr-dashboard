import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Cog, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ── Standalone Dashboard Dialog ───────────────────────────────────────────────
function DashboardDialog({ open, onClose, onConfirm, isCreating }) {
  const [date, setDate] = useState("");
  useEffect(() => { if (!open) setDate(""); }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-sm z-[200]">
        <DialogHeader>
          <DialogTitle>Select Project Start Date</DialogTitle>
        </DialogHeader>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm(date)} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




// ── Main ProcessSheet ─────────────────────────────────────────────────────────
export function ProcessSheet({ isOpen, onClose, projectId }) {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const id          = projectId;

  const [editableLines,       setEditableLines]       = useState([]);
  const [showDashboardModal,  setShowDashboardModal]  = useState(false);
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);
 

  // ── queries ──────────────────────────────────────────────────────────────
  const { data: contractorTypes = [] } = useQuery({
    queryKey: ["contractorTypes"],
    queryFn: async () => (await axios.get(`${url}/api/contractor-type`)).data?.data || [],
    enabled: isOpen,
  });

  const { data: contractorTypeMap = [] } = useQuery({
    queryKey: ["contractorTypeMap"],
    queryFn: async () =>
      (await axios.get(`${url}/api/contractor/contractor-type-info`)).data?.data || [],
    enabled: isOpen,
  });

  const { data: contractorNames = [] } = useQuery({
    queryKey: ["contractorNames"],
    queryFn: async () => (await axios.get(`${url}/api/contractor`)).data?.data || [],
    enabled: isOpen,
  });

  const { data: existingProject } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/project?p_id=${id}`);
      const d   = res.data?.data;
      return Array.isArray(d) ? d.find((p) => Number(p.P_ID) === Number(id)) : d;
    },
    enabled: !!id && isOpen,
  });

  const { data: allSchedules = [] } = useQuery({
    queryKey: ["allSchedules"],
    queryFn: async () => {
      const res = await axios.get(`${url}/api/shedule`);
      if (Array.isArray(res.data?.data)) return res.data.data;
      if (Array.isArray(res.data)) return res.data;
      return [];
    },
    enabled: !!id && isOpen,
  });

  const { data: processLines = [], refetch: refetchProcess } = useQuery({
    queryKey: ["constructionProcess", id],
    queryFn: async () => {
      if (!id) return [];
      return (
        await axios.get(`${url}/api/construction-process?action=read&PROCESS_ID=${id}`)
      ).data?.data || [];
    },
    enabled: !!id && isOpen,
  });

  // ── derived ──────────────────────────────────────────────────────────────
  const dashboardAlreadyCreated = allSchedules.some((s) => String(s.P_ID) === String(id));
  const processAlreadyCreated   = processLines.length > 0;

  
  // ── sync editable lines ───────────────────────────────────────────────────
//   useEffect(() => {
//     if (processLines.length > 0) {
//       setEditableLines(
//         processLines.map((line) => ({
//           ...line,
//           CONTRACTOR_NAME:
//             contractorNames.find(
//               (c) => Number(c.CONTRATOR_ID) === Number(line.CONTRACTOR_ID)
//             )?.CONTRATOR_NAME || "",
//         }))
//       );
//     } else {
//       setEditableLines([]);
//     }
//   }, [processLines, contractorNames]);

// ── sync editable lines ───────────────────────────────────────────────────
  useEffect(() => {
    if (processLines.length > 0) {
      const next = processLines.map((line) => ({
        ...line,
        CONTRACTOR_NAME:
          contractorNames.find(
            (c) => Number(c.CONTRATOR_ID) === Number(line.CONTRACTOR_ID)
          )?.CONTRATOR_NAME || "",
      }));
      setEditableLines((prev) => {
        const sameLength = prev.length === next.length;
        const sameContent =
          sameLength &&
          prev.every(
            (p, i) => p.ID === next[i].ID && p.CONTRACTOR_NAME === next[i].CONTRACTOR_NAME
          );
        return sameContent ? prev : next; // bail out if nothing actually changed
      });
    } else {
      setEditableLines((prev) => (prev.length === 0 ? prev : []));
    }
  }, [processLines, contractorNames]);

  // reset when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setShowDashboardModal(false);
      
    }
  }, [isOpen]);

  // ── mutations ─────────────────────────────────────────────────────────────
  const processMutation = useMutation({
    mutationFn: async (process_id) =>
      axios.post(`${url}/api/process-contractor`, { process_id }),
    onSuccess: async () => {
      toast.success("Process lines created!");
      await queryClient.invalidateQueries(["constructionProcess", id]);
      refetchProcess();
    },
    onError: () => toast.error("Failed to create process lines."),
  });

  const handleProcess = () => {
    if (!id) { toast.error("Project ID not found."); return; }
    if (processAlreadyCreated) { toast.warning("Process lines already exist."); return; }
    processMutation.mutate(id);
  };

  const handleLineChange = (index, field, value) => {
    setEditableLines((prev) => {
      const updated = [...prev];
      let newValue  = value;
      if (["SORT_ID","COST","SUB_CONTRACT_ID","DEPENDENT_ID","CONTRACTOR_ID"].includes(field)) {
        newValue = value === "" ? "" : Number(value);
      }
      const newLine = { ...updated[index], [field]: newValue };
      if (field === "DEPENDENT_ID") {
        newLine.DEPENDENT_NAME = contractorTypes.find((c) => c.ID === newValue)?.NAME || "";
      }
      if (field === "CONTRACTOR_ID") {
        newLine.CONTRACTOR_NAME =
          contractorNames.find((c) => Number(c.CONTRATOR_ID) === Number(newValue))
            ?.CONTRATOR_NAME || "";
      }
      updated[index] = newLine;
      return updated;
    });
  };

  const updateProcessMutation = useMutation({
    mutationFn: async (lines) =>
      Promise.all(
        lines.map((line) =>
          axios.put(`${url}/api/construction-process?action=update`, {
            ID:            line.ID,
            DEPENDENT_ID:  line.DEPENDENT_ID ? Number(line.DEPENDENT_ID) : null,
            SORT_ID:       line.SORT_ID ? Number(line.SORT_ID) : 0,
            COST:          line.COST !== undefined && line.COST !== "" ? Number(line.COST) : null,
            CONTRACTOR_ID: line.CONTRACTOR_ID ? Number(line.CONTRACTOR_ID) : null,
            UPDATED_BY:    105,
          })
        )
      ),
    onSuccess: () => { refetchProcess(); toast.success("Process lines updated!"); },
    onError:   () => toast.error("Update failed."),
  });

 
  // ── dashboard ─────────────────────────────────────────────────────────────
  const handleCreateDashboard = async (dashboardDate) => {
    if (!dashboardDate) { toast.error("Please select a start date!"); return; }
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
      toast.success("Dashboard created!");
      await new Promise((r) => setTimeout(r, 500));

      const fetchRes   = await axios.get(`${url}/api/shedule`);
      const schedules  = fetchRes.data?.data || fetchRes.data || [];
      const projectSch = schedules.filter((s) => String(s.P_ID) === String(id));
      if (!projectSch.length) { toast.error("No schedule found."); setIsCreatingDashboard(false); return; }

      const H_ID = projectSch.sort((a, b) => Number(b.H_ID) - Number(a.H_ID))[0]?.H_ID;
      if (!H_ID) { toast.error("H_ID not found"); setIsCreatingDashboard(false); return; }

      queryClient.invalidateQueries(["allSchedules"]);
      toast.success(`Dashboard ready (H_ID: ${H_ID})`);
      setShowDashboardModal(false);
      onClose();
      setTimeout(
        () => navigate(`/dashboard/timeline/${H_ID}`, { state: { projectStartDate: dashboardDate } }),
        500
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create dashboard");
      setIsCreatingDashboard(false);
    }
  };

  
  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent className="!w-screen !h-screen !max-w-none overflow-y-auto flex flex-col gap-0 p-0 rounded-none z-[104]">
          <SheetHeader className="mb-6">
            <SheetTitle>
              {existingProject?.P_NAME || `Project #${id}`}
            </SheetTitle>
            <SheetDescription>Process &amp; Dashboard Management</SheetDescription>
          </SheetHeader>

          {/* ── Action Buttons ────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="relative group">
              <Button
                onClick={handleProcess}
                disabled={processMutation.isPending || processAlreadyCreated}
                variant={processAlreadyCreated ? "outline" : "default"}
                className={processAlreadyCreated ? "opacity-70 cursor-not-allowed" : ""}
              >
                {processAlreadyCreated ? (
                  <><CheckCircle size={15} className="mr-2 text-green-500" />Process Created</>
                ) : (
                  <><Cog size={15} className={processMutation.isPending ? "animate-spin mr-2" : "mr-2"} />
                    {processMutation.isPending ? "Processing..." : "Create Process"}</>
                )}
              </Button>
              {processAlreadyCreated && (
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap
                  bg-gray-800 text-white text-xs rounded px-2 py-1
                  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Process lines already created for this project
                </div>
              )}
            </div>

            <div className="relative group">
              <Button
                onClick={() => {
                  if (dashboardAlreadyCreated) { toast.warning("Dashboard already exists."); return; }
                  setShowDashboardModal(true);
                }}
                disabled={dashboardAlreadyCreated}
                variant={dashboardAlreadyCreated ? "outline" : "default"}
                className={dashboardAlreadyCreated ? "opacity-70 cursor-not-allowed" : ""}
              >
                {dashboardAlreadyCreated ? (
                  <><CheckCircle size={15} className="mr-2 text-green-500" />Dashboard Created</>
                ) : "Create Dashboard"}
              </Button>
              {dashboardAlreadyCreated && (
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap
                  bg-gray-800 text-white text-xs rounded px-2 py-1
                  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Dashboard already created for this project
                </div>
              )}
            </div>
          </div>

          {/* ── Construction Process Table ────────────────────────────────── */}
          <SectionLabel label="Construction Process Lines" />
          <div className="overflow-x-auto mt-3">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left">
                  {["Project ID", "Contract Type", "Contractor", "Dependent", "Sort", "Cost"].map((h) => (
                    <th key={h} className="px-3 py-2 border text-xs font-semibold uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {editableLines.length > 0 ? (
                  editableLines.map((line, index) => (
                    <tr key={line.ID || index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 border w-[6%] text-gray-500">{line.PROCESS_ID}</td>
                      <td className="px-3 py-2 border w-[20%]">
                        {contractorTypes.find((c) => c.ID === line.SUB_CONTRACT_ID)?.NAME || ""}
                      </td>
                      <td className="py-2 border w-[20%]">
                        <select
                          value={line.CONTRACTOR_ID || ""}
                          onChange={(e) => handleLineChange(index, "CONTRACTOR_ID", e.target.value)}
                          className="rounded text-sm px-2 py-1 w-[90%] focus:outline-none bg-transparent"
                        >
                          <option value="">Select Contractor</option>
                          {contractorNames
                            .filter((c) =>
                              !line.SUB_CONTRACT_ID ||
                              contractorTypeMap.some(
                                (m) =>
                                  Number(m.CONTRUCTOR_ID) === Number(c.CONTRATOR_ID) &&
                                  Number(m.CONTRUCTOR_TYPE) === Number(line.SUB_CONTRACT_ID)
                              )
                            )
                            .map((c) => (
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
                          className="rounded text-sm px-2 py-1 w-[90%] focus:outline-none bg-transparent"
                        >
                          <option value="">Select Dependent</option>
                          {contractorTypes.map((c) => (
                            <option key={c.ID} value={c.ID}>{c.NAME}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 border w-[7%] text-center">
                        <input
                          type="number"
                          value={line.SORT_ID || ""}
                          onChange={(e) => handleLineChange(index, "SORT_ID", e.target.value)}
                          className="w-full border-none outline-none bg-transparent text-center text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 border w-[10%] text-center">
                        <input
                          type="number"
                          value={line.COST || ""}
                          onChange={(e) => handleLineChange(index, "COST", e.target.value)}
                          className="w-full border-none outline-none bg-transparent text-center text-sm"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                      No process lines found. Click <strong>"Create Process"</strong> above to generate them.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

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
          </div>
        </SheetContent>
      </Sheet>

    
      <DashboardDialog
        open={showDashboardModal}
        onClose={() => setShowDashboardModal(false)}
        onConfirm={handleCreateDashboard}
        isCreating={isCreatingDashboard}
      />

     
    </>
  );
}

const SectionLabel = ({ label }) => (
  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
    <span className="flex-1 h-px bg-gray-200" />
    {label}
    <span className="flex-1 h-px bg-gray-200" />
  </p>
);