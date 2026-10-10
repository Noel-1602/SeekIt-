import { useState } from 'react';
import { MapView } from './map/MapView';
import { UserDot } from './map/UserDot';
import { useMap } from './map/useMap';
import { useFog } from './store/fog';
import { ingestPosition } from './location/ingest';
import { DEFAULT_START, CELL_AREA_KM2 } from './config';
import { Compass, Footprints, RotateCcw, MapPin, Eye } from 'lucide-react';

function HudControls() {
  const map = useMap();
  const position = useFog((state) => state.position);
  const revealedSize = useFog((state) => state.revealed.size);
  const source = useFog((state) => state.source);
  const resetFog = useFog((state) => state.resetFog);

  const [stepCount, setStepCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Ingest initial starting fix at DEFAULT_START
  const handleRevealStart = async () => {
    setIsProcessing(true);
    try {
      await ingestPosition({ lat: DEFAULT_START.lat, lng: DEFAULT_START.lng, ts: Date.now() }, 'sim');
      map?.flyTo({ center: [DEFAULT_START.lng, DEFAULT_START.lat], zoom: 16, speed: 1.2 });
    } finally {
      setIsProcessing(false);
    }
  };

  // Walk simulated step (~35 meters north-east per click)
  const handleWalkStep = async () => {
    setIsProcessing(true);
    try {
      const nextStep = stepCount + 1;
      setStepCount(nextStep);

      const baseLat = position?.lat ?? DEFAULT_START.lat;
      const baseLng = position?.lng ?? DEFAULT_START.lng;

      // ~35 meters offset in lat/lng
      const nextLat = baseLat + 0.00032;
      const nextLng = baseLng + 0.00032;

      await ingestPosition({ lat: nextLat, lng: nextLng, ts: Date.now() }, 'sim');
      map?.easeTo({ center: [nextLng, nextLat], zoom: 16, duration: 600 });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    setStepCount(0);
    await resetFog();
  };

  const uncoveredKm2 = (revealedSize * CELL_AREA_KM2).toFixed(3);

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
        backgroundColor: 'rgba(18, 25, 35, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border)',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Title & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'var(--teal-dim)',
              color: 'var(--teal)',
            }}
          >
            <Compass size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em' }}>UNFOG</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Milestone 2B • Fog & Map Engine</div>
          </div>
        </div>

        <div
          style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '12px',
            backgroundColor: 'rgba(45, 212, 191, 0.1)',
            color: 'var(--teal)',
            border: '1px solid rgba(45, 212, 191, 0.25)',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {source}
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          padding: '10px',
          borderRadius: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Uncovered Area</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
            {uncoveredKm2} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--muted)' }}>km²</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>H3 Res-10 Cells</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--teal)', marginTop: '2px' }}>
            {revealedSize} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--muted)' }}>hexes</span>
          </div>
        </div>
      </div>

      {/* Position readout */}
      <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <MapPin size={14} color="var(--teal)" />
        {position ? (
          <span>
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </span>
        ) : (
          <span>No position fixed yet</span>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          onClick={handleRevealStart}
          disabled={isProcessing}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-hover)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Eye size={14} color="var(--amber)" />
          <span>Punch Start</span>
        </button>

        <button
          onClick={handleWalkStep}
          disabled={isProcessing}
          style={{
            flex: 1.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--teal)',
            color: 'var(--void)',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Footprints size={15} />
          <span>Walk Step</span>
        </button>

        <button
          onClick={handleReset}
          disabled={isProcessing}
          title="Reset Fog (Dexie & State)"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
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
    </div>
  );
}

export default function App() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapView>
        <UserDot />
        <HudControls />
      </MapView>
    </div>
  );
}
