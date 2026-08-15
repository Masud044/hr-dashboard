// src/features/ticketing/components/TicketFilters.jsx
import { Button } from "@/components/ui/button";
import EntityCombobox from "@/components/shared/entity-combobox";

/**
 * Controlled draft filters + explicit Search/Clear, matching
 * attendance-list.jsx's draftFilters/filters split.
 *
 * props:
 *  - draftFilters, setDraftFilters
 *  - hasActiveDraftFilter, onSearch, onClear
 *  - statusOpts, priorityOpts, categoryOpts, agentOpts (EntityCombobox items)
 *  - showAgentFilter (hide on "My Tickets" view)
 */
export default function TicketFilters({
  draftFilters,
  setDraftFilters,
  onSearch,
  onClear,
  statusOpts = [],
  priorityOpts = [],
  categoryOpts = [],
  agentOpts = [],
  showAgentFilter = true,
}) {
  const hasActiveDraftFilter = Object.values(draftFilters).some((v) => v !== "" && v !== false);

  return (
    <div className="flex flex-wrap items-center gap-3 flex-1">
      <EntityCombobox
        items={statusOpts}
        value={draftFilters.STATUS_ID}
        onValueChange={(v) => setDraftFilters((f) => ({ ...f, STATUS_ID: v }))}
        placeholder="All Statuses"
        size="md"
        className="w-[160px]"
      />

      <EntityCombobox
        items={priorityOpts}
        value={draftFilters.PRIORITY_ID}
        onValueChange={(v) => setDraftFilters((f) => ({ ...f, PRIORITY_ID: v }))}
        placeholder="All Priorities"
        size="md"
        className="w-[160px]"
      />

      <EntityCombobox
        items={categoryOpts}
        value={draftFilters.CATEGORY_ID}
        onValueChange={(v) => setDraftFilters((f) => ({ ...f, CATEGORY_ID: v }))}
        placeholder="All Categories"
        size="md"
        className="w-[180px]"
      />

      {showAgentFilter && (
        <EntityCombobox
          items={agentOpts}
          value={draftFilters.AGENT_ID}
          onValueChange={(v) => setDraftFilters((f) => ({ ...f, AGENT_ID: v }))}
          placeholder="All Agents"
          size="md"
          className="w-[180px]"
          showAvatar
          avatarInTrigger
        />
      )}

      <Button
        onClick={onSearch}
        disabled={!hasActiveDraftFilter}
        className="h-10 rounded-full bg-primary text-primary-foreground shadow-teal-glow hover:bg-primary/90 disabled:shadow-none font-semibold transition-transform active:scale-95"
      >
        Search
      </Button>

      {hasActiveDraftFilter && (
        <Button
          variant="outline"
          onClick={onClear}
          className="h-10 rounded-full border-primary text-primary hover:bg-secondary font-semibold transition-transform active:scale-95"
        >
          Clear
        </Button>
      )}
    </div>
  );
}