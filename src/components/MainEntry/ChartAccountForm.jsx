import React, { useState } from "react";

const ChartAccountForm = () => {
  const [enabled, setEnabled] = useState(true);
  const [lastLevel, setLastLevel] = useState(false);

  return (
    <div className="max-w-4xl mx-auto shadow-xl rounded overflow-hidden">
      {/* Header */}
      <div className="bg-white text-black text-xl text-center font-semibold  px-4 py-2  ">
        Chart of Account Information
      </div>

      {/* Form */}
      <form className="w-full">
        {/* Row 1: Account Name */}
        <div className="grid grid-cols-3 items-center px-4 py-3 bg-blue-100">
          <label className="font-medium block text-sm  text-foreground">Account Name</label>
          <input
            type="text"
            className="col-span-2  rounded px-3 py-1 w-full bg-white focus-visible:outline-blue-500"
            placeholder="Enter account name"
          />
        </div>

        {/* Row 2: First Level */}
        <div className="grid grid-cols-3 items-center px-4 py-3 bg-green-100">
          <label className="font-medium block text-sm  text-foreground">First Level</label>
          <select className="col-span-2 bg-white rounded px-3 py-1 w-full text-sm">
            <option>Asset (1000000000)</option>
            <option>Liability (2000000000)</option>
            <option>Equity (3000000000)</option>
          </select>
        </div>

        {/* Row 3: Second Level */}
        <div className="grid grid-cols-3 items-center px-4 py-3 bg-orange-100">
          <label className="font-medium block text-sm  text-foreground">Second Level</label>
          <select className="col-span-2 bg-white rounded px-3 py-1 w-full text-sm">
            <option>NON CURRENT</option>
            <option>CURRENT</option>
          </select>
        </div>

        {/* Row 4: Third Level */}
        <div className="grid grid-cols-3 items-center px-4 py-3 bg-lime-50">
          <label className="font-medium block text-sm  text-foreground">Third Level</label>
          <select className="col-span-2 bg-white rounded px-3 py-1 w-full text-sm">
            <option>Choose one</option>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>

        {/* Row 5: Enabled */}
        <div className="grid grid-cols-3 items-center px-4 py-3 bg-purple-100">
          <label className="font-medium block text-sm  text-foreground">Enabled</label>
          <div className="col-span-2 flex gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={enabled}
                onChange={() => setEnabled(true)}
              />
              Yes
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={!enabled}
                onChange={() => setEnabled(false)}
              />
              No
            </label>
          </div>
        </div>

        {/* Row 6: Last Level */}
        <div className="grid grid-cols-3 items-center px-4 py-3 bg-gray-100">
          <label className="font-medium block text-sm  text-foreground ">Last Level</label>
          <div className="col-span-2 flex gap-4">
            <label className="flex items-center gap-1 ">
              <input
                type="radio"
                checked={lastLevel}
                onChange={() => setLastLevel(true)}
              />
              Yes
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={!lastLevel}
                onChange={() => setLastLevel(false)}
              />
              No
            </label>
          </div>
        </div>

        {/* Row 7: Save Button */}
        <div className="px-4 py-3 bg-gray-50 text-center">
          <button
            type="submit"
            className="bg-[#d28764] hover:bg-[#d28764] px-6 py-2 rounded text-white"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChartAccountForm;
