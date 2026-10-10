import { create } from 'zustand';
import { latLngToCell, gridDisk } from 'h3-js';
import { db } from '../db';
import { H3_RES, SEAL_OPEN_K } from '../config';
import type { Capsule, LatLng } from '../types';

export interface CapsulesState {
  capsules: Capsule[];
  composerOpen: boolean;
  selectedId: string | null;

  setComposerOpen: (open: boolean) => void;
  setSelectedId: (id: string | null) => void;
  addCapsule: (capsule: Capsule) => Promise<void>;
  hydrateCapsules: () => Promise<void>;
}

/**
 * Checks whether a sealed capsule can be opened given the user's current position.
 * Returns true if unsealed, or if user's cell is within SEAL_OPEN_K rings of the capsule's cell.
 */
export function canOpen(capsule: Capsule, userPos: LatLng | null): boolean {
  if (!capsule.sealed) {
    return true;
  }
  if (!userPos) {
    return false;
  }

  try {
    const userCell = latLngToCell(userPos.lat, userPos.lng, H3_RES);
    const nearbyCells = gridDisk(userCell, SEAL_OPEN_K);
    return nearbyCells.includes(capsule.h3);
  } catch (err) {
    console.warn('Failed to calculate capsule proximity unlock:', err);
    return false;
  }
}

export const useCapsules = create<CapsulesState>((set) => ({
  capsules: [],
  composerOpen: false,
  selectedId: null,

  setComposerOpen: (open: boolean) => set({ composerOpen: open }),

  setSelectedId: (id: string | null) => set({ selectedId: id }),

  addCapsule: async (capsule: Capsule) => {
    try {
      await db.capsules.put(capsule);
      set((state) => ({
        capsules: [capsule, ...state.capsules.filter((c) => c.id !== capsule.id)],
      }));
    } catch (err) {
      console.error('Failed to persist capsule to Dexie:', err);
    }
  },

  hydrateCapsules: async () => {
    try {
      const records = await db.capsules.orderBy('createdAt').reverse().toArray();
      set({ capsules: records });
    } catch (err) {
      console.error('Failed to hydrate capsules from Dexie:', err);
    }
  },
}));

// Hydrate capsules from Dexie on startup
if (typeof window !== 'undefined') {
  useCapsules.getState().hydrateCapsules().catch((err) => {
    console.error('Failed to hydrate capsules on boot:', err);
  });
}

export default useCapsules;
