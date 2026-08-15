// src/features/ticketing/useTicketSheetStore.js
import { create } from "zustand";

export const useTicketSheetStore = create((set) => ({
  open: false,
  ticketId: null,
  readOnly: false,
  openSheet: (ticketId, readOnly = false) =>
    set({ open: true, ticketId, readOnly }),
  closeSheet: () => set({ open: false, ticketId: null, readOnly: false }),
}));