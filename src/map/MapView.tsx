import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { STYLE_URL, DEFAULT_START } from '../config';
import { MapContext } from './useMap';
import { initFogLayer } from './fogLayer';
import { setMapInstance } from './mapActions';

export interface MapViewProps {
  children?: React.ReactNode;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
}

export function MapView({
  children,
  initialCenter = DEFAULT_START,
  initialZoom = 16,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize MapLibre GL JS
    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [initialCenter.lng, initialCenter.lat],
      zoom: initialZoom,
      attributionControl: { compact: false }, // Preserve OpenFreeMap & OpenStreetMap attribution
    });

    let cleanupFog: (() => void) | undefined;

    instance.on('load', () => {
      setMap(instance);
      setMapInstance(instance);
      cleanupFog = initFogLayer(instance);
    });

    return () => {
      cleanupFog?.();
      instance.remove();
      setMap(null);
      setMapInstance(null);
    };
  }, [initialCenter, initialZoom]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <MapContext.Provider value={map}>{children}</MapContext.Provider>
    </div>
  );
}

export default MapView;
