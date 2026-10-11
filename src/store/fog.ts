import { create } from 'zustand';
import { db } from '../db';
import type { LatLng, Source, RevealedCell } from '../types';

export interface ReplayState {
  active: boolean;
  progress: number; // 0 to 1
}

export interface FogState {
  position: LatLng | null;
  revealed: Map<string, number>;
  source: Source;
  isTracking: boolean;
  distanceMeters: number;
  replay: ReplayState;

  setPosition: (pos: LatLng) => void;
  addRevealedCells: (cells: { h3: string; ts: number }[]) => void;
  setSource: (source: Source) => void;
  setIsTracking: (isTracking: boolean) => void;
  addDistance: (m: number) => void;
  startReplay: () => void;
  stopReplay: () => void;
  setReplayProgress: (p: number) => void;
  hydrateRevealed: () => Promise<void>;
  resetFog: () => Promise<void>;
}

const getStoredDistance = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem('seekit_distance_meters');
    return val ? parseFloat(val) || 0 : 0;
  } catch {
    return 0;
  }
};

export const useFog = create<FogState>((set) => ({
  position: null,
  revealed: new Map<string, number>(),
  source: 'gps',
  isTracking: false,
  distanceMeters: getStoredDistance(),
  replay: { active: false, progress: 1 },

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

  addDistance: (m: number) =>
    set((s) => {
      const nextDist = s.distanceMeters + m;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('seekit_distance_meters', String(nextDist));
        }
      } catch {}
      return { distanceMeters: nextDist };
    }),

  startReplay: () => set({ replay: { active: true, progress: 0 } }),

  stopReplay: () => set({ replay: { active: false, progress: 1 } }),

  setReplayProgress: (progress: number) =>
    set({ replay: { active: true, progress: Math.max(0, Math.min(1, progress)) } }),

  hydrateRevealed: async () => {
    try {
      const records: RevealedCell[] = await db.cells.toArray();
      const map = new Map<string, number>();
      for (const r of records) {
        map.set(r.h3, r.ts);
      }

      let storedDist = getStoredDistance();
      // If distance wasn't stored but cells were previously uncovered,
      // recover estimated distance (~65m per cell) so user progress isn't 0
      if (storedDist === 0 && map.size > 0) {
        storedDist = map.size * 65;
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('seekit_distance_meters', String(storedDist));
          }
        } catch {}
      }

      set({ revealed: map, distanceMeters: storedDist });
    } catch (err) {
      console.error('Failed to hydrate revealed cells from Dexie:', err);
    }
  },

  resetFog: async () => {
    try {
      await db.cells.clear();
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('seekit_distance_meters');
        }
      } catch {}
      set({
        revealed: new Map<string, number>(),
        distanceMeters: 0,
        replay: { active: false, progress: 1 },
      });
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

/**
 * Returns whether an H3 cell has been uncovered (respecting active replay cutoff).
 */
export function isRevealed(h3: string): boolean {
  const { revealed, replay } = useFog.getState();
  if (!revealed.has(h3)) return false;
  if (!replay.active) return true;

  const cutoff = replayCutoffTs();
  if (cutoff === null) return true;
  const cellTs = revealed.get(h3) ?? 0;
  return cellTs <= cutoff;
}

/**
 * Returns the timestamp of the last visible cell during replay,
 * or null if replay is inactive.
 */
export function replayCutoffTs(): number | null {
  const { revealed, replay } = useFog.getState();
  if (!replay.active) return null;
  if (revealed.size === 0) return 0;

  const sorted = Array.from(revealed.entries()).sort((a, b) => a[1] - b[1]);
  const count = Math.floor(replay.progress * sorted.length);
  if (count <= 0) return 0;
  return sorted[Math.min(count - 1, sorted.length - 1)][1];
}

/**
 * Returns the active map of uncovered cells, filtering to the replay subset if replay is active.
 */
export function getVisibleRevealed(state: FogState): Map<string, number> {
  if (!state.replay.active) {
    return state.revealed;
  }
  const cutoff = replayCutoffTs();
  if (cutoff === null) return state.revealed;
  if (cutoff === 0) return new Map();

  const subset = new Map<string, number>();
  for (const [h3, ts] of state.revealed.entries()) {
    if (ts <= cutoff) {
      subset.set(h3, ts);
    }
  }
  return subset;
}

export default useFog;
