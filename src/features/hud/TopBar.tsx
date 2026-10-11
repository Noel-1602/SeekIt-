import { useState, useEffect } from 'react';
import { Home, Compass, ChevronRight, History, Settings } from 'lucide-react';
import { ProgressionBar } from './ProgressionBar';
import { useFog } from '../../store/fog';

export interface TopBarProps {
  onReturnHome?: () => void;
  onOpenSettings: () => void;
  isHudOpen: boolean;
  onToggleHud: () => void;
}

/**
 * Unified, responsive Top Navigation Bar spanning across the map.
 * Combines Left [Home | HUD Drawer] island, Center [Planetary Progression] pill,
 * and Right [Replay | Settings] action cluster with zero collisions on any screen size.
 */
export function TopBar({
  onReturnHome,
  onOpenSettings,
  isHudOpen,
  onToggleHud,
}: TopBarProps) {
  const replay = useFog((state) => state.replay);
  const startReplay = useFog((state) => state.startReplay);
  const stopReplay = useFog((state) => state.stopReplay);

  // Track compact viewport to render space-optimized buttons on mobile
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header
      style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {/* Left Island: Unified [ Home | HUD Drawer ] */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: '16px',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          pointerEvents: 'auto',
          flexShrink: 0,
        }}
      >
        {onReturnHome && (
          <button
            onClick={onReturnHome}
            title="Return to Landing Page & Overview"
            aria-label="Return to Landing Page"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#CCFF00',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(204, 255, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Home size={18} />
          </button>
        )}

        {onReturnHome && (
          <div
            style={{
              width: '1px',
              height: '18px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
            }}
          />
        )}

        <button
          onClick={onToggleHud}
          title={isHudOpen ? 'Close Telemetry Drawer (Esc)' : 'Open Exploration Telemetry'}
          aria-label="Toggle Exploration HUD"
          aria-expanded={isHudOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '0 10px',
            height: '38px',
            backgroundColor: isHudOpen ? 'rgba(45, 212, 191, 0.18)' : 'transparent',
            border: 'none',
            color: isHudOpen ? 'var(--teal)' : 'var(--text)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!isHudOpen) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
          }}
          onMouseLeave={(e) => {
            if (!isHudOpen) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Compass size={17} />
          <ChevronRight
            size={13}
            style={{
              transform: isHudOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              color: isHudOpen ? 'var(--teal)' : 'var(--muted)',
            }}
          />
        </button>
      </div>

      {/* Center: Responsive Planetary Progression Pill */}
      <div
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0,
          flexShrink: 1,
        }}
      >
        <ProgressionBar />
      </div>

      {/* Right Action Cluster: [ Replay | Settings ] */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'auto',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => (replay.active ? stopReplay() : startReplay())}
          title="Toggle Timeline Replay"
          aria-label="Toggle Timeline Replay"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: '38px',
            padding: isCompact ? '0 10px' : '0 14px',
            borderRadius: '16px',
            backgroundColor: replay.active ? 'var(--teal)' : 'rgba(15, 23, 42, 0.88)',
            color: replay.active ? 'var(--void)' : 'var(--text)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!replay.active) e.currentTarget.style.borderColor = 'var(--teal)';
          }}
          onMouseLeave={(e) => {
            if (!replay.active) e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <History size={16} />
          {!isCompact && <span>Replay</span>}
        </button>

        <button
          onClick={onOpenSettings}
          title="Settings & Presentation Tools"
          aria-label="Settings"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '16px',
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--teal)';
            e.currentTarget.style.color = 'var(--teal)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text)';
          }}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}

export default TopBar;
