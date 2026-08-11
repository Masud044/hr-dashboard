// src/features/setting/pages/statement-upload-three/useStagingSelectionStore.js
import { create } from "zustand";
export const useStagingSelectionStore = create((set) => ({
  selectedStagingId: null,

  setSelectedStagingId: (id) =>
    set((state) => ({
      selectedStagingId: state.selectedStagingId === id ? null : id,
    })),

  forceSelect: (id) => set({ selectedStagingId: id }),

  clearSelection: () => set({ selectedStagingId: null }),
}));