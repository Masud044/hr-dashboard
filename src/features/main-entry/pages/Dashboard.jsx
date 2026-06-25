import { SectionContainer } from "@/components/SectionContainer";
import { DashboardTable } from "../components/DashboardTable";

const Dashboard = () => {
  return (
    <SectionContainer variant="full" className="py-0">
  <DashboardTable />
</SectionContainer>
  );
};

export default Dashboard;