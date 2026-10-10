import { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Lock,
  Layers,
  ArrowRight,
  ShieldCheck,
  HardDrive,
  EyeOff,
  BatteryCharging,
  Play,
  Pause,
  ExternalLink,
  ChevronDown,
  Navigation,
  Sparkles,
} from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onLaunchApp: () => void;
}

export const LandingPage = ({ onLaunchApp }: LandingPageProps) => {
  // Voice capsule interactive preview state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(14);

  useEffect(() => {
    let interval: number | null = null;
    if (isPlayingAudio) {
      interval = window.setInterval(() => {
        setAudioSeconds((prev) => (prev >= 60 ? 0 : prev + 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingAudio]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="seekit-landing">
      {/* 1. Navigation */}
      <header className="nb-nav-wrapper">
        <div className="landing-container">
          <nav className="nb-nav" aria-label="Main Navigation">
            <a href="#" className="nb-brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <div className="nb-brand-logo">
                <Compass size={20} strokeWidth={2.6} aria-hidden="true" />
                <span>SEEKIT</span>
              </div>
              <span className="nb-brand-meta">OFFLINE-FIRST // MAP JOURNAL</span>
            </a>

            <ul className="nb-nav-links">
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('how-it-works');
                  }}
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#capsules"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('capsules');
                  }}
                >
                  Capsules
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('privacy');
                  }}
                >
                  Privacy
                </a>
              </li>
            </ul>

            <button
              type="button"
              className="nb-nav-cta"
              onClick={onLaunchApp}
              title="Launch SeekIt interactive map"
            >
              <span>Explore the Map</span>
              <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* 2. Hero Section */}
        <section className="hero-section" aria-labelledby="hero-heading">
          <div className="landing-container">
            <div className="hero-header-block">
              <div className="nb-kicker">
                <span className="kicker-dot" aria-hidden="true" />
                <span>GEOSPATIAL EXPEDITION ENGINE</span>
                <span style={{ color: '#94a3b8' }}>//</span>
                <span>UBER H3 RES-10</span>
              </div>

              <h1 id="hero-heading" className="hero-headline">
                The world is full of things <mark>you haven't found yet.</mark>
              </h1>

              <p className="hero-description">
                SeekIt is a mobile-first map journal starting in complete planetary fog.
                Physical movement uncovers territory cell by cell via Uber H3 hexagons.
                Anchor text reflections, raw photos, and voice notes to the ground you uncover—some sealed until you retrace your steps.
              </p>

              <div className="hero-cta-group">
                <button
                  type="button"
                  className="btn-tactile-primary"
                  onClick={onLaunchApp}
                >
                  <Navigation size={18} strokeWidth={2.4} aria-hidden="true" />
                  <span>Explore the Map</span>
                  <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="btn-tactile-secondary"
                  onClick={() => scrollToSection('how-it-works')}
                >
                  <span>How it works</span>
                  <ChevronDown size={18} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </div>

              <div className="hero-meta-badges">
                <span className="hero-badge-pill">
                  <HardDrive size={13} color="#0d9488" aria-hidden="true" />
                  IndexedDB Local Persistence
                </span>
                <span className="hero-badge-pill">
                  <ShieldCheck size={13} color="#0d9488" aria-hidden="true" />
                  Zero Cloud Sync Required
                </span>
                <span className="hero-badge-pill">
                  <Layers size={13} color="#0d9488" aria-hidden="true" />
                  Keyless OpenFreeMap Tiles
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. How It Works Section */}
        <section id="how-it-works" className="how-it-works-section" aria-labelledby="hiw-heading">
          <div className="landing-container">
            <div className="section-header-block">
              <span className="section-number">01 // WORKFLOW</span>
              <h2 id="hiw-heading" className="section-title">
                Three principles. Pure movement.
              </h2>
              <p className="section-lead">
                No gamified points or social feeds. Exploration is the engine: without physical movement through space, the map stays dark.
              </p>
            </div>

            <div className="steps-grid">
              {/* Step 1 */}
              <article className="step-card">
                <div className="step-card-num-badge">01</div>
                <div className="step-card-icon-wrap">
                  <Compass size={28} strokeWidth={2.2} color="#111113" aria-hidden="true" />
                </div>
                <h3 className="step-card-title">EXPLORE</h3>
                <p className="step-card-body">
                  Start in a shroud of dark planetary fog. As you traverse streets, trails, or coastlines, your live GPS fix dissolves the fog into crisp Uber H3 hexagons (~65m edge). Every discovered cell remains uncovered permanently on your device.
                </p>
                <div className="step-card-specs">
                  <span className="step-spec-tag">H3 RES-10 DISK</span>
                  <span className="step-spec-tag">HAWAII & VENUE TESTED</span>
                  <span className="step-spec-tag">SPEED JUMP FILTER</span>
                </div>
              </article>

              {/* Step 2 */}
              <article className="step-card">
                <div className="step-card-num-badge">02</div>
                <div className="step-card-icon-wrap">
                  <MapPin size={28} strokeWidth={2.2} color="#111113" aria-hidden="true" />
                </div>
                <h3 className="step-card-title">LEAVE A CAPSULE</h3>
                <p className="step-card-body">
                  Plant memories directly into the ground you stand upon. Compose formatted Markdown field notes, capture uncompressed photographs, or record 60-second voice memos. Optionally seal a capsule behind a physical return lock.
                </p>
                <div className="step-card-specs">
                  <span className="step-spec-tag">MARKDOWN NOTES</span>
                  <span className="step-spec-tag">1280PX RAW PHOTOS</span>
                  <span className="step-spec-tag">60S AUDIO BLOBS</span>
                </div>
              </article>

              {/* Step 3 */}
              <article className="step-card">
                <div className="step-card-num-badge">03</div>
                <div className="step-card-icon-wrap">
                  <Sparkles size={28} strokeWidth={2.2} color="#111113" aria-hidden="true" />
                </div>
                <h3 className="step-card-title">DISCOVER & REPLAY</h3>
                <p className="step-card-body">
                  Retrace your steps to unlock sealed capsules within a 1-ring radius (~65m). Scrub through the chronological timeline replay to watch your journey bloom out of the void, cell by cell, with exact temporal accuracy.
                </p>
                <div className="step-card-specs">
                  <span className="step-spec-tag">TEMPORAL SCRUBBER</span>
                  <span className="step-spec-tag">ACCUMULATED KM²</span>
                  <span className="step-spec-tag">GEOFENCE UNLOCK</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 5. Capsule Showcase Section */}
        <section id="capsules" className="capsules-section" aria-labelledby="capsules-heading">
          <div className="landing-container">
            <div className="section-header-block">
              <span className="section-number">02 // MEMORY ARTIFACTS</span>
              <h2 id="capsules-heading" className="section-title">
                Three media types. Tailored for the field.
              </h2>
              <p className="section-lead">
                Each capsule format is built for rapid field capture, local storage efficiency, and distinct visual presence on uncovered terrain.
              </p>
            </div>

            <div className="capsules-grid">
              {/* Text Capsule */}
              <article className="capsule-showcase-card type-text">
                <div className="card-header-banner banner-amber">
                  <span>[TYPE: 01 // TEXT FIELD NOTE]</span>
                  <span>MARKDOWN</span>
                </div>
                <div className="capsule-card-content">
                  <div className="index-card-lines">
                    <div className="index-card-quote">
                      "Crossed the ridge at 2,400ft. Strong headwind, but the sea fog parted right as the lighthouse beacon rotated past."
                    </div>
                    <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11px', color: '#64748b' }}>
                      #waypoints #pacific-ridge #elevation
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5, marginBottom: '16px' }}>
                    Formatted notes rendered with pure typography. Includes auto-tagged coordinates, UTC timestamps, and quick markdown formatting.
                  </p>

                  <div className="capsule-footer-specs">
                    <span>STORAGE: &lt; 4 KB</span>
                    <span>STATUS: UNSEALED</span>
                  </div>
                </div>
              </article>

              {/* Photo Capsule */}
              <article className="capsule-showcase-card type-photo">
                <div className="card-header-banner banner-teal">
                  <span>[TYPE: 02 // ARCHIVAL PHOTO]</span>
                  <span>JPEG / PNG</span>
                </div>
                <div className="photo-preview-box">
                  <img
                    src="/demo/expedition_photo.jpg"
                    alt="Expedition photo of misty mountain ridge and explorer overlooking coastal cliffs"
                    className="photo-preview-image"
                    loading="lazy"
                  />
                  <div className="photo-overlay-badge">
                    <span>LAT 37.8024° N • LNG 122.4058° W</span>
                  </div>
                </div>
                <div className="capsule-card-content">
                  <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5, marginBottom: '16px' }}>
                    Captured from phone camera or file picker. Automatically downscaled to 1280px on the longest side to preserve high fidelity while respecting device memory.
                  </p>
                  <div className="capsule-footer-specs">
                    <span>CLIENT COMPRESSION</span>
                    <span>EXIF PRESERVED</span>
                  </div>
                </div>
              </article>

              {/* Voice Capsule */}
              <article className="capsule-showcase-card type-voice">
                <div className="card-header-banner banner-acid">
                  <span>[TYPE: 03 // FIELD RECORDER]</span>
                  <span>WEBM AUDIO</span>
                </div>
                <div className="capsule-card-content">
                  <div className="voice-recorder-ui">
                    <div className="recorder-screen">
                      <span className="time-display">
                        00:{audioSeconds < 10 ? `0${audioSeconds}` : audioSeconds} / 01:00
                      </span>
                      <span className="rec-blinker">
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: isPlayingAudio ? '#22c55e' : '#ef4444',
                            display: 'inline-block',
                          }}
                        />
                        {isPlayingAudio ? 'PLAYING' : 'AUDIO READY'}
                      </span>
                    </div>

                    <div className="waveform-bars" aria-label="Audio waveform visualizer">
                      {[18, 28, 14, 32, 24, 16, 36, 20, 30, 26, 12, 34, 22, 16, 38, 28, 14, 32].map((height, i) => (
                        <div
                          key={i}
                          className="wave-bar"
                          style={{
                            height: isPlayingAudio
                              ? `${Math.max(8, (height + (audioSeconds * 7) % 24))}px`
                              : `${height}px`,
                            background: i % 3 === 0 ? '#d4ff00' : '#00e5be',
                            transition: 'height 0.1s ease',
                          }}
                        />
                      ))}
                    </div>

                    <div className="voice-controls-row">
                      <button
                        type="button"
                        className="btn-play-voice"
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      >
                        {isPlayingAudio ? (
                          <>
                            <Pause size={13} fill="#111113" aria-hidden="true" />
                            <span>Pause Memo</span>
                          </>
                        ) : (
                          <>
                            <Play size={13} fill="#111113" aria-hidden="true" />
                            <span>Preview Audio</span>
                          </>
                        )}
                      </button>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>SAMPLE_RATE: 44.1kHz</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5, marginBottom: '16px' }}>
                    Ambient environmental audio or spoken journal entries up to 60 seconds. Encoded in browser MediaRecorder and stored as raw binary blobs in IndexedDB.
                  </p>

                  <div className="capsule-footer-specs">
                    <span>LIMIT: 60 SEC</span>
                    <span>DIRECT BLOB STORAGE</span>
                  </div>
                </div>
              </article>
            </div>

            {/* Sealed Capsule Mechanism Banner */}
            <div className="sealed-feature-banner" role="region" aria-label="Sealed Capsule Feature">
              <div className="sealed-banner-icon">
                <Lock size={32} strokeWidth={2.4} aria-hidden="true" />
              </div>
              <div>
                <h3 className="sealed-banner-title">
                  Sealed Capsules: Memories locked behind physical return
                </h3>
                <p className="sealed-banner-body">
                  Toggle “Seal it” when dropping a memory. The capsule locks down with a padlock pin on the map.
                  It will not open until your physical coordinates return to within 1 H3 cell ring (~65 meters).
                  Walk away, and the lock snaps shut again. No remote passwords. No bypasses.
                </p>
              </div>
              <div>
                <span className="sealed-badge-chip">SEAL_OPEN_K = 1 RING (~65M)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Privacy Section */}
        <section id="privacy" className="privacy-section" aria-labelledby="privacy-heading">
          <div className="landing-container">
            <div className="section-header-block">
              <span className="section-number">03 // TRANSPARENT SECURITY</span>
              <h2 id="privacy-heading" className="section-title">
                Location-based. Zero cloud telemetry.
              </h2>
              <p className="section-lead">
                We believe in architectural honesty over marketing claims. Here is exactly how your coordinates and media are treated by the software.
              </p>
            </div>

            <div className="privacy-grid">
              {/* Privacy Pillar 1 */}
              <article className="privacy-card">
                <div className="privacy-card-icon lime">
                  <HardDrive size={24} color="#111113" strokeWidth={2.2} aria-hidden="true" />
                </div>
                <h3 className="privacy-card-title">100% Local IndexedDB</h3>
                <p className="privacy-card-body">
                  Every uncovered H3 cell, photo blob, audio recording, and note is committed straight to Dexie (IndexedDB) on your device. No user accounts, no analytics SDKs, no tracking pixels, and no remote servers holding your movement path.
                </p>
                <div className="privacy-spec-chip">STORAGE: DEXIE.JS ON DEVICE</div>
              </article>

              {/* Privacy Pillar 2 */}
              <article className="privacy-card">
                <div className="privacy-card-icon teal">
                  <EyeOff size={24} color="#111113" strokeWidth={2.2} aria-hidden="true" />
                </div>
                <h3 className="privacy-card-title">Configurable Privacy Zones</h3>
                <p className="privacy-card-body">
                  Mark your home, workplace, or private refuge as a Privacy Zone with a single tap. The movement ingestion pipeline checks every incoming fix against your exclusion radius (PRIVACY_K = 4 rings) and suppresses reveals and capsule creation.
                </p>
                <div className="privacy-spec-chip">RADIUS: 4 RINGS (~260M)</div>
              </article>

              {/* Privacy Pillar 3 */}
              <article className="privacy-card">
                <div className="privacy-card-icon coral">
                  <BatteryCharging size={24} strokeWidth={2.2} aria-hidden="true" />
                </div>
                <h3 className="privacy-card-title">Realistic Web Limitations</h3>
                <p className="privacy-card-body">
                  Modern browsers cannot track background GPS when the screen is asleep. SeekIt engages the Screen Wake Lock API to prevent sleep while tracking. If you clear browser cache or storage, your database resets. We do not invent cloud magic.
                </p>
                <div className="privacy-spec-chip">SCREEN WAKE LOCK API</div>
              </article>
            </div>
          </div>
        </section>

        {/* 7. Closing CTA Section */}
        <section className="closing-cta-section" aria-labelledby="cta-heading">
          <div className="landing-container">
            <div className="closing-cta-box">
              <span className="nb-kicker" style={{ background: '#ffffff', marginBottom: '20px' }}>
                <span className="kicker-dot" aria-hidden="true" />
                READY FOR EXPEDITION
              </span>

              <h2 id="cta-heading" className="closing-cta-headline">
                The fog is waiting. Step outside and start uncovering.
              </h2>

              <p className="closing-cta-sub">
                Explore real terrain with live device GPS, or test drive the interactive path walk simulator directly on your laptop.
              </p>

              <div className="closing-cta-buttons">
                <button
                  type="button"
                  className="btn-cta-dark"
                  onClick={onLaunchApp}
                >
                  <span>Launch SeekIt Map</span>
                  <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="btn-tactile-secondary"
                  onClick={() => {
                    onLaunchApp();
                  }}
                >
                  <span>Demo Simulator Mode</span>
                  <ExternalLink size={16} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Compact Footer */}
      <footer className="nb-footer">
        <div className="landing-container">
          <div className="footer-top">
            <div className="footer-brand">
              <Compass size={18} strokeWidth={2.5} color="#d4ff00" aria-hidden="true" />
              <span>SEEKIT</span>
              <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>v0.1-BETA</span>
            </div>

            <div className="footer-links">
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('how-it-works');
                }}
              >
                How it works
              </a>
              <a
                href="#capsules"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('capsules');
                }}
              >
                Capsules
              </a>
              <a
                href="#privacy"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('privacy');
                }}
              >
                Privacy Zones
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Back to top ↑
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <div>
              <span>Tiles © OpenFreeMap & OpenStreetMap contributors • H3 Spatial Index © Uber Technologies • MapLibre GL JS</span>
            </div>
            <div className="footer-status-pill">
              <span className="status-dot" aria-hidden="true" />
              <span>OFFLINE STORAGE ENGINE READY</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
