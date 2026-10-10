import { useEffect, useState } from 'react';
import { MapView } from './map/MapView';
import { UserDot } from './map/UserDot';
import { SimControls } from './map/SimControls';
import { PinsLayer } from './features/capsules/PinsLayer';
import { Composer } from './features/capsules/Composer';
import { Viewer } from './features/capsules/Viewer';
import { ReplayBar } from './features/replay/ReplayBar';
import { SettingsSheet } from './features/settings/SettingsSheet';
import { useFog } from './store/fog';
import { useGps } from './location/gps';
import { useCapsules } from './store/capsules';
import { setMode } from './location/mode';
import { locateMe } from './map/mapActions';
import { CELL_AREA_KM2 } from './config';
import {
  Compass,
  Radio,
  Footprints,
  RotateCcw,
  MapPin,
  Navigation,
  AlertCircle,
  ArrowRight,
  Sparkles,
  History,
  Settings,
} from 'lucide-react';

/**
 * Top-left HUD panel displaying metrics, source toggle, and GPS status banners.
 */
function HudPanel() {
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

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 10,
        maxWidth: '380px',
        width: 'calc(100vw - 32px)',
        padding: '16px',
        borderRadius: '16px',
        backgroundColor: 'rgba(18, 25, 35, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border)',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'auto',
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
  );
}

/**
 * Top-right Action Bar with Replay toggle and Settings gear buttons.
 */
function TopRightBar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const replay = useFog((state) => state.replay);
  const startReplay = useFog((state) => state.startReplay);
  const stopReplay = useFog((state) => state.stopReplay);

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <button
        onClick={() => (replay.active ? stopReplay() : startReplay())}
        title="Toggle Timeline Replay"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '20px',
          backgroundColor: replay.active ? 'var(--teal)' : 'rgba(18, 25, 35, 0.88)',
          color: replay.active ? 'var(--void)' : 'var(--text)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <History size={15} />
        <span>Replay</span>
      </button>

      <button
        onClick={onOpenSettings}
        title="Settings & Presentation Tools"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: 'rgba(18, 25, 35, 0.88)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Settings size={18} />
      </button>
    </div>
  );
}

/**
 * Floating button to open the Capsule Composer.
 */
function AddCapsuleButton() {
  const setComposerOpen = useCapsules((state) => state.setComposerOpen);
  const replayActive = useFog((state) => state.replay.active);

  if (replayActive) return null;

  return (
    <button
      onClick={() => setComposerOpen(true)}
      title="Add Memory at current spot"
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 15,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 22px',
        borderRadius: '24px',
        backgroundColor: 'var(--amber)',
        color: 'var(--void)',
        border: 'none',
        fontSize: '13px',
        fontWeight: 800,
        letterSpacing: '-0.01em',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(245, 185, 66, 0.5), 0 2px 6px rgba(0, 0, 0, 0.4)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
      }}
    >
      <Sparkles size={16} />
      <span>+ Add Memory</span>
    </button>
  );
}

/**
 * Floating Locate Me button positioned at the bottom right.
 */
function LocateMeButton() {
  return (
    <button
      onClick={() => locateMe()}
      title="Locate Me (Center Camera)"
      style={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        zIndex: 10,
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        backgroundColor: 'rgba(18, 25, 35, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        color: 'var(--teal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--teal)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <Navigation size={20} />
    </button>
  );
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const replayActive = useFog((state) => state.replay.active);

  // Start in Demo Walk simulator on boot
  useEffect(() => {
    void setMode('sim');
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapView>
        <PinsLayer />
        <UserDot />
        {!replayActive && <SimControls />}
        <HudPanel />
        <TopRightBar onOpenSettings={() => setSettingsOpen(true)} />
        <AddCapsuleButton />
        <LocateMeButton />
      </MapView>

      <ReplayBar />
      <Composer />
      <Viewer />
      <SettingsSheet isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
