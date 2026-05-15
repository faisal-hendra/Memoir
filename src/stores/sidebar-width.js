import { SIDEBAR_DEFAULT_WIDTH } from "@/const/sidebar";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSidebarWidth = create(
  persist(
    (set) => ({
      sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
      setSidebarWidth: (val) => set(() => ({ sidebarWidth: val })),
      resetSidebarWidth: () =>
        set(() => ({ sidebarWidth: SIDEBAR_DEFAULT_WIDTH })),
    }),
    {
      name: "sidebar-width",
    },
  ),
);
