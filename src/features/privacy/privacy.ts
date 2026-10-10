import { create } from 'zustand';
import { latLngToCell, gridDisk } from 'h3-js';
import { db } from '../../db';
import { H3_RES, PRIVACY_K } from '../../config';
import type { LatLng, PrivacyZone } from '../../types';

export interface PrivacyState {
  privateCells: Set<string>;
  addPrivateZone: (center: LatLng) => Promise<number>;
  hydratePrivacy: () => Promise<void>;
  clearPrivacy: () => Promise<void>;
}

export const usePrivacy = create<PrivacyState>((set, get) => ({
  privateCells: new Set<string>(),

  addPrivateZone: async (center: LatLng): Promise<number> => {
    try {
      const userCell = latLngToCell(center.lat, center.lng, H3_RES);
      const diskCells = gridDisk(userCell, PRIVACY_K);

      const records: PrivacyZone[] = diskCells.map((h3) => ({
        id: h3,
        h3,
      }));

      await db.privacy.bulkPut(records);

      const current = new Set(get().privateCells);
      let newCount = 0;
      for (const h3 of diskCells) {
        if (!current.has(h3)) {
          current.add(h3);
          newCount++;
        }
      }

      set({ privateCells: current });
      return newCount;
    } catch (err) {
      console.error('Failed to create privacy zone:', err);
      return 0;
    }
  },

  hydratePrivacy: async () => {
    try {
      const records = await db.privacy.toArray();
      const cells = new Set<string>();
      for (const r of records) {
        cells.add(r.h3);
      }
      set({ privateCells: cells });
    } catch (err) {
      console.error('Failed to hydrate privacy zones from Dexie:', err);
    }
  },

  clearPrivacy: async () => {
    try {
      await db.privacy.clear();
      set({ privateCells: new Set<string>() });
    } catch (err) {
      console.error('Failed to clear privacy zones:', err);
    }
  },
}));

/**
 * Checks whether an H3 cell falls inside any designated privacy zone.
 */
export function isPrivate(h3: string): boolean {
  return usePrivacy.getState().privateCells.has(h3);
}

// Hydrate privacy zones from Dexie on boot
if (typeof window !== 'undefined') {
  usePrivacy.getState().hydratePrivacy().catch((err) => {
    console.error('Failed to hydrate privacy zones on boot:', err);
  });
}

export default usePrivacy;
