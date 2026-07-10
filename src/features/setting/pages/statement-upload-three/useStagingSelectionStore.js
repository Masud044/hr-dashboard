// src/features/setting/pages/statement-upload-three/useStagingSelectionStore.js
import { create } from "zustand";

export const useStagingSelectionStore = create((set) => ({
  selectedStagingId: null,

  // Click a row: selects it. Click the same row again: deselects it.
  setSelectedStagingId: (id) =>
    set((state) => ({
      selectedStagingId: state.selectedStagingId === id ? null : id,
    })),

  clearSelection: () => set({ selectedStagingId: null }),
}));