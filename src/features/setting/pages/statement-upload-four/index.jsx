// src/features/setting/pages/statement-upload-four/index.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import AllTab from "./AllTab";
import { useStatementMutations } from "./useStatementMutations";
import { url } from "./constants";
import { toSortedOpts } from "@/lib/utils";
import InvoiceSheet from "./invoice/InvoiceSheet";

export default function StatementUploadFour() {
  const navigate = useNavigate();

  const mutations = useStatementMutations();

  const { data: projectOptions = [] } = useQuery({
    queryKey: ["statementProjects"],
    queryFn: async () => (await axios.get(`${url}/api/statement/projects`)).data?.data || [],
    staleTime: 5 * 60 * 1000,
  });

  const { data: contractorOptions = [] } = useQuery({
    queryKey: ["statementContractors"],
    queryFn: async () => (await axios.get(`${url}/api/statement/contractors`)).data?.data || [],
    staleTime: 5 * 60 * 1000,
  });

  const projectOpts = useMemo(
    () => projectOptions.map((p) => ({ value: String(p.P_ID), label: p.P_NAME })),
    [projectOptions]
  );

  const contractorOpts = useMemo(
    () => toSortedOpts(contractorOptions, "CONTRATOR_ID", "CONTRATOR_NAME"),
    [contractorOptions]
  );

  return (
    <SectionContainer variant="dashboard">
      <div className="p-4 sm:p-5 bg-card border border-border shadow-xs rounded-md ">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-border">
          <h2 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
            <FileSpreadsheet size={17} className="" />
            Statement
            
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
        </div>

        <AllTab
          projectOptions={projectOptions}
          contractorOptions={contractorOptions}
          projectOpts={projectOpts}
          contractorOpts={contractorOpts}
          mutations={mutations}
        />
      </div>
      <InvoiceSheet />
    </SectionContainer>
  );
}