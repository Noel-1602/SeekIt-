import { useState } from 'react';
import {
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
  Shield,
  EyeOff,
  Radio,
  Footprints,
  Lock,
  ChevronDown,
  Navigation,
  HelpCircle,
} from 'lucide-react';
import { InteractiveCapsuleShowcase } from './InteractiveCapsuleShowcase';

interface LandingPageProps {
  onExplore: (source?: 'gps' | 'sim') => void;
}

export function LandingPage({ onExplore }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="landing-scroll-container">
      {/* ─────────────────────────────────────────────────────────────
          1. NEO-BRUTALIST HEADER / NAVIGATION
      ───────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#FFFDF9',
          borderBottom: '3.5px solid #111111',
          padding: '14px clamp(16px, 4vw, 36px)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Logo Badge */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#111111',
                border: '2.5px solid #111111',
                boxShadow: '3px 3px 0px #111111',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(-3deg)',
                overflow: 'hidden',
              }}
            >
              <img
                src="/logo.png"
                alt="SeekIt Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  color: '#111111',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>SeekIt</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: '#111111',
                    color: '#CCFF00',
                    padding: '2px 5px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  v0.1
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: '#666',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                CARTOGRAPHIC MEMORY ATLAS
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
            className="landing-nav-links"
          >
            <a
              href="#features"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#111111',
                textDecoration: 'none',
                padding: '4px 8px',
              }}
            >
              Features
            </a>
            <a
              href="#capsules"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#111111',
                textDecoration: 'none',
                padding: '4px 8px',
              }}
            >
              Capsules
            </a>
            <a
              href="#privacy"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#111111',
                textDecoration: 'none',
                padding: '4px 8px',
              }}
            >
              Privacy & Trust
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => onExplore('sim')}
              title="Launch instant demo without requiring outdoor GPS"
              style={{
                backgroundColor: '#FFF',
                color: '#111111',
                border: '2.5px solid #111111',
                boxShadow: '3px 3px 0px #111111',
                borderRadius: '8px',
                padding: '8px 14px',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
              }}
            >
              Try Demo Walk
            </button>

            <button
              onClick={() => onExplore('gps')}
              style={{
                backgroundColor: '#CCFF00',
                color: '#111111',
                border: '2.5px solid #111111',
                boxShadow: '3px 3px 0px #111111',
                borderRadius: '8px',
                padding: '8px 18px',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
                e.currentTarget.style.backgroundColor = '#D4FF00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                e.currentTarget.style.backgroundColor = '#CCFF00';
              }}
            >
              <span>Explore</span>
              <ArrowRight size={15} strokeWidth={2.8} />
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(64px, 8vw, 110px) clamp(16px, 4vw, 36px) clamp(64px, 8vw, 100px)',
          maxWidth: '1040px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto' }}>
          {/* Eyebrow Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#CCFF00',
              border: '2.5px solid #111111',
              boxShadow: '4px 4px 0px #111111',
              padding: '6px 16px',
              borderRadius: '999px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}
          >
            <span style={{ fontSize: '14px' }}>⬡</span>
            <span>INVERSE FOG-OF-WAR CARTOGRAPHIC EXPEDITION</span>
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px, 6vw, 68px)',
              fontWeight: 800,
              color: '#111111',
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              marginBottom: '24px',
            }}
          >
            The world is full of things{' '}
            <span
              style={{
                backgroundColor: '#CCFF00',
                padding: '0 8px',
                border: '3px solid #111111',
                boxShadow: '4px 4px 0px #111111',
                display: 'inline-block',
                transform: 'rotate(-1deg)',
              }}
            >
              you haven't found yet.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(17px, 2.2vw, 21px)',
              color: '#333333',
              lineHeight: 1.55,
              maxWidth: '740px',
              margin: '0 auto 36px',
              fontWeight: 500,
            }}
          >
            SeekIt is a location-based discovery platform where people explore uncharted places,
            leave geocoded digital capsules, and stumble upon memories and stories left behind
            by fellow explorers. Movement lifts the dark fog along your path permanently.
          </p>

          {/* Hero CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '20px',
            }}
          >
            <button
              onClick={() => onExplore('gps')}
              style={{
                backgroundColor: '#CCFF00',
                color: '#111111',
                border: '3.5px solid #111111',
                boxShadow: '6px 6px 0px #111111',
                borderRadius: '14px',
                padding: '16px 36px',
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-3px, -3px)';
                e.currentTarget.style.boxShadow = '9px 9px 0px #111111';
                e.currentTarget.style.backgroundColor = '#D4FF00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '6px 6px 0px #111111';
                e.currentTarget.style.backgroundColor = '#CCFF00';
              }}
            >
              <span>Explore (Start GPS)</span>
              <ArrowRight size={22} strokeWidth={3} />
            </button>

            <button
              onClick={() => onExplore('sim')}
              style={{
                backgroundColor: '#FFFDF9',
                color: '#111111',
                border: '3.5px solid #111111',
                boxShadow: '6px 6px 0px #111111',
                borderRadius: '14px',
                padding: '16px 28px',
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-3px, -3px)';
                e.currentTarget.style.boxShadow = '9px 9px 0px #111111';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '6px 6px 0px #111111';
              }}
            >
              <Footprints size={20} />
              <span>Try Demo Walk</span>
            </button>
          </div>

          {/* Micro trust indicators */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#555555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <span>🔒 100% On-Device IndexedDB</span>
            <span>•</span>
            <span>🛰️ Zero Cloud Tracking</span>
            <span>•</span>
            <span>⚡ Instant Web Experience</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SCROLLING NEO-BRUTALIST MARQUEE RIBBON
      ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: '#111111',
          borderTop: '3.5px solid #111111',
          borderBottom: '3.5px solid #111111',
          padding: '14px 0',
          overflow: 'hidden',
          userSelect: 'none',
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
        }}
      >
        <div className="neo-marquee-content">
          {[1, 2].map((loop) => (
            <div
              key={loop}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '32px',
                paddingRight: '32px',
                fontFamily: 'var(--font-mono)',
                fontSize: '15px',
                fontWeight: 800,
                color: '#FFFDF9',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              <span style={{ color: '#CCFF00' }}>⬡ REAL GPS DISCOVERY</span>
              <span>✦</span>
              <span>DROP DIGITAL CAPSULES</span>
              <span>✦</span>
              <span style={{ color: '#2DD4BF' }}>UBER H3 HEXAGONAL GRID (RES-09)</span>
              <span>✦</span>
              <span>UNFOG REAL TERRAIN</span>
              <span>✦</span>
              <span style={{ color: '#FFB800' }}>SEALED PROXIMITY SECRETS</span>
              <span>✦</span>
              <span>TIMELINE REPLAY SCRUBBER</span>
              <span>✦</span>
              <span style={{ color: '#CCFF00' }}>LOCAL-FIRST PERSISTENCE</span>
              <span>✦</span>
              <span>AMBIENT AUDIO LOGS & FIELD NOTES</span>
              <span>✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. CORE FEATURES SECTION (Explore / Leave Capsule / Discover Stories)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="features"
        style={{
          padding: 'clamp(64px, 8vw, 100px) clamp(16px, 4vw, 36px)',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
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
            <span>Core Architecture</span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4.5vw, 52px)',
              fontWeight: 800,
              color: '#111111',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '16px',
            }}
          >
            How SeekIt transforms your journey.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '17px',
              color: '#555555',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            Travel is the engine. Moving through physical space is the only way to lift the fog,
            reveal hidden memories, and plant your own digital footprints.
          </p>
        </div>

        {/* Three Core Feature Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
          }}
        >
          {/* Feature 1: Explore */}
          <div
            style={{
              backgroundColor: '#FFFDF9',
              border: '3.5px solid #111111',
              borderRadius: '20px',
              padding: '32px 28px',
              boxShadow: '8px 8px 0px #111111',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-3px, -3px)';
              e.currentTarget.style.boxShadow = '11px 11px 0px #111111';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '8px 8px 0px #111111';
            }}
          >
            <div>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: '#CCFF00',
                  border: '3px solid #111111',
                  boxShadow: '4px 4px 0px #111111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                }}
              >
                <Compass size={28} color="#111111" strokeWidth={2.4} />
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#111111',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                FEATURE 01 // TRAVEL ENGINE
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '26px',
                  fontWeight: 800,
                  color: '#111111',
                  marginBottom: '14px',
                  lineHeight: 1.15,
                }}
              >
                Explore & Unfog the Map
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
                The map starts shrouded in dark void fog. As you walk outside with GPS or stroll
                via the interactive keyboard demo simulator, the fog lifts cell-by-cell across
                Uber H3 hexagons. Uncovered ground stays revealed forever in your personal atlas.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#F5F2EB',
                border: '2px solid #111111',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>
                Spatial Resolution
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: '#CCFF00',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #111',
                }}
              >
                H3 Res 9 (~105m)
              </div>
            </div>
          </div>

          {/* Feature 2: Leave a Capsule */}
          <div
            style={{
              backgroundColor: '#FFFDF9',
              border: '3.5px solid #111111',
              borderRadius: '20px',
              padding: '32px 28px',
              boxShadow: '8px 8px 0px #111111',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-3px, -3px)';
              e.currentTarget.style.boxShadow = '11px 11px 0px #111111';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '8px 8px 0px #111111';
            }}
          >
            <div>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: '#2DD4BF',
                  border: '3px solid #111111',
                  boxShadow: '4px 4px 0px #111111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                }}
              >
                <Sparkles size={28} color="#111111" strokeWidth={2.4} />
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#111111',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                FEATURE 02 // CREATION
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '26px',
                  fontWeight: 800,
                  color: '#111111',
                  marginBottom: '14px',
                  lineHeight: 1.15,
                }}
              >
                Leave Digital Capsules
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
                Drop an interactive capsule exactly where you stand. Write markdown journals,
                take and pin high-resolution photos, or record 60 seconds of ambient environmental
                audio. Anchor your presence to real geography forever.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#F5F2EB',
                border: '2px solid #111111',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>
                Capsule Formats
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: '#2DD4BF',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #111',
                }}
              >
                Text · Photo · Audio
              </div>
            </div>
          </div>

          {/* Feature 3: Discover Stories */}
          <div
            style={{
              backgroundColor: '#FFFDF9',
              border: '3.5px solid #111111',
              borderRadius: '20px',
              padding: '32px 28px',
              boxShadow: '8px 8px 0px #111111',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-3px, -3px)';
              e.currentTarget.style.boxShadow = '11px 11px 0px #111111';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '8px 8px 0px #111111';
            }}
          >
            <div>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: '#FFB800',
                  border: '3px solid #111111',
                  boxShadow: '4px 4px 0px #111111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                }}
              >
                <MapPin size={28} color="#111111" strokeWidth={2.4} />
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#111111',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                FEATURE 03 // DISCOVERY & LOCKS
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '26px',
                  fontWeight: 800,
                  color: '#111111',
                  marginBottom: '14px',
                  lineHeight: 1.15,
                }}
              >
                Discover Real Stories
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
                Pins only materialize once you uncover their ground. Sealed capsules are locked
                with spatial cryptography: you must physically journey within 1 cell of them
                to unlock their secrets. Walk away and they lock again.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#F5F2EB',
                border: '2px solid #111111',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>
                Unlocking Protocol
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: '#FFB800',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #111',
                }}
              >
                Proximity Padlock
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. INTERACTIVE DIGITAL CAPSULE SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section
        id="capsules"
        style={{
          backgroundColor: '#F5F2EB',
          borderTop: '3.5px solid #111111',
          borderBottom: '3.5px solid #111111',
          padding: 'clamp(64px, 8vw, 100px) clamp(16px, 4vw, 36px)',
        }}
      >
        <InteractiveCapsuleShowcase />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. PRIVACY AND TRUST SECTION
      ───────────────────────────────────────────────────────────── */}
      <section
        id="privacy"
        style={{
          backgroundColor: '#FFFDF9',
          borderTop: '3.5px solid #111111',
          borderBottom: '3.5px solid #111111',
          padding: 'clamp(64px, 8vw, 100px) clamp(16px, 4vw, 36px)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
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
              <Shield size={14} />
              <span>Sovereign Cartography</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4.5vw, 50px)',
                fontWeight: 800,
                color: '#111111',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: '16px',
              }}
            >
              Exploration without surveillance.
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '17px',
                color: '#555555',
                maxWidth: '680px',
                margin: '0 auto',
              }}
            >
              Location data is deeply personal. SeekIt was engineered from day one so your travels,
              coordinates, and intimate voice dispatches stay under your absolute control.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Card 1 */}
            <div
              style={{
                backgroundColor: '#F5F2EB',
                border: '3px solid #111111',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '5px 5px 0px #111111',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#CCFF00',
                  border: '2px solid #111111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Shield size={22} color="#111111" />
              </div>
              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 800,
                  marginBottom: '8px',
                  color: '#111111',
                }}
              >
                100% Local-First
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  lineHeight: 1.55,
                  color: '#444',
                }}
              >
                Every uncovered hexagon cell, coordinate timestamp, and recorded capsule is stored
                directly inside your browser’s IndexedDB database. Nothing is sent to an external server.
              </p>
            </div>

            {/* Card 2 */}
            <div
              style={{
                backgroundColor: '#F5F2EB',
                border: '3px solid #111111',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '5px 5px 0px #111111',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#2DD4BF',
                  border: '2px solid #111111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <EyeOff size={22} color="#111111" />
              </div>
              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 800,
                  marginBottom: '8px',
                  color: '#111111',
                }}
              >
                Privacy Exclusion Zones
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  lineHeight: 1.55,
                  color: '#444',
                }}
              >
                Easily designate radius exclusion zones around your home, workplace, or private spots.
                Inside your privacy zone, fog is never cleared and capsules cannot be created.
              </p>
            </div>

            {/* Card 3 */}
            <div
              style={{
                backgroundColor: '#F5F2EB',
                border: '3px solid #111111',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '5px 5px 0px #111111',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#FFB800',
                  border: '2px solid #111111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Lock size={22} color="#111111" />
              </div>
              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 800,
                  marginBottom: '8px',
                  color: '#111111',
                }}
              >
                Physical Presence Cryptography
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  lineHeight: 1.55,
                  color: '#444',
                }}
              >
                Sealed capsules cannot be scraped, scraped by web bots, or searched from a distant couch.
                Physical proximity is mathematically required to read or play sealed entries.
              </p>
            </div>

            {/* Card 4 */}
            <div
              style={{
                backgroundColor: '#F5F2EB',
                border: '3px solid #111111',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '5px 5px 0px #111111',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#FF4D4D',
                  border: '2px solid #111111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Radio size={22} color="#FFF" />
              </div>
              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 800,
                  marginBottom: '8px',
                  color: '#111111',
                }}
              >
                No Data Harvesting
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  lineHeight: 1.55,
                  color: '#444',
                }}
              >
                No accounts, no email requirements, no cross-site advertising cookies. You open the link,
                begin exploring, and your adventure belongs strictly to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. TIMELINE REPLAY HIGHLIGHT
      ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(64px, 8vw, 100px) clamp(16px, 4vw, 36px)',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            backgroundColor: '#111111',
            color: '#FFFDF9',
            border: '3.5px solid #111111',
            borderRadius: '24px',
            boxShadow: '10px 10px 0px #CCFF00',
            padding: 'clamp(28px, 5vw, 48px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 800,
                color: '#CCFF00',
                marginBottom: '12px',
                letterSpacing: '0.05em',
              }}
            >
              TIME MACHINE ENGINE // REPLAY
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: '18px',
                color: '#FFFDF9',
              }}
            >
              Watch your journey unfold step by step.
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#BBB',
                marginBottom: '24px',
              }}
            >
              Relive every expedition. The built-in Timeline Replay scrubber lets you watch the fog roll
              back across the map exactly in the chronological order you walked, as your capsules pop into
              view on the uncovered ground.
            </p>

            <button
              onClick={() => onExplore('sim')}
              style={{
                backgroundColor: '#CCFF00',
                color: '#111111',
                border: '2.5px solid #111111',
                borderRadius: '10px',
                padding: '12px 24px',
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '4px 4px 0px #FFF',
              }}
            >
              <span>Test Journey Replay</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div
            style={{
              backgroundColor: '#1E2530',
              border: '2.5px solid #CCFF00',
              borderRadius: '16px',
              padding: '24px',
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
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#CCFF00',
                }}
              >
                TIMELINE REPLAY SCRUBBER
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: '#8B98A5',
                }}
              >
                SPEED: 2X
              </div>
            </div>

            {/* Simulated Scrubber Bar */}
            <div
              style={{
                width: '100%',
                height: '10px',
                backgroundColor: '#0B0F14',
                borderRadius: '5px',
                border: '1.5px solid #444',
                position: 'relative',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '65%',
                  height: '100%',
                  backgroundColor: '#CCFF00',
                  borderRadius: '5px',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '65%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#CCFF00',
                  border: '2px solid #111',
                  boxShadow: '0 0 10px #CCFF00',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#AAA',
              }}
            >
              <span>18:12 (FIRST STEP)</span>
              <span style={{ color: '#CCFF00', fontWeight: 700 }}>18:44 (CURRENT)</span>
              <span>19:05 (FINISH)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. FREQUENTLY ASKED QUESTIONS (ACCORDION)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        style={{
          padding: 'clamp(64px, 8vw, 100px) clamp(16px, 4vw, 36px)',
          maxWidth: '880px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
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
            <HelpCircle size={14} />
            <span>Field Manual</span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(30px, 4vw, 44px)',
              fontWeight: 800,
              color: '#111111',
              letterSpacing: '-0.03em',
            }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            {
              q: 'How does the fog of war lift?',
              a: 'SeekIt uses the H3 hexagonal spatial indexing system (Resolution 9, with hexagons approximately 105 meters across). Whenever your GPS coordinates update, the cell you stand in and its immediate surrounding neighbors are unlocked permanently.',
            },
            {
              q: 'Can I try it on my laptop without leaving the house?',
              a: 'Yes! The built-in "Demo Walk" simulator lets you walk around any neighborhood using keyboard arrow keys (or W/A/S/D) and click-to-walk navigation. You can test uncovering fog, creating photo and voice capsules, and replay without moving a muscle.',
            },
            {
              q: 'How do sealed capsules work?',
              a: 'When you create a capsule, you can choose to "Seal it". A sealed capsule displays a padlock pin on the map. Visitors can see that something exists, but the audio, photo, or text is cryptographically unlocked only when their device is within 1 cell (~100m) of that exact spot.',
            },
            {
              q: 'What happens if I close my browser?',
              a: 'All uncovered hexagons, traveled distance, and created capsules are stored locally on your device via IndexedDB. When you reload or return weeks later, your revealed world atlas is waiting for you.',
            },
            {
              q: 'Does it keep my phone screen awake?',
              a: 'Yes. SeekIt automatically leverages the Screen Wake Lock API while tracking is active so your screen does not lock while you walk outdoors.',
            },
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFDF9',
                  border: '3px solid #111111',
                  borderRadius: '14px',
                  boxShadow: isOpen ? '6px 6px 0px #111111' : '4px 4px 0px #111111',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isOpen ? '#CCFF00' : 'transparent',
                    border: 'none',
                    borderBottom: isOpen ? '3px solid #111111' : 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: '17px',
                    fontWeight: 800,
                    color: '#111111',
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={20}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '18px 22px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      lineHeight: 1.6,
                      color: '#444',
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. CLOSING CALL-TO-ACTION SECTION
      ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(48px, 6vw, 80px) clamp(16px, 4vw, 36px)',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            backgroundColor: '#CCFF00',
            border: '4px solid #111111',
            borderRadius: '28px',
            boxShadow: '12px 12px 0px #111111',
            padding: 'clamp(40px, 6vw, 68px) clamp(24px, 5vw, 48px)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 800,
              backgroundColor: '#111111',
              color: '#CCFF00',
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '999px',
              marginBottom: '20px',
              letterSpacing: '0.04em',
            }}
          >
            THE ADVENTURE BEGINS NOW
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5.5vw, 64px)',
              fontWeight: 800,
              color: '#111111',
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              marginBottom: '20px',
              maxWidth: '820px',
              margin: '0 auto 20px',
            }}
          >
            The fog won't lift itself. Step into the unknown.
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(17px, 2vw, 20px)',
              color: '#222222',
              maxWidth: '640px',
              margin: '0 auto 36px',
              lineHeight: 1.5,
              fontWeight: 600,
            }}
          >
            Launch the atlas, put on your walking shoes, and see what you can uncover before nightfall.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => onExplore('gps')}
              style={{
                backgroundColor: '#111111',
                color: '#CCFF00',
                border: '3px solid #111111',
                borderRadius: '14px',
                padding: '16px 36px',
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '6px 6px 0px #FFFDF9',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '8px 8px 0px #FFFDF9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '6px 6px 0px #FFFDF9';
              }}
            >
              <Navigation size={20} />
              <span>Launch Live GPS Map</span>
            </button>

            <button
              onClick={() => onExplore('sim')}
              style={{
                backgroundColor: '#FFFDF9',
                color: '#111111',
                border: '3px solid #111111',
                borderRadius: '14px',
                padding: '16px 32px',
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '6px 6px 0px #111111',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '8px 8px 0px #111111';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '6px 6px 0px #111111';
              }}
            >
              <Footprints size={20} />
              <span>Try Demo Walk (Simulator)</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. NEO-BRUTALIST FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer
        style={{
          backgroundColor: '#FFFDF9',
          borderTop: '3.5px solid #111111',
          padding: '48px clamp(16px, 4vw, 36px) 36px',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '36px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '28px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#111111',
                    border: '2px solid #111111',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src="/logo.png"
                    alt="SeekIt"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#111111',
                  }}
                >
                  SeekIt
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: '#666',
                  maxWidth: '380px',
                  lineHeight: 1.5,
                }}
              >
                Inverse fog-of-war cartographic memory explorer.
                Designed for explorers, hikers, flâneurs, and curious souls.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#111111',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Navigation
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a href="#features" style={{ color: '#555', textDecoration: 'none', fontSize: '13px' }}>
                    Features
                  </a>
                  <a href="#capsules" style={{ color: '#555', textDecoration: 'none', fontSize: '13px' }}>
                    Capsule Showcase
                  </a>
                  <a href="#privacy" style={{ color: '#555', textDecoration: 'none', fontSize: '13px' }}>
                    Privacy & Trust
                  </a>
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#111111',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Cartography Tech
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: '#666',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <span>Uber H3 Res-9 Hexagons</span>
                  <span>MapLibre GL Vector Engine</span>
                  <span>IndexedDB Local Storage</span>
                  <span>Screen Wake Lock API</span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: '2px dashed #DDD',
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#777',
            }}
          >
            <div>
              © 2026 SeekIt · "The world is full of things you haven't found yet."
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                backgroundColor: '#F5F2EB',
                border: '1.5px solid #111',
                borderRadius: '6px',
                padding: '4px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#111',
                cursor: 'pointer',
              }}
            >
              ↑ BACK TO TOP
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
