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

      // Outer marker DOM element passed to MapLibre (no transforms/transitions)
      const el = document.createElement('div');
      el.className = 'capsule-pin-marker';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `${capsule.type} capsule: ${capsule.title || 'Untitled'}`);

      // Stop event bubbling on hover/pointer movements so MapLibre canvas/drag handlers do not misinterpret them
      const stopPropagation = (e: Event) => {
        e.stopPropagation();
      };
      el.addEventListener('mouseenter', stopPropagation);
      el.addEventListener('mouseleave', stopPropagation);
      el.addEventListener('mousemove', stopPropagation);
      el.addEventListener('pointerenter', stopPropagation);
      el.addEventListener('pointerleave', stopPropagation);

      // Inner child wrapper for visual appearance, hover scale, and pressing pulse
      const inner = document.createElement('div');
      inner.className = 'capsule-pin-inner';

      // Type icon
      const iconMarkup = ICONS[capsule.type] || ICONS.text;
      inner.innerHTML = iconMarkup;

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
        inner.appendChild(lockBadge);
      }

      el.appendChild(inner);

      // Long-press gesture detection
      let pressTimer: ReturnType<typeof setTimeout> | null = null;
      let isLongPressTriggered = false;
      let isPressing = false;
      let startX = 0;
      let startY = 0;

      const handlePressStart = (e: PointerEvent | TouchEvent | MouseEvent) => {
        // Prevent map click-to-walk or drag interference
        e.stopPropagation();
        if (isPressing) return;
        isPressing = true;
        isLongPressTriggered = false;

        if ('clientX' in e) {
          startX = e.clientX;
          startY = e.clientY;
        } else if ('touches' in e && e.touches.length > 0) {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        }

        el.classList.add('is-pressing');

        if (pressTimer) {
          clearTimeout(pressTimer);
        }

        pressTimer = setTimeout(() => {
          isLongPressTriggered = true;
          pressTimer = null;
          el.classList.remove('is-pressing');

          // Subtle haptic feedback
          try {
            if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
              navigator.vibrate(50);
            }
          } catch {
            // Ignore vibration errors on unsupported hardware
          }

          // Open deletion confirmation modal with targeted capsule ID
          useCapsules.getState().setDeleteTargetId(capsule.id);
        }, 600);
      };

      const handlePressEnd = (e?: Event) => {
        if (e) {
          e.stopPropagation();
        }
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
        el.classList.remove('is-pressing');
        // Delay resetting isPressing so trailing click event can inspect isLongPressTriggered
        setTimeout(() => {
          isPressing = false;
        }, 120);
      };

      const handlePressMove = (e: PointerEvent | TouchEvent) => {
        if (!isPressing) return;
        let curX = startX;
        let curY = startY;
        if ('clientX' in e) {
          curX = e.clientX;
          curY = e.clientY;
        } else if ('touches' in e && e.touches.length > 0) {
          curX = e.touches[0].clientX;
          curY = e.touches[0].clientY;
        }
        // If movement exceeds small threshold, user is panning rather than pressing
        if (Math.hypot(curX - startX, curY - startY) > 10) {
          handlePressEnd();
        }
      };

      // Pointer event listeners (desktop mouse + modern touch)
      el.addEventListener('pointerdown', handlePressStart);
      el.addEventListener('pointerup', handlePressEnd);
      el.addEventListener('pointerleave', handlePressEnd);
      el.addEventListener('pointercancel', handlePressEnd);
      el.addEventListener('pointermove', handlePressMove);

      // Touch event listeners for comprehensive mobile touch coverage
      el.addEventListener('touchstart', handlePressStart, { passive: false });
      el.addEventListener('touchend', handlePressEnd);
      el.addEventListener('touchcancel', handlePressEnd);
      el.addEventListener('touchmove', handlePressMove, { passive: true });

      // Prevent native context menu on long-press
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      // Accessible keyboard trigger
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();
          e.preventDefault();
          setSelectedId(capsule.id);
        }
      });

      // Click to open viewer (suppressed if long-press triggered)
      el.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering click-to-walk on the map
        if (isLongPressTriggered) {
          e.preventDefault();
          isLongPressTriggered = false;
          return;
        }
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
