// src/features/setting/pages/statement-upload-four/FilterBar.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FileText,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DateInput from "@/components/shared/DateInput";
import EntityCombobox from "@/components/shared/entity-combobox";
import { EMPTY_FILTERS } from "./constants";
import { toSortedOpts } from "@/lib/utils";

// Filters that live inside the collapsible "More Filters" panel.
const SECONDARY_KEYS = [
  "dateFrom",
  "dateTo",
  "status",
  "category",
  "amount",
  "amountMin",
  "amountMax",
  "invoiceNo",
  "remarks",
  "sourceType",
];

const labelCls = "text-[10px] text-muted-foreground block mb-1";

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
  const [showMore, setShowMore] = useState(() =>
    SECONDARY_KEYS.some((k) => Boolean(initialFilters?.[k])),
  );
  const descriptionRef = useRef(null);

  // keep local draft in sync when parent resets filters externally (e.g. Clear)
  useEffect(() => {
    setDraft(initialFilters);
  }, [initialFilters]);

  const update = (key, value) => setDraft((p) => ({ ...p, [key]: value }));

  const hasActive = useMemo(() => Object.values(draft).some((v) => v), [draft]);
  const secondaryCount = useMemo(
    () => SECONDARY_KEYS.filter((k) => draft[k]).length,
    [draft],
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
    setShowMore(false);
    onClear();
  };
  const enterToSearch = (e) => e.key === "Enter" && handleSearch();

  return (
    <div className="bg-card border border-border rounded-md px-4 py-3.5 mb-4">
      {/* ── Tier 1: primary bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Prominent description search */}
        <div className="relative flex-1 min-w-[220px]">
          <FileText
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={descriptionRef}
            placeholder="Search description..."
            value={draft.description}
            onChange={(e) => update("description", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-8 text-xs pl-8 pr-8 bg-background/60 focus-visible:border-primary focus-visible:ring-primary/30"
          />
          {draft.description && (
            <button
              type="button"
              aria-label="Clear description"
              onClick={() => {
                update("description", "");
                descriptionRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <EntityCombobox
          items={projectOpts}
          value={draft.pId}
          onValueChange={(v) => update("pId", v)}
          placeholder="All projects"
          className="w-full sm:w-40"
        />

        <EntityCombobox
          items={contractorOpts}
          value={draft.contractorId}
          onValueChange={(v) => update("contractorId", v)}
          placeholder="All contractors"
          className="w-full sm:w-44"
        />

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          className={`h-8 gap-1.5 rounded-md text-xs ${
            showMore ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Filter size={13} />
          More Filters
          {secondaryCount > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary">
              +{secondaryCount}
            </span>
          )}
          {showMore ? (
            <ChevronUp size={13} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={13} className="text-muted-foreground" />
          )}
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSearch}
            className="h-8 rounded-md bg-primary text-xs text-primary-foreground hover:bg-[#4F46E5] btn-lift"
          >
            <Search size={12} className="mr-1" /> Search
          </Button>
          {hasActive && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              className="h-8 rounded-md px-2.5 text-xs"
            >
              Reset <X size={12} />
            </Button>
          )}
        </div>
      </div>

      {/* ── Tier 2: collapsible secondary filters ── */}
      {showMore && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-3 border-t border-border mt-3">
          <div onKeyDown={enterToSearch}>
            <label className={labelCls}>Date From</label>
            <DateInput
              value={draft.dateFrom}
              onChange={(v) => update("dateFrom", v)}
            />
          </div>

          <div onKeyDown={enterToSearch}>
            <label className={labelCls}>Date To</label>
            <DateInput
              value={draft.dateTo}
              onChange={(v) => update("dateTo", v)}
            />
          </div>

          {showStatus && (
            <div>
              <label className={labelCls}>Status</label>
              <Select
                value={draft.status || "ALL"}
                onValueChange={(v) => update("status", v === "ALL" ? "" : v)}
              >
                <SelectTrigger className="h-8 w-full text-xs">
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

          {showCategory && (
            <div>
              <label className={labelCls}>Category</label>
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
            <label className={labelCls}>Source</label>
            <Select
              value={draft.sourceType || "ALL"}
              onValueChange={(v) => update("sourceType", v === "ALL" ? "" : v)}
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="BANKING">Banking</SelectItem>
                <SelectItem value="NON_BANKING">Non-banking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className={labelCls}>Amount</label>
            <Input
              type="number"
              step="1"
              placeholder="e.g. 300"
              value={draft.amount}
              onChange={(e) => update("amount", e.target.value)}
              onKeyDown={enterToSearch}
              className="h-8 text-xs"
            />
          </div>

          <div>
            <label className={labelCls}>Amount Min</label>
            <Input
              type="number"
              step="1"
              placeholder="Min"
              value={draft.amountMin}
              onChange={(e) => update("amountMin", e.target.value)}
              onKeyDown={enterToSearch}
              className="h-8 text-xs"
            />
          </div>

          <div>
            <label className={labelCls}>Amount Max</label>
            <Input
              type="number"
              step="1"
              placeholder="Max"
              value={draft.amountMax}
              onChange={(e) => update("amountMax", e.target.value)}
              onKeyDown={enterToSearch}
              className="h-8 text-xs"
            />
          </div>

          <div>
            <label className={labelCls}>Invoice No</label>
            <Input
              placeholder="Search invoice no"
              value={draft.invoiceNo}
              onChange={(e) => update("invoiceNo", e.target.value)}
              onKeyDown={enterToSearch}
              className="h-8 text-xs"
            />
          </div>

          <div>
            <label className={labelCls}>Remarks</label>
            <Input
              placeholder="Search remarks"
              value={draft.remarks}
              onChange={(e) => update("remarks", e.target.value)}
              onKeyDown={enterToSearch}
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default FilterBar;
