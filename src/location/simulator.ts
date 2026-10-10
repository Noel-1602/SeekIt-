import { create } from 'zustand';
import { DEFAULT_START } from '../config';
import { ingestPosition, haversineDistanceKm } from './ingest';
import { useFog } from '../store/fog';
import type { LatLng } from '../types';

export type SimSpeedMultiplier = 1 | 5 | 20;

export interface SimulatorState {
  isActive: boolean;
  isWalking: boolean;
  target: LatLng | null;
  speedMultiplier: SimSpeedMultiplier;
  setSpeedMultiplier: (mult: SimSpeedMultiplier) => void;
}

export const useSimulator = create<SimulatorState>((set) => ({
  isActive: false,
  isWalking: false,
  target: null,
  speedMultiplier: 5,
  setSpeedMultiplier: (speedMultiplier) => set({ speedMultiplier }),
}));

// Base walking speed: 5 m/s (~18 km/h brisk walk/jog)
const BASE_WALK_SPEED_MPS = 5;
const TICK_INTERVAL_MS = 50; // 20 updates per second

let walkTimer: number | null = null;
let isKeyboardListenerAttached = false;

/**
 * Calculates latitude/longitude offset in degrees for a given meter distance.
 */
export function metersToDegreeDelta(lat: number, meters: number): { dLat: number; dLng: number } {
  const dLat = meters / 111195;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const dLng = meters / (111195 * Math.max(0.01, Math.abs(cosLat)));
  return { dLat, dLng };
}

/**
 * Moves position by ~30 meters in one of four cardinal directions.
 */
export async function stepSimDirection(direction: 'north' | 'south' | 'east' | 'west'): Promise<void> {
  // Cancel any active click-to-walk animation if the user steers manually
  cancelSimWalk();

  const current = useFog.getState().position ?? DEFAULT_START;
  const { dLat, dLng } = metersToDegreeDelta(current.lat, 30);

  let nextLat = current.lat;
  let nextLng = current.lng;

  switch (direction) {
    case 'north':
      nextLat += dLat;
      break;
    case 'south':
      nextLat -= dLat;
      break;
    case 'east':
      nextLng += dLng;
      break;
    case 'west':
      nextLng -= dLng;
      break;
  }

  await ingestPosition({ lat: nextLat, lng: nextLng, ts: Date.now() }, 'sim');
}

/**
 * Handles keyboard events (WASD and Arrow keys) for movement simulation.
 */
function handleKeyDown(e: KeyboardEvent): void {
  // Only respond when simulator is active
  if (!useSimulator.getState().isActive) return;

  // Ignore keystrokes when typing into input fields
  const target = e.target as HTMLElement | null;
  if (
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable)
  ) {
    return;
  }

  const key = e.key;
  if (['ArrowUp', 'w', 'W'].includes(key)) {
    e.preventDefault();
    void stepSimDirection('north');
  } else if (['ArrowDown', 's', 'S'].includes(key)) {
    e.preventDefault();
    void stepSimDirection('south');
  } else if (['ArrowLeft', 'a', 'A'].includes(key)) {
    e.preventDefault();
    void stepSimDirection('west');
  } else if (['ArrowRight', 'd', 'D'].includes(key)) {
    e.preventDefault();
    void stepSimDirection('east');
  }
}

/**
 * Cancels active click-to-walk interpolation.
 */
export function cancelSimWalk(): void {
  if (walkTimer !== null) {
    clearInterval(walkTimer);
    walkTimer = null;
  }
  useSimulator.setState({ isWalking: false, target: null });
}

/**
 * Initiates click-to-walk to a target destination, interpolating smoothly in ticks.
 */
export function walkTo(target: LatLng): void {
  // Cancel any existing walk loop
  cancelSimWalk();

  const currentPos = useFog.getState().position ?? DEFAULT_START;
  const initialDistMeters = haversineDistanceKm(currentPos, target) * 1000;

  if (initialDistMeters < 0.5) {
    // Already at target destination
    return;
  }

  useSimulator.setState({ isWalking: true, target });

  walkTimer = window.setInterval(async () => {
    const pos = useFog.getState().position ?? DEFAULT_START;
    const remainingMeters = haversineDistanceKm(pos, target) * 1000;
    const multiplier = useSimulator.getState().speedMultiplier;
    const stepDistanceMeters = BASE_WALK_SPEED_MPS * multiplier * (TICK_INTERVAL_MS / 1000);

    if (remainingMeters <= stepDistanceMeters || remainingMeters <= 0.5) {
      // Reached destination
      cancelSimWalk();
      await ingestPosition({ lat: target.lat, lng: target.lng, ts: Date.now() }, 'sim');
      return;
    }

    const ratio = stepDistanceMeters / remainingMeters;
    const nextLat = pos.lat + (target.lat - pos.lat) * ratio;
    const nextLng = pos.lng + (target.lng - pos.lng) * ratio;

    await ingestPosition({ lat: nextLat, lng: nextLng, ts: Date.now() }, 'sim');
  }, TICK_INTERVAL_MS);
}

/**
 * Starts the simulator and attaches keyboard navigation listeners.
 */
export function startSimulator(): void {
  useSimulator.setState({ isActive: true });

  if (typeof window !== 'undefined' && !isKeyboardListenerAttached) {
    window.addEventListener('keydown', handleKeyDown);
    isKeyboardListenerAttached = true;
  }

  // Ensure an initial position exists if none has been recorded
  if (useFog.getState().position === null) {
    void ingestPosition(
      { lat: DEFAULT_START.lat, lng: DEFAULT_START.lng, ts: Date.now() },
      'sim'
    );
  }
}

/**
 * Stops the simulator and cleans up listeners and timers.
 */
export function stopSimulator(): void {
  cancelSimWalk();
  useSimulator.setState({ isActive: false });

  if (typeof window !== 'undefined' && isKeyboardListenerAttached) {
    window.removeEventListener('keydown', handleKeyDown);
    isKeyboardListenerAttached = false;
  }
}
