// src\features\setting\owner-info\owner-info.jsx
import { SectionContainer } from "@/components/SectionContainer";
import { OwnerInfoTable } from "./owner-info-table";


const OwnerInfo = () => {
  return (
    <SectionContainer>
      <div>
        <OwnerInfoTable/>
      </div>
    </SectionContainer>
  );
};

export default OwnerInfo;