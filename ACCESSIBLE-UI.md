# ACCESSIBLE-UI (overlay on DESIGN.md)

Purpose: older users with weaker vision must find their place easily and never get lost in a table, grid or card list.

## Scope
Follow DESIGN.md for everything. This file overrides it ONLY on the screens named in the prompt. If no screen is named, ignore this file. Use theme tokens only, no hardcoded colors.

## Principles
- **Clear selection:** when a user clicks a row, grid cell or card, it gets a clearly different highlighted look and stays highlighted until another one is selected. The highlight must be obvious at a glance, including across wide tables.
- **Strong zebra striping** on tables, with a visible hover state.
- **Visible hover and focus** on all interactive elements.
- **Larger text and click targets** than the base design.
- **Status never relies on color alone.** Pair color with an icon or text.
- **Eye-catching, but purposeful color:** use primary and semantic colors more generously for headers, totals and key information.
- **Sufficient contrast** in light and dark mode.
- **Selection color:** use the `selected` and `selected-border` tokens (soft yellow fill, strong border or left accent). Never use the warning color for selection.

## Implementation
- Do NOT edit shared shadcn components in components/ui.
- Apply the styling directly in the screen's own file (for example project-list.jsx), using className on the existing shadcn Table, Card and Badge elements.
- Selection state: use a small zustand store, scoped per table or grid, not persisted. Create it once and reuse it across screens.
- Pick sensible values yourself within the principles above.

## Prompt usage
- New screen: "Follow DESIGN.md plus ACCESSIBLE-UI.md for X."
- Existing screen: "Restyle X using ACCESSIBLE-UI.md. Styling only, no logic changes."