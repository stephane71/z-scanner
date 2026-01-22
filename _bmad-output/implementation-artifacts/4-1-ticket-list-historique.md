# Story 4.1: Ticket List (Historique)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to see a list of all my validated tickets**,
So that **I can review my sales history** (FR17, FR29).

## Acceptance Criteria

1. **Given** I navigate to /tickets (Historique tab)
   **When** the page loads
   **Then** all my tickets are displayed in a list (most recent first)
   **And** each ticket shows: date, montant TTC, marché (if assigned), sync status
   **And** the thumbnail photo is visible
   **And** the NF525 badge is shown on validated tickets
   **And** data loads reactively via useLiveQuery (works offline)

2. **Given** I have no tickets
   **When** the page loads
   **Then** an empty state with illustration is shown
   **And** a CTA to scan my first ticket is displayed

3. **Given** I tap on a ticket in the list
   **When** the ticket row is clicked
   **Then** I navigate to `/tickets/[id]` for the detail view (Story 4.2)

4. **Given** the page is loading
   **When** tickets data is being fetched from IndexedDB
   **Then** a skeleton loading state is displayed
   **And** the transition to content is smooth (no flash)

## Tasks / Subtasks

- [x] **Task 1: Create TicketCard Component** (AC: #1)
  - [x] Create `src/components/features/tickets/TicketCard.tsx`
  - [x] Display thumbnail photo using usePhoto hook (existing)
  - [x] Show ticket date (impressionDate) formatted as dd/MM/yyyy
  - [x] Show ticket number (#xxx)
  - [x] Show total amount in euro format (12,50 €)
  - [x] Show market name if marketId assigned (use useMarketById)
  - [x] Integrate TicketSyncBadge component (from Story 3.8)
  - [x] Add NF525 badge for validated tickets (status === 'validated')
  - [x] Touch-friendly: min-h-[72px], active state
  - [x] Write unit tests (10 tests)

- [x] **Task 2: Create TicketList Component** (AC: #1, #4)
  - [x] Create `src/components/features/tickets/TicketList.tsx`
  - [x] Use useTickets hook to fetch tickets (existing)
  - [x] Render TicketCard for each ticket
  - [x] Implement skeleton loading state (5 skeleton cards)
  - [x] Handle empty results (defer to Task 3)
  - [x] Write unit tests (5 tests)

- [x] **Task 3: Create EmptyState Component** (AC: #2)
  - [x] Create `src/components/features/tickets/EmptyState.tsx`
  - [x] Display ListX icon (lucide-react)
  - [x] Title: "Aucun ticket"
  - [x] Message: "Scannez votre premier ticket Z pour commencer à suivre vos ventes"
  - [x] CTA button: Link to /scan with primary styling
  - [x] Write unit tests (5 tests)

- [x] **Task 4: Create NF525Badge Component** (AC: #1)
  - [x] Create `src/components/features/tickets/NF525Badge.tsx`
  - [x] Display shield icon (ShieldCheck from lucide-react)
  - [x] Blue color (blue-700) per UX spec (trust color)
  - [x] Compact size for list view
  - [x] Include tooltip and aria-label: "Conforme NF525"
  - [x] Write unit tests (4 tests)

- [x] **Task 5: Create TicketsPageClient Component** (AC: #1, #2, #3, #4)
  - [x] Create `src/app/(app)/tickets/TicketsPageClient.tsx`
  - [x] Get userId using createClient().auth.getUser() pattern
  - [x] Use useTickets(userId) for reactive data
  - [x] Conditional render: EmptyState when tickets empty, TicketList otherwise
  - [x] Handle loading state during auth/data fetch
  - [x] Implement navigation to /tickets/[id] on card click
  - [x] Write integration tests (5 tests)

- [x] **Task 6: Update Tickets Page** (AC: #1, #2, #3, #4)
  - [x] Update `src/app/(app)/tickets/page.tsx`
  - [x] Replace placeholder with TicketsPageClient
  - [x] Keep existing metadata
  - [x] Verify build passes

- [x] **Task 7: Create Barrel Exports** (AC: all)
  - [x] Create `src/components/features/tickets/index.ts`
  - [x] Export: TicketCard, TicketList, EmptyState, NF525Badge
  - [x] Export skeleton components

## Dev Notes

### Story Context (CRITICAL)

**THIS IS THE FIRST STORY OF EPIC 4:** This story starts the ticket management epic. It builds on the solid foundation from Epic 3 (scanning, validation, sync).

**Epic 4 Overview:** Gestion des Tickets & Marchés - Allows users to view history, filter, and manage tickets.

**Dependencies:**
- Story 3.1-3.10 (All DONE): Core scanning, validation, sync, navigation
- Story 3.8 TicketListItem + TicketSyncBadge: **REUSE these components** (already prepared for this story!)
- Story 4.2 (Ticket Detail): Will receive navigation from this list

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App Router, Link, useRouter |
| react | 19.x | Components |
| dexie-react-hooks | 1.x | useLiveQuery for reactive data |
| lucide-react | latest | Icons (List, ShieldCheck) |
| tailwindcss | 4.x | Styling with @theme tokens |

### Architecture Compliance (CRITICAL)

**From project-context.md:**

- **Data Source:** useLiveQuery is THE SINGLE SOURCE OF TRUTH for IndexedDB data
- **Auth Pattern:** `createClient().auth.getUser()` in client components
- **Route Groups:** `(app)/` for authenticated routes with BottomNav
- **Feature Components:** Place in `src/components/features/tickets/`
- **Loading States:** Skeleton for lists, minimum 300ms to prevent flash

**From architecture.md:**

- **State Management:** useLiveQuery for reactive data, useState for ephemeral UI state
- **Error Handling:** Components use Error Boundary at `(app)/layout.tsx`
- **Naming:** Components PascalCase, hooks camelCase with `use` prefix

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

**TicketCard Pattern:**
- Container with surface background (#F8FAFC)
- Touch target: min-h-[72px]
- Thumbnail photo visible (small)
- Total as prominent element
- Sync badge when not synced (amber)
- NF525 badge on validated tickets (trust blue #1D4ED8)

**Empty State Pattern:**
- Centered illustration/icon
- Clear title
- Encouraging message (no guilt)
- CTA to primary action (scan)

**Loading State:**
- Skeleton cards (3-5)
- Smooth transition to content

### Existing Code to Leverage (CRITICAL - DO NOT REINVENT!)

**From Story 3.8 - REUSE THESE:**

```typescript
// src/components/features/sync/TicketListItem.tsx - ALREADY EXISTS
// Displays: date, ticket number, total, sync badge
// Consider: Extending this OR creating new TicketCard with photo support

// src/components/features/sync/TicketSyncBadge.tsx - ALREADY EXISTS
// Shows "Non synchronisé" badge when pending sync
// USE THIS directly in your TicketCard

// src/components/features/sync/index.ts - EXPORT EXISTS
export { TicketListItem } from './TicketListItem';
export { TicketSyncBadge } from './TicketSyncBadge';
```

**Existing Hooks - USE THESE:**

```typescript
// src/hooks/useTickets.ts - ALREADY EXISTS
export function useTickets(userId: string): { tickets: Ticket[] | undefined, isLoading: boolean }
export function useTicketById(id: number): { ticket: Ticket | undefined, isLoading: boolean }
export function useTicketsByStatus(userId: string, status: TicketStatus): { tickets, isLoading }
export function useTicketsByMarket(userId: string, marketId: number): { tickets, isLoading }

// src/hooks/usePhoto.ts - ALREADY EXISTS
export function usePhoto(ticketId: number): { photo: Photo | undefined, isLoading: boolean }

// src/hooks/useMarkets.ts - ALREADY EXISTS
export function useMarkets(userId: string): { markets: Market[] | undefined, isLoading: boolean }
export function useMarketById(id: number): { market: Market | undefined, isLoading: boolean }
```

**Auth Pattern (from ScanPageClient.tsx):**

```typescript
// Use this EXACT pattern for getting userId
import { createClient } from '@/lib/supabase/client';

const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  async function getUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  }
  getUser();
}, []);
```

### Photo Thumbnail Display

```typescript
// From usePhoto hook - convert blob to object URL
const { photo, isLoading: photoLoading } = usePhoto(ticket.id);

// Display thumbnail (NOT full blob)
{photo && (
  <img
    src={URL.createObjectURL(photo.thumbnail)}
    alt="Photo du ticket"
    className="w-12 h-12 object-cover rounded"
  />
)}

// IMPORTANT: Clean up object URLs to prevent memory leaks
useEffect(() => {
  if (photo) {
    const url = URL.createObjectURL(photo.thumbnail);
    return () => URL.revokeObjectURL(url);
  }
}, [photo]);
```

### Component Structure

```
src/components/features/tickets/
├── TicketCard.tsx         # Main card with photo, NF525 badge, sync badge
├── TicketCard.test.tsx
├── TicketList.tsx         # List wrapper with skeleton loading
├── TicketList.test.tsx
├── EmptyState.tsx         # Empty state with CTA
├── EmptyState.test.tsx
├── NF525Badge.tsx         # Blue trust badge
├── NF525Badge.test.tsx
└── index.ts               # Barrel exports

src/app/(app)/tickets/
├── page.tsx               # Server component (metadata)
└── TicketsPageClient.tsx  # Client component with data loading
```

### Skeleton Loading Pattern

```typescript
// Use this pattern for skeleton cards
function TicketCardSkeleton() {
  return (
    <div className="p-4 border-b border-border animate-pulse">
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-muted rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-3 bg-muted rounded w-16" />
        </div>
        <div className="h-5 bg-muted rounded w-16" />
      </div>
    </div>
  );
}

function TicketListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <TicketCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### NF525 Badge Design

```typescript
// Blue trust color per UX spec
// Compact for list view
<span className="inline-flex items-center gap-1 text-xs text-trust bg-blue-50 px-2 py-0.5 rounded">
  <ShieldCheck className="w-3 h-3" aria-hidden="true" />
  <span>NF525</span>
</span>
```

### Navigation to Detail

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

function handleTicketClick(ticketId: number) {
  router.push(`/tickets/${ticketId}`);
}
```

### Testing Strategy

**Unit Tests (co-located):**
- TicketCard: renders all fields, shows badges, handles click
- TicketList: renders list, shows skeleton, handles empty
- EmptyState: renders message, CTA navigates to /scan
- NF525Badge: renders correctly, has accessibility

**Test Mocks:**
```typescript
// Mock useTickets
vi.mock('@/hooks/useTickets', () => ({
  useTickets: vi.fn(() => ({ tickets: mockTickets, isLoading: false })),
}));

// Mock usePhoto
vi.mock('@/hooks/usePhoto', () => ({
  usePhoto: vi.fn(() => ({ photo: mockPhoto, isLoading: false })),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
```

### Previous Story Intelligence (Story 3.10)

**Learnings to apply:**
1. Use `bg-background` and `border-border` tokens (NOT hardcoded colors)
2. Layout already has pb-20 - don't add duplicate padding
3. Test file co-location pattern: `Component.test.tsx`
4. Export from index file with barrel pattern

**Established patterns:**
- `'use client'` directive for interactive components
- cn() utility for conditional classNames
- Lucide icons with aria-hidden="true"
- Min-height calculations account for nav (9rem total)

### Forbidden Patterns (NEVER DO)

- ❌ Direct IndexedDB access - use Dexie hooks (useLiveQuery)
- ❌ useEffect for data fetching - use useLiveQuery
- ❌ Hardcoded colors - use Tailwind theme tokens
- ❌ Skip loading states - always show skeleton
- ❌ Create custom useTickets - USE EXISTING HOOK
- ❌ Forget URL.revokeObjectURL - causes memory leaks
- ❌ Mix naming conventions

### References

- [Source: epics.md#Story-4.1] - Acceptance criteria
- [Source: project-context.md#Critical-Rules] - Data source rules
- [Source: ux-design-specification.md#TicketCard] - Card design
- [Source: architecture.md#Frontend] - State management
- [Source: story-3.8] - TicketListItem, TicketSyncBadge components

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None - implementation was clean with no issues.

### Completion Notes List

1. **All 7 tasks completed** with 31 passing tests total:
   - TicketCard: 10 tests (date formatting, currency formatting, badges, click handling)
   - TicketList: 5 tests (skeleton loading, navigation, rendering)
   - EmptyState: 5 tests (title, message, CTA link)
   - NF525Badge: 4 tests (accessibility, styling)
   - TicketsPageClient: 5 tests (auth flow, empty state, ticket list)

2. **Architecture compliance verified:**
   - Used existing hooks (useTickets, usePhoto, useMarketById)
   - Reused TicketSyncBadge from Story 3.8
   - Applied theme tokens (bg-background, border-border)
   - Proper URL.revokeObjectURL cleanup for thumbnails

3. **Build passes** - all routes compile successfully.

4. **Code review fixes applied:**
   - Added photo thumbnail test (TicketCard.test.tsx)
   - Converted EmptyState to Server Component (removed 'use client')
   - Added stabilization delay test (TicketsPageClient.test.tsx)
   - Clarified NF525Badge color choice in comments (blue-700 is a Tailwind theme token)

### File List

| File | Status | Description |
|------|--------|-------------|
| src/components/features/tickets/TicketCard.tsx | created | Main card component with photo, badges, click handling |
| src/components/features/tickets/TicketCard.test.tsx | created | Unit tests for TicketCard (10 tests) |
| src/components/features/tickets/TicketList.tsx | created | List component with skeleton loading |
| src/components/features/tickets/TicketList.test.tsx | created | Unit tests for TicketList (5 tests) |
| src/components/features/tickets/EmptyState.tsx | created | Empty state with CTA to /scan |
| src/components/features/tickets/EmptyState.test.tsx | created | Unit tests for EmptyState (5 tests) |
| src/components/features/tickets/NF525Badge.tsx | created | Blue trust badge for validated tickets |
| src/components/features/tickets/NF525Badge.test.tsx | created | Unit tests for NF525Badge (4 tests) |
| src/components/features/tickets/index.ts | created | Barrel exports for tickets feature |
| src/app/(app)/tickets/TicketsPageClient.tsx | created | Client component with auth + data loading |
| src/app/(app)/tickets/TicketsPageClient.test.tsx | created | Integration tests (5 tests) |
| src/app/(app)/tickets/page.tsx | modified | Replaced placeholder with TicketsPageClient |

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-22 | Story created with comprehensive context from Epic 3 patterns | Claude Opus 4.5 |
| 2026-01-22 | Implementation complete - all 7 tasks done, 29 tests passing, build verified | Claude Opus 4.5 |
| 2026-01-22 | Code review fixes: added photo thumbnail test, removed unnecessary 'use client', added stabilization test, clarified NF525Badge colors | Claude Opus 4.5 |
