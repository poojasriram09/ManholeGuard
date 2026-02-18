import { create } from 'zustand';

interface DashboardState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
