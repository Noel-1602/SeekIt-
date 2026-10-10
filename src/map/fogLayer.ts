import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
import { cellToBoundary } from 'h3-js';
import { useFog } from '../store/fog';

export const FOG_FILL_SOURCE_ID = 'fog-fill-source';
export const FOG_EDGE_SOURCE_ID = 'fog-edge-source';
export const FOG_FILL_LAYER_ID = 'fog-fill';
export const FOG_EDGE_LAYER_ID = 'fog-edge';

// Outer bounding ring covering the navigable world coordinates
const WORLD_RING: [number, number][] = [
  [-180, -85],
  [180, -85],
  [180, 85],
  [-180, 85],
  [-180, -85],
];

/**
 * Builds GeoJSON Feature for the inverted fog polygon with interior hole rings.
 */
export function buildFogPolygon(revealed: Map<string, number>): GeoJSON.Feature<GeoJSON.Polygon> {
  const holes: [number, number][][] = [];

  for (const h3 of revealed.keys()) {
    try {
      const ring = cellToBoundary(h3, true) as [number, number][];
      if (ring && ring.length >= 4) {
        holes.push(ring);
      }
    } catch (err) {
      console.warn('Invalid H3 cell index encountered:', h3, err);
    }
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [WORLD_RING, ...holes],
    },
  };
}

/**
 * Builds GeoJSON Feature containing only the hole rings as a MultiLineString for glowing edges.
 */
export function buildFogEdge(revealed: Map<string, number>): GeoJSON.Feature<GeoJSON.MultiLineString> {
  const holeRings: [number, number][][] = [];

  for (const h3 of revealed.keys()) {
    try {
      const ring = cellToBoundary(h3, true) as [number, number][];
      if (ring && ring.length >= 4) {
        holeRings.push(ring);
      }
    } catch (err) {
      console.warn('Invalid H3 cell index encountered:', h3, err);
    }
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiLineString',
      coordinates: holeRings,
    },
  };
}

/**
 * Adds the inverted fog sources and layers to the MapLibre map instance.
 */
export function setupFogLayers(map: MapLibreMap): void {
  const initialRevealed = useFog.getState().revealed;

  // Inverted Fog Fill (dark void covering everything except uncovered cells)
  if (!map.getSource(FOG_FILL_SOURCE_ID)) {
    map.addSource(FOG_FILL_SOURCE_ID, {
      type: 'geojson',
      data: buildFogPolygon(initialRevealed),
    });
  }

  if (!map.getLayer(FOG_FILL_LAYER_ID)) {
    map.addLayer({
      id: FOG_FILL_LAYER_ID,
      type: 'fill',
      source: FOG_FILL_SOURCE_ID,
      paint: {
        'fill-color': '#0b0f14',
        'fill-opacity': 0.9,
      },
    });
  }

  // Fog Edge (cyan/teal glow outlining revealed cell perimeters)
  if (!map.getSource(FOG_EDGE_SOURCE_ID)) {
    map.addSource(FOG_EDGE_SOURCE_ID, {
      type: 'geojson',
      data: buildFogEdge(initialRevealed),
    });
  }

  if (!map.getLayer(FOG_EDGE_LAYER_ID)) {
    map.addLayer({
      id: FOG_EDGE_LAYER_ID,
      type: 'line',
      source: FOG_EDGE_SOURCE_ID,
      paint: {
        'line-color': '#2dd4bf',
        'line-width': 6,
        'line-blur': 8,
        'line-opacity': 0.6,
      },
    });
  }
}

/**
 * Initializes the fog layer on a MapLibre map and subscribes to state updates.
 * Updates the GeoJSON source only when revealed.size actually changes.
 *
 * @returns cleanup function to unsubscribe and remove layers.
 */
export function initFogLayer(map: MapLibreMap): () => void {
  let prevRevealedSize = useFog.getState().revealed.size;

  const updateSources = (revealed: Map<string, number>) => {
    const fillSource = map.getSource(FOG_FILL_SOURCE_ID) as GeoJSONSource | undefined;
    const edgeSource = map.getSource(FOG_EDGE_SOURCE_ID) as GeoJSONSource | undefined;

    if (fillSource) {
      fillSource.setData(buildFogPolygon(revealed));
    }
    if (edgeSource) {
      edgeSource.setData(buildFogEdge(revealed));
    }
  };

  const onStyleOrLoadReady = () => {
    setupFogLayers(map);
    updateSources(useFog.getState().revealed);
  };

  if (map.isStyleLoaded()) {
    onStyleOrLoadReady();
  } else {
    map.once('load', onStyleOrLoadReady);
  }

  // Subscribe to store: only call setData when revealed.size changes
  const unsubscribe = useFog.subscribe((state) => {
    const currentSize = state.revealed.size;
    if (currentSize !== prevRevealedSize) {
      prevRevealedSize = currentSize;
      if (map.isStyleLoaded() && map.getSource(FOG_FILL_SOURCE_ID)) {
        updateSources(state.revealed);
      }
    }
  });

  return () => {
    unsubscribe();
    map.off('load', onStyleOrLoadReady);
    try {
      if (map.getLayer(FOG_EDGE_LAYER_ID)) map.removeLayer(FOG_EDGE_LAYER_ID);
      if (map.getLayer(FOG_FILL_LAYER_ID)) map.removeLayer(FOG_FILL_LAYER_ID);
      if (map.getSource(FOG_EDGE_SOURCE_ID)) map.removeSource(FOG_EDGE_SOURCE_ID);
      if (map.getSource(FOG_FILL_SOURCE_ID)) map.removeSource(FOG_FILL_SOURCE_ID);
    } catch {
      // Map may have already been cleaned up or destroyed
    }
  };
}
