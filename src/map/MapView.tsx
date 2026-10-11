import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { STYLE_URL_DAY, STYLE_URL_NIGHT, DEFAULT_START } from '../config';
import { MapContext } from './useMap';
import { initFogLayer, applyFogTheme } from './fogLayer';
import { setMapInstance } from './mapActions';
import { getAutoMapTheme, type MapTheme } from './solarTheme';
import { useFog } from '../store/fog';

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
  const position = useFog((state) => state.position);

  // Compute initial day/night theme automatically based on coordinates and timezone
  const initialTheme = useRef(getAutoMapTheme(position ?? initialCenter)).current;
  const [theme, setTheme] = useState<MapTheme>(initialTheme);
  const themeRef = useRef<MapTheme>(theme);
  themeRef.current = theme;

  const activeStyleRef = useRef<string>(
    initialTheme === 'day' ? STYLE_URL_DAY : STYLE_URL_NIGHT
  );

  // Automatically monitor and update theme based on position and time
  useEffect(() => {
    const evaluateTheme = () => {
      const activeCoords = position ?? initialCenter;
      const nextTheme = getAutoMapTheme(activeCoords);
      if (nextTheme !== themeRef.current) {
        themeRef.current = nextTheme;
        setTheme(nextTheme);
      }
    };

    // Evaluate on location changes
    evaluateTheme();

    // Check periodically (every 60 seconds) for automatic sunrise / sunset transitions
    const timer = setInterval(evaluateTheme, 60_000);
    return () => clearInterval(timer);
  }, [position, initialCenter]);

  // Synchronize MapLibre basemap style whenever automatic theme changes
  useEffect(() => {
    if (!map) return;
    const targetStyle = theme === 'day' ? STYLE_URL_DAY : STYLE_URL_NIGHT;
    if (activeStyleRef.current !== targetStyle) {
      activeStyleRef.current = targetStyle;
      map.setStyle(targetStyle);
      applyFogTheme(map, theme);
    }
  }, [theme, map]);

  useEffect(() => {
    if (!containerRef.current) return;

    const initialStyle = themeRef.current === 'day' ? STYLE_URL_DAY : STYLE_URL_NIGHT;
    activeStyleRef.current = initialStyle;

    // Initialize MapLibre GL JS
    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: initialStyle,
      center: [initialCenter.lng, initialCenter.lat],
      zoom: initialZoom,
      attributionControl: { compact: false },
    });

    let isMounted = true;
    let cleanupFog: (() => void) | undefined;

    const onLoad = () => {
      if (!isMounted) return;
      setMap(instance);
      setMapInstance(instance);
      cleanupFog = initFogLayer(instance, () => themeRef.current);
    };

    instance.once('load', onLoad);

    return () => {
      isMounted = false;
      instance.off('load', onLoad);
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
