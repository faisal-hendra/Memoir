import { create } from "zustand";

export const useEntries = create((set) => ({
  entries: null,
  setEntries: (val) => set(() => ({ entries: val })),
}));
