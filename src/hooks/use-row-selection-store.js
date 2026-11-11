// src/hooks/use-row-selection-store.js
import { create } from "zustand";

// Non-persisted row highlight state, one selected id per scope:
// selected = { "project-report": 12, "another-table": 8, ... }
export const useRowSelectionStore = create((set) => ({
  selected: {},

  toggle: (scope, id) =>
    set((state) => ({
      selected: {
        ...state.selected,
        [scope]: state.selected[scope] === id ? null : id,
      },
    })),

  clear: (scope) =>
    set((state) => ({
      selected: { ...state.selected, [scope]: null },
    })),
}));
