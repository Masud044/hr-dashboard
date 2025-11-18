import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
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
        <img
          src="https://revinns.com/wp-content/uploads/2023/03/E2-B-1.png"
          alt="Logo"
          className="w-24 md:w-28"
        />
      </div>

     

      {/*//! desktop nav navigation menu*/}
      <NavigationMenu viewport={isMobile} className="hidden md:block">
        <NavigationMenuList className="flex-wrap">
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              {NAV_ITEMS.mainEntry.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              {NAV_ITEMS.mainEntry.links.map((item, idx) => (
                
                  <NavLink
                    to={item.to}
                    end
                    key={idx}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `  px-4 py-2 w-48 flex items-center  text-sm font-sans rounded-lg cursor-pointer ${
                        isActive
                          ? "text-green-700 font-medium"
                          : "hover:text-green-800 hover:bg-red-200 transition-colors duration-300"
                      }`
                    }
                  >
                    {item.Icon && (
                      <item.Icon className="w-4 h-4 mr-2 shrink-0" />
                    )}
                    {item.label}
                  </NavLink>
               
              ))}
              
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>
              {NAV_ITEMS.report.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              {NAV_ITEMS.report.links.map((item, idx) => (
                <NavigationMenuLink
                  className="flex-row items-center gap-2 "
                  key={idx}
                  asChild
                >
                  <NavLink
                    to={item.to}
                    end
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `  px-4 py-2 w-52 text-sm font-sans rounded-lg cursor-pointer ${
                        isActive
                          ? "text-green-700 font-medium"
                          : "hover:text-green-800"
                      }`
                    }
                  >
                    {item.Icon && (
                      <item.Icon className="w-4 h-4 mr-2 shrink-0" />
                    )}
                    {item.label}
                  </NavLink>
                </NavigationMenuLink>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>
              {NAV_ITEMS.users.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              {NAV_ITEMS.users.links.map((item, idx) => (
                <NavigationMenuLink
                  className="flex-row items-center gap-2 "
                  key={idx}
                  asChild
                >
                  <NavLink
                    to={item.to}
                    end
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `  px-4 py-2 w-36 text-sm font-sans rounded-lg cursor-pointer ${
                        isActive
                          ? "text-green-700 font-medium"
                          : "hover:text-green-800"
                      }`
                    }
                  >
                    {item.Icon && (
                      <item.Icon className="w-4 h-4 mr-2 shrink-0" />
                    )}
                    {item.label}
                  </NavLink>
                </NavigationMenuLink>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>
              {NAV_ITEMS.settings.label}
            </NavigationMenuTrigger> 
            <NavigationMenuContent>
              {NAV_ITEMS.settings.links.map((item, idx) => (
                <NavigationMenuLink
                  className="flex-row items-center gap-2 "
                  key={idx}
                  asChild
                >
                  <NavLink
                    to={item.to}
                    end
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `  px-4 py-2 w-48 text-sm font-sans rounded-lg cursor-pointer ${
                        isActive
                          ? "text-green-700 font-medium"
                          : "hover:text-green-800"
                      }`
                    }
                  >
                    {item.Icon && (
                      <item.Icon className="w-4 h-4 mr-2 shrink-0" />
                    )}
                    {item.label}
                  </NavLink>
                </NavigationMenuLink>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Right Side: User Info */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img
            src="https://avatars.githubusercontent.com/u/100532083?v=4"
            alt="User"
            className="w-8 h-8 rounded-full"
          />
          <div className="hidden lg:block">
            <div className="font-medium">Md. Masud Mia</div>
            <div className="text-gray-500 text-sm">Software Engineer</div>
          </div>
        </div>
        <Link to="/login">
          <button className="flex items-center gap-2 bg-[#d28764] hover:bg-[#c76a48] text-white px-4 py-2 rounded-lg text-sm shadow-sm">
            Log Out <LogOutIcon className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden p-2 rounded hover:bg-gray-100"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Drawer (untouched for now) */}
      {mobileOpen && (
        <div className="absolute top-14 left-0 w-full bg-white shadow-md border-t md:hidden z-30">
          <div className="flex flex-col">
            <NavLink
              to="/dashboard"
              end
              onClick={handleLinkClick}
              className="px-4 py-3 hover:bg-gray-100"
            >
              Home
            </NavLink>

            <NavLink
              to="/dashboard/payment-voucher"
              onClick={handleLinkClick}
              className="px-4 py-3 hover:bg-gray-100"
            >
              Payment Voucher
            </NavLink>
            <NavLink
              to="/dashboard/journal-voucher"
              onClick={handleLinkClick}
              className="px-4 py-3 hover:bg-gray-100"
            >
              Journal Voucher
            </NavLink>
            <NavLink
              to="/dashboard/account-voucher"
              onClick={handleLinkClick}
              className="px-4 py-3 hover:bg-gray-100"
            >
              Chart of Account
            </NavLink>
            <NavLink
              to="/dashboard/settings"
              onClick={handleLinkClick}
              className="px-4 py-3 hover:bg-gray-100"
            >
              Settings
            </NavLink>
            <Link to="/login" onClick={handleLinkClick}>
              <button className="m-4 flex items-center justify-center gap-2 bg-[#d28764] hover:bg-[#c76a48] text-white px-4 py-2 rounded-lg text-sm shadow-sm">
                Log Out <LogOutIcon className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
