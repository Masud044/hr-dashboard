import StatCards from "../components/GoalsCards";
import Reports from "../components/Reports";
import PointsCards from "../components/PointsCards";
import Meetings from "../components/Meeting";
import RewardsBar from "../components/RewardsBar";

const DashboardHome = () => {
  return (
    <>
      <StatCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Reports />
        </div>
        <div className="space-y-6">
          <PointsCards />
          <Meetings />
        </div>
      </div>
      <RewardsBar />
    </>
  );
};

export default DashboardHome;
