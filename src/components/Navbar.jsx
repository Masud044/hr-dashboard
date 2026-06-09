import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { NAV_ITEMS } from "@/lib/constants/nav-items";
import { useIsMobile } from "@/hooks/useMobile";
import UserDropDown from "./UserDropDown";
import MobileNav from "./MobileNav";
import img from "../assets/image2.png";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-[102] flex items-center justify-between h-14 px-4 md:px-6 bg-card/90 backdrop-blur-sm border-b border-border">

        {/* Left: Mobile toggle + Logo */}
        <div className="flex items-center gap-3">

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-[6px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Logo */}
          <img
            src={img}
            alt="Logo"
            className="w-24 md:w-28 select-none"
          />
        </div>

        {/* Center: Desktop navigation */}
        <NavigationMenu viewport={isMobile} className="hidden md:block">
          <NavigationMenuList className="flex items-center gap-0.5">
            {NAV_ITEMS.map((item, idx) => (
              <NavigationMenuItem key={idx}>
                <NavigationMenuTrigger
                  className="flex items-center gap-1.5 h-8 px-3 text-sm font-medium text-muted-foreground rounded-[6px] bg-transparent hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground transition-colors duration-150"
                >
                  <item.ItemIcon size={15} />
                  {item.label}
                </NavigationMenuTrigger>

                <NavigationMenuContent>
                  <div className="min-w-[180px] p-1">
                    {item.links.map((linkItem, linkItemIndex) => (
                      <NavLink
                        to={linkItem.to}
                        end
                        key={linkItemIndex}
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 text-sm rounded-[6px] transition-colors duration-150 ${
                            isActive
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-foreground hover:bg-muted"
                          }`
                        }
                      >
                        {linkItem.Icon && (
                          <linkItem.Icon size={14} className="shrink-0 opacity-70" />
                        )}
                        {linkItem.label}
                      </NavLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right: User dropdown */}
        <div className="flex items-center">
          <UserDropDown />
        </div>
      </header>

      {/* Mobile nav drawer */}
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  );
}