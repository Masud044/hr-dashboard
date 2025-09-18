import {
  Home,
  DollarSign,
  Users,
  Layers,
  Coffee,
  LogOutIcon,
  FileText,
  PlusCircle,
  Repeat,
  Wrench,
  User,
  ClipboardList,
  Plus,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";



export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <aside className="w-60 bg-white border-r flex justify-between sticky top-0 min-h-screen">
      <div>
        <div className="px-4 py-6 flex items-center gap-2">
          <img
            src="https://revinns.com/wp-content/uploads/2023/03/E2-B-1.png"
            alt="Logo"
            width={150}
            height={150}
          />
        </div>

        {/* Static Menu */}

        {/* Main entry */}
        <div>
          <button
            onClick={() => toggleMenu("main")}
            className={`w-[95%] text-left px-4 py-2 cursor-pointer font-semibold rounded-r-full space-y-1 
      ${
        openMenu === "main"
          ? "bg-green-200 text-black font-semibold"
          : "hover:bg-green-200"
      }`}
          >
            ▸ Main entry
          </button>
          {openMenu === "main" && (
            <div className="bg-white">
              <NavLink
                to="/dashboard"
                end 
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <Home className="w-4 h-4 mr-2 font-medium" /> Home
              </NavLink>
              <NavLink
                to="/dashboard/receive-voucher"
                end 
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg cursor-pointer ${
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
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg cursor-pointer ${
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
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg cursor-pointer ${
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
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg cursor-pointer ${
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
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg cursor-pointer ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "hover:text-green-800"
                  }`
                }
              >
                <Wrench className="w-4 h-4 mr-2" /> Chart of Account
              </NavLink>
              <div className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <ClipboardList className="w-4 h-4 mr-2" /> All Chart of account
              </div>
            </div>
          )}
        </div>

        {/* Report */}
        <div>
          <button
            onClick={() => toggleMenu("report")}
            className={`w-[95%] text-left px-4 py-2 cursor-pointer font-semibold  rounded-r-full
      ${
        openMenu === "report"
          ? "bg-green-200 text-black font-medium"
          : "hover:bg-green-200"
      }`}
          >
            ▸ Report
          </button>
          {openMenu === "report" && (
            <div className="bg-white">
              <div className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <ClipboardList className="w-4 h-4 mr-2" /> Daily Expense Report
              </div>
              <div className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <ClipboardList className="w-4 h-4 mr-2" /> Daily Income Report
              </div>
              <div className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <FileText className="w-4 h-4 mr-2" /> Ledger
              </div>
              <div className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <FileText className="w-4 h-4 mr-2" /> Cash Book
              </div>
              <div className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <ClipboardList className="w-4 h-4 mr-2" /> Chart of account
              </div>
            </div>
          )}
        </div>

        {/* Users */}
        <div>
          <button
            onClick={() => toggleMenu("users")}
            className={`w-[95%] text-left px-4 py-2 cursor-pointer font-semibold rounded-r-full 
      ${
        openMenu === "users"
          ? "bg-green-200 text-black font-medium"
          : "hover:bg-green-200"
      }`}
          >
            ▸ Users
          </button>
          {openMenu === "users" && (
            <div className="bg-white">
              <div className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <User className="w-4 h-4 mr-2" /> User List
              </div>
              <div className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <User className="w-4 h-4 mr-2" /> Add User
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div>
          <button
            onClick={() => toggleMenu("settings")}
            className={`w-[95%] text-left px-4 py-2 cursor-pointer font-semibold rounded-r-full 
      ${
        openMenu === "settings"
          ? "bg-green-200 text-black font-medium"
          : "hover:bg-green-200"
      }`}
          >
            ▸ Settings
          </button>
          {openMenu === "settings" && (
            <div className="bg-white">
              <div className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <Settings className="w-4 h-4 mr-2" /> General Settings
              </div>
              <div className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <Settings className="w-4 h-4 mr-2" /> Account Settings
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer User Info */}
      {/* <div className="px-4 py-4 text-sm border-t">
        <div className="flex items-center gap-3 mb-4">
          <img
            src="https://avatars.githubusercontent.com/u/100532083?v=4"
            alt="User"
            className="w-8 h-8 rounded-full"
          />
          <div>
            <div className="font-medium">Md. Masud Mia</div>
            <div className="text-gray-500">Web Engineer</div>
          </div>
        </div>

        <Link to="/login">
          <button className="flex items-center gap-2 bg-[#d28764] hover:bg-[#d28764] text-white px-8 py-2 rounded-lg text-sm shadow-sm">
            Log Out <LogOutIcon className="w-4 h-4" />
          </button>
        </Link>
      </div> */}
    </aside>
  );
}
