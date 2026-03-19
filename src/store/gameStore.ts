import { create } from 'zustand';

interface GameState {
  started: boolean;
  fastMode: boolean;
  start: () => void;
  reset: () => void;
  setFastMode: (v: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  started: false,
  fastMode: false,
  start: () => set({ started: true }),
  reset: () => set({ started: false }),
  setFastMode: (v) => set({ fastMode: v }),
}));
