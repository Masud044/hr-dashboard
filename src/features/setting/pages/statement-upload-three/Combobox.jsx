// src/features/setting/pages/statement-upload-three/Combobox.jsx
import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// options: [{ value: string, label: string }]
const Combobox = React.memo(function Combobox({
  options, value, onChange, placeholder = "Select...", searchPlaceholder = "Search...",
  emptyText = "No results found.", allowClear = true, className, disabled,
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => options.find((o) => String(o.value) === String(value)), [options, value]);
  const showClear = allowClear && selected && !disabled;

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "h-8 w-full justify-between text-xs font-normal",
              showClear && "pr-7",
              !selected && "text-muted-foreground",
              className
            )}
          >
            <span className="truncate">{selected ? selected.label : placeholder}</span>
            <ChevronsUpDown size={12} className="opacity-50 shrink-0 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} className="text-xs" />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => { onChange(String(opt.value) === String(value) ? "" : opt.value); setOpen(false); }}
                    className="text-xs"
                  >
                    <Check className={cn("mr-2 h-3.5 w-3.5", String(value) === String(opt.value) ? "opacity-100" : "opacity-0")} />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {showClear && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Clear selection"
          className="absolute right-6 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 z-10"
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(""); }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
});

export default Combobox;