# Story 4.4: Filter by Market

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to filter my tickets by market/location**,
So that **I can see sales per market** (FR19).

## Acceptance Criteria

1. **Given** I am on the ticket list (/tickets Historique)
   **When** I tap the market filter button
   **Then** a list of my markets is displayed (Sheet/dropdown)

2. **Given** the market list is open
   **When** I view my options
   **Then** I can select one or multiple markets
   **And** each market shows its name
   **And** an "All Markets" option allows clearing selection

3. **Given** I select one or more markets
   **When** I apply the filter
   **Then** only tickets from selected markets are displayed
   **And** the list updates reactively via useLiveQuery

4. **Given** a market filter is active
   **When** I view the ticket list header
   **Then** a filter chip shows the active market(s) (e.g., "Marché Bastille" or "2 marchés")
   **And** the chip has a clear (X) button

5. **Given** I tap the clear button on the market filter chip
   **When** the action completes
   **Then** the filter is removed
   **And** all tickets are displayed again

6. **Given** I have both date AND market filters active
   **When** viewing the ticket list
   **Then** combined filters work correctly (intersection)
   **And** both filter chips are visible
   **And** each can be cleared independently

7. **Given** I have no tickets matching the market filter
   **When** the filter is applied
   **Then** the "Aucun ticket pour cette période" empty state is shown
   **And** filter chips remain visible so I can clear them

## Tasks / Subtasks

- [x] **Task 1: Create useTicketsByMarket Hook** (AC: #3, #6)
  - [x] Create `src/hooks/useTicketsByMarket.ts`
  - [x] Accept userId, startDate, endDate, marketIds parameters
  - [x] Extend useTicketsByDateRange logic to include market filtering
  - [x] Filter tickets where marketId is in selected marketIds array
  - [x] Handle empty marketIds array (no filter applied)
  - [x] Use useLiveQuery for reactive updates
  - [x] Write unit tests (5 tests)

- [x] **Task 2: Create MarketFilter Component** (AC: #1, #2)
  - [x] Create `src/components/features/tickets/MarketFilter.tsx`
  - [x] Button trigger showing MapPin icon
  - [x] Sheet with list of user's markets (via useMarkets hook)
  - [x] Multi-select checkboxes for each market
  - [x] "Tous les marchés" option to clear selection
  - [x] Apply and Cancel buttons
  - [x] Handle empty markets state (user has no markets)
  - [x] Write unit tests (6 tests)

- [x] **Task 3: Create MarketFilterChip Component** (AC: #4, #5)
  - [x] Create `src/components/features/tickets/MarketFilterChip.tsx`
  - [x] Display single market name or "X marchés" for multiple
  - [x] Clear (X) button to remove filter (32px touch target min)
  - [x] Styled similar to FilterChip (same pill design)
  - [x] Write unit tests (3 tests)

- [x] **Task 4: Update TicketsPageClient** (AC: #1-7)
  - [x] Add market filter state to URL params (`markets` param)
  - [x] Replace/extend useTicketsByDateRange with useTicketsByMarket
  - [x] Add MarketFilter button next to DateRangeFilter
  - [x] Display MarketFilterChip when filter is active
  - [x] Handle combined date + market filtering
  - [x] Update empty state logic for filter combinations
  - [x] Write/update unit tests (9 new tests: 6 market + 3 combined)

- [x] **Task 5: Update Barrel Exports** (AC: all)
  - [x] Update `src/components/features/tickets/index.ts`
  - [x] Export: MarketFilter, MarketFilterChip
  - [x] Update `src/hooks/index.ts`
  - [x] Export: useTicketsByMarket (combined filter hook)

## Dev Notes

### Story Context (CRITICAL)

**THIS IS STORY 4.4 OF EPIC 4:** The market filter extends the ticket list from Stories 4.1 and 4.3.

**Epic 4 Overview:** Gestion des Tickets & Marchés - Allows users to view history, filter, and manage tickets.

**Dependencies:**
- Story 4.1 (Ticket List - DONE): Base ticket list to add filtering to
- Story 4.3 (Filter by Date - DONE): URL-based filter pattern to follow
- Story 4.5 (Market CRUD - BACKLOG): Creates markets (useMarkets hook already exists!)
- Story 4.6 (Assign Ticket to Market - BACKLOG): Sets marketId on tickets

**IMPORTANT:** The `useMarkets` hook already exists from an earlier story! Reuse it.

**Filter Architecture (Extend Story 4.3):**
```
TicketsPageClient (state: startDate, endDate, marketIds via URL)
      │
      ├── DateRangeFilter (existing)
      │
      ├── MarketFilter (NEW - button + sheet to select markets)
      │         │
      │         └── onApply(marketIds) → updates URL params
      │
      ├── FilterChip (existing - date filter)
      │
      ├── MarketFilterChip (NEW - shows selected markets)
      │         │
      │         └── onClear() → resets market URL param
      │
      └── useTicketsByMarket(userId, startDate, endDate, marketIds)
                │
                └── useLiveQuery → filtered tickets → TicketList
```

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App Router, useSearchParams |
| react | 19.x | Components, useState |
| dexie-react-hooks | 1.x | useLiveQuery for reactive data |
| lucide-react | latest | Icons (MapPin, Check, X) |
| tailwindcss | 4.x | Styling with @theme tokens |
| shadcn/ui | latest | Sheet, Checkbox components |

### Architecture Compliance (CRITICAL)

**From project-context.md:**

- **Data Source:** useLiveQuery is THE SINGLE SOURCE OF TRUTH for IndexedDB data
- **Filter State:** URL params (useSearchParams) for persistence across navigation
- **Market Format:** marketId stored as number in tickets table
- **Loading States:** Maintain existing skeleton pattern

**From architecture.md:**

- **State Management:** useLiveQuery for reactive data, URL params for filter state
- **Naming:** Components PascalCase, hooks camelCase with `use` prefix
- **Feature Components:** Place in `src/components/features/tickets/`

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

**Filter Pattern:**
- Trigger button with MapPin icon (48px touch target)
- Bottom sheet on mobile for market selection
- Multi-select checkboxes for each market
- "Tous les marchés" at top to clear selection
- Apply button primary green, Cancel secondary

**Filter Chip Pattern:**
- Small pill showing active filter
- Single market: "Marché Bastille"
- Multiple markets: "2 marchés"
- X icon to clear (32px touch target min per code review)
- Positioned near filter button in header area

### Existing Code to Leverage (CRITICAL - DO NOT REINVENT!)

**From Story 4.3 - REUSE THESE PATTERNS:**

```typescript
// URL params pattern from TicketsPageClient.tsx
const searchParams = useSearchParams();
const router = useRouter();
const pathname = usePathname();

// Parse from URL
const startDate = searchParams.get('start');
const endDate = searchParams.get('end');
// NEW: Add markets parsing
const marketIdsParam = searchParams.get('markets');
const marketIds = marketIdsParam ? marketIdsParam.split(',').map(Number) : [];

// Update URL
function updateUrlParams(start, end, markets) {
  const params = new URLSearchParams(searchParams.toString());
  // ... existing date logic ...
  if (markets && markets.length > 0) {
    params.set('markets', markets.join(','));
  } else {
    params.delete('markets');
  }
  const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
  router.push(newUrl, { scroll: false });
}
```

**EXISTING useMarkets hook - ALREADY BUILT:**

```typescript
// src/hooks/useMarkets.ts - ALREADY EXISTS!
export function useMarkets(userId: string) {
  const markets = useLiveQuery(
    async () => {
      if (!userId) return [];
      const allMarkets = await db.markets
        .where('userId')
        .equals(userId)
        .sortBy('name');
      return allMarkets.filter((m) => !m.deletedAt);
    },
    [userId]
  );
  return { markets, isLoading: markets === undefined };
}
```

**From Story 4.3 - FilterChip styling to match:**

```typescript
// src/components/features/tickets/FilterChip.tsx
// Copy this styling approach for MarketFilterChip
<div className={cn(
  'inline-flex items-center gap-1.5 px-3 py-1.5',
  'bg-primary/10 text-primary rounded-full',
  'text-sm font-medium'
)}>
```

### Database Schema Reference

```typescript
// src/types/index.ts - Ticket type
interface Ticket {
  id?: number;
  userId: string;
  marketId?: number;  // This is the field to filter on!
  status: 'pending_ocr' | 'pending_validation' | 'validated' | 'cancelled';
  // ... other fields
}

// src/types/index.ts - Market type
interface Market {
  id?: number;
  userId: string;
  name: string;
  deletedAt?: string;
  createdAt: string;
}
```

### useTicketsByMarket Hook Pattern

```typescript
// src/hooks/useTicketsByMarket.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function useTicketsByMarket(
  userId: string,
  startDate: string | null,
  endDate: string | null,
  marketIds: number[]  // Empty array = no filter
) {
  const tickets = useLiveQuery(
    async () => {
      if (!userId) return [];

      let allTickets = await db.tickets
        .where('userId')
        .equals(userId)
        .toArray();

      // Filter by date range if specified
      if (startDate || endDate) {
        const normalizedStart = startDate ? startDate.slice(0, 10) : null;
        const normalizedEnd = endDate ? endDate.slice(0, 10) : null;

        allTickets = allTickets.filter(ticket => {
          const ticketDate = ticket.impressionDate;
          if (!ticketDate || typeof ticketDate !== 'string') return false;
          if (normalizedStart && ticketDate < normalizedStart) return false;
          if (normalizedEnd && ticketDate > normalizedEnd) return false;
          return true;
        });
      }

      // Filter by market if specified
      if (marketIds.length > 0) {
        allTickets = allTickets.filter(ticket =>
          ticket.marketId && marketIds.includes(ticket.marketId)
        );
      }

      // Sort by createdAt descending
      return allTickets.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    [userId, startDate, endDate, marketIds.join(',')]  // Join for stable dep
  );

  return {
    tickets,
    isLoading: tickets === undefined,
  };
}
```

### MarketFilter Component Structure

```typescript
// src/components/features/tickets/MarketFilter.tsx
'use client';

import { useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { useMarkets } from '@/hooks';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';  // May need: npx shadcn@latest add checkbox

interface MarketFilterProps {
  userId: string;
  selectedMarketIds: number[];
  onApply: (marketIds: number[]) => void;
  onClear: () => void;
}

export function MarketFilter({ userId, selectedMarketIds, onApply, onClear }: MarketFilterProps) {
  const [open, setOpen] = useState(false);
  const [tempSelection, setTempSelection] = useState<number[]>(selectedMarketIds);
  const { markets, isLoading } = useMarkets(userId);

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      setTempSelection(selectedMarketIds);  // Reset to current on open
    }
  }

  function handleToggle(marketId: number) {
    setTempSelection(prev =>
      prev.includes(marketId)
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId]
    );
  }

  function handleSelectAll() {
    setTempSelection([]);  // Empty = all markets
  }

  function handleApply() {
    onApply(tempSelection);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      {/* Trigger button */}
      {/* Sheet content with market list */}
    </Sheet>
  );
}
```

### Component Structure

```
src/components/features/tickets/
├── TicketCard.tsx           # From Story 4.1
├── TicketList.tsx           # From Story 4.1
├── EmptyState.tsx           # From Story 4.1
├── NF525Badge.tsx           # From Story 4.1
├── DateRangeFilter.tsx      # From Story 4.3
├── DateRangeFilter.test.tsx
├── FilterChip.tsx           # From Story 4.3
├── FilterChip.test.tsx
├── DateFilterEmpty.tsx      # From Story 4.3
├── DateFilterEmpty.test.tsx
├── MarketFilter.tsx         # NEW - Market picker
├── MarketFilter.test.tsx
├── MarketFilterChip.tsx     # NEW - Active market display
├── MarketFilterChip.test.tsx
└── index.ts                 # Update exports

src/hooks/
├── useTickets.ts            # Original (keep as fallback)
├── useTicketsByDateRange.ts # From Story 4.3
├── useTicketsByMarket.ts    # NEW - Combined filter hook
├── useTicketsByMarket.test.ts
├── useMarkets.ts            # ALREADY EXISTS!
└── index.ts                 # Update exports

src/app/(app)/tickets/
├── page.tsx                 # Unchanged
├── TicketsPageClient.tsx    # MODIFIED - Add market filter
└── TicketsPageClient.test.tsx
```

### shadcn/ui Components Needed

```bash
# May need to add Checkbox component
npx shadcn@latest add checkbox
```

### Testing Strategy

**Unit Tests (co-located):**
- useTicketsByMarket: no filter, single market, multiple markets, combined with date, empty results
- MarketFilter: opens sheet, shows markets, toggles selection, apply/cancel
- MarketFilterChip: displays single market, displays count, clear button works

**Test Mocks:**
```typescript
// Mock useTicketsByMarket
vi.mock('@/hooks/useTicketsByMarket', () => ({
  useTicketsByMarket: vi.fn(() => ({ tickets: [], isLoading: false })),
}));

// Mock useMarkets
vi.mock('@/hooks', () => ({
  useMarkets: vi.fn(() => ({
    markets: [
      { id: 1, name: 'Marché Bastille', userId: 'user-123' },
      { id: 2, name: 'Marché Aligre', userId: 'user-123' },
    ],
    isLoading: false,
  })),
}));
```

### Previous Story Intelligence (Story 4.3)

**Learnings to apply:**
1. URL params persistence works well - follow same pattern for markets
2. `[&>button:last-child]:hidden` trick for Sheet custom header
3. 32px minimum touch target for clear buttons (fixed in code review)
4. Date validation: start <= end (apply similar for multi-select)
5. Suspense wrapper in page.tsx for useSearchParams

**Established patterns:**
- `'use client'` directive for interactive components
- cn() utility for conditional classNames
- Lucide icons with aria-hidden="true"
- Sheet with custom header layout (title + close on same row)

### URL Params Format

```
/tickets                           # No filters
/tickets?start=2026-01-01&end=2026-01-15  # Date filter only
/tickets?markets=1,2,3            # Market filter only
/tickets?start=2026-01-01&end=2026-01-15&markets=1,2  # Combined
```

### Forbidden Patterns (NEVER DO)

- Direct IndexedDB access - use Dexie hooks (useLiveQuery)
- useEffect for data fetching - use useLiveQuery via hooks
- Hardcoded colors - use Tailwind theme tokens
- Skip loading states - maintain existing skeleton pattern
- Store filter state in component state only - use URL params
- Create new useMarkets hook - one already exists!
- Single-select when multi-select is specified

### References

- [Source: epics.md#Story-4.4] - Acceptance criteria
- [Source: project-context.md#Critical-Rules] - Data source rules
- [Source: ux-design-specification.md#Filter-Patterns] - Filter UX
- [Source: architecture.md#Frontend] - State management
- [Source: story-4.3] - FilterChip, DateRangeFilter, URL params patterns
- [Source: src/hooks/useMarkets.ts] - Existing markets hook

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 35 tests pass (5 hook + 6 MarketFilter + 3 MarketFilterChip + 21 TicketsPageClient)
- Pre-existing test failure in ManualEntryClient.test.tsx (unrelated to this story)

### Completion Notes List

- Reused existing useMarkets hook from Story 4.5 prep
- Added shadcn Checkbox component (@radix-ui/react-checkbox)
- Combined date+market filtering via single useTicketsByMarket hook
- URL persistence pattern consistent with Story 4.3
- Replaced useTicketsByDateRange usage in TicketsPageClient with useTicketsByMarket

### File List

**New Files:**
- `src/hooks/useTicketsByMarket.ts` - Combined date + market filtering hook
- `src/hooks/useTicketsByMarket.test.ts` - 5 unit tests
- `src/components/features/tickets/MarketFilter.tsx` - Multi-select market picker (Sheet)
- `src/components/features/tickets/MarketFilter.test.tsx` - 6 unit tests
- `src/components/features/tickets/MarketFilterChip.tsx` - Active filter chip display
- `src/components/features/tickets/MarketFilterChip.test.tsx` - 3 unit tests
- `src/components/ui/checkbox.tsx` - shadcn Checkbox component

**Modified Files:**
- `src/app/(app)/tickets/TicketsPageClient.tsx` - Integrated market filter
- `src/app/(app)/tickets/TicketsPageClient.test.tsx` - 9 new tests (6 market + 3 combined)
- `src/hooks/index.ts` - Added useTicketsByMarket export
- `src/components/features/tickets/index.ts` - Added MarketFilter, MarketFilterChip exports
- `package.json` - Added @radix-ui/react-checkbox dependency

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-22 | Story created with comprehensive context from Stories 4.1 and 4.3 patterns, leveraging existing useMarkets hook | Claude Opus 4.5 |
| 2026-01-24 | Implementation complete: all 5 tasks done, 35 tests passing | Claude Opus 4.5 |
| 2026-01-24 | Code review fixes: removed unused onClear prop, SheetHeader import, cleaned barrel export | Claude Opus 4.5 |
