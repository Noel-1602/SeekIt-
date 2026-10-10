import { create } from 'zustand';
import { ingestPosition, resetLastAcceptedGpsFix } from './ingest';
import type { Fix } from '../types';

export interface GpsState {
  isWatching: boolean;
  error: string | null;
  errorCode: number | null;
  clearError: () => void;
  setError: (error: string | null, code?: number | null) => void;
}

export const useGps = create<GpsState>((set) => ({
  isWatching: false,
  error: null,
  errorCode: null,
  clearError: () => set({ error: null, errorCode: null }),
  setError: (error: string | null, code: number | null = null) => set({ error, errorCode: code }),
}));

let watchId: number | null = null;

const GPS_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 5000,
  timeout: 20000,
};

/**
 * Handles incoming Geolocation coordinates.
 */
async function handlePositionSuccess(pos: GeolocationPosition): Promise<void> {
  useGps.getState().clearError();

  const fix: Fix = {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    ts: pos.timestamp || Date.now(),
  };

  await ingestPosition(fix, 'gps');
}

/**
 * Handles Geolocation errors with user-friendly messages.
 */
function handlePositionError(err: GeolocationPositionError): void {
  let message = 'Unable to retrieve GPS location.';

  switch (err.code) {
    case err.PERMISSION_DENIED:
      message = 'Location permission was denied. Please allow location access or switch to Demo Walk.';
      break;
    case err.POSITION_UNAVAILABLE:
      message = 'GPS signal unavailable. Ensure your device has an unobstructed view of the sky or switch to Demo Walk.';
      break;
    case err.TIMEOUT:
      message = 'Location request timed out. Weak GPS signal detected. Switch to Demo Walk?';
      break;
  }

  console.warn('Geolocation error:', err.code, err.message);
  useGps.getState().setError(message, err.code);
}

/**
 * Starts watching real-time GPS coordinates.
 */
export function startGpsTracking(): void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    useGps.getState().setError('Geolocation is not supported by your browser.', null);
    return;
  }

  // Clear any existing watcher first
  stopGpsTracking();

  useGps.setState({ isWatching: true, error: null, errorCode: null });

  try {
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        void handlePositionSuccess(pos);
      },
      (err) => {
        handlePositionError(err);
      },
      GPS_OPTIONS
    );
  } catch (err) {
    console.error('Failed to start GPS tracking:', err);
    useGps.getState().setError('Failed to initialize GPS tracking.', null);
    useGps.setState({ isWatching: false });
  }
}

/**
 * Stops watching real-time GPS coordinates and clears internal state.
 */
export function stopGpsTracking(): void {
  if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  resetLastAcceptedGpsFix();
  useGps.setState({ isWatching: false });
}

/**
 * Returns whether GPS tracking is currently active.
 */
export function isGpsTracking(): boolean {
  return watchId !== null;
}
