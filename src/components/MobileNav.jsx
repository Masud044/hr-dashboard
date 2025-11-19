import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { LogOut, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NAV_ITEMS } from "@/lib/constants/nav-items";

export default function MobileNav({ open, onOpenChange }) {
  const [openSections, setOpenSections] = useState([]);

  const toggleSection = (index) => {
    setOpenSections((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleLinkClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className=" z-[103]">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-left">
             <img
          src="https://revinns.com/wp-content/uploads/2023/03/E2-B-1.png"
          alt="Logo"
          className="w-24 md:w-28"
        />
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-73px)] overflow-y-auto">
          <nav className="flex-1 px-4 py-4 space-y-2">
            {NAV_ITEMS.map((item, idx) => (
              <Collapsible
                key={idx}
                open={openSections.includes(idx)}
                onOpenChange={() => toggleSection(idx)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  {item.label}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openSections.includes(idx) ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-1">
                  {item.links.map((linkItem, linkIdx) => (
                    <NavLink
                      key={linkIdx}
                      to={linkItem.to}
                      end={linkItem.to === "/dashboard"}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 ml-4 text-sm rounded-lg transition-colors ${
                          isActive
                            ? "text-green-700 font-medium bg-green-50"
                            : "text-gray-600 hover:bg-gray-100"
                        }`
                      }
                    >
                      {linkItem.Icon && (
                        <linkItem.Icon className="w-4 h-4 shrink-0" />
                      )}
                      {linkItem.label}
                    </NavLink>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </nav>

          
        </div>
      </SheetContent>
    </Sheet>
  );
}
