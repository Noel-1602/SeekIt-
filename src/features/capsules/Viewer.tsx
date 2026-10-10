import { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useCapsules, canOpen } from '../../store/capsules';
import { useFog } from '../../store/fog';
import { haversineDistanceKm } from '../../location/ingest';
import {
  X,
  Lock,
  Unlock,
  MapPin,
  Calendar,
  FileText,
  Camera,
  Mic,
  Navigation,
} from 'lucide-react';

export function Viewer() {
  const selectedId = useCapsules((state) => state.selectedId);
  const setSelectedId = useCapsules((state) => state.setSelectedId);
  const capsules = useCapsules((state) => state.capsules);
  const userPosition = useFog((state) => state.position);

  const capsule = useMemo(() => {
    return capsules.find((c) => c.id === selectedId) || null;
  }, [capsules, selectedId]);

  // Object URL for blob (photo or voice)
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!capsule?.blob) {
      setBlobUrl(null);
      return;
    }

    const url = URL.createObjectURL(capsule.blob);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [capsule?.blob]);

  if (!selectedId || !capsule) return null;

  const isUnlocked = canOpen(capsule, userPosition);

  // Compute distance from user position in meters
  const distanceMeters = userPosition
    ? Math.round(haversineDistanceKm(userPosition, { lat: capsule.lat, lng: capsule.lng }) * 1000)
    : null;

  const dateString = new Date(capsule.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleClose = () => {
    setSelectedId(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '85vh',
          backgroundColor: '#121923',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Type badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: 'var(--amber-dim)',
                color: 'var(--amber)',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {capsule.type === 'text' && <FileText size={13} />}
              {capsule.type === 'photo' && <Camera size={13} />}
              {capsule.type === 'voice' && <Mic size={13} />}
              <span>{capsule.type} Capsule</span>
            </div>

            {/* Sealed status badge */}
            {capsule.sealed && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  backgroundColor: isUnlocked
                    ? 'rgba(45, 212, 191, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  color: isUnlocked ? 'var(--teal)' : '#f87171',
                  border: isUnlocked
                    ? '1px solid rgba(45, 212, 191, 0.3)'
                    : '1px solid rgba(239, 68, 68, 0.3)',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {isUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
                <span>{isUnlocked ? 'Unlocked' : 'Sealed'}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
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

        {/* Content Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Title & Metadata */}
          <div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--text)',
                letterSpacing: '-0.01em',
                marginBottom: '8px',
              }}
            >
              {capsule.title || 'Untitled Memory'}
            </h2>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '11px',
                color: 'var(--muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} color="var(--amber)" />
                <span>{dateString}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="var(--amber)" />
                <span>
                  {capsule.lat.toFixed(5)}, {capsule.lng.toFixed(5)}
                </span>
              </div>
            </div>
          </div>

          {/* Locked State View */}
          {!isUnlocked && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '36px 20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(245, 185, 66, 0.05)',
                border: '1.5px dashed rgba(245, 185, 66, 0.35)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--amber-dim)',
                  color: 'var(--amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(245, 185, 66, 0.3)',
                }}
              >
                <Lock size={28} />
              </div>

              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
                  This Capsule is Sealed
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                    maxWidth: '280px',
                    marginTop: '4px',
                    lineHeight: 1.5,
                  }}
                >
                  Return to this spot (within ~65 meters) to open and view the memory.
                </div>
              </div>

              {distanceMeters !== null && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--amber)',
                  }}
                >
                  <Navigation size={13} />
                  <span>Currently {distanceMeters}m away</span>
                </div>
              )}
            </div>
          )}

          {/* Unlocked Content View */}
          {isUnlocked && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Photo Display */}
              {capsule.type === 'photo' && blobUrl && (
                <div
                  style={{
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    maxHeight: '340px',
                    backgroundColor: '#000',
                  }}
                >
                  <img
                    src={blobUrl}
                    alt={capsule.title || 'Capsule Photo'}
                    style={{
                      width: '100%',
                      height: '100%',
                      maxHeight: '340px',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>
              )}

              {/* Voice Player */}
              {capsule.type === 'voice' && blobUrl && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--amber)',
                    }}
                  >
                    <Mic size={14} />
                    <span>Voice Note</span>
                  </div>
                  <audio
                    src={blobUrl}
                    controls
                    style={{ width: '100%', height: '40px', outline: 'none' }}
                  />
                </div>
              )}

              {/* Text / Markdown Body */}
              {capsule.text && (
                <div
                  className="capsule-markdown-content"
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: 'var(--text)',
                    backgroundColor:
                      capsule.type !== 'text' ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                    padding: capsule.type !== 'text' ? '12px 14px' : '0',
                    borderRadius: '10px',
                  }}
                >
                  <ReactMarkdown>{capsule.text}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Viewer;
