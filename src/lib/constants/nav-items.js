
import { IconBuildingSkyscraper, IconDashboard, IconDatabaseEdit, IconSettings, IconTruckDelivery, IconUserHexagon, IconUsers, IconUserShield } from "@tabler/icons-react";
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
  LayoutDashboard,
} from "lucide-react";




export const NAV_ITEMS = [
  {
    label: "Main Entry",
    ItemIcon: IconDashboard,
    roles: ["Admin"],   
    links: [
     
      { to: "/dashboard/dashboard-schedule", label: "Dashboard", Icon: LayoutDashboard },
     
    ],
  },

 
   


 

  {
    label: "Settings",
    ItemIcon: IconSettings,
     roles: ["Admin"],   
    links: [
      
      // { to: "/dashboard/supplier", label: "Supplier", Icon: IconTruckDelivery },
     
      { to: "/dashboard/project", label: "Project", Icon: IconBuildingSkyscraper },
      { to: "/dashboard/contractor", label: "Contractor", Icon: IconUserHexagon },
      { to: "/dashboard/owner-info", label: "Owner Info", Icon: IconUserHexagon },
      // { to: "/dashboard/contractor-type-info", label: "Contractor info", Icon: IconUserHexagon },
       { to: "/dashboard/calendar", label: "Calender", Icon: IconUserHexagon },
        { to: "/dashboard/project-type", label: "Project Type", Icon: IconUserHexagon },
         { to: "/dashboard/contractor-type", label: "Contractor Type", Icon: IconUserHexagon },
          { to: "/dashboard/statement", label: "Project Statement", Icon: IconUserHexagon },
    ],
  },

  {
    label: "User Management",
    ItemIcon: IconUsers,
    roles: ["Admin"],                  // শুধু Admin
    links: [
      { to: "/dashboard/user-management", label: "User Management", Icon: ClipboardList },
      { to: "/dashboard/module", label: "Module", Icon: ClipboardList },
      { to: "/dashboard/role", label: "Role", Icon: FileText },
      { to: "/dashboard/permission", label: "Permission", Icon: FileText },
    ],
  },
];
