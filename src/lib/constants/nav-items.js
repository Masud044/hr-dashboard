import {
  Home,
  FileText,
  Plus,
  Wrench,
  ClipboardList,
  Settings,
  User,
  LogOutIcon,
  Menu,
  X,
} from "lucide-react";




export const NAV_ITEMS = [
  {
    label: "Main Entry",
    links: [
     
      { to: "/dashboard/dashboard-schedule", label: "Dashboard", Icon: ClipboardList },
     
    ],
  },

 

  {
    label: "Users",
    links: [
      { to: "/dashboard/user", label: "User", Icon: User },
    
      { to: "/dashboard/admin", label: "Admin User", Icon: User },
    ],
  },

  {
    label: "Settings",
    links: [
      
      { to: "/dashboard/supplier", label: "Supplier", Icon: Plus },
     
      { to: "/dashboard/project", label: "Project", Icon: Plus },
      { to: "/dashboard/contractor", label: "Contractor", Icon: Plus },
    ],
  },
];
