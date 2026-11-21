---
name: table-design
description: Use when designing or redesigning any table, data grid, or record list in a dashboard, on desktop or phone. Applies rules based on the table's columns and content.
---

# Table Design

Apply only the rules that match the table's content. Skip number rules if there are no numbers. Use the project's design tokens (spacing, colors, radius); never hardcode values.
If the project's DESIGN.md conflicts with this skill, DESIGN.md wins.

## Ask before building
Do not add sorting, a columns dropdown, or a density dropdown by default. They add complexity, and sorting often depends on the backend. Before building, ask the user once, in one short message, with a default pre-filled for each question. Skip any question the request or the existing code already answers.

1. **Sorting:** which columns are sortable (default: none), is sorting client-side or server-side (default: whatever the table does today), and what is the default sort? Is this a manual-order table (see Manual-order tables)?
2. **Columns dropdown:** does this table need it? (default: yes only if the table has more than 6 columns)
3. **Density dropdown:** does this table need it? (default: no, fixed 48px rows)

When redesigning an existing table:
- Keep exactly the sortable columns it already has. Never add sort to another column.
- Do not add a columns dropdown or density dropdown it doesn't have, unless the user asks.
- Do not remove ones it has, unless the user asks.

## Read the table first
1. Classify every column:
   - Identity (name, title)
   - Value (amount, count, score)
   - State (status, badge)
   - Date/time
   - Meta (ID, notes, created by)
   - Action
2. Rank by use: identity, value, state, date, meta.
3. Decide from the ranking:
   - Wide (more than 6 columns): show all columns, scroll horizontally, pin per Pinning. Never hide columns by breakpoint on desktop.
   - Narrow (4 columns or fewer): no pinning, no scroll.
4. Redesign: never delete columns or data. Hide, don't delete. Change only layout, alignment, density, and behavior.

## Desktop

**Alignment (by data type)**
- Numbers, currency, percentages: right-aligned, tabular figures (`font-variant-numeric: tabular-nums`).
- Text, names, status: left-aligned.
- Dates: left-aligned, one consistent format.
- Icons, checkboxes, short badges: centered.
- Header aligns with its column.

**Number formatting**
- Same decimals within a column.
- Consistent currency symbol.
- Negatives clearly marked (minus sign, optionally red; never color alone).
- Units in the header, not repeated in cells.

**Column widths**
- Number, status, date columns: fixed width.
- Text columns: flexible, with a min-width.
- One flexible column absorbs the slack.

**Rows**
- One 1px hairline between rows. No zebra stripes on any table, including loading skeleton rows. Every row uses the same background (`bg-card`).
- Hover highlights the current row (`bg-accent`). A highlighted row (see Row highlight) always wins over hover.
- One line per row. Never wrap. Put secondary text inline in muted color, or in a tooltip.

**Row height**
- Default: one fixed height, 48px, for header and body rows. No density control.
- If the user asked for a density dropdown: Compact (40px), Default (48px), Comfortable (56px). Saved per table (see Persistence).
- Density never applies to the phone row layout.

**Pinning**
- Pin the identity column on the left and the actions column on the right.
- If a checkbox column exists, pin checkbox and identity together.
- Pinned cells: solid background (hover color on row hover, selected color on a highlighted row), 1px border on the inner edge, no shadow.
- Pin the header on vertical scroll. This needs a bounded height: the table scrolls inside its own container with `max-height: calc(100dvh - <page chrome>)`. Skip pinning when a page has about 15 rows or fewer.
- Never nest scroll containers. If the table library's wrapper scrolls, render a plain table inside a single `overflow-auto` container with a bounded max-height.

**Cells**
- Missing value: dash (`—`). Real zero: `0`. Loading: skeleton. Never mix them.
- Long text: truncate with ellipsis, full text in tooltip on hover.
- Numbers never truncate.

**Column header sort menu (sortable columns only)**
Only for columns the user approved as sortable (see Ask before building). Not used in manual-order tables.
- The header label is a button. Clicking it opens a small dropdown menu: **Ascending**, **Descending**, **Reset sort**, and **Hide column**.
- The active choice shows a check. The arrow icon shows only on the column that is currently sorted.
- **Reset sort** returns to the table's declared default sort (e.g. date descending). If the table declares no default sort, it clears the sort. It is disabled when the table is already on the default.
- **Hide column** calls `column.toggleVisibility(false)`. Show it only if the table has a columns dropdown. Never show it on columns that can't be hidden (checkbox, actions).
- Server-side sorting: the menu writes to the same sort state the table already uses (for example the URL via nuqs), and returns to page 1. Do not invent a second sort state.
- New server-side table with no sort state yet: keep sort in the URL with nuqs as `sortBy` and `sortOrder`, send both to the API, and offer sort only on columns the API supports (ask the user which ones).
- Columns that aren't sortable stay plain text, with no button and no menu.
- `aria-sort` stays on the `<th>`.

**Columns dropdown (only if the table needs it)**
- A "Columns" dropdown in the toolbar with a checkbox per hideable column.
- Checkbox and actions columns are never hideable (`enableHiding: false`).
- Include a **Reset columns** item that restores the default visibility.
- Visibility is saved per table (see Persistence).

**Persistence (localStorage, layout preferences only)**
Saved per table, with a unique `tableKey` (e.g. "projects", "contractors"). Wrap every read and write in try/catch, and fall back to the defaults when storage is unavailable or a value is invalid.
- **Column visibility:** use the `usePersistedColumnVisibility(tableKey, defaultVisibility)` hook (`src/hooks/use-persisted-column-visibility.js`). It stores a visibility map under `dataTableColumnVisibility:<tableKey>` and keeps only boolean values. Pass its state and setter to the table's `columnVisibility` and `onColumnVisibilityChange`. **Reset columns** calls `setVisibility(defaultVisibility)`.
- **Density (only if the table has the dropdown):** saved under `dataTableDensity:<tableKey>` as `compact`, `default`, or `comfortable`. Any other saved value falls back to `default`. Use this hook:

```js
// src/hooks/use-persisted-density.js
import { useCallback, useState } from "react";

const STORAGE_PREFIX = "dataTableDensity";
const VALID = ["compact", "default", "comfortable"];

export function usePersistedDensity(tableKey) {
  const [density, setDensityState] = useState(() => {
    if (typeof window === "undefined") return "default";
    try {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${tableKey}`);
      return VALID.includes(raw) ? raw : "default";
    } catch {
      return "default";
    }
  });

  const setDensity = useCallback(
    (next) => {
      if (!VALID.includes(next)) return;
      setDensityState(next);
      try {
        window.localStorage.setItem(`${STORAGE_PREFIX}:${tableKey}`, next);
      } catch {
        // storage unavailable — keep the in-memory value
      }
    },
    [tableKey],
  );

  return [density, setDensity];
}
```

- **Never saved to localStorage:** row highlight, checkbox selection, sort, page, filters. Sort in particular lives in the table's own state or the URL.

**Row highlight (reading marker)**
Purpose: wide rows make readers lose their place when they scan across columns. Clicking a row marks it like a highlighter pen so the eye can follow it.
- Click a row to highlight it. Click the same row again to clear it.
- One highlighted row at a time. Clicking another row moves the highlight.
- Use the existing tokens only: `bg-selected` for the row and `border-selected-border` for a 3px left edge marker. Never hardcode a yellow.
- Pinned cells (identity, checkbox, actions) use the same `bg-selected` so the pinned and scrolling parts of the row match.
- Highlight wins over hover. Do not apply `bg-accent` to a highlighted row.
- Not by color alone: set `aria-selected="true"` on the row and show the 3px left edge marker.
- State lives in a Zustand store, so it survives re-renders, sorting, and pagination. Store the row's stable ID, never its index.
- Clear the highlight when the data set changes (filter, search, new page of a different query) if the row is no longer present.
- Keyboard: Space on a focused row toggles the highlight. Inputs inside a row stop key propagation so typing a space never toggles it. Enter still reaches the View action.

```ts
// useRowHighlightStore.ts
import { create } from "zustand";

type RowHighlightState = {
  highlightedByTable: Record<string, string | null>;
  toggle: (tableId: string, rowId: string) => void;
  clear: (tableId: string) => void;
};

export const useRowHighlightStore = create<RowHighlightState>((set) => ({
  highlightedByTable: {},
  toggle: (tableId, rowId) =>
    set((s) => ({
      highlightedByTable: {
        ...s.highlightedByTable,
        [tableId]: s.highlightedByTable[tableId] === rowId ? null : rowId,
      },
    })),
  clear: (tableId) =>
    set((s) => ({
      highlightedByTable: { ...s.highlightedByTable, [tableId]: null },
    })),
}));
```

Key the state by table ID so tables on the same page don't clear each other.

**Row click vs actions**
- Row click only highlights the row. Clicking the row never opens the details. The details open only from a **View** button in the actions column, as a page or a sheet (by record size, see Full record). Other actions (Edit, Delete, etc.) sit beside it.
- If the record has no details view, don't invent a View button.
- The actions column is always visible on every row, pinned on the right. No hover or focus reveal, on any device.
- Action buttons stop propagation so they never trigger the row highlight.

**Selection and bulk actions (if applicable)**
- Checkbox column first, header checkbox selects all.
- Checkbox selection is separate from the row highlight. A row can be both checked and highlighted.
- When rows are selected, show a bulk-action bar with the count and actions.
- Clear selection on action complete or via a clear button.

**Table states**
- Loading: skeleton rows matching the real row layout.
- Empty: short message plus a next action (e.g. "Add first item").
- Error: message plus a retry button.

**Large data**
- Pagination by default.
- Virtualize above ~100 rows rendered at once.
- Infinite scroll only for feeds.

## Manual-order tables
Use this type only when the client wants rows ordered by hand (for example the Contractor and Project tables). It replaces column sorting.
- The table is always sorted by `SORT_ORDER` ascending (1, 2, 3, ...).
- No column sorting at all: every header, including Sort Order, is plain text with no sort button or menu.
- The Order column (up/down arrows plus a position input) is the only way to reorder. The sort never changes, so it stays usable. Disable its controls only while a move is pending or when the user lacks edit permission.
- The up arrow on the first row and the down arrow on the last row stay disabled, because there is nowhere to move. First and last mean the whole list, not the current page.
- Pin the Order and actions columns on the right.
- The Sort Order column is display-only. It may be hidden by default.
- Row highlight, always-visible actions, persistence, and the phone layout all apply as written.

## Phone

Do not shrink the table. Restructure into rows.

**Phone row**
- Line 1: identity left, key value right (amount, count, or date, whichever matters most).
- Line 2: state and secondary info.
- No value column: identity left, state right.
- Key value always in the same slot across rows.
- Hide meta (ID, notes) first.
- No header row. Label only ambiguous values ("Due Mar 4"); amounts need no label.
- Long text: wrap to two lines, then truncate. No tooltips on touch.
- Touch targets at least 44px tall.

**Behavior**
- Sorting moves to a select control above the list, offering only the columns approved as sortable. Manual-order tables and tables with no sortable columns show no sort control.
- Tap the row to expand it in place and highlight it (same `bg-selected` and `border-selected-border` as desktop, same Zustand store). Expanded row shows only fields not already on the row (about 2), plus action buttons (40px+, icon and label). One row open at a time, and it is the highlighted row. No kebab menu.
- Tapping the open row again collapses it and clears the highlight.
- Expand and collapse animate height and opacity (150–200ms ease-out, chevron rotates). No animation under reduced motion.
- No horizontal scroll.

**Full record**
- Opened from a View button in the expanded row, not by tapping the row.
- Small to medium (about 10 fields or fewer, no sub-tables): bottom sheet.
- Large (many fields, tabs, sub-tables, or editing): separate page.
- Glance only: never a separate page.

**Breakpoint**
- Container query on the table's container, not a viewport media query.
- Threshold = pinned columns + at least 3 scrolling columns × ~115px (about 800px). Below it, switch to rows.
- Same table in a narrow desktop side panel also switches to rows.

## Accessibility
- Semantic `<table>`, `<th scope>`, and `aria-sort` on the sorted column.
- `aria-selected="true"` on the highlighted row.
- Header sort menu and columns dropdown are keyboard operable: Tab to the button, Enter or Space to open, arrow keys to move, Escape to close.
- Visible focus ring on rows, buttons, and checkboxes.
- Status and highlight never by color alone: color plus text, icon, or edge marker.
- Keyboard: Tab reaches rows and actions, Space toggles the highlight, Enter on the View button opens the details.

## Checklist
- [ ] Asked the user about sorting, columns dropdown, and density dropdown (or the answers were already clear)
- [ ] Columns classified and ranked, none deleted
- [ ] Alignment and number formatting match data type
- [ ] Column widths set (fixed vs flexible)
- [ ] Hairlines, hover, no stripes anywhere (including skeleton rows)
- [ ] Row height fixed at 48px, or density dropdown (40/48/56) only if requested
- [ ] Identity (left) and actions (right) pinned, header pinned with bounded height
- [ ] Actions always visible, not hover-revealed
- [ ] Row click highlights (one row, toggle), using `bg-selected` and `border-selected-border`
- [ ] Highlight stored in Zustand by row ID, wins over hover, pinned cells match
- [ ] Highlight has `aria-selected` and a left edge marker, not color alone
- [ ] Row click never opens details; a View button in the actions column does; action buttons stop propagation
- [ ] Sortable columns only where approved; header menu has Ascending, Descending, Reset sort, Hide column
- [ ] Reset sort returns to the declared default sort; server-side sort uses the existing state (or URL `sortBy`/`sortOrder` for a new table)
- [ ] Manual-order tables: sorted by `SORT_ORDER`, plain headers, Order controls usable, first row's up and last row's down disabled
- [ ] Columns dropdown (if used): persisted with `usePersistedColumnVisibility`, has Reset columns
- [ ] Density dropdown (if used): persisted with `usePersistedDensity`, invalid value falls back to 48px
- [ ] Row highlight, selection, sort, page, and filters are not saved to localStorage
- [ ] Dash vs 0 vs skeleton used correctly
- [ ] Loading, empty, and error states
- [ ] Selection and bulk bar (if applicable)
- [ ] Pagination or virtualization (if large data)
- [ ] Container-query row layout below ~800px (pinned + 3 scrolling columns)
- [ ] Phone: tap expands and highlights, one row open at a time, sort control only for approved columns
- [ ] Full record: sheet or page by size
- [ ] Accessibility: semantics, focus, status not by color alone, 44px targets
- [ ] Project tokens used, nothing hardcoded