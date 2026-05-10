import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSidebarWidth = create(
  persist(
    (set) => ({
      sidebarWidth: 250,
      setSidebarWidth: (val) => set(() => ({ sidebarWidth: val })),
    }),
    {
      name: "sidebar-width",
    },
  ),
);
