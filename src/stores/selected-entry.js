import { create } from "zustand";

export const useSelectedEntry = create((set) => ({
  selectedEntry: null,
  setSelectedEntry: (val) => set(() => ({ selectedEntry: val })),
}));
