// src\components\MobileNav.jsx
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
      <SheetContent side="left" className="z-[103] p-0 bg-card border-r border-border">

        {/* Header */}
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-left">
            <img src={img} alt="Logo" className="w-24" />
          </SheetTitle>
        </SheetHeader>

        {/* Nav */}
        <div className="flex flex-col h-[calc(100%-65px)] overflow-y-auto">
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {NAV_ITEMS.map((item, idx) => (
              <Collapsible
                key={idx}
                open={openSections.includes(idx)}
                onOpenChange={() => toggleSection(idx)}
              >
                {/* Section trigger */}
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-[6px] transition-colors duration-150">
                  <div className="flex items-center gap-2">
                    {item.ItemIcon && <item.ItemIcon size={15} className="text-muted-foreground" />}
                    {item.label}
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-muted-foreground transition-transform duration-200 ${
                      openSections.includes(idx) ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                {/* Section links */}
                <CollapsibleContent className="mt-0.5 ml-3 pl-3 border-l border-border space-y-0.5">
                  {item.links.map((linkItem, linkIdx) => (
                    <NavLink
                      key={linkIdx}
                      to={linkItem.to}
                      end={linkItem.to === "/dashboard"}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 text-sm rounded-[6px] transition-colors duration-150 ${
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`
                      }
                    >
                      {linkItem.Icon && (
                        <linkItem.Icon size={14} className="shrink-0 opacity-70" />
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