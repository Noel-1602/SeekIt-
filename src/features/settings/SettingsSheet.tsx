import { useState } from 'react';
import { useFog } from '../../store/fog';
import { useCapsules } from '../../store/capsules';
import { usePrivacy } from '../privacy/privacy';
import { seedDemoJourney } from '../seed/seedJourney';
import { db } from '../../db';
import { DEFAULT_START } from '../../config';
import {
  X,
  Sparkles,
  ShieldAlert,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react';

export interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsSheet({ isOpen, onClose }: SettingsSheetProps) {
  const position = useFog((state) => state.position);
  const revealedSize = useFog((state) => state.revealed.size);
  const resetFog = useFog((state) => state.resetFog);

  const capsules = useCapsules((state) => state.capsules);
  const hydrateCapsules = useCapsules((state) => state.hydrateCapsules);

  const privateCells = usePrivacy((state) => state.privateCells);
  const addPrivateZone = usePrivacy((state) => state.addPrivateZone);
  const clearPrivacy = usePrivacy((state) => state.clearPrivacy);

  const [isSeeding, setIsSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const center = position ?? DEFAULT_START;
      const res = await seedDemoJourney(center);
      showToast(`Seeded ${res.cellsCount} cells and ${res.capsulesCount} demo capsules!`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleMarkPrivate = async () => {
    const center = position ?? DEFAULT_START;
    const count = await addPrivateZone(center);
    showToast(`Marked ${count} cells (~260m radius) as Private Zone!`);
  };

  const handleResetAll = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all data (revealed fog, capsules, and privacy zones)?'
    );
    if (!confirmed) return;

    await resetFog();
    await clearPrivacy();
    await db.capsules.clear();
    await hydrateCapsules();

    showToast('All journey data has been reset.');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          height: '100%',
          backgroundColor: '#121923',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-12px 0 36px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          animation: 'slideInRight 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 20px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--teal)" />
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
              Settings & Tools
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div
            style={{
              margin: '12px 20px 0',
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: 'var(--teal-dim)',
              border: '1px solid var(--teal)',
              color: 'var(--text)',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Check size={14} color="var(--teal)" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content sections */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Presentation & Demo */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
              }}
            >
              Demo & Presentations
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>
                Instantly generates a rich ~250-cell path with sample Story, Photo, and Sealed capsules for demonstrating features.
              </div>

              <button
                onClick={handleSeed}
                disabled={isSeeding}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--teal)',
                  color: 'var(--void)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(45, 212, 191, 0.3)',
                }}
              >
                <Sparkles size={15} />
                <span>{isSeeding ? 'Seeding Path...' : 'Seed Demo Journey'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Privacy Zones */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
              }}
            >
              Privacy Zones
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>
                Designate a 4-ring radius (~260m) around your current location as private. Movements within private zones are not uncovered, and no capsules can be dropped.
              </div>

              <div style={{ fontSize: '11px', color: 'var(--teal)', fontWeight: 600 }}>
                Active Private Cells: {privateCells.size}
              </div>

              <button
                onClick={handleMarkPrivate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--surface-hover)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <ShieldAlert size={15} color="var(--amber)" />
                <span>Mark Current Area as Private</span>
              </button>
            </div>
          </div>

          {/* Section 3: Data Stats */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
              }}
            >
              Stored Data Summary
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              <div
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Revealed Hexes
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--teal)', marginTop: '2px' }}>
                  {revealedSize}
                </div>
              </div>

              <div
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Capsules Stored
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--amber)', marginTop: '2px' }}>
                  {capsules.length}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Reset Danger Zone */}
          <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
            <button
              onClick={handleResetAll}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
              <span>Reset All Journey Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsSheet;
