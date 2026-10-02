import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerState {
  initials: string | null;
  xp: number;
  setInitials: (raw: string) => void;
  addXp: (n: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      initials: null,
      xp: 0,
      setInitials: (raw) => set({ initials: raw.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) }),
      addXp: (n) => set((s) => ({ xp: s.xp + n })),
    }),
    { name: 'thinkcode-player' },
  ),
);
