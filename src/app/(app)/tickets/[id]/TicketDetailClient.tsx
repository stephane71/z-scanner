'use client';

/**
 * TicketDetailClient - Main ticket detail view component
 * Story 4.2: Ticket Detail View
 *
 * Displays complete ticket information: photo, fields, NF525 info.
 * Handles loading, not found, and cancelled states.
 * Uses useTicketById for reactive data loading from IndexedDB.
 */

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTicketById } from '@/hooks/useTickets';
import { DetailHeader } from '@/components/features/tickets/DetailHeader';
import { TicketPhoto, TicketPhotoSkeleton } from '@/components/features/tickets/TicketPhoto';
import { TicketFields } from '@/components/features/tickets/TicketFields';
import { NF525Info } from '@/components/features/tickets/NF525Info';
import { CancelledBanner } from '@/components/features/tickets/CancelledBanner';
import { FileQuestion } from 'lucide-react';

/**
 * Skeleton for the entire detail view
 */
function TicketDetailSkeleton() {
  return (
    <div className="animate-pulse" data-testid="detail-skeleton">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center h-14 px-4">
          <div className="w-10 h-10 bg-muted rounded-full" />
          <div className="h-6 bg-muted rounded w-32 ml-4" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Photo skeleton */}
        <TicketPhotoSkeleton />

        {/* Total hero skeleton */}
        <div className="text-center py-2">
          <div className="h-3 bg-muted rounded w-16 mx-auto mb-2" />
          <div className="h-10 bg-muted rounded w-32 mx-auto" />
        </div>

        {/* Fields skeleton */}
        <div className="bg-muted rounded-lg h-48" />

        {/* NF525 info skeleton */}
        <div className="bg-muted rounded-lg h-24" />
      </div>
    </div>
  );
}

/**
 * Not found state when ticket doesn't exist
 */
function TicketNotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center"
      data-testid="not-found"
    >
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h1 className="text-lg font-semibold text-foreground mb-2">
        Ticket non trouvé
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Ce ticket n&apos;existe pas ou a été supprimé.
      </p>
      <Link
        href="/tickets"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        data-testid="back-to-list"
      >
        Retour à l&apos;historique
      </Link>
    </div>
  );
}

export function TicketDetailClient() {
  const params = useParams();
  const ticketId = params?.id ? Number(params.id) : undefined;

  const { ticket, isLoading } = useTicketById(ticketId);

  // Loading state
  if (isLoading) {
    return <TicketDetailSkeleton />;
  }

  // Not found state
  if (!ticket) {
    return <TicketNotFound />;
  }

  const isCancelled = ticket.status === 'cancelled';
  const isValidated = ticket.status === 'validated';

  return (
    <div>
      {/* Header with back navigation and sync status */}
      <DetailHeader ticketNumber={ticket.ticketNumber} ticketId={ticket.id} />

      <div className="p-4 space-y-4">
        {/* Cancelled banner (if applicable) */}
        {isCancelled && ticket.cancelledAt && ticket.cancellationReason && (
          <CancelledBanner
            reason={ticket.cancellationReason}
            cancelledAt={ticket.cancelledAt}
          />
        )}

        {/* Photo */}
        {ticket.id && <TicketPhoto ticketId={ticket.id} />}

        {/* Ticket fields */}
        <TicketFields ticket={ticket} />

        {/* NF525 info (for validated tickets only) */}
        {isValidated && ticket.validatedAt && (
          <NF525Info
            dataHash={ticket.dataHash}
            validatedAt={ticket.validatedAt}
          />
        )}
      </div>
    </div>
  );
}
