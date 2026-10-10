import { create } from 'zustand';
import { db } from '../db';
import type { LatLng, Source, RevealedCell } from '../types';

export interface FogState {
  position: LatLng | null;
  revealed: Map<string, number>;
  source: Source;
  isTracking: boolean;

  setPosition: (pos: LatLng) => void;
  addRevealedCells: (cells: { h3: string; ts: number }[]) => void;
  setSource: (source: Source) => void;
  setIsTracking: (isTracking: boolean) => void;
  hydrateRevealed: () => Promise<void>;
  resetFog: () => Promise<void>;
}

export const useFog = create<FogState>((set) => ({
  position: null,
  revealed: new Map<string, number>(),
  source: 'gps',
  isTracking: false,

  setPosition: (pos: LatLng) => set({ position: pos }),

  addRevealedCells: (cells: { h3: string; ts: number }[]) => {
    if (cells.length === 0) return;
    set((state) => {
      const next = new Map(state.revealed);
      for (const cell of cells) {
        next.set(cell.h3, cell.ts);
      }
      return { revealed: next };
    });
  },

  setSource: (source: Source) => set({ source }),

  setIsTracking: (isTracking: boolean) => set({ isTracking }),

  hydrateRevealed: async () => {
    try {
      const records: RevealedCell[] = await db.cells.toArray();
      const map = new Map<string, number>();
      for (const r of records) {
        map.set(r.h3, r.ts);
      }
      set({ revealed: map });
    } catch (err) {
      console.error('Failed to hydrate revealed cells from Dexie:', err);
    }
  },

  resetFog: async () => {
    try {
      await db.cells.clear();
      set({ revealed: new Map<string, number>() });
    } catch (err) {
      console.error('Failed to reset fog:', err);
    }
  },
}));

// Hydrate revealed cells from Dexie on boot
if (typeof window !== 'undefined') {
  useFog.getState().hydrateRevealed().catch((err) => {
    console.error('Failed to hydrate revealed cells on boot:', err);
  });
}

export default useFog;
