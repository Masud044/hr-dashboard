import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";

const PlainLayout = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <div className="flex flex-col min-h-screen min-w-0 bg-background">
        <Navbar showSidebarTrigger={false} />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default PlainLayout;