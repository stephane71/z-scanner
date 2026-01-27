# Story 6.3: Sales by Market

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to see my sales broken down by market**,
So that **I can identify my best performing locations** (FR28).

## Acceptance Criteria

1. **Given** I am viewing the dashboard
   **When** I look at the market breakdown
   **Then** I see a list of my markets with: name, ticket count, total revenue
   **And** markets are sorted by revenue (highest first)
   **And** tapping a market filters the ticket list to that market

2. **Given** I have tickets without assigned markets
   **When** viewing the breakdown
   **Then** an "Non assigné" category shows unassigned ticket totals

## Tasks / Subtasks

- [x] **Task 1: Create useSalesByMarket Hook** (AC: #1, #2)
  - [x] Create `src/hooks/useSalesByMarket.ts`
  - [x] Uses useLiveQuery for reactive data from IndexedDB
  - [x] Returns `{ markets: MarketStats[], unassigned: MarketStats, isLoading }`
  - [x] Each MarketStats contains: `{ marketId, marketName, ticketCount, revenue }`
  - [x] Fetches markets from Dexie `markets` table for names
  - [x] Sorts markets by revenue (highest first)
  - [x] Handles "Non assigné" category for tickets with marketId = null
  - [x] Filters only validated tickets (excludes draft/cancelled)
  - [x] Export pure functions for testability (aggregateMarketStats, sortByRevenue, filterTicketsForMarket)
  - [x] Write unit tests for all scenarios (target: 15+ tests) - **24 tests**

- [x] **Task 2: Create SalesByMarketCard Component** (AC: #1, #2)
  - [x] Create `src/components/features/dashboard/SalesByMarketCard.tsx`
  - [x] Displays list of markets with: name, ticket count, revenue formatted
  - [x] "Non assigné" row at bottom if tickets without market exist
  - [x] Uses Card component from shadcn/ui
  - [x] Loading skeleton state while computing
  - [x] Empty state when no tickets at all
  - [x] Uses Lucide icons (MapPin, Package)
  - [x] Write unit tests (loading, data, empty state, unassigned) - target: 8+ tests - **9 tests**

- [x] **Task 3: Create MarketRow Component (Clickable)** (AC: #1)
  - [x] Create `src/components/features/dashboard/MarketRow.tsx`
  - [x] Displays single market row with name, count, revenue
  - [x] Clickable row with hover/active states
  - [x] Uses Link component for navigation
  - [x] 48px minimum touch target per UX
  - [x] Write unit tests - target: 5+ tests - **8 tests**

- [x] **Task 4: Integrate Navigation to Filtered Ticket List** (AC: #1)
  - [x] When market row is tapped, navigate to `/tickets?market={marketId}`
  - [x] Reuse existing MarketFilter from Story 4.4
  - [x] For "Non assigné", navigate to `/tickets?market=unassigned`
  - [x] Verify URL-based filtering works with existing implementation

- [x] **Task 5: Create Dedicated Analytics Page** (AC: #1, #2)
  - [x] Create `src/app/(app)/analytics/page.tsx` - Server Component shell
  - [x] Create `src/app/(app)/analytics/AnalyticsPageClient.tsx` - Client Component with dashboard cards
  - [x] Move dashboard cards (DashboardSummaryCard, SalesByPeriodCard, SalesByMarketCard) from TicketsPageClient to AnalyticsPageClient
  - [x] Remove date/market filters from analytics page (shows all data)
  - [x] Create `AnalyticsPageClient.test.tsx` with 3 test cases
  - [x] Update `TicketsPageClient.tsx` to remove dashboard cards (keep only filters and ticket list)
  - [x] Remove default month filter from TicketsPageClient (now shows all tickets by default)

- [x] **Task 6: Update Dashboard Barrel Export** (AC: all)
  - [x] Update `src/components/features/dashboard/index.ts`
  - [x] Export SalesByMarketCard, SalesByMarketLoadingSkeleton, MarketRow
  - [x] Export useSalesByMarket from `src/hooks/index.ts`

- [x] **Task 7: Style and Polish** (AC: #1, #2)
  - [x] Ensure 48px touch targets per UX guidelines (min-h-[48px] class)
  - [x] Verify mobile-first responsive design
  - [x] Verify accessibility (ARIA labels, screen reader support with sr-only)
  - [x] Visual distinction for clickable rows (ChevronRight icon, hover state)

- [x] **Task 8: Navigation Restructuring** (UX Enhancement)
  - [x] Create `src/components/features/navigation/FloatingScanButton.tsx` - FAB for scanner access
  - [x] Create `FloatingScanButton.test.tsx` with 10 test cases
  - [x] Update `BottomNavigation.tsx` - Replace Scanner tab with Analytics (Pilotage)
  - [x] Reorder navigation: Pilotage | Historique | Export | Paramètres
  - [x] Update `navigation/index.ts` to export FloatingScanButton
  - [x] Update `src/app/(app)/layout.tsx` to include FloatingScanButton
  - [x] Update `BottomNavigation.test.tsx` with new navigation structure

- [x] **Task 9: Fix PeriodBreakdown Accordion Behavior** (Bug Fix)
  - [x] Refactor `PeriodBreakdown.tsx` to controlled component with separate Trigger and Content
  - [x] Update `SalesByPeriodCard.tsx` to manage accordion open state
  - [x] Fix accordion closing when internal content changes

- [x] **Task 10: Market Navigation URL Fix** (Bug Fix)
  - [x] Update `MarketRow.tsx` to use `?markets={id}` parameter (not `?market=`)
  - [x] Update `useTicketsByMarket.ts` to support marketId=0 as special marker for unassigned tickets
  - [x] Verify navigation from MarketRow correctly filters ticket list

## Dev Notes

### Story Context (CRITICAL)

**THIS IS STORY 6.3 OF EPIC 6:** The third story of Epic 6 (Dashboard & Insights), adding market-based breakdown analytics.

**Epic 6 Overview:** Dashboard & Insights - Allow users to visualize their business activity and make better decisions.

**Dependencies:**
- Story 6.1 (Activity Dashboard - DONE): useDashboardStats pattern to follow, DashboardSummaryCard integration point
- Story 6.2 (Sales by Period - DONE): useSalesByPeriod pattern, PeriodBreakdown component pattern
- Story 3.1 (Dexie Schema - DONE): Tickets table with marketId field, Markets table
- Story 4.4 (Filter by Market - DONE): MarketFilter component, URL-based filtering pattern

**Related Stories:**
- Story 6.4 (Settings Page) - Final story of epic

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App Router, Server/Client components |
| react | 19.x | Components, hooks |
| dexie | 4.x | IndexedDB queries |
| dexie-react-hooks | 1.x | useLiveQuery for reactive aggregations |
| lucide-react | latest | Icons (MapPin, Store, ChevronRight) |
| tailwindcss | 4.x | Styling with @theme tokens |
| shadcn/ui | latest | Card component |

### Architecture Compliance (CRITICAL)

**From project-context.md:**

- **useLiveQuery is the single source of truth** for IndexedDB data
- **useState only for ephemeral UI state** (hover state, loading)
- **Data Formats:** Money as integer centimes (1250 = 12,50€)
- **API Response Format:** Not applicable - this is local-only

**From architecture.md:**

- **Offline-First:** All calculations from local IndexedDB data
- **Feature-based organization:** Components go in `src/components/features/dashboard/`

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

- **Touch Targets:** 48px minimum
- **Loading States:** Skeleton components, 300ms minimum display
- **Typography:** Inter font, 16px base
- **Interactive Elements:** Clickable rows need visual affordance (chevron, hover)

**Market Breakdown UI Pattern (from epics.md):**
```
┌─────────────────────────────────────────┐
│ 📍 Ventes par marché                    │
├─────────────────────────────────────────┤
│                                         │
│ 🏪 Marché de Belleville         >      │
│    8 tickets    │    € 567,80          │
│                                         │
│ 🏪 Marché des Lilas             >      │
│    5 tickets    │    € 345,20          │
│                                         │
│ 🏪 Marché de Montreuil          >      │
│    3 tickets    │    € 123,00          │
│                                         │
│ ⊘ Non assigné                   >      │
│    2 tickets    │    € 45,50           │
│                                         │
└─────────────────────────────────────────┘
```

### Existing Code to Leverage (CRITICAL - DO NOT REINVENT!)

**REUSE useDashboardStats Pattern (src/hooks/useDashboardStats.ts):**

```typescript
// Story 6.1 established this pattern - FOLLOW IT:
// 1. Pure functions for testability (aggregateDashboardStats, filterTicketsForDashboard)
// 2. useLiveQuery for reactive data
// 3. Defensive coding with nullish coalescing (??)

export function aggregateDashboardStats(tickets: TicketForAggregation[]): AggregatedStats {
  const marketIds = new Set<number>();
  let revenue = 0;
  for (const ticket of tickets) {
    revenue += ticket.total ?? 0;
    if (ticket.marketId) {
      marketIds.add(ticket.marketId);
    }
  }
  return { tickets: tickets.length, revenue, markets: marketIds.size };
}
```

**REUSE useSalesByPeriod Pattern (src/hooks/useSalesByPeriod.ts):**

```typescript
// Story 6.2 established grouping pattern:
export function aggregatePeriodStats(tickets: TicketForAggregation[]): { count: number; revenue: number } {
  let revenue = 0;
  for (const ticket of tickets) {
    revenue += ticket.total ?? 0;
  }
  return { count: tickets.length, revenue };
}
```

**EXISTING MARKET FILTER URL PATTERN (src/app/(app)/tickets/TicketsPageClient.tsx):**

```typescript
// Story 4.4 established URL-based market filtering:
const searchParams = useSearchParams();
const marketFilter = searchParams.get('market');
// Filter tickets by market in useLiveQuery
```

**EXISTING MARKETS DATA (src/lib/db/schema.ts):**

```typescript
// Dexie schema includes:
markets: '++id, userId, name, deletedAt'
tickets: '++id, userId, marketId, ...'
```

**FORMAT UTILITIES (src/lib/utils/format.ts):**

```typescript
// Already implemented:
export function formatCurrency(centimes: number): string // "12,50 €"
```

**SHADCN/UI COMPONENTS:**

```typescript
// Already available
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
```

**EXISTING TICKET TYPES (src/types/ticket.ts):**

```typescript
interface Ticket {
  id?: number;
  userId: string;
  marketId?: number;        // For market breakdown
  status: TicketStatus;     // 'draft' | 'validated' | 'cancelled'
  total: number;            // Centimes for revenue calculation
  // ...
}
```

**EXISTING MARKET TYPES (src/types/market.ts):**

```typescript
interface Market {
  id?: number;
  userId: string;
  name: string;
  deletedAt?: string | null;  // Soft delete for NF525
}
```

### Component Structure

```
src/hooks/
├── useSalesByMarket.ts         # NEW - Market aggregation hook
├── useSalesByMarket.test.ts    # NEW - Tests (15+ tests)
├── index.ts                    # MODIFY - Export useSalesByMarket

src/components/features/dashboard/
├── SalesByMarketCard.tsx       # NEW - Market breakdown card
├── SalesByMarketCard.test.tsx  # NEW - Tests (8+ tests)
├── MarketRow.tsx               # NEW - Clickable market row
├── MarketRow.test.tsx          # NEW - Tests (5+ tests)
├── index.ts                    # MODIFY - Export new components

src/app/(app)/tickets/
├── TicketsPageClient.tsx       # MODIFY - Add SalesByMarketCard integration
├── TicketsPageClient.test.tsx  # MODIFY - Update tests
```

### useSalesByMarket Hook Implementation Pattern

```typescript
// src/hooks/useSalesByMarket.ts
'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getThisMonth } from '@/lib/utils/date-ranges';

export interface MarketStats {
  marketId: number | null;  // null for unassigned
  marketName: string;       // "Non assigné" for null
  ticketCount: number;
  revenue: number;          // In centimes
}

export interface SalesByMarketResult {
  markets: MarketStats[];   // Sorted by revenue desc
  unassigned: MarketStats;  // Separate for easy access
  isLoading: boolean;
}

/** Pure function to aggregate tickets by market */
export function aggregateMarketStats(
  tickets: { marketId?: number | null; total?: number | null }[],
  marketNames: Map<number, string>
): { markets: Map<number, MarketStats>; unassigned: MarketStats } {
  const markets = new Map<number, MarketStats>();
  const unassigned: MarketStats = {
    marketId: null,
    marketName: 'Non assigné',
    ticketCount: 0,
    revenue: 0,
  };

  for (const ticket of tickets) {
    const revenue = ticket.total ?? 0;

    if (ticket.marketId) {
      const existing = markets.get(ticket.marketId);
      if (existing) {
        existing.ticketCount++;
        existing.revenue += revenue;
      } else {
        markets.set(ticket.marketId, {
          marketId: ticket.marketId,
          marketName: marketNames.get(ticket.marketId) ?? `Marché ${ticket.marketId}`,
          ticketCount: 1,
          revenue,
        });
      }
    } else {
      unassigned.ticketCount++;
      unassigned.revenue += revenue;
    }
  }

  return { markets, unassigned };
}

/** Pure function to sort markets by revenue (highest first) */
export function sortByRevenue(markets: MarketStats[]): MarketStats[] {
  return [...markets].sort((a, b) => b.revenue - a.revenue);
}

export function useSalesByMarket(userId: string): SalesByMarketResult {
  const { start, end } = getThisMonth();

  const result = useLiveQuery(
    async () => {
      if (!userId) {
        return { markets: [], unassigned: { marketId: null, marketName: 'Non assigné', ticketCount: 0, revenue: 0 } };
      }

      // Fetch markets for name lookup
      const allMarkets = await db.markets
        .where('userId')
        .equals(userId)
        .filter((m) => !m.deletedAt)
        .toArray();

      const marketNames = new Map<number, string>();
      for (const market of allMarkets) {
        if (market.id) marketNames.set(market.id, market.name);
      }

      // Fetch validated tickets for current month
      const tickets = await db.tickets
        .where('userId')
        .equals(userId)
        .filter((ticket) => {
          const date = ticket.impressionDate?.slice(0, 10);
          return date >= start && date <= end && ticket.status === 'validated';
        })
        .toArray();

      // Aggregate by market
      const { markets, unassigned } = aggregateMarketStats(tickets, marketNames);

      // Sort by revenue and convert to array
      const sortedMarkets = sortByRevenue(Array.from(markets.values()));

      return { markets: sortedMarkets, unassigned };
    },
    [userId, start, end]
  );

  return {
    markets: result?.markets ?? [],
    unassigned: result?.unassigned ?? { marketId: null, marketName: 'Non assigné', ticketCount: 0, revenue: 0 },
    isLoading: result === undefined,
  };
}
```

### Testing Strategy

**Unit Tests (co-located):**
- useSalesByMarket: loading state, empty data, correct counts per market, sorting, unassigned handling
- SalesByMarketCard: renders markets, loading skeleton, empty state, unassigned row
- MarketRow: renders correctly, click handler, accessibility

**Test Mocks:**
```typescript
// Mock date-ranges
vi.mock('@/lib/utils/date-ranges', () => ({
  getThisMonth: vi.fn(() => ({ start: '2026-01-01', end: '2026-01-31' })),
}));

// Mock useLiveQuery
const mockUseLiveQuery = vi.fn();
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (...args: unknown[]) => mockUseLiveQuery(...args),
}));

// Mock next/navigation for Link clicks
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
```

### Previous Story Intelligence (Story 6.2)

**Learnings to apply:**
1. Extract pure functions for testability (aggregateMarketStats, sortByRevenue)
2. useLiveQuery pattern works well for aggregations
3. Loading states with skeletons provide good UX
4. sr-only pattern for accessible screen reader text
5. Integration tests need to mock new components in TicketsPageClient

**Established patterns from Story 6.2:**
- `'use client'` directive for hooks and interactive components
- cn() utility for conditional classNames
- Lucide icons with aria-hidden="true"
- Test mocking pattern for hooks and Dexie
- Breakdown component pattern (expandable)

### Git Intelligence (Recent Commits)

```
661a786 feat(story-6-2): Implement Sales by Period feature with breakdown and trend analysis
791443f feat(story-6-1): Implement Activity Dashboard with summary card and stats hook
abbb093 test(CancellationDialog): Refactor tests for improved readability and consistency
```

**Commit message pattern:**
```
feat(story-6-3): Implement Sales by Market with clickable navigation to filtered list
```

### Forbidden Patterns (NEVER DO)

- Direct IndexedDB access - always use Dexie.js
- useEffect for data fetching - use useLiveQuery
- Hard-coded market names - fetch from markets table
- Skip loading states - always show skeleton
- Store money as floats - use integer centimes
- Mix naming conventions - camelCase in frontend
- Skip "Non assigné" category - always show unassigned tickets
- Navigation without URL params - use /tickets?market={id} pattern

### Project Structure Notes

- Dashboard components go in `src/components/features/dashboard/`
- Hook goes in `src/hooks/` with test co-located
- Integration in existing `TicketsPageClient.tsx`
- No new routes needed - clicking navigates to existing /tickets with market filter
- Reuse existing MarketFilter component for destination page

### References

- [Source: epics.md#Story-6.3] - Acceptance criteria and user story
- [Source: project-context.md#Data-Formats] - Money formatting rules
- [Source: architecture.md#Frontend-Architecture] - useLiveQuery as single source of truth
- [Source: src/hooks/useDashboardStats.ts] - Pattern for useLiveQuery aggregation with pure functions
- [Source: src/hooks/useSalesByPeriod.ts] - Pattern for grouping aggregation
- [Source: src/lib/utils/format.ts] - formatCurrency utility
- [Source: src/types/ticket.ts] - Ticket interface with marketId
- [Source: src/types/market.ts] - Market interface
- [Source: src/app/(app)/tickets/TicketsPageClient.tsx] - URL-based market filtering

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - All 1229 tests passed after code review fixes

### Completion Notes List

- Implemented TDD approach throughout: RED (write failing tests) -> GREEN (implement) -> REFACTOR
- Created 54 total tests: 24 hook tests + 9 card tests + 8 row tests + 10 FAB tests + 3 analytics page tests
- Pure functions extracted for testability: filterTicketsForMarket, aggregateMarketStats, sortByRevenue
- Used existing patterns from Story 6.1 (useDashboardStats) and Story 6.2 (useSalesByPeriod)
- MarketRow navigation uses Link component with `/tickets?markets={id}` URL pattern (corrected from ?market=)
- "Non assigné" category navigates to `/tickets?markets=0` using special marker in useTicketsByMarket
- 48px minimum touch targets implemented with Tailwind min-h-[48px] class
- Accessibility: aria-labels on links, sr-only for screen reader text, aria-hidden on decorative icons

**UI/Navigation Restructuring (Code Review Addition):**
- Created dedicated `/analytics` page with all dashboard cards (DashboardSummaryCard, SalesByPeriodCard, SalesByMarketCard)
- Created FloatingScanButton (FAB) positioned bottom-right above navigation for scanner access on all pages except /scan
- Restructured BottomNavigation: replaced Scanner tab with Analytics (Pilotage), reordered to Pilotage | Historique | Export | Paramètres
- Removed dashboard cards from TicketsPageClient (now only filters and ticket list)
- Removed default month filter from TicketsPageClient (now shows all tickets when no filter specified)
- Fixed PeriodBreakdown accordion behavior by refactoring to controlled component pattern
- Fixed MarketRow URL parameter mismatch (was `?market=` should be `?markets=`)
- Added marketId=0 support in useTicketsByMarket as special marker for unassigned tickets

### File List

| File | Action |
|------|--------|
| src/hooks/useSalesByMarket.ts | NEW |
| src/hooks/useSalesByMarket.test.ts | NEW |
| src/hooks/index.ts | MODIFIED - Added useSalesByMarket export |
| src/hooks/useTicketsByMarket.ts | MODIFIED - Support marketId=0 as unassigned marker |
| src/components/features/dashboard/SalesByMarketCard.tsx | NEW |
| src/components/features/dashboard/SalesByMarketCard.test.tsx | NEW |
| src/components/features/dashboard/MarketRow.tsx | NEW |
| src/components/features/dashboard/MarketRow.test.tsx | NEW |
| src/components/features/dashboard/PeriodBreakdown.tsx | MODIFIED - Refactored to controlled component |
| src/components/features/dashboard/SalesByPeriodCard.tsx | MODIFIED - Manages accordion open state |
| src/components/features/dashboard/index.ts | MODIFIED - Added SalesByMarketCard, MarketRow exports |
| src/components/features/navigation/FloatingScanButton.tsx | NEW |
| src/components/features/navigation/FloatingScanButton.test.tsx | NEW |
| src/components/features/navigation/BottomNavigation.tsx | MODIFIED - Replaced Scanner with Analytics, reordered |
| src/components/features/navigation/BottomNavigation.test.tsx | MODIFIED - Updated for new navigation structure |
| src/components/features/navigation/index.ts | MODIFIED - Added FloatingScanButton export |
| src/app/(app)/analytics/page.tsx | NEW |
| src/app/(app)/analytics/AnalyticsPageClient.tsx | NEW |
| src/app/(app)/analytics/AnalyticsPageClient.test.tsx | NEW |
| src/app/(app)/layout.tsx | MODIFIED - Added FloatingScanButton |
| src/app/(app)/tickets/TicketsPageClient.tsx | MODIFIED - Removed dashboard cards, removed default date filter |
| src/app/(app)/tickets/TicketsPageClient.test.tsx | MODIFIED - Updated expectations for changes |

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-27 | Story created with comprehensive context from Story 6.1 and 6.2 intelligence | Claude Opus 4.5 |
| 2026-01-27 | Implementation complete: useSalesByMarket hook (24 tests), SalesByMarketCard (9 tests), MarketRow (8 tests), dashboard integration | Claude Opus 4.5 |
| 2026-01-27 | UI/Navigation restructuring: Created dedicated /analytics page, FloatingScanButton FAB, restructured BottomNavigation | Claude Opus 4.5 |
| 2026-01-27 | Bug fixes: PeriodBreakdown accordion behavior, MarketRow URL parameter (?markets= not ?market=), useTicketsByMarket marketId=0 marker | Claude Opus 4.5 |
| 2026-01-27 | Code review: Updated story File List with 14 missing files, updated Tasks 5-10, updated Completion Notes | Claude Opus 4.5 |
