// src/features/setting/pages/statement-upload-four/index.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, BadgeCheck, FileSpreadsheet, Inbox } from "lucide-react";
import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import BankingTab from "./BankingTab";
import NonBankingTab from "./NonBankingTab";
import ApprovedTab from "./ApprovedTab";
import { useStatementMutations } from "./useStatementMutations";
import { url } from "./constants";
import { toSortedOpts } from "@/lib/utils";
import InvoiceSheet from "./invoice/InvoiceSheet";

const MainTabBtn = React.memo(function MainTabBtn({ id, label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
        ${active
          ? "text-primary border-primary"
          : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
        }`}
    >
      {Icon && <Icon size={15} className={active ? "text-primary" : "text-muted-foreground"} />}
      {label}
    </button>
  );
});

const SubTabBtn = React.memo(function SubTabBtn({ id, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
});

export default function StatementUploadFour() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState("pending");
  const [subTab, setSubTab] = useState("banking");
  const [unapprovedSubTab, setUnapprovedSubTab] = useState("banking");

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

        <div className="flex flex-wrap gap-1 border-b border-border mb-5">
          <MainTabBtn id="pending" label="Pending Uploads" icon={Inbox} active={mainTab === "pending"} onClick={setMainTab} />
          <MainTabBtn id="unapproved" label="Unapproved" icon={Inbox} active={mainTab === "unapproved"} onClick={setMainTab} />
          <MainTabBtn id="approved" label="Approved Records" icon={BadgeCheck} active={mainTab === "approved"} onClick={setMainTab} />
        </div>

        {mainTab === "pending" && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <SubTabBtn id="banking" label="Banking (from CSV)" active={subTab === "banking"} onClick={setSubTab} />
              <SubTabBtn id="nonbanking" label="Non-banking (manual form)" active={subTab === "nonbanking"} onClick={setSubTab} />
            </div>

            {subTab === "banking" && (
              <BankingTab
                projectOptions={projectOptions}
                contractorOptions={contractorOptions}
                projectOpts={projectOpts}
                contractorOpts={contractorOpts}
                mutations={mutations}
              />
            )}
            {subTab === "nonbanking" && (
              <NonBankingTab
                projectOptions={projectOptions}
                contractorOptions={contractorOptions}
                projectOpts={projectOpts}
                contractorOpts={contractorOpts}
                mutations={mutations}
              />
            )}
          </>
        )}

        {mainTab === "unapproved" && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <SubTabBtn id="banking" label="Banking (from CSV)" active={unapprovedSubTab === "banking"} onClick={setUnapprovedSubTab} />
              <SubTabBtn id="nonbanking" label="Non-banking (manual form)" active={unapprovedSubTab === "nonbanking"} onClick={setUnapprovedSubTab} />
            </div>

            {unapprovedSubTab === "banking" && (
              <BankingTab
                projectOptions={projectOptions}
                contractorOptions={contractorOptions}
                projectOpts={projectOpts}
                contractorOpts={contractorOpts}
                mutations={mutations}
                sortBy="recent"
              />
            )}
            {unapprovedSubTab === "nonbanking" && (
              <NonBankingTab
                projectOptions={projectOptions}
                contractorOptions={contractorOptions}
                projectOpts={projectOpts}
                contractorOpts={contractorOpts}
                mutations={mutations}
                sortBy="recent"
              />
            )}
          </>
        )}

        {mainTab === "approved" && (
          <ApprovedTab
            projectOptions={projectOptions}
            contractorOptions={contractorOptions}
            mutations={mutations}
          />
        )}
      </div>
      <InvoiceSheet />
    </SectionContainer>
  );
}