import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../../map/useMap';
import { useCapsules } from '../../store/capsules';
import { useFog, replayCutoffTs } from '../../store/fog';

const ICONS = {
  text: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  photo: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  voice: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
  lock: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
};

/**
 * Renders MapLibre Markers for capsules.
 * Visibility rule: Only rendered if the capsule's H3 cell is uncovered in revealed map.
 */
export function PinsLayer() {
  const map = useMap();
  const capsules = useCapsules((state) => state.capsules);
  const setSelectedId = useCapsules((state) => state.setSelectedId);
  const revealed = useFog((state) => state.revealed);
  const replay = useFog((state) => state.replay);

  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  useEffect(() => {
    if (!map) return;

    const currentMarkers = markersRef.current;
    const activeCapsuleIds = new Set<string>();
    const cutoff = replayCutoffTs();

    for (const capsule of capsules) {
      activeCapsuleIds.add(capsule.id);

      // Check visibility: uncovered ground AND within active replay window
      const isWithinReplay = cutoff === null || capsule.createdAt <= cutoff;
      const isVisible = revealed.has(capsule.h3) && isWithinReplay;

      if (!isVisible) {
        // If covered by fog or past replay cutoff, remove marker if present
        const existing = currentMarkers.get(capsule.id);
        if (existing) {
          existing.remove();
          currentMarkers.delete(capsule.id);
        }
        continue;
      }

      // If already created, update coordinates if needed
      if (currentMarkers.has(capsule.id)) {
        continue;
      }

      // Create new marker DOM element
      const el = document.createElement('div');
      el.className = 'capsule-pin-marker';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `${capsule.type} capsule: ${capsule.title || 'Untitled'}`);

      el.style.position = 'relative';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#121923';
      el.style.border = '2px solid #f5b942';
      el.style.color = '#f5b942';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 0 14px rgba(245, 185, 66, 0.45), 0 4px 10px rgba(0, 0, 0, 0.6)';
      el.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';

      // Type icon
      const iconMarkup = ICONS[capsule.type] || ICONS.text;
      el.innerHTML = iconMarkup;

      // Sealed lock badge if sealed
      if (capsule.sealed) {
        const lockBadge = document.createElement('div');
        lockBadge.style.position = 'absolute';
        lockBadge.style.top = '-5px';
        lockBadge.style.right = '-5px';
        lockBadge.style.width = '16px';
        lockBadge.style.height = '16px';
        lockBadge.style.borderRadius = '50%';
        lockBadge.style.backgroundColor = '#f5b942';
        lockBadge.style.color = '#0b0f14';
        lockBadge.style.display = 'flex';
        lockBadge.style.alignItems = 'center';
        lockBadge.style.justifyContent = 'center';
        lockBadge.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.5)';
        lockBadge.innerHTML = ICONS.lock;
        el.appendChild(lockBadge);
      }

      // Hover feedback
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.18)';
        el.style.boxShadow = '0 0 20px rgba(245, 185, 66, 0.8), 0 6px 14px rgba(0, 0, 0, 0.7)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 0 14px rgba(245, 185, 66, 0.45), 0 4px 10px rgba(0, 0, 0, 0.6)';
      });

      // Click to open viewer
      el.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering click-to-walk on the map
        setSelectedId(capsule.id);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([capsule.lng, capsule.lat])
        .addTo(map);

      currentMarkers.set(capsule.id, marker);
    }

    // Clean up markers for removed capsules
    for (const [id, marker] of currentMarkers.entries()) {
      if (!activeCapsuleIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    }
  }, [map, capsules, revealed, replay, setSelectedId]);

  // Cleanup all markers when unmounting
  useEffect(() => {
    const markers = markersRef.current;
    return () => {
      for (const marker of markers.values()) {
        marker.remove();
      }
      markers.clear();
    };
  }, []);

  return null;
}

export default PinsLayer;
