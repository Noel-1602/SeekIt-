import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
import { cellsToMultiPolygon, isValidCell } from 'h3-js';
import { useFog, getVisibleRevealed } from '../store/fog';

export const FOG_FILL_SOURCE_ID = 'fog-fill-source';
export const FOG_EDGE_SOURCE_ID = 'fog-edge-source';
export const FOG_FILL_LAYER_ID = 'fog-fill';
export const FOG_EDGE_LAYER_ID = 'fog-edge';
export const FOG_EDGE_BLUR_LAYER_ID = 'fog-edge-blur';

// Outer bounding ring covering the navigable world coordinates
const WORLD_RING: [number, number][] = [
  [-180, -85],
  [180, -85],
  [180, 85],
  [-180, 85],
  [-180, -85],
];

/**
 * Applies Chaikin's corner-cutting algorithm to smooth polygon coordinates,
 * transforming hexagonal stepping into organic, cloud-like curved perimeters.
 */
function smoothRing(points: [number, number][], iterations = 2): [number, number][] {
  if (points.length < 4) return points;

  let current = points;
  for (let it = 0; it < iterations; it++) {
    const next: [number, number][] = [];
    const n = current.length - 1; // Last point equals first point in closed ring
    for (let i = 0; i < n; i++) {
      const p0 = current[i];
      const p1 = current[i + 1];
      next.push([0.75 * p0[0] + 0.25 * p1[0], 0.75 * p0[1] + 0.25 * p1[1]]);
      next.push([0.25 * p0[0] + 0.75 * p1[0], 0.25 * p0[1] + 0.75 * p1[1]]);
    }
    next.push(next[0]);
    current = next;
  }
  return current;
}

/**
 * Builds GeoJSON Feature for the inverted fog polygon with interior hole rings.
 * Merges contiguous H3 cells using cellsToMultiPolygon to eliminate internal hex lines
 * and smoothes the perimeter to create an organic cloudy boundary.
 */
export function buildFogPolygon(
  revealed: Map<string, number>
): GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> {
  const validCells: string[] = [];
  for (const h3 of revealed.keys()) {
    if (isValidCell(h3)) {
      validCells.push(h3);
    }
  }

  if (validCells.length === 0) {
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [WORLD_RING],
      },
    };
  }

  try {
    const multiPolygons = cellsToMultiPolygon(validCells, true);
    const holes: [number, number][][] = [];
    const islandPolygons: [number, number][][][] = [];

    for (const poly of multiPolygons) {
      if (poly.length > 0 && poly[0].length >= 4) {
        holes.push(smoothRing(poly[0] as [number, number][]));
      }
      // Any interior unrevealed islands where fog remains
      for (let i = 1; i < poly.length; i++) {
        if (poly[i].length >= 4) {
          islandPolygons.push([smoothRing(poly[i] as [number, number][])]);
        }
      }
    }

    if (islandPolygons.length === 0) {
      return {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [WORLD_RING, ...holes],
        },
      };
    }

    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPolygon',
        coordinates: [[WORLD_RING, ...holes], ...islandPolygons],
      },
    };
  } catch (err) {
    console.warn('Failed to merge H3 cells into polygon:', err);
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [WORLD_RING],
      },
    };
  }
}

/**
 * Builds GeoJSON Feature containing only the outer perimeter rings of uncovered clusters.
 * Does NOT include any internal H3 cell edges.
 */
export function buildFogEdge(
  revealed: Map<string, number>
): GeoJSON.Feature<GeoJSON.MultiLineString> {
  const validCells: string[] = [];
  for (const h3 of revealed.keys()) {
    if (isValidCell(h3)) {
      validCells.push(h3);
    }
  }

  if (validCells.length === 0) {
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiLineString',
        coordinates: [],
      },
    };
  }

  try {
    const multiPolygons = cellsToMultiPolygon(validCells, true);
    const perimeterRings: [number, number][][] = [];

    for (const poly of multiPolygons) {
      for (const ring of poly) {
        if (ring && ring.length >= 4) {
          perimeterRings.push(smoothRing(ring as [number, number][]));
        }
      }
    }

    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiLineString',
        coordinates: perimeterRings,
      },
    };
  } catch (err) {
    console.warn('Failed to compute fog perimeter edge:', err);
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiLineString',
        coordinates: [],
      },
    };
  }
}

/**
 * Adds the cloudy fog sources and layers to the MapLibre map instance.
 */
export function setupFogLayers(map: MapLibreMap): void {
  const initialRevealed = useFog.getState().revealed;

  // Inverted Fog Fill (soft mist white/slate covering unrevealed terrain)
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
        'fill-color': '#e2e8f0', // Soft mist slate-200 cloud base
        'fill-opacity': 0.95, // Deep cloudy envelope over unrevealed terrain
      },
    });
  }

  // Fog Edge: Soft misty feathering along perimeter of revealed hole
  if (!map.getSource(FOG_EDGE_SOURCE_ID)) {
    map.addSource(FOG_EDGE_SOURCE_ID, {
      type: 'geojson',
      data: buildFogEdge(initialRevealed),
    });
  }

  // Outer diffuse mist layer
  if (!map.getLayer(FOG_EDGE_BLUR_LAYER_ID)) {
    map.addLayer({
      id: FOG_EDGE_BLUR_LAYER_ID,
      type: 'line',
      source: FOG_EDGE_SOURCE_ID,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#e2e8f0',
        'line-width': 26,
        'line-blur': 18,
        'line-opacity': 0.75,
      },
    });
  }

  // Inner soft cloud feathering layer
  if (!map.getLayer(FOG_EDGE_LAYER_ID)) {
    map.addLayer({
      id: FOG_EDGE_LAYER_ID,
      type: 'line',
      source: FOG_EDGE_SOURCE_ID,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#f8fafc',
        'line-width': 12,
        'line-blur': 8,
        'line-opacity': 0.85,
      },
    });
  }
}

/**
 * Initializes the fog layer on a MapLibre map and subscribes to state updates.
 * Updates the GeoJSON sources only when revealed or replay active state changes.
 *
 * @returns cleanup function to unsubscribe and remove layers.
 */
export function initFogLayer(map: MapLibreMap): () => void {
  let isDisposed = false;
  let prevRevealedSize = useFog.getState().revealed.size;
  let prevReplayActive = useFog.getState().replay.active;
  let prevVisibleSize = prevRevealedSize;

  const updateSources = (revealed: Map<string, number>) => {
    if (isDisposed) return;
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
    if (isDisposed) return;
    setupFogLayers(map);
    const visible = getVisibleRevealed(useFog.getState());
    updateSources(visible);
  };

  if (map.isStyleLoaded()) {
    onStyleOrLoadReady();
  } else {
    map.once('load', onStyleOrLoadReady);
  }

  // Subscribe to store: updates when revealed changes OR replay progress/active changes
  const unsubscribe = useFog.subscribe((state) => {
    if (isDisposed) return;
    const currentSize = state.revealed.size;
    const currentReplayActive = state.replay.active;
    const visible = getVisibleRevealed(state);
    const visibleSize = visible.size;

    const shouldUpdate =
      currentSize !== prevRevealedSize ||
      currentReplayActive !== prevReplayActive ||
      (currentReplayActive && visibleSize !== prevVisibleSize);

    if (shouldUpdate) {
      prevRevealedSize = currentSize;
      prevReplayActive = currentReplayActive;
      prevVisibleSize = visibleSize;

      if (map.isStyleLoaded() && map.getSource(FOG_FILL_SOURCE_ID)) {
        updateSources(visible);
      }
    }
  });

  return () => {
    isDisposed = true;
    unsubscribe();
    map.off('load', onStyleOrLoadReady);
    try {
      if (map.getLayer(FOG_EDGE_LAYER_ID)) map.removeLayer(FOG_EDGE_LAYER_ID);
      if (map.getLayer(FOG_EDGE_BLUR_LAYER_ID)) map.removeLayer(FOG_EDGE_BLUR_LAYER_ID);
      if (map.getLayer(FOG_FILL_LAYER_ID)) map.removeLayer(FOG_FILL_LAYER_ID);
      if (map.getSource(FOG_EDGE_SOURCE_ID)) map.removeSource(FOG_EDGE_SOURCE_ID);
      if (map.getSource(FOG_FILL_SOURCE_ID)) map.removeSource(FOG_FILL_SOURCE_ID);
    } catch {
      // Map may have already been cleaned up or destroyed
    }
  };
}
