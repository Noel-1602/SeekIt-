let wakeLockSentinel: WakeLockSentinel | null = null;
let isRequested = false;

/**
 * Acquires a screen wake lock if supported by the browser.
 */
async function acquireWakeLock(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
    return false;
  }

  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch (err) {
    // Wake lock request may be rejected (e.g. low battery, background tab)
    console.warn('Screen Wake Lock request failed:', err);
    wakeLockSentinel = null;
    return false;
  }
}

/**
 * Requests the Screen Wake Lock to prevent the screen from sleeping while tracking is active.
 */
export async function requestWakeLock(): Promise<boolean> {
  isRequested = true;
  return acquireWakeLock();
}

/**
 * Releases the active Screen Wake Lock.
 */
export async function releaseWakeLock(): Promise<void> {
  isRequested = false;
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch (err) {
      console.warn('Screen Wake Lock release failed:', err);
    } finally {
      wakeLockSentinel = null;
    }
  }
}

/**
 * Returns whether a wake lock is currently active.
 */
export function isWakeLockActive(): boolean {
  return wakeLockSentinel !== null;
}

// Automatically re-acquire wake lock on visibility change if tracking was active
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && isRequested && !wakeLockSentinel) {
      await acquireWakeLock();
    }
  });
}
