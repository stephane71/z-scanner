'use client';

/**
 * TicketPhoto - Full-size photo display with zoom modal
 * Story 4.2: Ticket Detail View
 *
 * Displays the ticket photo from IndexedDB using usePhoto hook.
 * Clicking opens a full-screen modal for zoom.
 * Properly cleans up object URLs to prevent memory leaks.
 */

import { useState, useEffect } from 'react';
import { X, ImageOff } from 'lucide-react';
import { usePhoto } from '@/hooks/usePhoto';

interface TicketPhotoProps {
  /** Ticket ID to fetch photo for */
  ticketId: number;
}

/**
 * Skeleton loader for photo
 */
export function TicketPhotoSkeleton() {
  return (
    <div
      className="aspect-[4/3] bg-muted rounded-lg animate-pulse"
      data-testid="photo-skeleton"
    />
  );
}

/**
 * Placeholder when no photo available
 */
function PhotoPlaceholder() {
  return (
    <div
      className="aspect-[4/3] bg-muted rounded-lg flex flex-col items-center justify-center"
      data-testid="photo-placeholder"
    >
      <ImageOff className="w-12 h-12 text-muted-foreground mb-2" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">Photo non disponible</p>
    </div>
  );
}

/**
 * Full-screen photo modal
 */
function PhotoModal({
  photoUrl,
  onClose,
}: {
  photoUrl: string;
  onClose: () => void;
}) {
  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo en plein écran"
      data-testid="photo-modal"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
        aria-label="Fermer"
        data-testid="close-modal"
      >
        <X className="w-8 h-8" aria-hidden="true" />
      </button>

      {/* Full-size photo */}
      <img
        src={photoUrl}
        alt="Photo du ticket en plein écran"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export function TicketPhoto({ ticketId }: TicketPhotoProps) {
  const { photo, isLoading } = usePhoto(ticketId);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Create and cleanup object URL for full-size blob
  useEffect(() => {
    if (photo?.blob) {
      const url = URL.createObjectURL(photo.blob);
      setPhotoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPhotoUrl(null);
    return undefined;
  }, [photo]);

  if (isLoading) {
    return <TicketPhotoSkeleton />;
  }

  if (!photoUrl) {
    return <PhotoPlaceholder />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsZoomed(true)}
        className="w-full focus:outline-none focus:ring-2 focus:ring-primary rounded-lg overflow-hidden"
        aria-label="Agrandir la photo"
        data-testid="photo-button"
      >
        <img
          src={photoUrl}
          alt="Photo du ticket"
          className="w-full aspect-[4/3] object-cover rounded-lg"
          data-testid="ticket-photo"
        />
      </button>

      {isZoomed && <PhotoModal photoUrl={photoUrl} onClose={() => setIsZoomed(false)} />}
    </>
  );
}

export type { TicketPhotoProps };
