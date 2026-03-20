import { create } from 'zustand';
import { db } from '../config/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export interface GuestEntry {
  color: string;
  name: string;
  message: string;
  createdAt: number;
}

interface GuestbookState {
  entries: (GuestEntry | null)[];
  subscribe: () => () => void;
  addEntry: (slot: number, entry: GuestEntry) => Promise<void>;
  removeEntry: (slot: number) => Promise<void>;
}

export const useGuestbookStore = create<GuestbookState>(() => ({
  entries: Array(20).fill(null) as (GuestEntry | null)[],

  subscribe: () => {
    const unsubscribe = onSnapshot(collection(db, 'guestbook'), (snapshot) => {
      const entries: (GuestEntry | null)[] = Array(20).fill(null);
      snapshot.forEach((d) => {
        const idx = parseInt(d.id.replace('slot_', ''), 10);
        if (idx >= 0 && idx < 20) entries[idx] = d.data() as GuestEntry;
      });
      useGuestbookStore.setState({ entries });
    });
    return unsubscribe;
  },

  addEntry: async (slot, entry) => {
    await setDoc(doc(db, 'guestbook', `slot_${slot}`), entry);
  },

  removeEntry: async (slot) => {
    await deleteDoc(doc(db, 'guestbook', `slot_${slot}`));
  },
}));
