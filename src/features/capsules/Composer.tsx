import React, { useState, useRef, useEffect } from 'react';
import { latLngToCell } from 'h3-js';
import { useFog } from '../../store/fog';
import { useCapsules } from '../../store/capsules';
import { isPrivate } from '../privacy/privacy';
import { H3_RES, PHOTO_MAX_PX, VOICE_MAX_S, DEFAULT_START } from '../../config';
import type { Capsule, CapsuleType } from '../../types';
import {
  FileText,
  Camera,
  Mic,
  Lock,
  Unlock,
  X,
  Upload,
  Square,
  RotateCcw,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';

export function Composer() {
  const isOpen = useCapsules((state) => state.composerOpen);
  const setComposerOpen = useCapsules((state) => state.setComposerOpen);
  const addCapsule = useCapsules((state) => state.addCapsule);
  const userPosition = useFog((state) => state.position);

  const [activeTab, setActiveTab] = useState<CapsuleType>('text');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isSealed, setIsSealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo state
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoMime, setPhotoMime] = useState<string>('image/jpeg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceMime, setVoiceMime] = useState<string | null>(null);
  const [voicePreviewUrl, setVoicePreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Clean up object URLs on unmount or reset
  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
      if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [photoPreviewUrl, voicePreviewUrl]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    setComposerOpen(false);
  };

  // --- Photo compression handler ---
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxPx = PHOTO_MAX_PX;

        if (width > maxPx || height > maxPx) {
          if (width > height) {
            height = Math.round((height * maxPx) / width);
            width = maxPx;
          } else {
            width = Math.round((width * maxPx) / height);
            height = maxPx;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
            const preview = URL.createObjectURL(blob);
            setPhotoBlob(blob);
            setPhotoPreviewUrl(preview);
            setPhotoMime('image/jpeg');
          },
          'image/jpeg',
          0.8
        );
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // --- Voice recording handlers ---
  const getSupportedMime = () => {
    const types = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'];
    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return 'audio/webm';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = getSupportedMime();
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: mime });
        setVoiceBlob(fullBlob);
        setVoiceMime(mime);
        if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
        setVoicePreviewUrl(URL.createObjectURL(fullBlob));

        // Stop all media tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);

      recordTimerRef.current = window.setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev + 1 >= VOICE_MAX_S) {
            stopRecording();
            return VOICE_MAX_S;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or unavailable:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setIsRecording(false);
  };

  const resetRecording = () => {
    stopRecording();
    setVoiceBlob(null);
    setVoiceMime(null);
    if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
    setVoicePreviewUrl(null);
    setRecordSeconds(0);
  };

  // --- Save Capsule ---
  const handleSave = async () => {
    const pos = userPosition ?? DEFAULT_START;
    const h3Cell = latLngToCell(pos.lat, pos.lng, H3_RES);

    if (isPrivate(h3Cell)) {
      alert('Cannot drop capsule in a private zone.');
      return;
    }

    let blob: Blob | undefined;
    let mime: string | undefined;

    if (activeTab === 'photo') {
      if (!photoBlob) {
        alert('Please choose a photo or snap a picture.');
        return;
      }
      blob = photoBlob;
      mime = photoMime;
    } else if (activeTab === 'voice') {
      if (!voiceBlob) {
        alert('Please record an audio note first.');
        return;
      }
      blob = voiceBlob;
      mime = voiceMime ?? 'audio/webm';
    }

    setIsSubmitting(true);
    try {
      const capsule: Capsule = {
        id: crypto.randomUUID(),
        lat: pos.lat,
        lng: pos.lng,
        h3: h3Cell,
        type: activeTab,
        title: title.trim() || undefined,
        text: text.trim() || undefined,
        blob,
        mime,
        createdAt: Date.now(),
        sealed: isSealed,
      };

      await addCapsule(capsule);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCoords = userPosition ?? DEFAULT_START;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          backgroundColor: '#121923',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          border: '1px solid var(--border)',
          boxShadow: '0 -16px 48px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'var(--amber-dim)',
                color: 'var(--amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                Add Memory
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <MapPin size={11} color="var(--amber)" />
                <span>
                  {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
                </span>
              </div>
            </div>
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

        {/* Capsule Type Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            padding: '12px 20px 0',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setActiveTab('text')}
            style={tabButtonStyle(activeTab === 'text')}
          >
            <FileText size={15} />
            <span>Story</span>
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            style={tabButtonStyle(activeTab === 'photo')}
          >
            <Camera size={15} />
            <span>Photo</span>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            style={tabButtonStyle(activeTab === 'voice')}
          >
            <Mic size={15} />
            <span>Voice</span>
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto',
          }}
        >
          {/* Title input */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. The Hidden Overlook"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Photo Tab Content */}
          {activeTab === 'photo' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--muted)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Photo
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />

              {photoPreviewUrl ? (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '180px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                  }}
                >
                  <img
                    src={photoPreviewUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(18, 25, 35, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '24px 16px',
                    borderRadius: '12px',
                    border: '1.5px dashed rgba(245, 185, 66, 0.4)',
                    backgroundColor: 'rgba(245, 185, 66, 0.04)',
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={22} color="var(--amber)" />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    Upload or take a photo
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    Auto-compressed to JPEG max 1280px
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Voice Tab Content */}
          {activeTab === 'voice' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--muted)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Voice Note (up to 60s)
              </label>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '20px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Recording indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: isRecording ? '#ef4444' : 'var(--muted)',
                      animation: isRecording ? 'pulse 1s infinite' : 'none',
                    }}
                  />
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                    {recordSeconds}s{' '}
                    <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--muted)' }}>
                      / {VOICE_MAX_S}s
                    </span>
                  </span>
                </div>

                {/* Recorder buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {!isRecording && !voiceBlob && (
                    <button
                      onClick={startRecording}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: '24px',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(239, 68, 68, 0.35)',
                      }}
                    >
                      <Mic size={16} />
                      <span>Start Recording</span>
                    </button>
                  )}

                  {isRecording && (
                    <button
                      onClick={stopRecording}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: '24px',
                        backgroundColor: 'var(--surface-hover)',
                        color: 'var(--text)',
                        border: '1px solid #ef4444',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Square size={14} color="#ef4444" fill="#ef4444" />
                      <span>Stop Recording</span>
                    </button>
                  )}

                  {!isRecording && voiceBlob && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <audio
                        src={voicePreviewUrl ?? undefined}
                        controls
                        style={{ height: '36px', maxWidth: '240px' }}
                      />
                      <button
                        onClick={resetRecording}
                        title="Re-record"
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--surface-hover)',
                          color: 'var(--muted)',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                        }}
                      >
                        <RotateCcw size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Markdown / Caption Text input */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {activeTab === 'text' ? 'Message (Markdown supported)' : 'Caption (Optional)'}
            </label>
            <textarea
              rows={activeTab === 'text' ? 4 : 2}
              placeholder={
                activeTab === 'text'
                  ? 'Describe this place, secrets discovered, or memories made...'
                  : 'Add a thought or context...'
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Sealed Capsule Toggle */}
          <div
            onClick={() => setIsSealed(!isSealed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: isSealed ? 'rgba(245, 185, 66, 0.1)' : 'rgba(0, 0, 0, 0.25)',
              border: isSealed ? '1px solid var(--amber)' : '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: isSealed ? 'var(--amber)' : 'var(--surface-hover)',
                  color: isSealed ? 'var(--void)' : 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSealed ? <Lock size={16} /> : <Unlock size={16} />}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                  Seal Memory
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  Must physically return within ~65m to unlock
                </div>
              </div>
            </div>

            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                backgroundColor: isSealed ? 'var(--amber)' : 'transparent',
                border: isSealed ? 'none' : '1.5px solid var(--muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--void)',
              }}
            >
              {isSealed && <Check size={14} strokeWidth={3} />}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '10px',
          }}
        >
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'var(--amber)',
              color: 'var(--void)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(245, 185, 66, 0.3)',
            }}
          >
            <Sparkles size={16} />
            <span>{isSubmitting ? 'Saving...' : 'Add Memory'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function tabButtonStyle(isActive: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 10px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    border: isActive ? '1px solid var(--amber)' : '1px solid var(--border)',
    backgroundColor: isActive ? 'var(--amber-dim)' : 'transparent',
    color: isActive ? 'var(--amber)' : 'var(--muted)',
    transition: 'all 0.15s ease',
  };
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  backgroundColor: 'rgba(0, 0, 0, 0.35)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
};

export default Composer;
