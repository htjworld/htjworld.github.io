import { create } from 'zustand';

interface GameState {
  started: boolean;
  start: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  started: false,
  start: () => set({ started: true }),
  reset: () => set({ started: false }),
}));
