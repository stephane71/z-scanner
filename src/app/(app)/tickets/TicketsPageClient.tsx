'use client';

/**
 * TicketsPageClient - Client component for ticket history page
 * Story 4.1: Ticket List (Historique)
 * Story 4.3: Filter by Date (with URL persistence)
 * Story 4.4: Filter by Market (with URL persistence)
 * Story 6.1: Activity Dashboard
 *
 * Fetches user authentication and displays ticket list with
 * loading states, empty state handling, date and market filtering.
 * Filter state is persisted in URL params for navigation support.
 * Includes dashboard summary card showing monthly activity.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTicketsByMarket, useMarkets } from '@/hooks';
import { TicketList, TicketListSkeleton } from '@/components/features/tickets/TicketList';
import { EmptyState } from '@/components/features/tickets/EmptyState';
import { DateRangeFilter } from '@/components/features/tickets/DateRangeFilter';
import { FilterChip } from '@/components/features/tickets/FilterChip';
import { DateFilterEmpty } from '@/components/features/tickets/DateFilterEmpty';
import { MarketFilter } from '@/components/features/tickets/MarketFilter';
import { MarketFilterChip } from '@/components/features/tickets/MarketFilterChip';
import { DashboardSummaryCard } from '@/components/features/dashboard';

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

  // Read market filter from URL params (Story 4.4 - URL persistence)
  const marketsParam = searchParams.get('markets');
  const marketIds = useMemo(
    () => (marketsParam ? marketsParam.split(',').map(Number) : []),
    [marketsParam]
  );

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

  // Fetch tickets reactively via useLiveQuery with date and market filtering
  const { tickets, isLoading: ticketsLoading } = useTicketsByMarket(
    userId || '',
    startDate,
    endDate,
    marketIds
  );

  // Fetch user's markets for filter display (Story 4.4)
  const { markets } = useMarkets(userId || '');

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
    (
      start: string | null,
      end: string | null,
      markets: number[] | null = null
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      if (start && end) {
        params.set('start', start);
        params.set('end', end);
      } else if (start === null && end === null) {
        params.delete('start');
        params.delete('end');
      }

      if (markets !== null) {
        if (markets.length > 0) {
          params.set('markets', markets.join(','));
        } else {
          params.delete('markets');
        }
      }

      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Date filter handlers
  function handleDateFilterApply(start: string, end: string) {
    updateUrlParams(start, end);
  }

  function handleDateFilterClear() {
    updateUrlParams(null, null);
  }

  // Market filter handlers (Story 4.4)
  function handleMarketFilterApply(selectedMarketIds: number[]) {
    updateUrlParams(startDate, endDate, selectedMarketIds);
  }

  function handleMarketFilterClear() {
    updateUrlParams(startDate, endDate, []);
  }

  const isDateFilterActive = startDate !== null || endDate !== null;
  const isMarketFilterActive = marketIds.length > 0;
  const isAnyFilterActive = isDateFilterActive || isMarketFilterActive;

  // Get selected market names for chip display
  const selectedMarketNames = useMemo(() => {
    if (!markets || marketIds.length === 0) return [];
    return marketIds
      .map((id) => markets.find((m) => m.id === id)?.name)
      .filter((name): name is string => !!name);
  }, [markets, marketIds]);

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
  // Dashboard is shown on empty state to encourage first ticket scan
  if (tickets.length === 0 && !isAnyFilterActive) {
    return (
      <div className="px-4 py-4">
        <DashboardSummaryCard userId={userId} />
      </div>
    );
  }

  // Filter UI header
  const filterHeader = (
    <div className="flex items-center gap-2 px-4 py-3 flex-wrap">
      <DateRangeFilter
        onApply={handleDateFilterApply}
        onClear={handleDateFilterClear}
        currentStart={startDate}
        currentEnd={endDate}
      />
      <MarketFilter
        userId={userId}
        selectedMarketIds={marketIds}
        onApply={handleMarketFilterApply}
      />
      {isDateFilterActive && startDate && endDate && (
        <FilterChip
          startDate={startDate}
          endDate={endDate}
          onClear={handleDateFilterClear}
        />
      )}
      {isMarketFilterActive && selectedMarketNames.length > 0 && (
        <MarketFilterChip
          marketNames={selectedMarketNames}
          onClear={handleMarketFilterClear}
        />
      )}
    </div>
  );

  // Dashboard card always visible when user has tickets or filter active
  const dashboardSection = (
    <div className="px-4 pt-4">
      <DashboardSummaryCard userId={userId} />
    </div>
  );

  // Show date filter empty state when filter is active but no results
  if (tickets.length === 0 && isAnyFilterActive) {
    return (
      <>
        {dashboardSection}
        {filterHeader}
        <DateFilterEmpty />
      </>
    );
  }

  // Show ticket list with dashboard and filter header
  return (
    <>
      {dashboardSection}
      {filterHeader}
      <TicketList tickets={tickets} isLoading={false} />
    </>
  );
}
