import { SectionContainer } from "@/components/SectionContainer";
import { DashboardTable } from "../components/DashboardTable";

const Dashboard = () => {
  return (
    <SectionContainer>
      <div>
        {/* Dashboard Table with Edit Sheet */}
        <DashboardTable />
      </div>
    </SectionContainer>
  );
};

export default Dashboard;