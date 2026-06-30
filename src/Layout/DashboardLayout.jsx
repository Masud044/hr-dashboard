import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import AppSidebar from "@/components/AppSidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

const DashboardLayout = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <SidebarProvider>
        <AppSidebar />

        <SidebarInset className="flex flex-col min-h-screen min-w-0 bg-background">
          <Navbar />
          <main className="flex-1 min-w-0 overflow-x-hidden">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default DashboardLayout;