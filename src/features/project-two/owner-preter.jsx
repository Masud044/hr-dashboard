import React from "react";
import { Plus, Trash2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const EMPTY_OWNER = {
  O_NAME: "",
  ADDRESS: "",
  SUBURB: "",
  POSTCODE: "",
  STATE: "",
  EMAIL: "",
  PHONE: "",
};

export function OwnerRepeater({ owners, onChange }) {
  const updateField = (idx, field, value) => {
    const next = owners.map((o, i) => (i === idx ? { ...o, [field]: value } : o));
    onChange(next);
  };

  const addOwner = () => onChange([...owners, { ...EMPTY_OWNER }]);
  const removeOwner = (idx) => onChange(owners.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {owners.map((owner, idx) => (
        <div
          key={owner.ID ?? `new-${idx}`}
          className="group relative border border-border rounded-lg bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={12} className="text-primary" />
              </div>
              <span className="text-overline text-muted-foreground font-semibold tracking-wider">
                Owner {idx + 1}
              </span>
            </div>
            {owners.length > 1 && (
              <button
                type="button"
                onClick={() => removeOwner(idx)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                title="Remove owner"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Owner name *"
              value={owner.O_NAME}
              onChange={(e) => updateField(idx, "O_NAME", e.target.value)}
              className="sm:col-span-2 h-10" // ✅ Cleaned
            />
            <Input
              placeholder="Address"
              value={owner.ADDRESS}
              onChange={(e) => updateField(idx, "ADDRESS", e.target.value)}
              className="sm:col-span-2 h-10" // ✅ Cleaned
            />
            <Input
              placeholder="Suburb"
              value={owner.SUBURB}
              onChange={(e) => updateField(idx, "SUBURB", e.target.value)}
              className="h-10" // ✅ Cleaned
            />
            <Input
              placeholder="Postcode"
              value={owner.POSTCODE}
              onChange={(e) => updateField(idx, "POSTCODE", e.target.value)}
              className="h-10" // ✅ Cleaned
            />
            <Input
              placeholder="State"
              value={owner.STATE}
              onChange={(e) => updateField(idx, "STATE", e.target.value)}
              className="h-10" // ✅ Cleaned
            />
            <Input
              placeholder="Email"
              type="email"
              value={owner.EMAIL}
              onChange={(e) => updateField(idx, "EMAIL", e.target.value)}
              className="h-10" // ✅ Cleaned
            />
            <Input
              placeholder="Phone"
              value={owner.PHONE}
              onChange={(e) => updateField(idx, "PHONE", e.target.value)}
              className="h-10" // ✅ Cleaned
            />
          </div>
 <div className="flex justify-end gap-3 pt-6   border-border">
            
              <Button
                type="submit"
                // disabled={mutation.isPending}
                className="h-9 px-4 text-sm font-medium bg-primary hover:bg-primary/90 text-white  hover:shadow-lg transition-all"
              >
                {/* <Save size={16} className="mr-2" /> */}
                {/* { "Add..." : "Add Owner"} */}
                Add owner
              </Button>
            </div>

        </div>
      ))}

      {/* Add Owner Button */}
      <Button
        type="button"
        variant="outline"
        onClick={addOwner}
        className="w-full h-10 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all"
      >
        <Plus size={16} className="mr-2" />
        <span className="text-sm font-medium">Add Another Owner</span>
      </Button>
    </div>
  );
}