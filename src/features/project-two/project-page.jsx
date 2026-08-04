// src\features\project-two\project-page.jsx
import React from "react";
import { NewProjectTable } from "./project-list";
import OwnerProjects from "./owner-projects";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { useHasPermission } from "@/hooks/use-permission";
import { SectionContainer } from "@/components/SectionContainer";

const ProjectPage = () => {
  const { user } = useAuthV2();
  const canViewAll = useHasPermission("PROJECT_VIEW_ALL");
  const canViewSelf = useHasPermission("PROJECT_VIEW_SELF");
  const isOwnerType = user?.userType === "OWNER";

  if (canViewAll) {
    return (
      <SectionContainer>
        <div>
          <NewProjectTable />
        </div>
      </SectionContainer>
    );
  }

  if (canViewSelf) {
    if (!isOwnerType) {
      return (
        <SectionContainer>
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your account has project view access but isn't linked to an owner
            record. Please contact an admin to fix your account setup.
          </div>
        </SectionContainer>
      );
    }
    return <OwnerProjects />;
  }

  return (
    <SectionContainer>
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        You don't have permission to view projects.
      </div>
    </SectionContainer>
  );
};

export default ProjectPage;