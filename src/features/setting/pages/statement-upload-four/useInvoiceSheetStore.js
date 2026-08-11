// src/features/setting/pages/statement-upload-three/useInvoiceSheetStore.js
import { create } from "zustand";

export const useInvoiceSheetStore = create((set) => ({
  open: false,
  parentType: null,
  parentId: null,
  row: null,
  readOnly: false,
  openSheet: (parentType, parentId, row, readOnly = false) =>
    set({ open: true, parentType, parentId, row, readOnly }),
  closeSheet: () =>
    set({ open: false, parentType: null, parentId: null, row: null, readOnly: false }),
}));