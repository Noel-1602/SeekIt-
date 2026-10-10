import { latLngToCell, gridDisk } from 'h3-js';
import { H3_RES, REVEAL_K, MAX_ACCURACY_M, MAX_SPEED_KMH } from '../config';
import { db } from '../db';
import { useFog } from '../store/fog';
import type { Fix, Source, LatLng, RevealedCell } from '../types';

/**
 * Computes great circle distance between two LatLng points using Haversine formula (km).
 */
export function haversineDistanceKm(p1: LatLng, p2: LatLng): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

let lastAcceptedGpsFix: Fix | null = null;

export function getLastAcceptedGpsFix(): Fix | null {
  return lastAcceptedGpsFix;
}

export function resetLastAcceptedGpsFix(): void {
  lastAcceptedGpsFix = null;
}

/**
 * Ingests a new position fix from either GPS or the movement simulator.
 * - Filters low-accuracy and high-speed GPS readings.
 * - Computes the H3 cell and reveal disk.
 * - Discovers and persists new revealed cells in Dexie and Zustand store.
 * - Updates the current user position.
 *
 * @returns boolean indicating whether the fix was accepted.
 */
export async function ingestPosition(fix: Fix, source: Source): Promise<boolean> {
  if (source === 'gps') {
    // 1. Accuracy check: reject if accuracy exceeds MAX_ACCURACY_M (50m)
    if (fix.accuracy !== undefined && fix.accuracy > MAX_ACCURACY_M) {
      return false;
    }

    // 2. Speed check: reject if calculated speed from last accepted GPS fix exceeds MAX_SPEED_KMH (150 km/h)
    if (lastAcceptedGpsFix !== null) {
      const timeDeltaMs = fix.ts - lastAcceptedGpsFix.ts;
      if (timeDeltaMs < 0) {
        // Fix has an older timestamp than previously accepted fix
        return false;
      }

      const distKm = haversineDistanceKm(lastAcceptedGpsFix, fix);
      if (timeDeltaMs === 0) {
        if (distKm > 0) {
          // Infinite speed jump
          return false;
        }
      } else {
        const timeDeltaHours = timeDeltaMs / 3_600_000;
        const speedKmh = distKm / timeDeltaHours;
        if (speedKmh > MAX_SPEED_KMH) {
          return false;
        }
      }
    }

    lastAcceptedGpsFix = fix;
  }

  // Sync active source if it differs
  const store = useFog.getState();
  if (store.source !== source) {
    store.setSource(source);
  }

  // Calculate current H3 cell and reveal disk
  const cell = latLngToCell(fix.lat, fix.lng, H3_RES);
  const disk = gridDisk(cell, REVEAL_K);

  // Identify newly revealed cells not already present in the store
  const { revealed, addRevealedCells, setPosition } = useFog.getState();
  const newlyRevealed: RevealedCell[] = [];

  for (const h3 of disk) {
    if (!revealed.has(h3)) {
      newlyRevealed.push({ h3, ts: fix.ts });
    }
  }

  // Bulk write new cells to Dexie and update store
  if (newlyRevealed.length > 0) {
    await db.cells.bulkPut(newlyRevealed);
    addRevealedCells(newlyRevealed);
  }

  // Update current user position
  setPosition({ lat: fix.lat, lng: fix.lng });

  return true;
}
