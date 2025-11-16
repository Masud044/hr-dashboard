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

export default function Header() {
  const [openMenu, setOpenMenu] = useState(null);
  const [activeParent, setActiveParent] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
    setActiveParent(menu);
  };
  const handleLinkClick = () => {
    setOpenMenu(null);
    setMobileOpen(false); // close everything when link is clicked
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

      {/* Desktop Navbar */}
      <nav className="hidden md:flex gap-6">
        {/* Main Entry */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("main")}
            className={`px-3 py-2 text-sm font-sans rounded-md ${
              activeParent === "main" ? "underline decoration-[#e66123] decoration-2 underline-offset-20 ": "hover:underline decoration-[#e66123] decoration-2 underline-offset-20"
            }`}
          >
            ▸ Main Entry
          </button>
          {openMenu === "main" && (
            <div className="absolute left-0 mt-2 bg-white border shadow-lg rounded-md w-56">
              <NavLink
                to="/dashboard"
                end
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <Home className="w-4  h-4 mr-2" /> Home
              </NavLink>
               <NavLink
                to="/dashboard/receive-voucher"
                end 
                 onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 text-sm font-sans py-2 rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <Home className="w-4 h-4 mr-2" /> Receive Voucher
              </NavLink>
              <NavLink
                to="/dashboard/payment-voucher"
                end
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <FileText className="w-4 h-4 mr-2" /> Payment Voucher
              </NavLink>
              <NavLink
                to="/dashboard/journal-voucher"
                end
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <Plus className="w-4 h-4 mr-2" /> Journal Voucher
              </NavLink>
              <NavLink
                to="/dashboard/cash-voucher"
                end 
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <Plus className="w-4 h-4 mr-2" /> Cash transfer
              </NavLink>
              
              <NavLink
                to="/dashboard/account-voucher"
                end
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans hover:bg-gray-100 ${
                    isActive ? "bg-green-100 font-medium" : ""
                  }`
                }
              >
                <Wrench className="w-4 h-4  mr-2" /> Chart of Account
              </NavLink>
               <div className="flex items-center px-4 py-2 text-sm font-sans hover:bg-gray-100 cursor-pointer">
                <ClipboardList className="w-4 h-4 mr-2" /> All Chart of account
              </div>
            </div>
          )}
        </div>

        {/* Report */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("report")}
            className={`px-3 py-2 text-sm font-sans  rounded-md ${
              openMenu === "report" ?"underline decoration-[#e66123] decoration-2 underline-offset-20 ": "hover:underline decoration-[#e66123] decoration-2 underline-offset-20"
            }`}
          >
            ▸ Report
          </button>
          {openMenu === "report" && (
            <div className="absolute left-0 mt-2 bg-white border shadow-lg rounded-md w-56">
              <div className="flex items-center px-4 py-2 text-sm font-sans hover:bg-gray-100">
                <ClipboardList className="w-4 h-4 mr-2" /> Daily Expense Report
              </div>
               <NavLink
                to="/dashboard/contraction-process"
                end
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <ClipboardList className="w-4 h-4  mr-2" /> Contraction Process
              </NavLink>
               <NavLink
                to="/dashboard/test"
                end
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <ClipboardList className="w-4 h-4  mr-2" /> Schedule Test
              </NavLink>
                {/* <NavLink
                to="/dashboard/shedule"
                end
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <ClipboardList className="w-4 h-4  mr-2" /> Schedule
              </NavLink> */}

               <NavLink
                to="/dashboard/shedule-line"
                end
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <ClipboardList className="w-4 h-4  mr-2" /> Schedule Line
              </NavLink>

              <div className="flex items-center px-4 py-2 text-sm font-sans hover:bg-gray-100">
                <ClipboardList className="w-4 h-4 mr-2" /> Daily Income Report
              </div>
              <div className="flex items-center px-4 py-2 text-sm font-sans hover:bg-gray-100">
                <FileText className="w-4 h-4 mr-2" /> Ledger
              </div>
               <div className="flex items-center px-4 py-2 text-sm font-sans hover:bg-gray-100">
                <FileText className="w-4 h-4 mr-2" /> Cash Book
              </div>
              <div className="flex items-center px-4 py-2 text-sm font-sans hover:bg-gray-100">
                <ClipboardList className="w-4 h-4 mr-2" /> Chart of account
              </div>
            </div>
          )}
        </div>

        {/* Users */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("users")}
            className={`px-3 py-2 text-sm font-sans  rounded-md ${
              openMenu === "users" ? "underline decoration-[#e66123] decoration-2 underline-offset-20 ": "hover:underline decoration-[#e66123] decoration-2 underline-offset-20"
            }`}
          >
            ▸ Users
          </button>
          {openMenu === "users" && (
            <div className="absolute left-0 mt-2 bg-white border shadow-lg rounded-md w-48">
              {/* <div className="flex items-center text-sm font-sans px-4 py-2 hover:bg-gray-100"> */}
               <NavLink
                to="/dashboard/user"
                end
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <User className="w-4 h-4  mr-2" /> User
              </NavLink>
              {/* </div> */}
              <div className="flex items-center text-sm font-sans px-4 py-2 hover:bg-gray-100">
                <User className="w-4 h-4 mr-2" /> Add User
              </div>
               <NavLink
                to="/dashboard/admin-user"
                end
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <User className="w-4 h-4  mr-2" /> Admin User
              </NavLink>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("settings")}
            className={`px-3 py-2 text-sm font-sans  rounded-md ${
              openMenu === "settings" ?"underline decoration-[#e66123] decoration-2 underline-offset-20 ": "hover:underline decoration-[#e66123] decoration-2 underline-offset-20"
            }`}
          >
            ▸ Settings
          </button>
          {openMenu === "settings" && (
            <div className="absolute left-0 mt-2 bg-white border shadow-lg rounded-md w-48">
              <div className="flex items-center text-sm font-sans px-4 py-2 hover:bg-gray-100">
                <Settings className="w-4 text-sm h-4 mr-2" /> General Settings
              </div>
              <div className="flex items-center text-sm font-sans px-4 py-2 hover:bg-gray-100">
                <Settings className="w-4 text-sm h-4 mr-2" /> Account Settings
              </div>
               <NavLink
                to="/dashboard/supplier-setting-voucher"
                end 
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <Plus className="w-4 h-4 mr-2" /> Supplier Setting
              </NavLink>
               <NavLink
                to="/dashboard/customer-setting-voucher"
                end 
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <Plus className="w-4 h-4 mr-2" /> Customer Setting
              </NavLink>
               <NavLink
                to="/dashboard/project-setting"
                end 
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <Plus className="w-4 h-4 mr-2" /> Project Setting
              </NavLink>
               <NavLink
                to="/dashboard/contrator-setting"
                end 
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-sans rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <Plus className="w-4 h-4 mr-2" /> Contractor Setting
              </NavLink>
            </div>
          )}
        </div>
      </nav>

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

      {/* Mobile Drawer */}
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
