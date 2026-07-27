import React from "react";
import { NewProjectTable } from "./project-list";
import OwnerProjects from "./owner-projects";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { SectionContainer } from "@/components/SectionContainer";

const ProjectPage = () => {
  const { user } = useAuthV2();
  const hasOwnerRole = user?.roles?.includes("Owner");
  const isAdmin = user?.roles?.includes("Admin");
  const isOwnerType = user?.userType === "OWNER";

  if (hasOwnerRole && !isAdmin) {
    if (!isOwnerType) {
      return (
        <SectionContainer>
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your account has the Owner role but isn't linked to an owner record.
            Please contact an admin to fix your account setup.
          </div>
        </SectionContainer>
      );
    }
    return <OwnerProjects />;
  }

  return (
    <SectionContainer>
      <div>
        <NewProjectTable />
      </div>
    </SectionContainer>
  );
};

export default ProjectPage;