// src/components/AppSidebar.jsx
import { NavLink, useLocation } from "react-router-dom";
import { Moon, Sun, ChevronDown } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_ITEMS } from "@/lib/constants/nav-items";
import { useTheme } from "@/components/theme-provider";
import img from "@/assets/image2.png";
import { IconBuildingSkyscraper } from "@tabler/icons-react";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";

export default function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { setTheme } = useTheme();
  const location = useLocation();
  const { user } = useAuthV2(); // add this
  const userRoles = user?.roles ?? []; // add this

  return (
    <Sidebar collapsible="icon" className="border-r border-border">

      {/* ── Header ── */}
      <SidebarHeader className="h-14 flex flex-row items-center border-b border-border px-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
            {/* <img src={img} alt="" className="w-5 h-5 object-contain invert" /> */}
            <IconBuildingSkyscraper />
          </div>
          {!isCollapsed && (
            <span className="font-display text-lg font-bold text-emerald-600 tracking-tight whitespace-nowrap">
              7Skies Riversoft
            </span>
          )}
        </div>
      </SidebarHeader>

     {/* ── Nav Groups ── */}
<SidebarContent className="px-2 py-4 gap-4">
  {/* {NAV_ITEMS.map((group, idx) => (
    <Collapsible key={idx} defaultOpen className="group/collapsible">
      <SidebarGroup className="px-0">
        {!isCollapsed && (
          <CollapsibleTrigger asChild>
            <SidebarGroupLabel className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase px-3 cursor-pointer hover:text-foreground transition-colors flex items-center justify-between">
              {group.label}
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </SidebarGroupLabel>
          </CollapsibleTrigger>
        )}
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {group.links.map((linkItem, linkIdx) => {
const isActive =
  linkItem.to === "/dashboard"
    ? location.pathname === linkItem.to
    : location.pathname === linkItem.to ||
      location.pathname.startsWith(linkItem.to + "/");

                return (
                  <SidebarMenuItem key={linkIdx}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={isCollapsed ? linkItem.label : undefined}
                      className="
                        h-auto rounded-md px-2 py-2
                        text-[13px] font-medium
                        text-muted-foreground
                        hover:bg-accent hover:text-primary
                        data-[active=true]:bg-[#818CF8]
                        data-[active=true]:text-[#F0F0F5]
                        dark:data-[active=true]:bg-accent
                        dark:data-[active=true]:text-primary
                         
                      "
                    >
                      <NavLink to={linkItem.to} end={linkItem.to === "/dashboard"} className="flex items-center gap-4">
                        {linkItem.Icon && (
                          <linkItem.Icon className="w-5 h-5 shrink-0" />
                        )}
                        <span>{linkItem.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  ))} */}

  {NAV_ITEMS
  .filter((group) => group.roles?.some((r) => userRoles.includes(r)))
  .map((group, idx) => {
   const visibleLinks = group.links.filter((linkItem) => {
  const allowed = linkItem.roles ?? ["Admin"];
  return allowed.some((r) => userRoles.includes(r));
});
    if (visibleLinks.length === 0) return null;

    return (
      <Collapsible key={idx} defaultOpen className="group/collapsible">
        <SidebarGroup className="px-0">
          {!isCollapsed && (
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase px-3 cursor-pointer hover:text-foreground transition-colors flex items-center justify-between">
                {group.label}
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
          )}
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {visibleLinks.map((linkItem, linkIdx) => {
                  const isActive =
                    linkItem.to === "/dashboard"
                      ? location.pathname === linkItem.to
                      : location.pathname === linkItem.to ||
                        location.pathname.startsWith(linkItem.to + "/");

                  return (
                    <SidebarMenuItem key={linkIdx}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={isCollapsed ? linkItem.label : undefined}
                        className="
                          h-auto rounded-md px-2 py-2
                          text-[13px] font-medium
                          text-muted-foreground
                          hover:bg-accent hover:text-primary
                          data-[active=true]:bg-[#818CF8]
                          data-[active=true]:text-[#F0F0F5]
                          dark:data-[active=true]:bg-accent
                          dark:data-[active=true]:text-primary
                        "
                      >
                        <NavLink
                          to={linkItem.to}
                          end={linkItem.to === "/dashboard"}
                          className="flex items-center gap-4"
                        >
                          {linkItem.Icon && (
                            <linkItem.Icon className="w-5 h-5 shrink-0" />
                          )}
                          <span>{linkItem.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    );
  })}
</SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip={isCollapsed ? "Toggle theme" : undefined}
                  className="text-muted-foreground hover:bg-accent hover:text-primary"
                >
                  <Sun className="w-[18px] h-[18px] shrink-0 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute w-[18px] h-[18px] shrink-0 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  {!isCollapsed && <span>Toggle theme</span>}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-40">
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  );
}