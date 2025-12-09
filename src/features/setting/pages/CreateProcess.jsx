import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Upload, Cog, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/SectionContainer";

import api from "@/api/Api";

const CreateProcess = () => {
  // support both param names: id or projectId
  const params = useParams();
  const projectIdParam = params.projectId ?? params.id ?? params.pid ?? null;
  const projectId = projectIdParam ? String(projectIdParam) : null;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editableLines, setEditableLines] = useState([]);

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

  // Fetch Construction Process Lines
  const {
    data: processLines = [],
    refetch: refetchProcess,
    isLoading,
  } = useQuery({
    queryKey: ["constructionProcess", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await api.get(
        `/construction_process.php?action=read&PROCESS_ID=${projectId}`
      );
      return res.data?.data || [];
    },
    enabled: !!projectId,
  });

  // Update editable lines when data changes
  useEffect(() => {
    if ((processLines || []).length > 0 && (contractorNames || []).length > 0) {
      const updatedLines = processLines.map((line) => {
        const contractor = contractorNames.find(
          (c) => Number(c.CONTRATOR_ID) === Number(line.CONTRACTOR_ID)
        );
        return { ...line, CONTRACTOR_NAME: contractor?.CONTRATOR_NAME || "" };
      });
      setEditableLines(updatedLines);
    }
  }, [processLines, contractorNames]);

  // Create 21 Process Lines - send both common keys to be safe
  const processMutation = useMutation({
    mutationFn: async (pid) => {
      const numPid = Number(pid);
      // send multiple key forms to match backend expectations
      const payload = {
        PROCESS_ID: numPid,
        process_id: numPid,
        P_ID: numPid,
      };
      return api.post("/process_contractor.php", payload);
    },
    onSuccess: (res) => {
      toast.success("Process lines created successfully!");
      refetchProcess();
    },
    onError: (err) => {
      console.error("Process create error:", err?.response?.data ?? err);
      toast.error("Failed to create process lines.");
    },
  });

  const handleProcess = () => {
    if (!projectId) {
      toast.error("Project ID not found in route!");
      return;
    }

    // show debug log to confirm what is sent
    console.log("Creating process for projectId:", projectId, "Number:", Number(projectId));
    processMutation.mutate(Number(projectId));
  };

  // Handle line changes
  const handleLineChange = (index, field, value) => {
    setEditableLines((prev) => {
      const updated = [...prev];
      const current = updated[index] ?? {};
      let newValue = value;

      if (
        [
          "SORT_ID",
          "COST",
          "SUB_CONTRACT_ID",
          "DEPENDENT_ID",
          "CONTRACTOR_ID",
        ].includes(field)
      ) {
        newValue = value === "" ? "" : Number(value);
      }

      const newLine = { ...current, [field]: newValue };

      if (field === "DEPENDENT_ID") {
        const selected = contractorTypes.find((c) => c.ID === newValue);
        newLine.DEPENDENT_NAME = selected?.NAME || "";
      }

      if (field === "CONTRACTOR_ID") {
        const selected = contractorNames.find(
          (c) => Number(c.CONTRATOR_ID) === Number(newValue)
        );
        newLine.CONTRACTOR_NAME = selected?.CONTRATOR_NAME || "";
      }

      updated[index] = newLine;
      return updated;
    });
  };

  // Update process lines
  const updateProcessMutation = useMutation({
    mutationFn: async (lines) =>
      Promise.all(
        (lines || []).map((line) => {
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
            ...(line.COST !== undefined && line.COST !== ""
              ? { COST: Number(line.COST) }
              : {}),
          };
          return api.put("/construction_process.php?action=update", payload);
        })
      ),
    onSuccess: () => {
      refetchProcess();
      toast.success("Process lines updated successfully!");
    },
    onError: (err) => {
      console.error("Update process error:", err?.response?.data ?? err);
      toast.error("Update failed. Check required fields.");
    },
  });

  const handleGoBack = () => {
    navigate("/dashboard/project");
  };

  return (
    <SectionContainer>
      <div className="p-6 bg-white shadow rounded-lg mt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Project Process Lines
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Project ID: {projectId ?? "—"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Projects
          </Button>
        </div>

        {/* Create Process Button */}
        {editableLines.length === 0 && !isLoading && (
          <div className="flex justify-center mb-6">
            <Button
              onClick={handleProcess}
              disabled={processMutation.isPending}
            >
              <Cog
                size={16}
                className={
                  processMutation.isPending ? "animate-spin mr-2" : "mr-2"
                }
              />
              {processMutation.isPending
                ? "Creating Process..."
                : "Create Process Lines"}
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading process lines...</p>
          </div>
        )}

        {/* Process Lines Table */}
        {!isLoading && editableLines.length > 0 && (
          <>
            <div className="overflow-x-auto">
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
                  {(editableLines || []).map((line, index) => (
                    <tr key={line.ID || index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 w-[5%] border">
                        {line.PROCESS_ID}
                      </td>
                      <td className="px-3 py-2 w-[30%] border">
                        {(contractorTypes || []).find(
                          (c) => c.ID === line.SUB_CONTRACT_ID
                        )?.NAME || ""}
                      </td>
                      <td className="py-2 border w-[20%]">
                        <select
                          value={line.CONTRACTOR_ID || ""}
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              "CONTRACTOR_ID",
                              e.target.value
                            )
                          }
                          className="rounded text-sm px-2 py-1 w-[90%] focus:outline-none"
                        >
                          <option value="">Select Contractor</option>
                          {(contractorNames || []).map((c) => (
                            <option
                              key={c.CONTRATOR_ID}
                              value={c.CONTRATOR_ID}
                            >
                              {c.CONTRATOR_NAME}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 border w-[15%]">
                        <select
                          value={line.DEPENDENT_ID || ""}
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              "DEPENDENT_ID",
                              e.target.value
                            )
                          }
                          className="rounded text-sm px-2 py-1 w-[90%] focus:outline-none"
                        >
                          <option value="">Select Dependent</option>
                          {(contractorTypes || []).map((c) => (
                            <option key={c.ID} value={c.ID}>
                              {c.NAME}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 w-[5%] text-center border">
                        <input
                          type="number"
                          value={line.SORT_ID || ""}
                          onChange={(e) =>
                            handleLineChange(index, "SORT_ID", e.target.value)
                          }
                          className="w-full border-none outline-none bg-transparent text-center"
                        />
                      </td>
                      <td className="px-3 py-2 w-[10%] text-center border">
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save Changes Button */}
            <div className="flex justify-end gap-3 mt-4">
              <Button
                onClick={() => updateProcessMutation.mutate(editableLines)}
                disabled={updateProcessMutation.isPending}
              >
                <Upload size={16} className="mr-2" />
                {updateProcessMutation.isPending
                  ? "Updating..."
                  : "Save Changes"}
              </Button>
            </div>
          </>
        )}

        {/* No Data State */}
        {!isLoading &&
          editableLines.length === 0 &&
          !processMutation.isPending && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p>No process lines found for this project.</p>
              <p className="text-sm mt-2">
                Click "Create Process Lines" to get started.
              </p>
            </div>
          )}
      </div>
    </SectionContainer>
  );
};

export default CreateProcess;
