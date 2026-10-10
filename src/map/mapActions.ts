import type { Map as MapLibreMap } from 'maplibre-gl';
import { useFog } from '../store/fog';
import { DEFAULT_START } from '../config';

let activeMapInstance: MapLibreMap | null = null;

/**
 * Registers the active MapLibre GL map instance.
 */
export function setMapInstance(map: MapLibreMap | null): void {
  activeMapInstance = map;
}

/**
 * Returns the currently registered MapLibre GL map instance.
 */
export function getMapInstance(): MapLibreMap | null {
  return activeMapInstance;
}

/**
 * Smoothly flies the MapLibre camera to the user's current coordinates.
 */
export function locateMe(): void {
  if (!activeMapInstance) return;

  const position = useFog.getState().position;
  const target = position ?? DEFAULT_START;

  activeMapInstance.flyTo({
    center: [target.lng, target.lat],
    zoom: 16,
    duration: 1200,
    essential: true,
  });
}
