import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
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
    <header className="w-full flex items-center justify-between bg-card/80 backdrop-blur-md border-b border-border px-6 h-14 sticky top-0 z-[102]">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <img src={img} alt="Logo" className="w-24 md:w-28" />
      </div>

      {/* Desktop Nav */}
      <NavigationMenu viewport={isMobile} className="hidden md:block">
        <NavigationMenuList className="flex items-center gap-1">
          {NAV_ITEMS.map((item, idx) => (
            <NavigationMenuItem key={idx}>
              <NavigationMenuTrigger
                className="
                  flex items-center gap-1.5
                  h-8 px-3
                  text-sm font-medium text-foreground
                  bg-transparent rounded-md
                  hover:bg-accent hover:text-primary
                  data-[state=open]:bg-primary/10 data-[state=open]:text-primary
                  transition-colors duration-200
                "
              >
                <item.ItemIcon size={16} className="shrink-0" />
                {item.label}
              </NavigationMenuTrigger>

              <NavigationMenuContent className="p-0">
                <div className="w-[190px] py-1.5">
                  {item.links.map((linkItem, linkItemIndex) => (
                    <NavLink
                      to={linkItem.to}
                      end
                      key={linkItemIndex}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 w-full text-sm transition-colors duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground hover:bg-accent hover:text-primary"
                        }`
                      }
                    >
                      {linkItem.Icon && (
                        <linkItem.Icon className="w-4 h-4 shrink-0" />
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

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <ModeToggle />
        <UserDropDown />
      </div>

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  );
}