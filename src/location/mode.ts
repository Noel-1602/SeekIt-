import { useFog } from '../store/fog';
import { startGpsTracking, stopGpsTracking } from './gps';
import { startSimulator, stopSimulator } from './simulator';
import { requestWakeLock, releaseWakeLock } from './wakeLock';
import type { Source } from '../types';

/**
 * Switches the active movement source between live GPS and the interactive simulator.
 * Cleanly starts/stops watchers, listeners, and wake locks.
 */
export async function setMode(source: Source): Promise<void> {
  const store = useFog.getState();

  if (source === 'gps') {
    // Teardown simulator
    stopSimulator();

    // Start GPS engine & screen wake lock
    startGpsTracking();
    await requestWakeLock();

    store.setSource('gps');
    store.setIsTracking(true);
  } else if (source === 'sim') {
    // Teardown GPS engine & release screen wake lock
    stopGpsTracking();
    await releaseWakeLock();

    // Start interactive simulator
    startSimulator();

    store.setSource('sim');
    store.setIsTracking(true);
  }
}

/**
 * Halts all active tracking sources (GPS, simulator, wake lock).
 */
export async function stopTracking(): Promise<void> {
  stopGpsTracking();
  stopSimulator();
  await releaseWakeLock();

  useFog.getState().setIsTracking(false);
}
