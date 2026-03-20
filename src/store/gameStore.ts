import { create } from 'zustand';

interface GameState {
  started: boolean;
  fastMode: boolean;
  openGuestbookSlot: number | null;
  start: () => void;
  reset: () => void;
  setFastMode: (v: boolean) => void;
  setOpenGuestbookSlot: (slot: number | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  started: false,
  fastMode: false,
  openGuestbookSlot: null,
  start: () => set({ started: true }),
  reset: () => set({ started: false }),
  setFastMode: (v) => set({ fastMode: v }),
  setOpenGuestbookSlot: (slot) => set({ openGuestbookSlot: slot }),
}));
