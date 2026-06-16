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
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-10 px-3 border rounded-md bg-white flex items-center justify-between"
      >
        <span className="text-sm text-gray-700">
          {selectedCount
            ? `${selectedCount} Contractor Selected`
            : placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-72 overflow-y-auto">
          {contractors.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(c.id)}
                onChange={() => toggle(c.id)}
                className="h-4 w-4"
              />

              <span className="text-base text-gray-800">
                {c.title}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}