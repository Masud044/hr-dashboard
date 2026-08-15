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
  const userPermissions = user?.permissions ?? [];

  const hasAnyRequiredPermission = (required) => {
    const codes = Array.isArray(required) ? required : [required];
    return codes.some((code) => userPermissions.includes(code));
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      {/* ── Header ── */}
      <SidebarHeader className="h-14 flex flex-row items-center border-b border-border px-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
            <IconBuildingSkyscraper className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-none overflow-hidden">
              <span className="font-display text-[15px] font-bold text-foreground tracking-tight whitespace-nowrap">
                7Skies Riversoft
              </span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase whitespace-nowrap">
                Admin Console
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* ── Nav Groups ── */}
      <SidebarContent className="px-2 py-4 gap-4">
        {NAV_ITEMS.map((group) => {
          const visibleLinks = group.links.filter((linkItem) =>
            hasAnyRequiredPermission(linkItem.requiredPermission)
          );
          if (visibleLinks.length === 0) return null;

          return (
            <Collapsible key={group.label} defaultOpen className="group/collapsible">
              <SidebarGroup className="px-0">
                {!isCollapsed && (
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel
                      className="
                        text-overline font-semibold tracking-wider text-muted-foreground
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
  linkItem.to === "/dashboard" || linkItem.exact
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
                                h-auto rounded-md px-3 py-2
                                text-[13px] font-medium
                                text-muted-foreground
                                transition-all duration-200
                                hover:bg-accent hover:text-primary
                                data-[active=true]:bg-primary
                                data-[active=true]:text-primary-foreground
                                data-[active=true]:font-semibold
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
                                        ? "flex items-center justify-center w-6 h-6 rounded-full bg-white/20 shrink-0"
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
                    rounded-md text-[13px] font-medium
                    text-muted-foreground
                    hover:bg-accent hover:text-primary
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
                className="w-40 rounded-lg border-border shadow-lg"
              >
                <DropdownMenuItem onClick={() => setTheme("light")} className="focus:bg-accent focus:text-primary">
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="focus:bg-accent focus:text-primary">
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="focus:bg-accent focus:text-primary">
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