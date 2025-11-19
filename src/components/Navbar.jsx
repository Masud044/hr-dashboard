import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {

  LogOutIcon,
  Menu,
  X,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { NAV_ITEMS } from "@/lib/constants/nav-items";
import { useIsMobile } from "@/hooks/useMobile";
import UserDropDown from "./UserDropDown";
import MobileNav from "./MobileNav";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLinkClick = () => {
    setMobileOpen(false); // close mobile when link clicked
  };

  return (
    <header className="flex items-center justify-between bg-white px-4 md:px-6 py-1 shadow-md sticky top-0 z-[102]">
      {/* Logo */}
      <div className="flex items-center gap-2">
        {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden p-2 rounded hover:bg-gray-100"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
        <img
          src="https://revinns.com/wp-content/uploads/2023/03/E2-B-1.png"
          alt="Logo"
          className="w-24 md:w-28"
        />
      </div>

      

      {/* desktop nav */}
      <NavigationMenu viewport={isMobile} className="hidden md:block">
        <NavigationMenuList className="flex-wrap">
          {NAV_ITEMS.map((item, idx) => (
            <NavigationMenuItem key={idx}>
              <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
              <NavigationMenuContent>
                {item.links.map((linkItem, linkItemIndex) => (
                  <NavLink
                    to={linkItem.to}
                    end
                    key={linkItemIndex}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `  px-4 py-2 w-48 flex items-center gap-2  text-sm font-sans rounded-lg cursor-pointer ${
                        isActive
                          ? "text-green-700 font-medium bg-green-50"
                          : " hover:bg-green-100 transition-colors duration-300"
                      }`
                    }
                  >
                    {linkItem.Icon && (
                      <linkItem.Icon className="w-4 h-4  shrink-0" />
                    )}
                    {linkItem.label}
                  </NavLink>
                ))}
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Right Side: User Info */}
      <div className="flex items-center gap-4">
        <UserDropDown />
      </div>

      

      
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  );
}
