import React from "react";
import { SectionContainer } from "@/components/SectionContainer";
import { NewProjectTable } from "./project-list";


const ProjectPage = () => {
  return (
    <SectionContainer>
      <div>
        <NewProjectTable />
      </div>
    </SectionContainer>
  );
};

export default ProjectPage;