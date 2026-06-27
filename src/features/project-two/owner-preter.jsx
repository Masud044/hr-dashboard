import React from "react";
import { Plus, Trash2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * OwnerRepeater
 * ------------------------------------------------------------------
 * Manages a list of owner rows (PM_OWNER_INFO) for a project.
 * Pure controlled component — parent (Create/Edit sheet) owns the state.
 *
 * owners: [{ ID?, O_NAME, ADDRESS, SUBURB, POSTCODE, STATE, EMAIL, PHONE }]
 * onChange: (newOwnersArray) => void
 */

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
    <div className="space-y-3">
      {owners.map((owner, idx) => (
        <div key={owner.ID ?? `new-${idx}`} className="border rounded-lg p-3 relative bg-gray-50/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <User size={12} /> Owner {idx + 1}
            </p>
            {owners.length > 1 && (
              <button
                type="button"
                onClick={() => removeOwner(idx)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Owner name *"
              value={owner.O_NAME}
              onChange={(e) => updateField(idx, "O_NAME", e.target.value)}
              className="sm:col-span-2"
            />
            <Input
              placeholder="Address"
              value={owner.ADDRESS}
              onChange={(e) => updateField(idx, "ADDRESS", e.target.value)}
              className="sm:col-span-2"
            />
            <Input
              placeholder="Suburb"
              value={owner.SUBURB}
              onChange={(e) => updateField(idx, "SUBURB", e.target.value)}
            />
            <Input
              placeholder="Postcode"
              value={owner.POSTCODE}
              onChange={(e) => updateField(idx, "POSTCODE", e.target.value)}
            />
            <Input
              placeholder="State"
              value={owner.STATE}
              onChange={(e) => updateField(idx, "STATE", e.target.value)}
            />
            <Input
              placeholder="Email"
              type="email"
              value={owner.EMAIL}
              onChange={(e) => updateField(idx, "EMAIL", e.target.value)}
            />
            <Input
              placeholder="Phone"
              value={owner.PHONE}
              onChange={(e) => updateField(idx, "PHONE", e.target.value)}
            />
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addOwner} className="w-full">
        <Plus size={14} className="mr-1" /> Add Owner
      </Button>
    </div>
  );
}