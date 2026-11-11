// src/features/selection/useSelectionHighlightStore.js
import { create } from "zustand";

// Non-persisted highlight state, one key per scope:
// selected = { "selection-forms": 12, "selection-items": 8, ... }
export const useSelectionHighlightStore = create((set) => ({
  selected: {},

  select: (scope, id) =>
    set((state) => ({
      selected: { ...state.selected, [scope]: id },
    })),

  clear: (scope) =>
    set((state) => {
      const next = { ...state.selected };
      delete next[scope];
      return { selected: next };
    }),
}));
