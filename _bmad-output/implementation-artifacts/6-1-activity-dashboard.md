# Story 6.1: Activity Dashboard

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to see a summary of my activity**,
So that **I can quickly understand my business status** (FR26).

## Acceptance Criteria

1. **Given** I am logged in (dashboard could be integrated into /tickets or separate)
   **When** I view the dashboard section
   **Then** I see a summary card with:
   - Total tickets this month
   - Total revenue this month (in euros)
   - Number of markets visited
   **And** data loads reactively via useLiveQuery
   **And** loading state shows skeleton while computing

2. **Given** I have no tickets
   **When** the dashboard loads
   **Then** zeros are displayed gracefully
   **And** an encouraging message invites me to scan my first ticket

## Tasks / Subtasks

- [x] **Task 1: Create useDashboardStats Hook** (AC: #1, #2)
  - [x] Create `src/hooks/useDashboardStats.ts`
  - [x] Uses useLiveQuery for reactive data from IndexedDB
  - [x] Returns `{ ticketsThisMonth, revenueThisMonth, marketsVisited, isLoading }`
  - [x] Filters tickets by current month using impressionDate
  - [x] Only counts validated tickets (excludes draft/cancelled)
  - [x] Aggregates unique marketIds for markets visited count
  - [x] Write unit tests for all scenarios

- [x] **Task 2: Create DashboardSummaryCard Component** (AC: #1, #2)
  - [x] Create `src/components/features/dashboard/DashboardSummaryCard.tsx`
  - [x] Displays three key metrics: tickets count, revenue, markets visited
  - [x] Uses Card component from shadcn/ui
  - [x] Loading skeleton state while computing
  - [x] Empty state with encouraging message when no tickets
  - [x] Uses Lucide icons for visual clarity (Receipt, Euro, MapPin)
  - [x] Write unit tests (loading, data, empty state)

- [x] **Task 3: Integrate Dashboard into Tickets Page** (AC: #1)
  - [x] Modify `src/app/(app)/tickets/TicketsPageClient.tsx`
  - [x] Add DashboardSummaryCard at the top of the page
  - [x] Dashboard appears above the ticket list and filters
  - [x] Dashboard shown on empty state for encouraging message

- [x] **Task 4: Create Dashboard Component Barrel Export** (AC: all)
  - [x] Create `src/components/features/dashboard/index.ts`
  - [x] Export DashboardSummaryCard and any supporting components
  - [x] Export useDashboardStats from `src/hooks/index.ts`

- [x] **Task 5: Style and Polish** (AC: #1, #2)
  - [x] Ensure 48px touch targets per UX guidelines
  - [x] Verify mobile-first responsive design
  - [x] Test dark mode compatibility (if applicable)
  - [x] Verify accessibility (ARIA labels, contrast, screen reader support)

## Dev Notes

### Story Context (CRITICAL)

**THIS IS STORY 6.1 OF EPIC 6:** The first story of Epic 6 (Dashboard & Insights), initiating the analytics feature set.

**Epic 6 Overview:** Dashboard & Insights - Allow users to visualize their business activity and make better decisions.

**Dependencies:**
- Story 3.1 (Dexie Schema - DONE): Tickets table with all required fields
- Story 4.1 (Ticket List - DONE): TicketsPageClient where dashboard will be integrated
- Story 5.1 (Export Preview - DONE): useExportPreview hook pattern to follow for useLiveQuery aggregation

**Related Stories:**
- Story 6.2 (Sales by Period) - Will expand on period-based analytics
- Story 6.3 (Sales by Market) - Will expand on market-based breakdown
- Story 6.4 (Settings Page) - Final story of epic

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App Router, Server/Client components |
| react | 19.x | Components, hooks |
| dexie | 4.x | IndexedDB queries |
| dexie-react-hooks | 1.x | useLiveQuery for reactive aggregations |
| lucide-react | latest | Icons (Receipt, Euro, MapPin, Sparkles) |
| tailwindcss | 4.x | Styling with @theme tokens |
| shadcn/ui | latest | Card component |

### Architecture Compliance (CRITICAL)

**From project-context.md:**

- **useLiveQuery is the single source of truth** for IndexedDB data
- **useState only for ephemeral UI state** (collapsible state, animations)
- **Data Formats:** Money as integer centimes (1250 = 12,50€)
- **API Response Format:** Not applicable - this is local-only

**From architecture.md:**

- **Offline-First:** Dashboard must work offline using local IndexedDB data
- **Feature-based organization:** Components go in `src/components/features/dashboard/`

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

- **Touch Targets:** 48px minimum
- **Loading States:** Skeleton components, 300ms minimum display
- **Empty State:** Illustration + CTA message
- **Typography:** Inter font, 16px base

**Dashboard UI Pattern (from epics.md):**
```
┌─────────────────────────────────────────┐
│ 📊 Mon activité ce mois                 │
├─────────────────────────────────────────┤
│                                         │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│   │ 📄 15   │ │ € 1 234 │ │ 📍 3    │  │
│   │ tickets │ │   ,50   │ │ marchés │  │
│   └─────────┘ └─────────┘ └─────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Empty State:**
```
┌─────────────────────────────────────────┐
│ 📊 Mon activité ce mois                 │
├─────────────────────────────────────────┤
│                                         │
│         ✨ Prêt à commencer !           │
│                                         │
│    Scannez votre premier ticket Z       │
│    pour voir vos statistiques ici       │
│                                         │
└─────────────────────────────────────────┘
```

### Existing Code to Leverage (CRITICAL - DO NOT REINVENT!)

**REUSE useExportPreview Pattern (src/hooks/useExportPreview.ts):**

```typescript
// Already implemented! Follow this pattern for useDashboardStats:
export function useExportPreview(
  userId: string,
  startDate: string,
  endDate: string,
): UseExportPreviewResult {
  const result = useLiveQuery(async () => {
    // Query tickets in date range
    const tickets = await db.tickets
      .where("userId")
      .equals(userId)
      .filter((ticket) => {
        const ticketDate = ticket.impressionDate?.slice(0, 10);
        return ticketDate >= startDate && ticketDate <= endDate;
      })
      .toArray();

    // Aggregate
    let count = 0;
    let total = 0;
    for (const ticket of tickets) {
      if (ticket.status === "validated") {
        count++;
        total += ticket.total ?? 0;
      }
    }
    return { count, total };
  }, [userId, startDate, endDate]);

  return {
    ticketCount: result?.count ?? 0,
    totalAmount: result?.total ?? 0,
    isLoading: result === undefined,
  };
}
```

**REUSE Date Range Helpers (src/lib/utils/date-ranges.ts):**

```typescript
// Already implemented! Use for "this month" range:
import { getThisMonth } from '@/lib/utils/date-ranges';

const { start, end } = getThisMonth();
// start: "2026-01-01", end: "2026-01-31"
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
// Ticket interface includes:
interface Ticket {
  id?: number;
  userId: string;
  marketId?: number;           // For markets visited count
  status: TicketStatus;        // 'draft' | 'validated' | 'cancelled'
  impressionDate: string;      // YYYY-MM-DD for date filtering
  total: number;               // Centimes for revenue calculation
  // ...
}
```

### Component Structure

```
src/hooks/
├── useDashboardStats.ts        # NEW - Dashboard aggregation hook
├── useDashboardStats.test.ts   # NEW - Tests
├── index.ts                    # MODIFY - Export useDashboardStats

src/components/features/dashboard/
├── DashboardSummaryCard.tsx    # NEW - Summary card component
├── DashboardSummaryCard.test.tsx # NEW - Tests
├── index.ts                    # NEW - Barrel export

src/app/(app)/tickets/
├── TicketsPageClient.tsx       # MODIFY - Add dashboard integration
├── TicketsPageClient.test.tsx  # MODIFY - Add dashboard tests
```

### useDashboardStats Hook Implementation Pattern

```typescript
// src/hooks/useDashboardStats.ts
'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getThisMonth } from '@/lib/utils/date-ranges';

export interface DashboardStats {
  ticketsThisMonth: number;
  revenueThisMonth: number;  // In centimes
  marketsVisited: number;
  isLoading: boolean;
}

export function useDashboardStats(userId: string): DashboardStats {
  const { start, end } = getThisMonth();

  const result = useLiveQuery(async () => {
    if (!userId) return { tickets: 0, revenue: 0, markets: 0 };

    const tickets = await db.tickets
      .where('userId')
      .equals(userId)
      .filter((ticket) => {
        const date = ticket.impressionDate?.slice(0, 10);
        return date >= start && date <= end && ticket.status === 'validated';
      })
      .toArray();

    const marketIds = new Set<number>();
    let revenue = 0;

    for (const ticket of tickets) {
      revenue += ticket.total ?? 0;
      if (ticket.marketId) {
        marketIds.add(ticket.marketId);
      }
    }

    return {
      tickets: tickets.length,
      revenue,
      markets: marketIds.size,
    };
  }, [userId, start, end]);

  return {
    ticketsThisMonth: result?.tickets ?? 0,
    revenueThisMonth: result?.revenue ?? 0,
    marketsVisited: result?.markets ?? 0,
    isLoading: result === undefined,
  };
}
```

### Testing Strategy

**Unit Tests (co-located):**
- useDashboardStats: returns correct counts, handles empty data, filters by month and status
- DashboardSummaryCard: renders stats, loading skeleton, empty state

**Test Mocks:**
```typescript
// Mock Dexie
vi.mock('@/lib/db', () => ({
  db: {
    tickets: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          filter: vi.fn(() => ({
            toArray: vi.fn().mockResolvedValue([]),
          })),
        })),
      })),
    },
  },
}));

// Mock useLiveQuery
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((fn) => {
    // Return mock data based on test scenario
  }),
}));

// Mock date-ranges
vi.mock('@/lib/utils/date-ranges', () => ({
  getThisMonth: vi.fn(() => ({ start: '2026-01-01', end: '2026-01-31' })),
}));
```

### Previous Story Intelligence (Story 5.3)

**Learnings to apply:**
1. useLiveQuery pattern works well for aggregations - follow useExportPreview exactly
2. Loading states with skeletons provide good UX
3. Empty states with encouraging messages improve first-time experience
4. Defensive coding with nullish coalescing (`??`) prevents undefined errors

**Established patterns from Epic 5:**
- `'use client'` directive for hooks and interactive components
- cn() utility for conditional classNames
- Lucide icons with aria-hidden="true"
- Test mocking pattern for hooks and Dexie

### Git Intelligence (Recent Commits)

```
abbb093 test(CancellationDialog): Refactor tests for improved readability and consistency
a27b6b5 feat(story-5-3): Implement File Download with cross-platform support and toast feedback
49d4df8 feat(story-5-2): Implement CSV Export Generation with error handling and loading state
4a1dfeb feat(story-5-1): Implement Export Page with Period Selection and Preview functionality
c107ec2 feat(story-4-7): Implement NF525-compliant ticket cancellation with CancellationDialog and useCancelTicket hook
```

**Commit message pattern:**
```
feat(story-6-1): Implement Activity Dashboard with summary card and stats hook
```

### Forbidden Patterns (NEVER DO)

- Direct IndexedDB access - always use Dexie.js
- useEffect for data fetching - use useLiveQuery
- Hard-coded date calculations - use date-ranges utilities
- Skip loading states - always show skeleton
- Ignore empty states - show encouraging message
- Store money as floats - use integer centimes
- Mix naming conventions - camelCase in frontend

### Project Structure Notes

- Dashboard components go in `src/components/features/dashboard/`
- Hook goes in `src/hooks/` with test co-located
- Integration in existing `TicketsPageClient.tsx`
- No new routes needed - dashboard is a section, not a page

### References

- [Source: epics.md#Story-6.1] - Acceptance criteria and user story
- [Source: project-context.md#Data-Formats] - Money formatting rules
- [Source: architecture.md#Frontend-Architecture] - useLiveQuery as single source of truth
- [Source: src/hooks/useExportPreview.ts] - Pattern for useLiveQuery aggregation
- [Source: src/lib/utils/date-ranges.ts] - getThisMonth utility
- [Source: src/lib/utils/format.ts] - formatCurrency utility
- [Source: src/types/ticket.ts] - Ticket interface with marketId and status

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- Added shadcn/ui Skeleton component via `npx shadcn@latest add skeleton`

### Completion Notes List

1. Created useDashboardStats hook with useLiveQuery for reactive aggregation of tickets by current month
2. Created DashboardSummaryCard component with loading skeleton, empty state, and stats grid
3. Integrated dashboard into TicketsPageClient above filters and ticket list
4. Added comprehensive accessibility (ARIA labels, screen reader support)
5. All 47 Story 6.1 tests passing (19 hook tests, 7 component tests, 21 integration tests)
6. Note: 1 pre-existing test failure in ManualEntryClient (unrelated to this story)

### Code Review Fixes Applied

1. **[MEDIUM] Test coverage for query function logic:** Extracted `aggregateDashboardStats` and `filterTicketsForDashboard` as pure functions. Added 14 new tests covering filtering logic, date boundary handling, null/undefined handling, and market deduplication.
2. **[LOW] Export reusable components:** Renamed and exported `DashboardLoadingSkeleton` and `DashboardEmptyState` for reuse in future stories (6.2, 6.3).
3. **[LOW] Empty state CTA consistency:** Added "Scanner un ticket" CTA link to DashboardEmptyState to match original EmptyState behavior.
4. **[LOW] Improved ARIA patterns:** Refactored StatItem to use sr-only pattern with dedicated screen reader text element.

### File List

**New Files:**
- `src/hooks/useDashboardStats.ts` - Dashboard aggregation hook
- `src/hooks/useDashboardStats.test.ts` - Unit tests (5 tests)
- `src/components/features/dashboard/DashboardSummaryCard.tsx` - Summary card component
- `src/components/features/dashboard/DashboardSummaryCard.test.tsx` - Unit tests (7 tests)
- `src/components/features/dashboard/index.ts` - Barrel export
- `src/components/ui/skeleton.tsx` - shadcn/ui Skeleton component

**Modified Files:**
- `src/hooks/index.ts` - Added useDashboardStats export
- `src/app/(app)/tickets/TicketsPageClient.tsx` - Integrated DashboardSummaryCard
- `src/app/(app)/tickets/TicketsPageClient.test.tsx` - Updated tests for dashboard integration

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-27 | Story created with comprehensive context | Claude Opus 4.5 |
| 2026-01-27 | Story implemented - all 5 tasks completed, 33 tests passing | Claude Opus 4.5 |
| 2026-01-27 | Code review completed - 4 issues fixed, test count increased to 47 | Claude Opus 4.5 |
