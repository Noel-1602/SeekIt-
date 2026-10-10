import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from './useMap';
import { useFog } from '../store/fog';

/**
 * Renders a pulsing teal user location marker on the MapLibre map.
 * Subscribes to the active position from useFog.
 */
export function UserDot() {
  const map = useMap();
  const position = useFog((state) => state.position);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    // Build the pulsing marker DOM element
    const container = document.createElement('div');
    container.className = 'user-dot-marker';
    container.setAttribute('aria-label', 'Current User Location');

    const pulseRing = document.createElement('div');
    pulseRing.className = 'user-dot-pulse-ring';

    const centerDot = document.createElement('div');
    centerDot.className = 'user-dot-center';

    container.appendChild(pulseRing);
    container.appendChild(centerDot);

    const marker = new maplibregl.Marker({
      element: container,
      anchor: 'center',
    });

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    if (!markerRef.current || !map) return;

    if (position) {
      markerRef.current.setLngLat([position.lng, position.lat]);
      if (!markerRef.current.getElement().parentElement) {
        markerRef.current.addTo(map);
      }
    } else {
      markerRef.current.remove();
    }
  }, [position, map]);

  return null;
}

export default UserDot;
