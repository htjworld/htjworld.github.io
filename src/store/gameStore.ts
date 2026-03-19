import { create } from 'zustand';

export type Theme = 'creative' | 'ice' | 'maze' | 'hallway';

interface GameState {
  started: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  start: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  started: false,
  theme: 'creative',
  setTheme: (theme) => set({ theme }),
  start: () => set({ started: true }),
  reset: () => set({ started: false }),
}));
