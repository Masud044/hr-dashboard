import { SectionContainer } from "@/components/SectionContainer";
import { SupplierTable } from "../components/SupplierTable";

const Supplier = () => {
  return (
    <SectionContainer>
      <div>
        {/* Supplier Table with Add New Button */}
        <SupplierTable />
      </div>
    </SectionContainer>
  );
};

export default Supplier;