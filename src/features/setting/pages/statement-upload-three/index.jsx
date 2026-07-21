// src/features/setting/pages/statement-upload-three/index.jsx
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
      className={`relative flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all
        ${active
          ? "text-blue-700 bg-white border-x border-t border-gray-200 rounded-t-xl -mb-px"
          : "text-gray-400 bg-gray-100 hover:bg-gray-50 hover:text-gray-600 border-x border-t border-transparent rounded-t-xl"
        }`}
      style={active ? { boxShadow: "0 -2px 0 0 #2563eb inset" } : {}}
    >
      {Icon && <Icon size={15} className={active ? "text-blue-600" : "text-gray-400"} />}
      {label}
    </button>
  );
});

const SubTabBtn = React.memo(function SubTabBtn({ id, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-xs font-semibold rounded-full border-2 transition-all ${
        active
          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
          : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
});

export default function StatementUploadThree() {
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
  // const contractorOpts = useMemo(
  //   () => contractorOptions.map((c) => ({ value: String(c.CONTRATOR_ID), label: c.CONTRATOR_NAME })),
  //   [contractorOptions]
  // );

  const contractorOpts = useMemo(
  () => toSortedOpts(contractorOptions, "CONTRATOR_ID", "CONTRATOR_NAME"),
  [contractorOptions]
);
  return (
    <SectionContainer>
      <div className="p-6 bg-white shadow rounded-lg mt-8">
        <div className="flex items-center justify-between mb-6 pb-2 border-b">
          <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-blue-600" />
            Statement Tool
            <span className="bg-blue-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">CSV</span>
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
        </div>

        {/* <div className="flex gap-1 border-b border-gray-200 mb-6">
          <MainTabBtn id="pending" label="Pending Uploads" icon={Inbox} active={mainTab === "pending"} onClick={setMainTab} />
          <MainTabBtn id="unapproved" label="Unapproved" icon={Inbox} active={mainTab==="unapproved"} onClick={setMainTab} />
          <MainTabBtn id="approved" label="Approved Records" icon={BadgeCheck} active={mainTab === "approved"} onClick={setMainTab} />
        </div> */}

        <div className="flex gap-1 border-b border-gray-200 mb-6">
  <MainTabBtn id="pending" label="Pending Uploads" icon={Inbox} active={mainTab === "pending"} onClick={setMainTab} />
  <MainTabBtn id="unapproved" label="Unapproved" icon={Inbox} active={mainTab === "unapproved"} onClick={setMainTab} />
  <MainTabBtn id="approved" label="Approved Records" icon={BadgeCheck} active={mainTab === "approved"} onClick={setMainTab} />
</div>

        {mainTab === "pending" && (
          <>
            <div className="flex items-center gap-2 mb-5">
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
    <div className="flex items-center gap-2 mb-5">
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