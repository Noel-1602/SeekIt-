import React, { useEffect } from 'react';
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
  Footprints,
  Square,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MousePointerClick,
  Keyboard,
} from 'lucide-react';

export function SimControls() {
  const map = useMap();
  const source = useFog((state) => state.source);
  const isWalking = useSimulator((state) => state.isWalking);
  const speedMultiplier = useSimulator((state) => state.speedMultiplier);
  const setSpeedMultiplier = useSimulator((state) => state.setSpeedMultiplier);

  // Bind map click-to-walk listener when in simulator mode
  useEffect(() => {
    if (!map || source !== 'sim') return;

    const handleMapClick = (e: MapMouseEvent) => {
      walkTo({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, source]);

  if (source !== 'sim') {
    return null;
  }

  const speeds: SimSpeedMultiplier[] = [1, 5, 20];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '92vw',
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()} // Prevent triggering map click-to-walk on the control bar
    >
      {/* Walking banner if active */}
      {isWalking && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: 'rgba(18, 25, 35, 0.95)',
            border: '1px solid var(--teal)',
            boxShadow: '0 4px 16px rgba(45, 212, 191, 0.25)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            fontSize: '12px',
            color: 'var(--text)',
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--teal)',
              animation: 'pulse 1.2s infinite',
            }}
          />
          <Footprints size={14} color="var(--teal)" />
          <span>Walking to destination ({speedMultiplier}x)</span>
          <button
            onClick={() => cancelSimWalk()}
            title="Stop walking"
            style={{
              marginLeft: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '10px',
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

      {/* Main control capsule */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 14px',
          borderRadius: '16px',
          backgroundColor: 'rgba(18, 25, 35, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55)',
        }}
      >
        {/* Speed multiplier toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--muted)',
              marginRight: '4px',
              fontWeight: 700,
            }}
          >
            Speed
          </span>
          {speeds.map((s) => {
            const isSelected = speedMultiplier === s;
            return (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isSelected
                    ? '1px solid var(--teal)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: isSelected ? 'var(--teal-dim)' : 'transparent',
                  color: isSelected ? 'var(--teal)' : 'var(--muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                {s}x
              </button>
            );
          })}
        </div>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)' }} />

        {/* Directional D-Pad for manual 30m steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <button
            onClick={() => void stepSimDirection('west')}
            title="Step West (~30m / A)"
            style={dPadButtonStyle}
          >
            <ArrowLeft size={13} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <button
              onClick={() => void stepSimDirection('north')}
              title="Step North (~30m / W)"
              style={dPadButtonStyle}
            >
              <ArrowUp size={13} />
            </button>
            <button
              onClick={() => void stepSimDirection('south')}
              title="Step South (~30m / S)"
              style={dPadButtonStyle}
            >
              <ArrowDown size={13} />
            </button>
          </div>
          <button
            onClick={() => void stepSimDirection('east')}
            title="Step East (~30m / D)"
            style={dPadButtonStyle}
          >
            <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)' }} />

        {/* Quick Helper Tips */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            fontSize: '10px',
            color: 'var(--muted)',
            lineHeight: 1.2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Keyboard size={11} color="var(--teal)" />
            <span>WASD / Arrows (30m)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MousePointerClick size={11} color="var(--teal)" />
            <span>Click map to walk</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const dPadButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  borderRadius: '6px',
  backgroundColor: 'var(--surface-hover)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  cursor: 'pointer',
  padding: 0,
};

export default SimControls;
