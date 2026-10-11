import { useState, useRef, useEffect } from 'react';
import { useFog } from '../../store/fog';
import {
  EARTH_CIRCUMFERENCE_KM,
  EARTH_LAND_AREA_KM2,
  EARTH_TOTAL_AREA_KM2,
  CELL_AREA_KM2,
} from '../../config';
import {
  Globe2,
  ChevronDown,
  CheckCircle2,
  Compass,
  X,
  Gauge,
} from 'lucide-react';

export type MetricMode = 'circumference' | 'land_area' | 'total_surface';

interface TierDefinition {
  name: string;
  minKm: number;
  maxKm: number;
  badge: string;
  description: string;
}

const TIERS: TierDefinition[] = [
  {
    name: 'Neighborhood Scout',
    minKm: 0,
    maxKm: 1,
    badge: '🌿',
    description: 'First steps into the unknown. Charting local surroundings.',
  },
  {
    name: 'City Pathfinder',
    minKm: 1,
    maxKm: 10,
    badge: '🏙️',
    description: 'Mapping urban networks and neighborhood horizons.',
  },
  {
    name: 'Regional Nomad',
    minKm: 10,
    maxKm: 50,
    badge: '🗺️',
    description: 'Traversing counties, hills, and river valleys.',
  },
  {
    name: 'Continental Trekker',
    minKm: 50,
    maxKm: 250,
    badge: '🏔️',
    description: 'Endurance wanderer carving deep paths across provinces.',
  },
  {
    name: 'Global Voyager',
    minKm: 250,
    maxKm: 1000,
    badge: '🧭',
    description: 'Master explorer with epic journeys across biomes.',
  },
  {
    name: 'Planetary Circumnavigator',
    minKm: 1000,
    maxKm: EARTH_CIRCUMFERENCE_KM,
    badge: '🌍',
    description: 'Living legend walking the circumference of planet Earth.',
  },
];

/**
 * Formats a percentage value up to 4 decimal places.
 * Example: 0.0025 -> "0.0025%"
 */
export function formatUpTo4Decimals(percentage: number): string {
  if (percentage <= 0) return '0.0000%';
  if (percentage < 0.0001) return '< 0.0001%';
  return `${percentage.toFixed(4)}%`;
}

/**
 * Progression bar system located in the top-right corner.
 * Calculates true, non-random progression according to total travel distance
 * and uncovered area with respect to Earth's planetary scale (up to 4 decimal places).
 */
export function ProgressionBar() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [metricMode, setMetricMode] = useState<MetricMode>('circumference');
  const [visualMode, setVisualMode] = useState<'tier' | 'linear'>('tier');
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 680 : false
  );
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 680);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const distanceMeters = useFog((state) => state.distanceMeters);
  const revealedSize = useFog((state) => state.revealed.size);

  const distanceKm = distanceMeters / 1000;
  const uncoveredKm2 = revealedSize * CELL_AREA_KM2;

  // 1. Circumference Odyssey (Travel distance vs Earth's 40,075 km circumference)
  // 40.075 meters traveled = +0.0001%
  const circumferencePercent = (distanceKm / EARTH_CIRCUMFERENCE_KM) * 100;

  // 2. Explorable Landmass Area (Uncovered area vs Earth's 148,940,000 km² land)
  const landAreaPercent = (uncoveredKm2 / EARTH_LAND_AREA_KM2) * 100;

  // 3. Total Planetary Surface Area (Uncovered area vs 510,064,472 km²)
  const totalSurfacePercent = (uncoveredKm2 / EARTH_TOTAL_AREA_KM2) * 100;

  // Find active explorer tier
  const currentTier =
    TIERS.find((t) => distanceKm >= t.minKm && distanceKm < t.maxKm) ||
    TIERS[TIERS.length - 1];

  const tierSpan = currentTier.maxKm - currentTier.minKm;
  const tierProgress =
    tierSpan > 0
      ? Math.min(1, Math.max(0, (distanceKm - currentTier.minKm) / tierSpan))
      : 1;

  // Active percentage based on user's selected metric mode
  const activePercent =
    metricMode === 'circumference'
      ? circumferencePercent
      : metricMode === 'land_area'
      ? landAreaPercent
      : totalSurfacePercent;

  const formattedPercent = formatUpTo4Decimals(activePercent);

  // Determine visual fill for the progress bar
  const visualFillPercent =
    visualMode === 'tier'
      ? Math.max(distanceMeters > 0 ? 3 : 0, tierProgress * 100)
      : Math.min(100, Math.max(distanceMeters > 0 ? 2 : 0, circumferencePercent));

  // Close popover on click outside or escape key
  useEffect(() => {
    if (!detailsOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setDetailsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDetailsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [detailsOpen]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Top Right Floating Progression Pill */}
      <div
        ref={buttonRef}
        onClick={() => setDetailsOpen((prev) => !prev)}
        title="View Earth Exploration Telemetry"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px 6px 10px',
          borderRadius: '24px',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45), 0 0 14px rgba(45, 212, 191, 0.15)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.6)';
          e.currentTarget.style.boxShadow =
            '0 10px 28px rgba(0, 0, 0, 0.55), 0 0 20px rgba(45, 212, 191, 0.25)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)';
          e.currentTarget.style.boxShadow =
            '0 8px 24px rgba(0, 0, 0, 0.45), 0 0 14px rgba(45, 212, 191, 0.15)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Glowing Planet / Orbit Icon */}
        <div
          style={{
            position: 'relative',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.2), rgba(245, 185, 66, 0.2))',
            border: '1px solid rgba(45, 212, 191, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--teal)',
            flexShrink: 0,
          }}
        >
          <Globe2 size={16} />
          {distanceMeters > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#CCFF00',
                boxShadow: '0 0 8px #CCFF00',
              }}
            />
          )}
        </div>

        {/* Responsive Text & Progress Track */}
        {isCompact ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#CCFF00',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 8px rgba(204, 255, 0, 0.35)',
                  lineHeight: 1.1,
                }}
              >
                {formattedPercent}
              </span>
            </div>
            {/* Compact Progress Bar */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '3.5px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${visualFillPercent}%`,
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #2dd4bf 0%, #CCFF00 100%)',
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '135px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                }}
              >
                Earth Explored
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#CCFF00',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 10px rgba(204, 255, 0, 0.35)',
                }}
              >
                {formattedPercent}
              </span>
            </div>

            {/* Progress Bar Container */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '5px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${visualFillPercent}%`,
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #2dd4bf 0%, #CCFF00 100%)',
                  boxShadow: '0 0 10px rgba(45, 212, 191, 0.7)',
                  transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>

            {/* Sub-label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '9.5px',
                color: 'var(--muted)',
                lineHeight: 1.1,
              }}
            >
              <span>
                {distanceMeters >= 1000
                  ? `${distanceKm.toFixed(2)} km`
                  : `${Math.round(distanceMeters)} m`}{' '}
                walked
              </span>
              <span style={{ opacity: 0.8 }}>
                {currentTier.badge} {currentTier.name.split(' ')[0]}
              </span>
            </div>
          </div>
        )}

        <ChevronDown
          size={13}
          style={{
            color: 'var(--muted)',
            transform: detailsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </div>

      {/* Expanded Exploration Telemetry Modal / Popover */}
      {detailsOpen && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            width: '370px',
            maxWidth: 'min(370px, calc(100vw - 24px))',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(45, 212, 191, 0.35)',
            borderRadius: '18px',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.75), 0 0 24px rgba(45, 212, 191, 0.15)',
            padding: '18px',
            color: 'var(--text)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(45, 212, 191, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--teal)',
                }}
              >
                <Compass size={18} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                  Planetary Telemetry
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  Earth WGS 84 Cartographic System
                </div>
              </div>
            </div>

            <button
              onClick={() => setDetailsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Active Rank / Tier Banner */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>{currentTier.badge}</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#CCFF00' }}>
                  {currentTier.name}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Tier {TIERS.indexOf(currentTier) + 1} of {TIERS.length}
              </span>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>
              {currentTier.description}
            </p>

            {/* Tier Progress Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
              <div
                style={{
                  height: '6px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round(tierProgress * 100)}%`,
                    background: 'linear-gradient(90deg, #2dd4bf, #CCFF00)',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: 'var(--muted)',
                }}
              >
                <span>{currentTier.minKm} km</span>
                <span>
                  {tierProgress >= 1
                    ? 'Tier Complete!'
                    : `${(currentTier.maxKm - distanceKm).toFixed(2)} km to next rank`}
                </span>
                <span>
                  {currentTier.maxKm >= 1000 ? '40,075 km' : `${currentTier.maxKm} km`}
                </span>
              </div>
            </div>
          </div>

          {/* Metric Mode Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Select Active Progression Scale
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
              }}
            >
              <button
                onClick={() => setMetricMode('circumference')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  backgroundColor:
                    metricMode === 'circumference'
                      ? 'rgba(45, 212, 191, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                  border:
                    metricMode === 'circumference'
                      ? '1.5px solid var(--teal)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                  color: metricMode === 'circumference' ? 'var(--text)' : 'var(--muted)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 800 }}>🌍 Circumference</span>
                <span style={{ fontSize: '10px', opacity: 0.8, fontFamily: 'monospace' }}>
                  {formatUpTo4Decimals(circumferencePercent)}
                </span>
              </button>

              <button
                onClick={() => setMetricMode('land_area')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  backgroundColor:
                    metricMode === 'land_area'
                      ? 'rgba(45, 212, 191, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                  border:
                    metricMode === 'land_area'
                      ? '1.5px solid var(--teal)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                  color: metricMode === 'land_area' ? 'var(--text)' : 'var(--muted)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 800 }}>🗺️ Explorable Land</span>
                <span style={{ fontSize: '10px', opacity: 0.8, fontFamily: 'monospace' }}>
                  {formatUpTo4Decimals(landAreaPercent)}
                </span>
              </button>
            </div>

            {/* Visual Bar Scaling Option */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginTop: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gauge size={13} style={{ color: 'var(--teal)' }} />
                <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>Bar Fill Scale</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setVisualMode('tier')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor:
                      visualMode === 'tier' ? 'rgba(45, 212, 191, 0.2)' : 'transparent',
                    color: visualMode === 'tier' ? 'var(--teal)' : 'var(--muted)',
                    border:
                      visualMode === 'tier'
                        ? '1px solid var(--teal)'
                        : '1px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Milestone
                </button>
                <button
                  onClick={() => setVisualMode('linear')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor:
                      visualMode === 'linear' ? 'rgba(45, 212, 191, 0.2)' : 'transparent',
                    color: visualMode === 'linear' ? 'var(--teal)' : 'var(--muted)',
                    border:
                      visualMode === 'linear'
                        ? '1px solid var(--teal)'
                        : '1px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Full Earth
                </button>
              </div>
            </div>
          </div>

          {/* Cartographic Statistics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}
          >
            {/* Stat 1: Total Distance */}
            <div
              style={{
                padding: '10px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700 }}>
                DISTANCE TRAVELED
              </div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: 'var(--text)',
                  fontFamily: 'monospace',
                  marginTop: '2px',
                }}
              >
                {distanceMeters >= 1000
                  ? `${distanceKm.toFixed(3)} km`
                  : `${Math.round(distanceMeters)} m`}
              </div>
              <div style={{ fontSize: '9.5px', color: 'var(--muted)', marginTop: '2px' }}>
                of 40,075 km Earth equator
              </div>
            </div>

            {/* Stat 2: Area Uncovered */}
            <div
              style={{
                padding: '10px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700 }}>
                AREA UNCOVERED
              </div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: 'var(--teal)',
                  fontFamily: 'monospace',
                  marginTop: '2px',
                }}
              >
                {uncoveredKm2.toFixed(3)} km²
              </div>
              <div style={{ fontSize: '9.5px', color: 'var(--muted)', marginTop: '2px' }}>
                of 148.94M km² landmass
              </div>
            </div>

            {/* Stat 3: H3 Res-10 Cells */}
            <div
              style={{
                padding: '10px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700 }}>
                HEX CELLS CLEARED
              </div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: 'var(--amber)',
                  fontFamily: 'monospace',
                  marginTop: '2px',
                }}
              >
                {revealedSize.toLocaleString()}
              </div>
              <div style={{ fontSize: '9.5px', color: 'var(--muted)', marginTop: '2px' }}>
                ~0.015 km² per res-10 hex
              </div>
            </div>

            {/* Stat 4: Earth Ratio */}
            <div
              style={{
                padding: '10px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700 }}>
                PLANETARY RATIO
              </div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#CCFF00',
                  fontFamily: 'monospace',
                  marginTop: '2px',
                }}
              >
                {formattedPercent}
              </div>
              <div style={{ fontSize: '9.5px', color: 'var(--muted)', marginTop: '2px' }}>
                Accurate to 4 decimal places
              </div>
            </div>
          </div>

          {/* Verification Footnote */}
          <div
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(45, 212, 191, 0.06)',
              border: '1px solid rgba(45, 212, 191, 0.15)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={14} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '10px', color: 'var(--muted)', lineHeight: 1.35 }}>
              <strong>Scientific Verification:</strong> Progress is calculated continuously from your
              real GPS / travel track against the 40,075,017 m equatorial circumference and 148,940,000 km²
              explorable land area. Every ~40 m walked advances the counter by 0.0001%.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
