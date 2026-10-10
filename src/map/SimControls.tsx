import React, { useState, useRef, useEffect } from 'react';
import type { MapMouseEvent } from 'maplibre-gl';
import { useMap } from './useMap';
import { useFog } from '../store/fog';
import {
  useSimulator,
  walkTo,
  cancelSimWalk,
  stepSimDirection,
  type SimSpeedMultiplier,
} from '../location/simulator';
import {
  HelpCircle,
  X,
  Footprints,
  Square,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MousePointerClick,
  Keyboard,
  Compass,
} from 'lucide-react';

export function SimControls() {
  const map = useMap();
  const source = useFog((state) => state.source);
  const isWalking = useSimulator((state) => state.isWalking);
  const speedMultiplier = useSimulator((state) => state.speedMultiplier);
  const setSpeedMultiplier = useSimulator((state) => state.setSpeedMultiplier);

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Bind map click-to-walk listener when in simulator mode
  useEffect(() => {
    if (!map || source !== 'sim') return;

    const handleMapClick = (e: MapMouseEvent) => {
      walkTo({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
      cancelSimWalk();
    };
  }, [map, source]);

  // Click-outside listener to close the popover
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (source !== 'sim') {
    return null;
  }

  const speeds: SimSpeedMultiplier[] = [1, 5, 20];

  return (
    <>
      {/* Floating active walking banner if walking while popover is closed */}
      {isWalking && !isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '82px',
            right: '80px',
            zIndex: 12,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(18, 25, 35, 0.95)',
            border: '1px solid var(--teal)',
            boxShadow: '0 4px 16px rgba(45, 212, 191, 0.25)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            fontSize: '11px',
            color: 'var(--text)',
            fontWeight: 600,
            pointerEvents: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--teal)',
            }}
          />
          <Footprints size={13} color="var(--teal)" />
          <span>Walking ({speedMultiplier}x)</span>
          <button
            onClick={() => cancelSimWalk()}
            title="Stop walking"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 6px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Square size={9} />
            <span>Stop</span>
          </button>
        </div>
      )}

      {/* Floating '?' Help Button in bottom-right corner, positioned above Locate button */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        title="Simulator & Movement Controls (?)"
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '24px',
          zIndex: 12,
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: isOpen ? 'var(--teal)' : 'rgba(18, 25, 35, 0.92)',
          color: isOpen ? 'var(--void)' : 'var(--teal)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: isOpen ? '1px solid var(--teal)' : '1px solid var(--border)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.15s ease, background-color 0.15s ease, color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <HelpCircle size={22} />
      </button>

      {/* Compact Popover Sheet */}
      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            bottom: '136px',
            right: '24px',
            zIndex: 20,
            width: '270px',
            borderRadius: '18px',
            backgroundColor: 'rgba(18, 25, 35, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            pointerEvents: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={17} color="var(--teal)" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                Simulator Controls
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              title="Close controls"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
            >
              <X size={16} />
            </button>
          </div>

          {/* Active Walking Banner (if walking) */}
          {isWalking && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(45, 212, 191, 0.1)',
                border: '1px solid var(--teal)',
                fontSize: '12px',
                color: 'var(--text)',
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Footprints size={14} color="var(--teal)" />
                <span>Walking ({speedMultiplier}x)</span>
              </div>
              <button
                onClick={() => cancelSimWalk()}
                title="Stop walking"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Square size={10} />
                <span>Stop</span>
              </button>
            </div>
          )}

          {/* Speed Selector */}
          <div>
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--muted)',
                fontWeight: 700,
                marginBottom: '6px',
              }}
            >
              Speed Multiplier
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {speeds.map((s) => {
                const isSelected = speedMultiplier === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSpeedMultiplier(s)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected
                        ? '1px solid var(--teal)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: isSelected ? 'var(--teal-dim)' : 'var(--surface-hover)',
                      color: isSelected ? 'var(--teal)' : 'var(--muted)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {s}x
                  </button>
                );
              })}
            </div>
          </div>

          {/* Directional Step D-Pad */}
          <div>
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--muted)',
                fontWeight: 700,
                marginBottom: '6px',
              }}
            >
              Step Direction (30m)
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 36px)',
                gridTemplateRows: 'repeat(3, 36px)',
                gap: '4px',
                justifyContent: 'center',
                margin: '4px 0',
              }}
            >
              {/* Row 1: Empty, North, Empty */}
              <div />
              <button
                onClick={() => void stepSimDirection('north')}
                title="Step North (~30m / W / Up)"
                style={dPadButtonStyle}
              >
                <ArrowUp size={16} />
              </button>
              <div />

              {/* Row 2: West, Center, East */}
              <button
                onClick={() => void stepSimDirection('west')}
                title="Step West (~30m / A / Left)"
                style={dPadButtonStyle}
              >
                <ArrowLeft size={16} />
              </button>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--muted)',
                  fontSize: '10px',
                  fontWeight: 700,
                }}
              >
                30m
              </div>
              <button
                onClick={() => void stepSimDirection('east')}
                title="Step East (~30m / D / Right)"
                style={dPadButtonStyle}
              >
                <ArrowRight size={16} />
              </button>

              {/* Row 3: Empty, South, Empty */}
              <div />
              <button
                onClick={() => void stepSimDirection('south')}
                title="Step South (~30m / S / Down)"
                style={dPadButtonStyle}
              >
                <ArrowDown size={16} />
              </button>
              <div />
            </div>
          </div>

          {/* Movement Instructions */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: 'var(--surface-hover)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '11px',
              color: 'var(--muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Keyboard size={13} color="var(--teal)" />
              <span>WASD / Arrows (30m)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MousePointerClick size={13} color="var(--teal)" />
              <span>Click map to walk</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const dPadButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  backgroundColor: 'var(--surface-hover)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  cursor: 'pointer',
  padding: 0,
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
};

export default SimControls;
