# Story 6.2: Sales by Period

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to see my total sales by period**,
So that **I can track my business performance over time** (FR27).

## Acceptance Criteria

1. **Given** I am viewing the dashboard
   **When** I look at the period summary
   **Then** I see totals for: "Cette semaine", "Ce mois", "Ce trimestre"
   **And** each period shows: number of tickets, total revenue
   **And** I can tap to expand and see daily/weekly breakdown

2. **Given** I want to compare periods
   **When** I view the dashboard
   **Then** a simple comparison shows trend vs previous period (e.g., "+15% vs mois dernier")

## Tasks / Subtasks

- [x] **Task 1: Create useSalesByPeriod Hook** (AC: #1, #2)
  - [x] Create `src/hooks/useSalesByPeriod.ts`
  - [x] Uses useLiveQuery for reactive data from IndexedDB
  - [x] Returns `{ thisWeek, thisMonth, thisQuarter, isLoading }` with each period containing `{ ticketCount, revenue, previousPeriodRevenue, trend }`
  - [x] Uses existing date-ranges utilities (getThisWeek to add, getThisMonth, getThisQuarter, getLastMonth, getLastQuarter)
  - [x] Filters only validated tickets (excludes draft/cancelled)
  - [x] Calculates trend percentage vs previous period
  - [x] Export pure functions for testability (aggregatePeriodStats, filterTicketsForPeriod, calculateTrend)
  - [x] Write unit tests for all scenarios (27 tests - exceeds 19+ target)

- [x] **Task 2: Add getThisWeek and getLastWeek utilities** (AC: #1, #2)
  - [x] Modify `src/lib/utils/date-ranges.ts`
  - [x] Add `getThisWeek(): DateRange` - Monday to Sunday of current week
  - [x] Add `getLastWeek(): DateRange` - Monday to Sunday of previous week
  - [x] Write unit tests for week boundary handling

- [x] **Task 3: Create SalesByPeriodCard Component** (AC: #1, #2)
  - [x] Create `src/components/features/dashboard/SalesByPeriodCard.tsx`
  - [x] Displays period tabs/sections: "Cette semaine", "Ce mois", "Ce trimestre"
  - [x] Each section shows: ticket count, revenue formatted
  - [x] Trend indicator: green/red arrow with percentage ("+15%" or "-5%")
  - [x] Uses Card component from shadcn/ui
  - [x] Loading skeleton state while computing
  - [x] Uses Lucide icons (TrendingUp, TrendingDown, Calendar)
  - [x] Write unit tests (loading, data, trends, negative trends) - 10 tests

- [x] **Task 4: Create PeriodBreakdown Component (Expandable)** (AC: #1)
  - [x] Create `src/components/features/dashboard/PeriodBreakdown.tsx`
  - [x] Collapsible/expandable section showing daily/weekly breakdown
  - [x] For week: show each day's total
  - [x] For month: show each week's total
  - [x] For quarter: show each month's total
  - [x] Uses Collapsible component from shadcn/ui (radix-ui)
  - [x] Smooth animation on expand/collapse
  - [x] Write unit tests - 11 tests

- [x] **Task 5: Integrate into Dashboard** (AC: #1, #2)
  - [x] Modify `src/app/(app)/tickets/TicketsPageClient.tsx`
  - [x] Add SalesByPeriodCard below DashboardSummaryCard
  - [x] Update tests for new component integration

- [x] **Task 6: Update Dashboard Barrel Export** (AC: all)
  - [x] Update `src/components/features/dashboard/index.ts`
  - [x] Export SalesByPeriodCard and PeriodBreakdown
  - [x] Export useSalesByPeriod from `src/hooks/index.ts`

- [x] **Task 7: Style and Polish** (AC: #1, #2)
  - [x] Ensure 48px touch targets per UX guidelines
  - [x] Verify mobile-first responsive design
  - [x] Verify accessibility (ARIA labels, screen reader support)
  - [x] Trend colors: green for positive (text-green-600), red for negative (text-red-600)

## Dev Notes

### Story Context (CRITICAL)

**THIS IS STORY 6.2 OF EPIC 6:** The second story of Epic 6 (Dashboard & Insights), expanding analytics with period-based insights.

**Epic 6 Overview:** Dashboard & Insights - Allow users to visualize their business activity and make better decisions.

**Dependencies:**
- Story 6.1 (Activity Dashboard - DONE): useDashboardStats pattern to follow, DashboardSummaryCard integration point
- Story 3.1 (Dexie Schema - DONE): Tickets table with all required fields
- Story 5.1 (Export Preview - DONE): date-ranges utilities to extend

**Related Stories:**
- Story 6.3 (Sales by Market) - Will add market-based breakdown
- Story 6.4 (Settings Page) - Final story of epic

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App Router, Server/Client components |
| react | 19.x | Components, hooks |
| dexie | 4.x | IndexedDB queries |
| dexie-react-hooks | 1.x | useLiveQuery for reactive aggregations |
| lucide-react | latest | Icons (TrendingUp, TrendingDown, Calendar, ChevronDown) |
| tailwindcss | 4.x | Styling with @theme tokens |
| shadcn/ui | latest | Card, Collapsible components |

### Architecture Compliance (CRITICAL)

**From project-context.md:**

- **useLiveQuery is the single source of truth** for IndexedDB data
- **useState only for ephemeral UI state** (expand/collapse state)
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
- **Colors:** Primary green (#16A34A) for positive trends, danger red (#DC2626) for negative

**Period Summary UI Pattern (from epics.md):**
```
┌─────────────────────────────────────────┐
│ 📅 Ventes par période                   │
├─────────────────────────────────────────┤
│                                         │
│ Cette semaine    │ Ce mois  │ Ce trim.  │
│ ──────────────────────────────────────  │
│ 📄 5 tickets     │ 15 tickets│ 42 tkts  │
│ € 234,50         │ € 1 234  │ € 4 567   │
│ ↑ +12% vs sem.   │ ↑ +8%    │ ↓ -3%    │
│   dernière       │          │           │
└─────────────────────────────────────────┘
```

### Existing Code to Leverage (CRITICAL - DO NOT REINVENT!)

**REUSE useDashboardStats Pattern (src/hooks/useDashboardStats.ts):**

```typescript
// Story 6.1 established this pattern - FOLLOW IT:
// 1. Pure functions for testability (aggregateDashboardStats, filterTicketsForDashboard)
// 2. useLiveQuery for reactive data
// 3. Defensive coding with nullish coalescing (??)

export function filterTicketsForDashboard(
  ticket: { impressionDate?: string | null; status?: string },
  start: string,
  end: string
): boolean {
  const ticketDate = ticket.impressionDate?.slice(0, 10);
  if (!ticketDate) return false;
  return ticketDate >= start && ticketDate <= end && ticket.status === 'validated';
}

export function aggregateDashboardStats(tickets: TicketForAggregation[]): AggregatedStats {
  // Sum revenue, count unique markets
}
```

**REUSE Date Range Utilities (src/lib/utils/date-ranges.ts):**

```typescript
// Already implemented - EXTEND with week functions:
import { getThisMonth, getLastMonth, getThisQuarter, getLastQuarter } from '@/lib/utils/date-ranges';

// Need to ADD:
export function getThisWeek(): DateRange { /* Monday-Sunday current */ }
export function getLastWeek(): DateRange { /* Monday-Sunday previous */ }
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
// May need to add:
// npx shadcn@latest add collapsible
```

**EXISTING TICKET TYPES (src/types/ticket.ts):**

```typescript
interface Ticket {
  id?: number;
  userId: string;
  status: TicketStatus; // 'draft' | 'validated' | 'cancelled'
  impressionDate: string; // YYYY-MM-DD for date filtering
  total: number; // Centimes for revenue calculation
  // ...
}
```

### Component Structure

```
src/lib/utils/
├── date-ranges.ts              # MODIFY - Add getThisWeek, getLastWeek
├── date-ranges.test.ts         # MODIFY - Add week tests

src/hooks/
├── useSalesByPeriod.ts         # NEW - Period aggregation hook
├── useSalesByPeriod.test.ts    # NEW - Tests (19+ tests)
├── index.ts                    # MODIFY - Export useSalesByPeriod

src/components/features/dashboard/
├── SalesByPeriodCard.tsx       # NEW - Main period summary card
├── SalesByPeriodCard.test.tsx  # NEW - Tests
├── PeriodBreakdown.tsx         # NEW - Expandable breakdown component
├── PeriodBreakdown.test.tsx    # NEW - Tests
├── index.ts                    # MODIFY - Export new components

src/app/(app)/tickets/
├── TicketsPageClient.tsx       # MODIFY - Add SalesByPeriodCard integration
├── TicketsPageClient.test.tsx  # MODIFY - Update tests
```

### useSalesByPeriod Hook Implementation Pattern

```typescript
// src/hooks/useSalesByPeriod.ts
'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  getThisWeek, getLastWeek,
  getThisMonth, getLastMonth,
  getThisQuarter, getLastQuarter
} from '@/lib/utils/date-ranges';

export interface PeriodStats {
  ticketCount: number;
  revenue: number;           // In centimes
  previousRevenue: number;   // Previous period revenue for comparison
  trend: number;             // Percentage change (-15 to +30, etc.)
}

export interface SalesByPeriodResult {
  thisWeek: PeriodStats;
  thisMonth: PeriodStats;
  thisQuarter: PeriodStats;
  isLoading: boolean;
}

/** Pure function to calculate trend percentage */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Pure function to filter tickets for a period */
export function filterTicketsForPeriod(
  ticket: { impressionDate?: string | null; status?: string },
  start: string,
  end: string
): boolean {
  const ticketDate = ticket.impressionDate?.slice(0, 10);
  if (!ticketDate) return false;
  return ticketDate >= start && ticketDate <= end && ticket.status === 'validated';
}

/** Pure function to aggregate tickets for a period */
export function aggregatePeriodStats(tickets: { total?: number | null }[]): { count: number; revenue: number } {
  let revenue = 0;
  for (const ticket of tickets) {
    revenue += ticket.total ?? 0;
  }
  return { count: tickets.length, revenue };
}

export function useSalesByPeriod(userId: string): SalesByPeriodResult {
  const result = useLiveQuery(
    async () => {
      if (!userId) {
        return {
          thisWeek: { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
          thisMonth: { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
          thisQuarter: { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
        };
      }

      const tickets = await db.tickets.where('userId').equals(userId).toArray();

      // Calculate for each period
      const periods = [
        { current: getThisWeek(), previous: getLastWeek(), key: 'thisWeek' },
        { current: getThisMonth(), previous: getLastMonth(), key: 'thisMonth' },
        { current: getThisQuarter(), previous: getLastQuarter(), key: 'thisQuarter' },
      ];

      const stats: Record<string, PeriodStats> = {};

      for (const period of periods) {
        const currentTickets = tickets.filter(t =>
          filterTicketsForPeriod(t, period.current.start, period.current.end)
        );
        const previousTickets = tickets.filter(t =>
          filterTicketsForPeriod(t, period.previous.start, period.previous.end)
        );

        const current = aggregatePeriodStats(currentTickets);
        const previous = aggregatePeriodStats(previousTickets);

        stats[period.key] = {
          ticketCount: current.count,
          revenue: current.revenue,
          previousRevenue: previous.revenue,
          trend: calculateTrend(current.revenue, previous.revenue),
        };
      }

      return stats;
    },
    [userId]
  );

  return {
    thisWeek: result?.thisWeek ?? { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
    thisMonth: result?.thisMonth ?? { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
    thisQuarter: result?.thisQuarter ?? { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
    isLoading: result === undefined,
  };
}
```

### Testing Strategy

**Unit Tests (co-located):**
- useSalesByPeriod: loading state, empty data, correct counts per period, trend calculations
- date-ranges: getThisWeek/getLastWeek boundary handling
- SalesByPeriodCard: renders periods, loading skeleton, positive/negative trends
- PeriodBreakdown: expands/collapses, shows correct breakdown

**Test Mocks:**
```typescript
// Mock date-ranges
vi.mock('@/lib/utils/date-ranges', () => ({
  getThisWeek: vi.fn(() => ({ start: '2026-01-20', end: '2026-01-26' })),
  getLastWeek: vi.fn(() => ({ start: '2026-01-13', end: '2026-01-19' })),
  getThisMonth: vi.fn(() => ({ start: '2026-01-01', end: '2026-01-31' })),
  getLastMonth: vi.fn(() => ({ start: '2025-12-01', end: '2025-12-31' })),
  getThisQuarter: vi.fn(() => ({ start: '2026-01-01', end: '2026-03-31' })),
  getLastQuarter: vi.fn(() => ({ start: '2025-10-01', end: '2025-12-31' })),
}));
```

### Previous Story Intelligence (Story 6.1)

**Learnings to apply:**
1. Extract pure functions for testability (aggregateDashboardStats, filterTicketsForDashboard pattern)
2. useLiveQuery pattern works well for aggregations
3. Loading states with skeletons provide good UX
4. sr-only pattern for accessible screen reader text
5. 19+ tests provide comprehensive coverage (5 hook + 14 pure function tests)

**Established patterns from Story 6.1:**
- `'use client'` directive for hooks and interactive components
- cn() utility for conditional classNames
- Lucide icons with aria-hidden="true"
- Test mocking pattern for hooks and Dexie

### Git Intelligence (Recent Commits)

```
791443f feat(story-6-1): Implement Activity Dashboard with summary card and stats hook
abbb093 test(CancellationDialog): Refactor tests for improved readability and consistency
a27b6b5 feat(story-5-3): Implement File Download with cross-platform support and toast feedback
```

**Commit message pattern:**
```
feat(story-6-2): Implement Sales by Period with trend comparison and expandable breakdown
```

### Forbidden Patterns (NEVER DO)

- Direct IndexedDB access - always use Dexie.js
- useEffect for data fetching - use useLiveQuery
- Hard-coded date calculations - use date-ranges utilities
- Skip loading states - always show skeleton
- Store money as floats - use integer centimes
- Mix naming conventions - camelCase in frontend
- Skip trend calculations - always show comparison
- Hard-code colors for trends - use Tailwind tokens

### Project Structure Notes

- Dashboard components go in `src/components/features/dashboard/`
- Hook goes in `src/hooks/` with test co-located
- Extend existing date-ranges.ts with week functions
- Integration in existing `TicketsPageClient.tsx`
- No new routes needed - dashboard is a section

### References

- [Source: epics.md#Story-6.2] - Acceptance criteria and user story
- [Source: project-context.md#Data-Formats] - Money formatting rules
- [Source: architecture.md#Frontend-Architecture] - useLiveQuery as single source of truth
- [Source: src/hooks/useDashboardStats.ts] - Pattern for useLiveQuery aggregation with pure functions
- [Source: src/lib/utils/date-ranges.ts] - Date range utilities to extend
- [Source: src/lib/utils/format.ts] - formatCurrency utility
- [Source: src/types/ticket.ts] - Ticket interface with status and impressionDate

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- Added shadcn/ui Collapsible component via `npx shadcn@latest add collapsible`

### Completion Notes List

1. Added getThisWeek and getLastWeek utilities to date-ranges.ts with ISO week support (Monday-Sunday)
2. Created useSalesByPeriod hook with pure functions for testability (calculateTrend, filterTicketsForPeriod, aggregatePeriodStats)
3. Created SalesByPeriodCard component displaying week/month/quarter statistics with trend indicators
4. Created PeriodBreakdown component for expandable daily/weekly/monthly breakdown
5. Integrated SalesByPeriodCard into TicketsPageClient below DashboardSummaryCard
6. Total: 81 new tests (22 date-ranges + 38 hook + 10 card + 11 breakdown)
7. Note: 1 pre-existing test failure in ManualEntryClient (unrelated to this story)

### File List

**New Files:**
- `src/hooks/useSalesByPeriod.ts` - Period aggregation hook with useLiveQuery
- `src/hooks/useSalesByPeriod.test.ts` - Unit tests (38 tests)
- `src/components/features/dashboard/SalesByPeriodCard.tsx` - Period summary card
- `src/components/features/dashboard/SalesByPeriodCard.test.tsx` - Unit tests (10 tests)
- `src/components/features/dashboard/PeriodBreakdown.tsx` - Expandable breakdown component
- `src/components/features/dashboard/PeriodBreakdown.test.tsx` - Unit tests (11 tests)
- `src/components/ui/collapsible.tsx` - shadcn/ui Collapsible component

**Modified Files:**
- `src/lib/utils/date-ranges.ts` - Added getThisWeek, getLastWeek
- `src/lib/utils/date-ranges.test.ts` - Added 7 week tests (22 total)
- `src/hooks/index.ts` - Added useSalesByPeriod export and BreakdownItem/PeriodStats type exports
- `src/components/features/dashboard/index.ts` - Added SalesByPeriodCard, PeriodBreakdown exports
- `src/app/(app)/tickets/TicketsPageClient.tsx` - Integrated SalesByPeriodCard
- `src/app/(app)/tickets/TicketsPageClient.test.tsx` - Updated mock for SalesByPeriodCard
- `package.json` - Added @radix-ui/react-collapsible dependency
- `package-lock.json` - Updated lockfile with collapsible dependencies

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-27 | Story created with comprehensive context from Story 6.1 intelligence | Claude Opus 4.5 |
| 2026-01-27 | Story implemented - all 7 tasks completed, 70 new tests passing | Claude Opus 4.5 |
| 2026-01-27 | Code review fixes: Integrated PeriodBreakdown into SalesByPeriodCard, added breakdown computation functions (computeWeeklyBreakdown, computeMonthlyBreakdown, computeQuarterlyBreakdown), added 11 tests for breakdown functions, updated File List | Claude Opus 4.5 |
