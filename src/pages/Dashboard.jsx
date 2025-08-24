import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCards from "../components/GoalsCards";
import Reports from "../components/Reports";
import Meetings from "../components/Meeting";
import PointsCards from "../components/PointsCards";
import Reminder from "../components/Reminder";
import RewardsBar from "../components/RewardsBar";

const Dashboard = () => {
  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          <Reminder />
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
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
