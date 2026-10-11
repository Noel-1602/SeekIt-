import { useState } from 'react';
import {
  FileText,
  Camera,
  Mic,
  Lock,
  Unlock,
  Play,
  Pause,
  Volume2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

type CapsuleTab = 'text' | 'photo' | 'voice' | 'sealed';

export function InteractiveCapsuleShowcase() {
  const [activeTab, setActiveTab] = useState<CapsuleTab>('photo');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isUnsealedDemo, setIsUnsealedDemo] = useState(false);

  return (
    <div
      style={{
        maxWidth: '1040px',
        margin: '0 auto',
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#CCFF00',
            border: '2.5px solid #111111',
            boxShadow: '3px 3px 0px #111111',
            padding: '6px 14px',
            borderRadius: '999px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          <Sparkles size={14} />
          <span>Physical Anchor Engine</span>
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 800,
            color: '#111111',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '14px',
          }}
        >
          Memories anchored to the physical world.
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '17px',
            color: '#444444',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          SeekIt capsules are living digital relics planted at exact GPS coordinates.
          They hold authentic reflections, sensory voice dispatches, and analog photographs.
        </p>
      </div>

      {/* Interactive Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '32px',
        }}
      >
        {[
          { id: 'photo', label: 'Photo Capsule', icon: Camera, color: '#CCFF00' },
          { id: 'voice', label: 'Voice Recording', icon: Mic, color: '#2DD4BF' },
          { id: 'text', label: 'Field Journal', icon: FileText, color: '#FFB800' },
          { id: 'sealed', label: 'Sealed Memory', icon: Lock, color: '#FF4D4D' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CapsuleTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '12px',
                border: '3px solid #111111',
                backgroundColor: isActive ? tab.color : '#FFFDF9',
                color: '#111111',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: isActive ? '5px 5px 0px #111111' : '2px 2px 0px #111111',
                transform: isActive ? 'translate(-2px, -2px)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Capsule Card Display */}
      <div
        style={{
          backgroundColor: '#FFFDF9',
          border: '3.5px solid #111111',
          borderRadius: '24px',
          boxShadow: '10px 10px 0px #111111',
          padding: 'clamp(20px, 4vw, 36px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'center',
        }}
      >
        {/* Left: Capsule Object Visual */}
        <div style={{ position: 'relative' }}>
          {activeTab === 'photo' && (
            <div
              style={{
                backgroundColor: '#FFF',
                border: '3px solid #111111',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '6px 6px 0px #111111',
                transform: 'rotate(-1.5deg)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '4 / 3',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '2px solid #111111',
                  marginBottom: '14px',
                }}
              >
                <img
                  src="/landing/capsule_pier.jpg"
                  alt="Foggy Pier Memory"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(17, 17, 17, 0.85)',
                    color: '#CCFF00',
                    border: '1.5px solid #CCFF00',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                  }}
                >
                  35MM RAW SNAP
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: '#666',
                  borderTop: '2px dashed #DDD',
                  paddingTop: '10px',
                }}
              >
                <span style={{ fontWeight: 700, color: '#111' }}>
                  LAT 37.8085° N · LON 122.4098° W
                </span>
                <span>OCT 10 · 18:42</span>
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div
              style={{
                backgroundColor: '#111111',
                color: '#FFFDF9',
                border: '3px solid #2DD4BF',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '6px 6px 0px #2DD4BF',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#2DD4BF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  <Volume2 size={16} />
                  <span>SPATIAL VOICE RECORDING</span>
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(45, 212, 191, 0.2)',
                    color: '#2DD4BF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                  }}
                >
                  MAX 60 SECONDS
                </div>
              </div>

              {/* Live Waveform Equalizer */}
              <div
                style={{
                  height: '80px',
                  backgroundColor: '#192230',
                  borderRadius: '10px',
                  border: '2px solid #2DD4BF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '0 16px',
                  marginBottom: '18px',
                }}
              >
                {[14, 28, 45, 22, 60, 38, 55, 70, 48, 62, 30, 52, 68, 42, 26, 50, 64, 33, 20, 40].map(
                  (val, i) => (
                    <div
                      key={i}
                      style={{
                        width: '4px',
                        height: isPlayingAudio ? `${Math.max(8, (val * 1.1) % 65)}px` : `${val * 0.7}px`,
                        backgroundColor: i < 10 ? '#2DD4BF' : '#5A758D',
                        borderRadius: '2px',
                        transition: 'height 0.15s ease',
                      }}
                    />
                  )
                )}
              </div>

              {/* Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  style={{
                    backgroundColor: '#2DD4BF',
                    color: '#111111',
                    border: '2px solid #111111',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0px #111111',
                  }}
                >
                  {isPlayingAudio ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#2DD4BF' }}>
                  {isPlayingAudio ? '00:24 / 00:46' : '00:00 / 00:46'}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#8B98A5',
                  }}
                >
                  HIGH FIDELITY OPUS
                </div>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div
              style={{
                backgroundColor: '#FFFDF9',
                border: '3px solid #111111',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '6px 6px 0px #111111',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  borderBottom: '2px solid #111111',
                  paddingBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: '#FFB800',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1.5px solid #111111',
                  }}
                >
                  MARKDOWN FIELD LOG
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#777' }}>
                  SECTOR #42-B
                </div>
              </div>

              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 800,
                  marginBottom: '8px',
                  color: '#111111',
                }}
              >
                The Hidden Overlook Behind the Pines
              </h4>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#333333',
                  marginBottom: '12px',
                }}
              >
                "If you take the overgrown gravel trail past the stone marker and walk 120 paces
                north, there's a forgotten wooden bench with the best morning view of the bay."
              </p>

              <div
                style={{
                  backgroundColor: '#F5F2EB',
                  border: '1.5px solid #111111',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: '#111111',
                }}
              >
                # Coordinates: 37°46'32"N 122°24'11"W<br />
                # Tip: Best during low tide sunrise
              </div>
            </div>
          )}

          {activeTab === 'sealed' && (
            <div
              style={{
                backgroundColor: isUnsealedDemo ? '#F0FFF4' : '#FFF5F5',
                border: isUnsealedDemo ? '3px solid #10B981' : '3px solid #FF4D4D',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: isUnsealedDemo ? '6px 6px 0px #10B981' : '6px 6px 0px #FF4D4D',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: isUnsealedDemo ? '#10B981' : '#FF4D4D',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '3px solid #111111',
                  boxShadow: '4px 4px 0px #111111',
                }}
              >
                {isUnsealedDemo ? <Unlock size={32} /> : <Lock size={32} />}
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: isUnsealedDemo ? '#10B981' : '#FF4D4D',
                  marginBottom: '6px',
                }}
              >
                {isUnsealedDemo ? 'SEAL BROKEN · MEMORY REVEALED' : 'PHYSICAL PROXIMITY LOCK ACTIVATED'}
              </div>

              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#111111',
                  marginBottom: '10px',
                }}
              >
                {isUnsealedDemo
                  ? 'Congratulations! You reached the landmark.'
                  : 'Locked Secret: Only Opens In Person'}
              </h4>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: '#555',
                  marginBottom: '16px',
                  lineHeight: 1.5,
                }}
              >
                {isUnsealedDemo
                  ? 'Secret coordinate unlocked: "Under the iron compass dial lies the traveler\'s guestbook."'
                  : 'You must physically stand within 1 H3 cell (~100 meters) of these coordinates to reveal its contents.'}
              </p>

              <button
                onClick={() => setIsUnsealedDemo(!isUnsealedDemo)}
                style={{
                  backgroundColor: '#111111',
                  color: '#FFF',
                  border: '2px solid #111111',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px #888',
                }}
              >
                {isUnsealedDemo ? 'RESET LOCK TEST' : 'SIMULATE WALKING WITHIN 100M'}
              </button>
            </div>
          )}
        </div>

        {/* Right: Technical Explanation & Benefits */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 800,
              color: '#CCFF00',
              backgroundColor: '#111111',
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '6px',
              marginBottom: '12px',
            }}
          >
            OBJECT SPECIFICATION // V0.1
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 800,
              color: '#111111',
              lineHeight: 1.2,
              marginBottom: '14px',
            }}
          >
            {activeTab === 'photo' && 'Analog-grade visual time capsules.'}
            {activeTab === 'voice' && 'Capture the ambience of the moment.'}
            {activeTab === 'text' && 'Rich markdown notes, clues & field maps.'}
            {activeTab === 'sealed' && 'Spatial cryptography: earn every discovery.'}
          </h3>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#444444',
              marginBottom: '20px',
            }}
          >
            {activeTab === 'photo' &&
              'Snap a scene with your phone camera or upload a field photo. Each photo is stamped with exact latitude, longitude, and elevation. It remains permanently pinned to the map tile where you stood.'}
            {activeTab === 'voice' &&
              'Record up to 60 seconds of unfiltered local soundscapes—the crash of waves, rustling forest winds, or whispered directions. High-efficiency local audio encoding plays directly inside the cartographic viewer.'}
            {activeTab === 'text' &&
              'Write full markdown notes, trail guides, poetry, or secret tips. Includes headings, checklists, blockquotes, and code snippets for geocaching puzzle solvers.'}
            {activeTab === 'sealed' &&
              'Turn ordinary travel into an unforgettable real-world treasure hunt. Sealed capsules show a padlock pin on the map. Walk away and they remain hidden; arrive within 1 cell and they unlock instantly.'}
          </p>

          {/* Bullet specifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#111" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600 }}>
                Instant IndexedDB offline persistence
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#111" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600 }}>
                Zero battery-draining background sync
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#111" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600 }}>
                Timeline replay engine recreates your footsteps
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
