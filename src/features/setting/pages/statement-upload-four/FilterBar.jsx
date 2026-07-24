// src\features\setting\pages\statement-upload-four\FilterBar.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DateInput from "./DateInput";
import Combobox from "./Combobox";
import EntityCombobox from "@/components/shared/entity-combobox";
import { EMPTY_FILTERS } from "./constants";
import { toSortedOpts } from "@/lib/utils";

const FilterBar = React.memo(function FilterBar({
  initialFilters,
  onApply,
  onClear,
  projectOptions,
  contractorOptions,
  showStatus,
  showCategory,
}) {
  const [draft, setDraft] = useState(initialFilters);

  // keep local draft in sync when parent resets filters externally (e.g. Clear)
  useEffect(() => {
    setDraft(initialFilters);
  }, [initialFilters]);

  const update = (key, value) => setDraft((p) => ({ ...p, [key]: value }));

  const hasActive = useMemo(() => Object.values(draft).some((v) => v), [draft]);
  const hasPendingChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialFilters),
    [draft, initialFilters],
  );

  const projectOpts = useMemo(
    () =>
      projectOptions.map((p) => ({ value: String(p.P_ID), label: p.P_NAME })),
    [projectOptions],
  );
  const contractorOpts = useMemo(
    () => toSortedOpts(contractorOptions, "CONTRATOR_ID", "CONTRATOR_NAME"),
    [contractorOptions],
  );

  const handleSearch = () => onApply(draft);
  const handleClear = () => {
    setDraft(EMPTY_FILTERS);
    onClear();
  };

  return (
    <div className="bg-white border rounded-2xl shadow-sm px-5 py-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter size={14} className="text-gray-400" />
        <span className="text-xs font-semibold text-gray-600 uppercase">
          Filters
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">
            Date From
          </label>
          <DateInput
            value={draft.dateFrom}
            onChange={(v) => update("dateFrom", v)}
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">
            Date To
          </label>
          <DateInput
            value={draft.dateTo}
            onChange={(v) => update("dateTo", v)}
          />
        </div>
        {showStatus && (
          <div>
            <label className="text-[10px] text-gray-400 block mb-0.5">
              Status
            </label>
            <Select
              value={draft.status || "ALL"}
              onValueChange={(v) => update("status", v === "ALL" ? "" : v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">
            Project
          </label>
          
          <EntityCombobox
            items={projectOpts}
            value={draft.pId}
            onValueChange={(v) => update("pId", v)}
            placeholder="All projects"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">
            Contractor
          </label>
          {/* <Combobox
            options={contractorOpts}
            value={draft.contractorId}
            onChange={(v) => update("contractorId", v)}
            placeholder="All contractors"
            searchPlaceholder="Search contractors..."
          /> */}

          <EntityCombobox
            items={contractorOpts}
            value={draft.contractorId}
            onValueChange={(v) => update("contractorId", v)}
            placeholder="All contractors"
            showAvatar
            avatarInTrigger
            getImageUrl={(item) =>
              `${import.meta.env.VITE_API_BASE_URL}/api/emp-images/contractor/${item.value}`
            }
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">
            Invoice No
          </label>
          <Input
            placeholder="Invoice no."
            value={draft.invoiceNo}
            onChange={(e) => update("invoiceNo", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">
            Amount Min
          </label>
          <Input
            type="number"
            step="1"
            placeholder="Min"
            value={draft.amountMin}
            onChange={(e) => update("amountMin", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">
            Amount Max
          </label>
          <Input
            type="number"
            step="1"
            placeholder="Max"
            value={draft.amountMax}
            onChange={(e) => update("amountMax", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">
            Description
          </label>
          <Input
            placeholder="Search description"
            value={draft.description}
            onChange={(e) => update("description", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        {showCategory && (
          <div>
            <label className="text-[10px] text-gray-400 block mb-0.5">
              Category
            </label>
            <Select
              value={draft.category || "ALL"}
              onValueChange={(v) => update("category", v === "ALL" ? "" : v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All categories</SelectItem>
                <SelectItem value="address">Address</SelectItem>
                <SelectItem value="place">Place</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5 invisible">
            Actions
          </label>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSearch}
              disabled={!hasPendingChanges}
              className="h-8 flex-1 rounded-md bg-blue-600 hover:bg-blue-700 text-xs disabled:opacity-40"
            >
              <Search size={12} className="mr-1" /> Search
            </Button>
            {hasActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                className="h-8 px-2.5 rounded-md text-xs"
              >
                Reset <X size={12} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default FilterBar;
