/**
 * EmptyState - Displayed when user has no tickets
 * Story 4.1: Ticket List (Historique)
 *
 * Shows encouraging message with CTA to scan first ticket.
 * Per UX spec: centered illustration, clear title, encouraging message.
 *
 * Note: This is a Server Component (no 'use client') as it has no
 * client-side interactivity - just static content with a Link.
 */

import Link from 'next/link';
import { ListX, Camera } from 'lucide-react';

export function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      data-testid="empty-state"
    >
      {/* Illustration */}
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <ListX className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-foreground mb-2">
        Aucun ticket
      </h2>

      {/* Message */}
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Scannez votre premier ticket Z pour commencer à suivre vos ventes
      </p>

      {/* CTA */}
      <Link
        href="/scan"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        data-testid="scan-cta"
      >
        <Camera className="w-5 h-5" aria-hidden="true" />
        <span>Scanner un ticket</span>
      </Link>
    </div>
  );
}
