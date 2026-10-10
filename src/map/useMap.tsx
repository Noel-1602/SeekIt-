import { createContext, useContext } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';

export const MapContext = createContext<MapLibreMap | null>(null);

/**
 * Accesses the active MapLibre Map instance once loaded (or null while loading).
 */
export function useMap(): MapLibreMap | null {
  return useContext(MapContext);
}

export default useMap;
