import { SectionContainer } from "@/components/SectionContainer";
import { ContractorTable } from "../components/ContractorTable";


const Contractor = () => {
  return (
    <SectionContainer>
      <div>
        {/* Table with Add New Button */}
        <ContractorTable />
      </div>
    </SectionContainer>
  );
};

export default Contractor;