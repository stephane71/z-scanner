'use client';

/**
 * TicketsPageClient - Client component for ticket history page
 * Story 4.1: Ticket List (Historique)
 *
 * Fetches user authentication and displays ticket list with
 * loading states and empty state handling.
 */

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTickets } from '@/hooks/useTickets';
import { TicketList, TicketListSkeleton } from '@/components/features/tickets/TicketList';
import { EmptyState } from '@/components/features/tickets/EmptyState';

export function TicketsPageClient() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  // Track when we can trust the data (after a small delay post userId change)
  const [canShowContent, setCanShowContent] = useState(false);
  const userIdChangeTimeRef = useRef<number>(0);

  // Get current user from Supabase
  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      setAuthLoading(false);
    }
    getUser();
  }, []);

  // Reset canShowContent and track when userId changes
  useEffect(() => {
    if (userId) {
      setCanShowContent(false);
      userIdChangeTimeRef.current = Date.now();
    }
  }, [userId]);

  // Fetch tickets reactively via useLiveQuery
  const { tickets, isLoading: ticketsLoading } = useTickets(userId || '');

  // Allow showing content after data stabilizes (small delay to skip stale data)
  useEffect(() => {
    if (userId && tickets !== undefined && !ticketsLoading) {
      // Ensure at least 100ms has passed since userId changed
      // This allows useLiveQuery to properly re-fetch
      const timeSinceChange = Date.now() - userIdChangeTimeRef.current;
      const delay = Math.max(0, 100 - timeSinceChange);

      const timer = setTimeout(() => {
        setCanShowContent(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [userId, tickets, ticketsLoading]);

  // Show skeleton while loading auth
  if (authLoading) {
    return (
      <div className="py-4">
        <TicketListSkeleton count={5} />
      </div>
    );
  }

  // User not authenticated (shouldn't happen with middleware, but handle gracefully)
  if (!userId) {
    return (
      <div className="py-4 px-4 text-center text-muted-foreground">
        Veuillez vous connecter pour voir vos tickets.
      </div>
    );
  }

  // Show skeleton while loading tickets OR waiting for data to stabilize
  if (ticketsLoading || tickets === undefined || !canShowContent) {
    return (
      <div className="py-4">
        <TicketListSkeleton count={5} />
      </div>
    );
  }

  // Show empty state when no tickets
  if (tickets.length === 0) {
    return <EmptyState />;
  }

  // Show ticket list
  return <TicketList tickets={tickets} isLoading={false} />;
}
