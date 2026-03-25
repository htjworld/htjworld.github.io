import { create } from 'zustand';

interface GameState {
  started: boolean;
  fastMode: boolean;
  openGuestbookSlot: number | null;
  hoveredPostTitle: string | null;
  start: () => void;
  reset: () => void;
  setFastMode: (v: boolean) => void;
  setOpenGuestbookSlot: (slot: number | null) => void;
  setHoveredPostTitle: (title: string | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  started: false,
  fastMode: false,
  openGuestbookSlot: null,
  hoveredPostTitle: null,
  start: () => set({ started: true }),
  reset: () => set({ started: false }),
  setFastMode: (v) => set({ fastMode: v }),
  setOpenGuestbookSlot: (slot) => set({ openGuestbookSlot: slot }),
  setHoveredPostTitle: (title) => set({ hoveredPostTitle: title }),
}));
