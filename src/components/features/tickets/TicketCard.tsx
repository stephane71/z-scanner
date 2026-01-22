'use client';

/**
 * TicketCard - Display a ticket in a list view
 * Story 4.1: Ticket List (Historique)
 *
 * Shows ticket info: photo thumbnail, date, number, total, market name,
 * NF525 badge (validated), and sync badge (pending sync).
 * Touch-friendly design per UX spec (min-h-[72px]).
 */

import { useEffect, useMemo, useState } from 'react';
import { usePhoto } from '@/hooks/usePhoto';
import { useMarketById } from '@/hooks/useMarkets';
import { TicketSyncBadge } from '@/components/features/sync';
import { NF525Badge } from './NF525Badge';
import type { Ticket } from '@/types';

interface TicketCardProps {
  /** Ticket data to display */
  ticket: Ticket;
  /** Callback when card is clicked */
  onClick?: () => void;
}

/**
 * Format date from ISO to French locale (dd/MM/yyyy)
 */
function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

/**
 * Format centimes to euro display (1250 → "12,50 €")
 */
function formatCurrency(centimes: number): string {
  const euros = centimes / 100;
  return euros.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const { photo } = usePhoto(ticket.id);
  const { market } = useMarketById(ticket.marketId);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // Create and cleanup object URL for thumbnail
  useEffect(() => {
    if (photo?.thumbnail) {
      const url = URL.createObjectURL(photo.thumbnail);
      setThumbnailUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    return undefined;
  }, [photo]);

  // Memoize formatted values
  const formattedDate = useMemo(
    () => formatDate(ticket.impressionDate),
    [ticket.impressionDate]
  );
  const formattedTotal = useMemo(
    () => formatCurrency(ticket.total),
    [ticket.total]
  );

  const isValidated = ticket.status === 'validated';

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-4 border-b border-border bg-background hover:bg-muted/50 active:bg-muted transition-colors min-h-[72px] text-left"
      data-testid="ticket-card"
    >
      <div className="flex gap-3 items-center">
        {/* Thumbnail */}
        <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Photo du ticket"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              Photo
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {formattedDate}
            </span>
            <span className="text-xs text-muted-foreground">
              #{ticket.ticketNumber}
            </span>
          </div>
          {market && (
            <p className="text-xs text-muted-foreground truncate">
              {market.name}
            </p>
          )}
        </div>

        {/* Badges and Total */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-sm font-semibold text-foreground">
            {formattedTotal}
          </span>
          <div className="flex items-center gap-1">
            {isValidated && <NF525Badge />}
            {ticket.id && <TicketSyncBadge ticketId={ticket.id} />}
          </div>
        </div>
      </div>
    </button>
  );
}

export type { TicketCardProps };
