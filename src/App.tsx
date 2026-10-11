import { useEffect, useState } from 'react';
import { MapView } from './map/MapView';
import { UserDot } from './map/UserDot';
import { SimControls } from './map/SimControls';
import { PinsLayer } from './features/capsules/PinsLayer';
import { Composer } from './features/capsules/Composer';
import { Viewer } from './features/capsules/Viewer';
import { DeleteMemoryModal } from './features/capsules/DeleteMemoryModal';
import { ReplayBar } from './features/replay/ReplayBar';
import { SettingsSheet } from './features/settings/SettingsSheet';
import { useFog } from './store/fog';
import { useCapsules } from './store/capsules';
import { setMode } from './location/mode';
import { locateMe } from './map/mapActions';
import { TopBar } from './features/hud/TopBar';
import { HudDrawer } from './features/hud/Hud';
import {
  Navigation,
  Sparkles,
} from 'lucide-react';
import { LandingPage } from './features/landing/LandingPage';

/**
 * Floating button to open the Capsule Composer.
 */
function AddCapsuleButton() {
  const setComposerOpen = useCapsules((state) => state.setComposerOpen);
  const setSelectedId = useCapsules((state) => state.setSelectedId);
  const replayActive = useFog((state) => state.replay.active);

  if (replayActive) return null;

  return (
    <button
      onClick={() => {
        setSelectedId(null);
        setComposerOpen(true);
      }}
      title="Add Memory at current spot"
      aria-label="Add Memory at current spot"
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
      aria-label="Locate Me (Center Camera)"
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
  const [hudOpen, setHudOpen] = useState(false);
  const replayActive = useFog((state) => state.replay.active);
  const [view, setView] = useState<'landing' | 'map'>(() => {
    return window.location.hash === '#map' || window.location.search.includes('view=map')
      ? 'map'
      : 'landing';
  });

  // Listen to hash changes for browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#map') {
        setView('map');
      } else if (window.location.hash === '' || window.location.hash === '#') {
        setView('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleExplore = (source: 'gps' | 'sim' = 'sim') => {
    void setMode(source);
    setView('map');
    window.location.hash = 'map';
  };

  const handleReturnHome = () => {
    setView('landing');
    window.location.hash = '';
  };

  if (view === 'landing') {
    return <LandingPage onExplore={handleExplore} />;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapView>
        <PinsLayer />
        <UserDot />
        {!replayActive && <SimControls />}
        <TopBar
          onReturnHome={handleReturnHome}
          onOpenSettings={() => setSettingsOpen(true)}
          isHudOpen={hudOpen}
          onToggleHud={() => setHudOpen((prev) => !prev)}
        />
        <HudDrawer isOpen={hudOpen} onClose={() => setHudOpen(false)} />
        <AddCapsuleButton />
        <LocateMeButton />
      </MapView>

      <ReplayBar />
      <Composer />
      <Viewer />
      <DeleteMemoryModal />
      <SettingsSheet isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
