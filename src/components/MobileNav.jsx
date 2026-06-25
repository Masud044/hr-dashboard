import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";
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
import img from "../assets/image2.png";
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
      <SheetContent side="left" className="z-[103] p-0 w-[280px]">
        <SheetHeader className="border-b border-border px-4 h-14 flex justify-center">
          <SheetTitle className="text-left">
           <img src={img} alt="Logo" className="w-24" />
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-56px)] overflow-y-auto">
          <nav className="flex-1 px-3 py-3 space-y-1">
            {NAV_ITEMS.map((item, idx) => (
              <Collapsible
                key={idx}
                open={openSections.includes(idx)}
                onOpenChange={() => toggleSection(idx)}
              >
                <CollapsibleTrigger
                  className={`flex items-center justify-between w-full px-3 py-2.5 text-left text-sm font-medium rounded-md transition-colors ${
                    openSections.includes(idx)
                      ? "text-primary"
                      : "text-foreground hover:bg-accent hover:text-primary"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.ItemIcon && (
                      <item.ItemIcon size={16} className="shrink-0" />
                    )}
                    {item.label}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openSections.includes(idx) ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="ml-4 pl-3 border-l border-border py-1 space-y-0.5">
                    {item.links.map((linkItem, linkIdx) => (
                      <NavLink
                        key={linkIdx}
                        to={linkItem.to}
                        end={linkItem.to === "/dashboard"}
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-accent hover:text-primary"
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
                </CollapsibleContent>
              </Collapsible>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}