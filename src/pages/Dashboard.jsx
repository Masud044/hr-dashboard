import { Routes, Route, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCards from "../components/GoalsCards";
import Reports from "../components/Reports";
import Meetings from "../components/Meeting";
import PointsCards from "../components/PointsCards";

import RewardsBar from "../components/RewardsBar";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";


const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard|HRMS</title>
      </Helmet>
      <div className="flex  w-full min-h-screen bg-gray-50">
        {/* <Sidebar /> */}
        <div className="flex-1 flex flex-col">
         
          <Navbar />
          <main className="">
            <Outlet></Outlet>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
