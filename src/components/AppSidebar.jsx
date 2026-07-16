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
import { IconBuildingSkyscraper } from "@tabler/icons-react";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";

export default function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { setTheme } = useTheme();
  const location = useLocation();
  const { user } = useAuthV2();
  const userRoles = user?.roles ?? [];

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">

      {/* ── Header — Flip7 wordmark, no logo art needed ── */}
      <SidebarHeader className="h-14 flex flex-row items-center border-b border-border px-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0 shadow-teal-glow">
            <IconBuildingSkyscraper className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-none overflow-hidden">
              <span className="font-display text-[15px] font-extrabold text-primary tracking-tight whitespace-nowrap">
                Flip7 SaaS
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase whitespace-nowrap">
                Admin Console
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* ── Nav Groups ── */}
      <SidebarContent className="px-2 py-4 gap-4">
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
                      <SidebarGroupLabel
                        className="
                          text-[11px] font-bold tracking-wider text-muted-foreground uppercase
                          px-3 pb-2 mx-1 cursor-pointer
                          border-b border-dashed border-border
                          hover:text-primary transition-colors
                          flex items-center justify-between
                        "
                      >
                        {group.label}
                        <ChevronDown className="w-3.5 h-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                  )}
                  <CollapsibleContent>
                    <SidebarGroupContent className="mt-1">
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
                                  h-auto rounded-l-none rounded-r-full px-3 py-2
                                  text-[13px] font-semibold
                                  text-muted-foreground
                                  transition-all duration-150
                                  hover:bg-secondary hover:text-primary
                                  data-[active=true]:bg-primary
                                  data-[active=true]:text-primary-foreground
                                  data-[active=true]:shadow-teal-glow
                                  data-[active=true]:font-bold
                                "
                              >
                                <NavLink
                                  to={linkItem.to}
                                  end={linkItem.to === "/dashboard"}
                                  className="flex items-center gap-3"
                                >
                                  {linkItem.Icon && (
                                    <span
                                      className={
                                        isActive
                                          ? "flex items-center justify-center w-6 h-6 rounded-md bg-white/20 shrink-0"
                                          : "flex items-center justify-center w-6 h-6 shrink-0"
                                      }
                                    >
                                      <linkItem.Icon className="w-[16px] h-[16px]" />
                                    </span>
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
                  className="
                    rounded-lg text-[13px] font-semibold
                    text-muted-foreground
                    hover:bg-secondary hover:text-primary
                    transition-colors
                  "
                >
                  <Sun className="w-[18px] h-[18px] shrink-0 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute w-[18px] h-[18px] shrink-0 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  {!isCollapsed && <span>Toggle theme</span>}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="top"
                className="w-40 rounded-lg border-border shadow-card"
              >
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className="focus:bg-secondary focus:text-primary"
                >
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className="focus:bg-secondary focus:text-primary"
                >
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className="focus:bg-secondary focus:text-primary"
                >
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  );
}