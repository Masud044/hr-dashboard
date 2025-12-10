
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
    links: [
     
      { to: "/dashboard/dashboard-schedule", label: "Dashboard", Icon: LayoutDashboard },
     
    ],
  },

 

  {
    label: "Users",
    ItemIcon: IconUsers,
    links: [
      { to: "/dashboard/user", label: "User", Icon: User },
    
      { to: "/dashboard/admin", label: "Admin User", Icon: IconUserShield},
    ],
  },

  {
    label: "Settings",
    ItemIcon: IconSettings,
    links: [
      
      { to: "/dashboard/supplier", label: "Supplier", Icon: IconTruckDelivery },
     
      { to: "/dashboard/project", label: "Project", Icon: IconBuildingSkyscraper },
      { to: "/dashboard/contractor", label: "Contractor", Icon: IconUserHexagon },
    ],
  },
];
