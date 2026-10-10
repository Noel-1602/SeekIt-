import { useState, useEffect } from 'react';
import { useFog } from '../../store/fog';
import { useGps } from '../../location/gps';
import { setMode } from '../../location/mode';
import { CELL_AREA_KM2 } from '../../config';
import {
  Compass,
  Radio,
  Footprints,
  RotateCcw,
  MapPin,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

/**
 * Collapsible sliding HUD panel tucked off the top-left edge of the screen.
 * Expands into a drawer with discovery metrics, source toggle, and coordinates.
 */
export function HudPanel() {
  const [isOpen, setIsOpen] = useState(false);

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

  // Allow closing drawer with Escape key for keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 30,
        transform: isOpen ? 'translateX(0)' : 'translateX(calc(-100% - 16px))',
        transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
        display: 'flex',
        alignItems: 'flex-start',
        pointerEvents: 'none',
      }}
    >
      {/* Sliding HUD Card */}
      <div
        style={{
          width: 'calc(100vw - 84px)',
          maxWidth: '360px',
          padding: '16px',
          borderRadius: '16px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title & App Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: 'var(--teal-dim)',
                color: 'var(--teal)',
                boxShadow: '0 0 12px rgba(45, 212, 191, 0.25)',
              }}
            >
              <Compass size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                SEEKIT
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Cartographic Memory Explorer
              </div>
            </div>
          </div>

          <button
            onClick={() => void resetFog()}
            title="Reset Fog"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--muted)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--muted)';
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Mode Toggle Switch (Live GPS / Demo Walk) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <button
            onClick={() => handleModeSwitch('gps')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: source === 'gps' ? 'var(--teal)' : 'transparent',
              color: source === 'gps' ? 'var(--void)' : 'var(--muted)',
              transition: 'all 0.15s ease',
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
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: source === 'sim' ? 'var(--teal)' : 'transparent',
              color: source === 'sim' ? 'var(--void)' : 'var(--muted)',
              transition: 'all 0.15s ease',
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
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '11px', lineHeight: 1.4, color: 'var(--text)' }}>
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

      {/* Compact Floating Drawer Chevron Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        title={isOpen ? 'Collapse HUD (Esc)' : 'Expand HUD'}
        aria-label={isOpen ? 'Collapse HUD' : 'Expand HUD'}
        aria-expanded={isOpen}
        style={{
          position: 'absolute',
          top: '0px',
          left: 'calc(100% + 16px)',
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          pointerEvents: 'auto',
          transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--teal)';
          e.currentTarget.style.color = 'var(--teal)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 14px rgba(45, 212, 191, 0.25)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </div>
  );
}

export const Hud = HudPanel;
export default HudPanel;
