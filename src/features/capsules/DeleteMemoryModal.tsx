import { useEffect, useMemo, useState } from 'react';
import { useCapsules } from '../../store/capsules';
import { Trash2, X, FileText, Camera, Mic, Loader2 } from 'lucide-react';

const TYPE_ICONS = {
  text: FileText,
  photo: Camera,
  voice: Mic,
};

export function DeleteMemoryModal() {
  const deleteTargetId = useCapsules((state) => state.deleteTargetId);
  const setDeleteTargetId = useCapsules((state) => state.setDeleteTargetId);
  const capsules = useCapsules((state) => state.capsules);
  const deleteCapsule = useCapsules((state) => state.deleteCapsule);

  const [isDeleting, setIsDeleting] = useState(false);

  const targetCapsule = useMemo(() => {
    return capsules.find((c) => c.id === deleteTargetId) || null;
  }, [capsules, deleteTargetId]);

  // Handle Escape key to close dialog
  useEffect(() => {
    if (!deleteTargetId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDeleteTargetId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [deleteTargetId, setDeleteTargetId]);

  if (!deleteTargetId) {
    return null;
  }

  const handleCancel = () => {
    if (isDeleting) return;
    setDeleteTargetId(null);
  };

  const handleDelete = async () => {
    if (!deleteTargetId || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteCapsule(deleteTargetId);
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const TypeIcon = targetCapsule ? TYPE_ICONS[targetCapsule.type] || FileText : FileText;

  const formattedDate = targetCapsule
    ? new Date(targetCapsule.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={handleCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-memory-title"
      aria-describedby="delete-memory-desc"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#121923',
          borderRadius: '20px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(239, 68, 68, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warning accent */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(18, 25, 35, 0) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trash2 size={18} />
            </div>
            <div>
              <h2
                id="delete-memory-title"
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  lineHeight: 1.2,
                }}
              >
                Delete Memory?
              </h2>
            </div>
          </div>

          <button
            onClick={handleCancel}
            aria-label="Close dialog"
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
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--muted)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div style={{ padding: '20px' }}>
          <p
            id="delete-memory-desc"
            style={{
              fontSize: '14px',
              lineHeight: 1.5,
              color: 'var(--text)',
              marginBottom: '16px',
            }}
          >
            Are you sure you want to delete this memory? This action cannot be undone.
          </p>

          {/* Capsule Preview Card if capsule found */}
          {targetCapsule && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#1a2332',
                  border: '1px solid var(--amber)',
                  color: 'var(--amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <TypeIcon size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {targetCapsule.title || 'Untitled Memory'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  {formattedDate}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            onClick={handleCancel}
            disabled={isDeleting}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.6 : 1,
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '10px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
              opacity: isDeleting ? 0.7 : 1,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#ef4444';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {isDeleting ? (
              <>
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteMemoryModal;
