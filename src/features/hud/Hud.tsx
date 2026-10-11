import { useEffect, useRef } from 'react';
import { useFog } from '../../store/fog';
import { useGps } from '../../location/gps';
import { setMode } from '../../location/mode';
import { CELL_AREA_KM2 } from '../../config';
import {
  Radio,
  Footprints,
  RotateCcw,
  MapPin,
  AlertCircle,
  ArrowRight,
  X,
} from 'lucide-react';

export interface HudDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnHome?: () => void;
}

/**
 * Exploration Telemetry Drawer that reveals smoothly under the unified TopBar.
 * Displays real-time discovery metrics, live GPS / Demo Walk mode switch, and coordinates.
 */
export function HudDrawer({ isOpen, onClose }: HudDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const position = useFog((state) => state.position);
  const revealedSize = useFog((state) => state.revealed.size);
  const source = useFog((state) => state.source);
  const distanceMeters = useFog((state) => state.distanceMeters);
  const resetFog = useFog((state) => state.resetFog);

  const gpsError = useGps((state) => state.error);
  const clearGpsError = useGps((state) => state.clearError);

  const uncoveredKm2 = (revealedSize * CELL_AREA_KM2).toFixed(3);
  const distanceFormatted =
    distanceMeters >= 1000
      ? `${(distanceMeters / 1000).toFixed(2)} km`
      : `${Math.round(distanceMeters)} m`;

  const handleModeSwitch = (nextSource: 'gps' | 'sim') => {
    void setMode(nextSource);
  };

  const handleSwitchToDemoWalk = () => {
    clearGpsError();
    void setMode('sim');
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('header')) {
          onClose();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: '58px',
        left: '12px',
        zIndex: 35,
        width: 'calc(100vw - 24px)',
        maxWidth: '360px',
        padding: '16px',
        borderRadius: '18px',
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: 'fadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Title & App Branding + Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              boxShadow: '0 0 12px rgba(45, 212, 191, 0.25)',
              overflow: 'hidden',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
            }}
          >
            <img
              src="/logo.png"
              alt="SeekIt"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
              SEEKIT
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Cartographic Exploration Telemetry
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => void resetFog()}
            title="Reset Fog Exploration"
            aria-label="Reset Fog Exploration"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              cursor: 'pointer',
              transition: 'color 0.15s ease, background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={onClose}
            title="Close Telemetry (Esc)"
            aria-label="Close Telemetry"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              cursor: 'pointer',
              transition: 'color 0.15s ease, background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Mode Switch (GPS vs Demo Walk) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          padding: '4px',
          borderRadius: '10px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => handleModeSwitch('gps')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: source === 'gps' ? 'var(--teal)' : 'transparent',
            color: source === 'gps' ? 'var(--void)' : 'var(--muted)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, color 0.15s ease',
          }}
        >
          <Radio size={14} />
          <span>Live GPS</span>
        </button>

        <button
          onClick={() => handleModeSwitch('sim')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: source === 'sim' ? 'var(--teal)' : 'transparent',
            color: source === 'sim' ? 'var(--void)' : 'var(--muted)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, color 0.15s ease',
          }}
        >
          <Footprints size={14} />
          <span>Demo Walk</span>
        </button>
      </div>

      {/* GPS Error Banner */}
      {source === 'gps' && gpsError && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '12px', color: '#fca5a5', lineHeight: 1.3 }}>
              {gpsError}
            </div>
          </div>
          <button
            onClick={handleSwitchToDemoWalk}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--teal)',
              color: 'var(--void)',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            <span>Switch to Demo Walk</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Discovery Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px',
          padding: '10px',
          borderRadius: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Area
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
            {uncoveredKm2} <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--muted)' }}>km²</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Hexes
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--teal)', marginTop: '2px' }}>
            {revealedSize}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Traveled
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--amber)', marginTop: '2px' }}>
            {distanceFormatted}
          </div>
        </div>
      </div>

      {/* Position coordinates readout */}
      <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <MapPin size={14} color="var(--teal)" />
        {position ? (
          <span>
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </span>
        ) : (
          <span>Acquiring position fix...</span>
        )}
      </div>
    </div>
  );
}

export const HudPanel = HudDrawer;
export const Hud = HudDrawer;
export default HudDrawer;
