// src/features/ticketing/components/TicketFilters.jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EntityCombobox from "@/components/shared/entity-combobox";
import { Search, X } from "lucide-react";

const TICKET_TYPE_OPTS = [
  { value: "CHANGE_REQUEST", label: "Change Request" },
  { value: "VARIATION", label: "Variation" },
  { value: "SPECIAL_NOTE", label: "Special Note" },
];

/**
 * Controlled draft filters + explicit Search/Clear, matching
 * attendance-list.jsx's draftFilters/filters split.
 *
 * props:
 *  - draftFilters, setDraftFilters
 *  - onSearch, onClear
 *  - statusOpts, priorityOpts (EntityCombobox items)
 */
export default function TicketFilters({
  draftFilters,
  setDraftFilters,
  onSearch,
  onClear,
  statusOpts = [],
  priorityOpts = [],
}) {
  const hasActiveDraftFilter = Object.values(draftFilters).some((v) => v !== "" && v !== false);
  const searchValue = draftFilters.SEARCH || "";

  return (
    <div className="flex flex-wrap items-center gap-3 flex-1">
      {/* Keyword search — icon inside left, clear button inside right */}
      <div className="relative min-w-[200px] flex-1 sm:flex-initial sm:w-[240px]">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={searchValue}
          onChange={(e) => setDraftFilters((f) => ({ ...f, SEARCH: e.target.value }))}
          placeholder="Search by ticket # or subject..."
          className="h-10 pl-9 pr-8"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => setDraftFilters((f) => ({ ...f, SEARCH: "" }))}
            aria-label="Clear search"
            title="Clear search"
            className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <EntityCombobox
        items={statusOpts}
        value={draftFilters.STATUS_ID}
        onValueChange={(v) => setDraftFilters((f) => ({ ...f, STATUS_ID: v }))}
        placeholder="All Statuses"
        size="lg"
        className="w-[160px]"
      />

      <EntityCombobox
        items={TICKET_TYPE_OPTS}
        value={draftFilters.TICKET_TYPE}
        onValueChange={(v) => setDraftFilters((f) => ({ ...f, TICKET_TYPE: v }))}
        placeholder="All Types"
        size="lg"
        className="w-[160px]"
      />

      <EntityCombobox
        items={priorityOpts}
        value={draftFilters.PRIORITY_ID}
        onValueChange={(v) => setDraftFilters((f) => ({ ...f, PRIORITY_ID: v }))}
        placeholder="All Priorities"
        size="lg"
        className="w-[160px]"
      />

       {hasActiveDraftFilter && (
        <Button
          variant="outline"
          onClick={onClear}
         
        >
          Clear
        </Button>
      )}

      <Button
        onClick={onSearch}
        disabled={!hasActiveDraftFilter}
        
      >
        Search
      </Button>

     
    </div>
  );
}
