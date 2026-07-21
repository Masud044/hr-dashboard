// src/features/setting/pages/statement-upload-three/useInvoiceSheetStore.js
import { create } from "zustand";

export const useInvoiceSheetStore = create((set) => ({
  open: false,
  parentType: null,
  parentId: null,
  row: null,
  openSheet: (parentType, parentId, row) =>
    set({ open: true, parentType, parentId, row }),
  closeSheet: () =>
    set({ open: false, parentType: null, parentId: null, row: null }),
}));