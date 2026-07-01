import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function ContractorMultiSelect({
  contractors,
  value = [],
  onChange,
  placeholder = "Select Contractors",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id) => {
    onChange(
      value.includes(id)
        ? value.filter((v) => v !== id)
        : [...value, id]
    );
  };

  const selectedCount = value.length;

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-10 px-3 border border-border rounded-md 
          bg-card hover:bg-muted/50 transition-colors
          flex items-center justify-between"
      >
        <span className="text-sm text-foreground">
          {selectedCount
            ? `${selectedCount} Contractor Selected`
            : placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute z-50 mt-1 w-full 
          bg-card border border-border rounded-md shadow-lg 
          max-h-72 overflow-y-auto">
          {contractors.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-3 px-4 py-3 
                hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={value.includes(c.id)}
                onChange={() => toggle(c.id)}
                className="h-4 w-4 rounded border-border 
                  text-primary focus:ring-primary/20 
                  dark:border-muted-foreground"
              />

              <span className="text-sm text-foreground">
                {c.title}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}