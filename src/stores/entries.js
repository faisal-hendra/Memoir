import { create } from "zustand";

export const useEntries = create((set) => ({
  entries: null,
  setEntries: (val) => set((state) => ({ entries: typeof val === 'function' ? val(state.entries) : val })),
}));
