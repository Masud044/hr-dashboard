// src/components/Navbar.jsx
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserDropDown from "./UserDropDown";

export default function Navbar() {
  return (
    <header className="w-full flex items-center justify-between bg-card/80 backdrop-blur-md border-b border-border px-4 h-14 sticky top-0 z-[102]">

      {/* Left — sidebar trigger */}
      <SidebarTrigger className="text-muted-foreground hover:text-primary hover:bg-accent" />

      {/* Right — user dropdown only (theme toggle moved to sidebar footer) */}
      <div className="flex items-center gap-3">
        <UserDropDown />
      </div>

    </header>
  );
}