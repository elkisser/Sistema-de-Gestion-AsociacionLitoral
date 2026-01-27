import { create } from 'zustand';

interface UIState {
  isQuickOrderOpen: boolean;
  openQuickOrder: () => void;
  closeQuickOrder: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isQuickOrderOpen: false,
  openQuickOrder: () => set({ isQuickOrderOpen: true }),
  closeQuickOrder: () => set({ isQuickOrderOpen: false }),
}));
