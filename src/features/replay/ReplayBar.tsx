import { useEffect, useRef, useState } from 'react';
import { useFog, replayCutoffTs } from '../../store/fog';
import { Play, Pause, X, RotateCcw, Clock } from 'lucide-react';

const REPLAY_DURATION_MS = 15000; // 15 seconds to replay journey from 0 to 1

export function ReplayBar() {
  const replay = useFog((state) => state.replay);
  const stopReplay = useFog((state) => state.stopReplay);
  const setReplayProgress = useFog((state) => state.setReplayProgress);
  const revealedSize = useFog((state) => state.revealed.size);

  const [isPlaying, setIsPlaying] = useState(true);
  const lastTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Play animation loop over ~15s
  useEffect(() => {
    if (!replay.active || !isPlaying) {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const progressStep = delta / REPLAY_DURATION_MS;
      const current = useFog.getState().replay.progress;
      const nextProgress = Math.min(1, current + progressStep);

      setReplayProgress(nextProgress);

      if (nextProgress >= 1) {
        setIsPlaying(false);
        lastTimeRef.current = null;
        animFrameRef.current = null;
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [replay.active, isPlaying, setReplayProgress]);

  if (!replay.active) return null;

  const cutoff = replayCutoffTs();
  const dateFormatted = cutoff && cutoff > 0
    ? new Date(cutoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Journey Start';

  const visibleCellsCount = Math.floor(replay.progress * revealedSize);

  const handlePlayToggle = () => {
    if (replay.progress >= 1) {
      // Loop back to start
      setReplayProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    setReplayProgress(0);
    setIsPlaying(true);
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        maxWidth: '520px',
        width: 'calc(100vw - 32px)',
        padding: '12px 18px',
        borderRadius: '20px',
        backgroundColor: 'rgba(18, 25, 35, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--teal)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(45, 212, 191, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Status Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isPlaying ? 'var(--teal)' : 'var(--muted)',
              animation: isPlaying ? 'pulse 1.2s infinite' : 'none',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>
            TIMELINE REPLAY
          </span>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
            • {visibleCellsCount} / {revealedSize} hexes
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: 'var(--teal)',
              fontWeight: 600,
            }}
          >
            <Clock size={12} />
            <span>{dateFormatted}</span>
          </div>

          <button
            onClick={() => stopReplay()}
            title="Exit Replay Mode"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Scrubber & Controls Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={handlePlayToggle}
          title={isPlaying ? 'Pause' : 'Play'}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--teal)',
            color: 'var(--void)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(45, 212, 191, 0.4)',
            flexShrink: 0,
          }}
        >
          {isPlaying ? <Pause size={16} fill="var(--void)" /> : <Play size={16} fill="var(--void)" />}
        </button>

        <button
          onClick={handleRestart}
          title="Restart Timeline"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-hover)',
            color: 'var(--muted)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <RotateCcw size={14} />
        </button>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.002"
          value={replay.progress}
          onChange={(e) => {
            setIsPlaying(false);
            setReplayProgress(parseFloat(e.target.value));
          }}
          style={{
            flex: 1,
            cursor: 'pointer',
            accentColor: 'var(--teal)',
            height: '6px',
          }}
        />

        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text)',
            minWidth: '40px',
            textAlign: 'right',
          }}
        >
          {Math.round(replay.progress * 100)}%
        </span>
      </div>
    </div>
  );
}

export default ReplayBar;
