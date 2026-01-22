'use client';

/**
 * TicketsPageClient - Client component for ticket history page
 * Story 4.1: Ticket List (Historique)
 * Story 4.3: Filter by Date (with URL persistence)
 *
 * Fetches user authentication and displays ticket list with
 * loading states, empty state handling, and date filtering.
 * Filter state is persisted in URL params for navigation support.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTicketsByDateRange } from '@/hooks/useTicketsByDateRange';
import { TicketList, TicketListSkeleton } from '@/components/features/tickets/TicketList';
import { EmptyState } from '@/components/features/tickets/EmptyState';
import { DateRangeFilter } from '@/components/features/tickets/DateRangeFilter';
import { FilterChip } from '@/components/features/tickets/FilterChip';
import { DateFilterEmpty } from '@/components/features/tickets/DateFilterEmpty';

export function TicketsPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  // Track when we can trust the data (after a small delay post userId change)
  const [canShowContent, setCanShowContent] = useState(false);
  const userIdChangeTimeRef = useRef<number>(0);

  // Read date filter from URL params (Story 4.3 - URL persistence)
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

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

  // Fetch tickets reactively via useLiveQuery with date filtering
  const { tickets, isLoading: ticketsLoading } = useTicketsByDateRange(
    userId || '',
    startDate,
    endDate
  );

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

  // Update URL with filter params
  const updateUrlParams = useCallback(
    (start: string | null, end: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (start && end) {
        params.set('start', start);
        params.set('end', end);
      } else {
        params.delete('start');
        params.delete('end');
      }

      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Filter handlers
  function handleFilterApply(start: string, end: string) {
    updateUrlParams(start, end);
  }

  function handleFilterClear() {
    updateUrlParams(null, null);
  }

  const isFilterActive = startDate !== null || endDate !== null;

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

  // Show empty state when no tickets (no filter active = user has zero tickets)
  if (tickets.length === 0 && !isFilterActive) {
    return <EmptyState />;
  }

  // Filter UI header
  const filterHeader = (
    <div className="flex items-center gap-2 px-4 py-3">
      <DateRangeFilter
        onApply={handleFilterApply}
        onClear={handleFilterClear}
        currentStart={startDate}
        currentEnd={endDate}
      />
      {isFilterActive && startDate && endDate && (
        <FilterChip
          startDate={startDate}
          endDate={endDate}
          onClear={handleFilterClear}
        />
      )}
    </div>
  );

  // Show date filter empty state when filter is active but no results
  if (tickets.length === 0 && isFilterActive) {
    return (
      <>
        {filterHeader}
        <DateFilterEmpty />
      </>
    );
  }

  // Show ticket list with filter header
  return (
    <>
      {filterHeader}
      <TicketList tickets={tickets} isLoading={false} />
    </>
  );
}
